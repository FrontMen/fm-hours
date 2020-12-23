import { isWithinInterval, startOfISOWeek, addDays, isBefore, format, isToday, compareAsc, isWeekend } from 'date-fns'

export const state = () => ({
  users: undefined,
});

const GetRecordsForWeekRange = (records, startDate, endDate) => {
  return records.filter((entry) =>
    isWithinInterval(new Date(entry.date), {
      start: new Date(startDate),
      end: new Date(endDate),
    })
  );
};

const getWeekRange = (beginDate) => {
  const start = startOfISOWeek(new Date(beginDate));
  const end = addDays(new Date(start), 6);
  return { start, end }
}

const transformToUIFormat = (records) => {
  return records.reduce((acc, entry) => {
    let record = acc.find((a) => a.customer === entry.customer);
    if (!record) {
      record = {
        customer: entry.customer,
        hours: [],
        debtor: entry.debtor,
      };
      acc.push(record);
    }
    record.hours.push({
      date: entry.date,
      hours: entry.hours,
    });
    return acc;
  }, [])
}

const buildWeek = (startDate) => {
  return [...Array(7)].map((_, index) => {
    const newDate = addDays(new Date(startDate), index);
    return {
      date: newDate,
      weekDay: format(newDate, "EEEEEE"),
      monthDay: format(newDate, "dd"),
      month: format(newDate, "MMM"),
      year: format(newDate, "yyyy"),
      isWeekend: isWeekend(newDate),
      isToday: isToday(newDate),
    }
  })
}

export const actions = {
  async getUserList(context) {
    const ref = this.$fire.firestore.collection("users");
    const users = await ref.get();
    const usersEntities = users.docs.map((res) => ({
      id: res.id,
      ...res.data(),
    }));
    context.commit("getUsersSuccess", usersEntities);
  },
  async toggleTravelAllowance(context, payload) {
    const travelAllowanceAllowed = !payload.travelAllowance;
    const newUser = { ...payload, travelAllowance: travelAllowanceAllowed };
    await this.$fire.firestore.collection("users").doc(payload.id).set(
      {
        travelAllowance: travelAllowanceAllowed,
      },
      { merge: true }
    );
    context.commit("updateUser", newUser);
  },
};

export const mutations = {
  getUsersSuccess: (state, payload) => {
    state.users = payload;
  },
  updateUser: (state, payload) => {
    state.users = state.users.map((user) =>
      user.id === payload.id ? payload : user
    );
  },
};


export const getters = {
  getUsers: (state) => {
    return state.users;
  },
  getUsersRecordsForApproval: (state, getters) => {
    const users = getters.getUsers;
    if (!users) {
      return;
    }

    // return users when there they have records with the status of pending. If so, return only the records with that status
    const pendingRecords = users.reduce((acc, curr) => {
      const recordsForApproval = curr.time_records.filter(record => record.status === 'pending');
      if (recordsForApproval.length > 0) {
        return [
          ...acc,
          {
            ...curr,
            time_records: recordsForApproval
          }
        ]
      } else {
        return acc;
      }
    }, []);

    // Based on the pending record list, get the first and last date
    const dateRange = pendingRecords.reduce((acc, curr) => {
      return [
        ...curr.time_records.map((entry) => new Date(entry.date)),
        ...acc
      ]
    }, []).sort(compareAsc);

    let weeks = [];
    // get the startdate of the week based on the given date
    let { start: startDate } = getWeekRange(dateRange[0]);
    const { end: endDate } = getWeekRange(dateRange[dateRange.length - 1]);
    // build the weeks based on the dateRange. Loop as long as the startdate is before the last date.
    // the startdate will be increased by 1 week after every build
    while (isBefore(startDate, endDate)) {
      const { start, end } = getWeekRange(startDate);

      const timeRecords = pendingRecords.reduce((acc, user) => {
        const timeRecordsWithinRange = GetRecordsForWeekRange(user.time_records, start, end);
        if (timeRecordsWithinRange.length > 0) {
          const entry = [
            ...acc,
            {
              user: user.name,
              records: transformToUIFormat(timeRecordsWithinRange),
              week: buildWeek(start)
            }
          ];
          return entry
        } else {
          return acc
        }
      }, []);
      if (timeRecords.length > 0) {
        const weekRecords = {
          beginDate: start,
          endDate: end,
          timeRecords
        }
        weeks.push(weekRecords);
      }
      startDate = addDays(startDate, 8)
    }
    console.log('weeks', weeks);
    return weeks
  },
};
