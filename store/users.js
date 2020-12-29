import { isBefore, compareAsc } from 'date-fns'
import { addDays, getDateLabel, buildWeek, getWeekRange } from "../helpers/dates.js";
import { isSameRecord, getRecordsForWeekRange } from "../helpers/records.js";
import { recordStatus } from "../helpers/record-status";

export const state = () => ({
  users: undefined,
});

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
  async approveRecords(context, payload) {
    const users = [...context.getters.getUsers];
    const currentUser = users.find((u) => u.id === payload.userId);
    const newrecs = currentUser.time_records.map(record => {
      const isApproved = payload.records.some(approvedRecord => isSameRecord(record, approvedRecord));
      const newStatus = isApproved ? recordStatus.APPROVED : record.status;
      return newStatus ? { ...record, status: newStatus } : record
    });
    await this.$fire.firestore.collection("users").doc(currentUser.id).set(
      { time_records: newrecs },
      { merge: true }
    );
    context.commit("updateUser", { ...currentUser, time_records: newrecs });
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
  getUsersRecordsForApproval: (state, getters, _, rootGetters) => {
    const holidays = rootGetters["holidays/getHolidayDates"];
    const users = getters.getUsers;
    if (!users) {
      return;
    }

    // return users when they have records with the status of pending. If so, return only the records with that status
    const pendingRecords = users.reduce((acc, curr) => {
      const recordsForApproval = curr.time_records.filter(record => record.status === recordStatus.PENDING);
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
    // the startdate will be increased by 1 week after every cycle
    while (isBefore(startDate, endDate)) {
      const { start, end } = getWeekRange(startDate);
      const thisWeekTimeRecords = pendingRecords.reduce((acc, user) => {
        const timeRecordsWithinRange = getRecordsForWeekRange(user.time_records, start, end);
        if (timeRecordsWithinRange.length > 0) {
          const entry = [
            ...acc,
            {
              userId: user.id,
              user: user.name,
              records: timeRecordsWithinRange,
              week: buildWeek(start, holidays)
            }
          ];
          return entry
        } else {
          return acc
        }
      }, []);
      if (thisWeekTimeRecords.length > 0) {
        const weekRecords = {
          dateLabel: getDateLabel(start, end),
          startDate: start,
          recordsForApproval: thisWeekTimeRecords,
        };
        weeks = [...weeks, weekRecords];
      }
      startDate = addDays(startDate, 8)
    }
    return weeks
  },
  // used for displaying a divider between the normal weeks and the future ones
  getIndexOfFirstWeekInFuture: (_, getters) => {
    const weeks = getters.getUsersRecordsForApproval;
    if (!weeks) {
      return;
    }
    return weeks.findIndex((weeks) => isBefore(new Date(), weeks.startDate))
  }
};
