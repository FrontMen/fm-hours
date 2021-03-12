import { NuxtFireInstance } from "@nuxtjs/firebase";
import { compareAsc, isSameDay } from "date-fns";

import { formatDate } from "~/helpers/dates";

export default class HolidaysService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getHolidays(): Promise<{ docId: string; dates: string[] }> {
    const snapshot = await this.fire.firestore.collection("holidays").get();
    const data = snapshot.docs[0].data();

    return {
      docId: snapshot.docs[0].id,
      dates: data.dates,
    };
  }

  async saveHoliday(date: string) {
    const { docId, dates } = await this.getHolidays();
    const newDates: string[] = [...dates, formatDate(date)];

    const sortedDates = newDates.sort((accDate, currDate) =>
      compareAsc(new Date(accDate), new Date(currDate))
    );

    const ref = this.fire.firestore.collection("holidays").doc(docId);
    await ref.set({ dates: sortedDates });

    return newDates;
  }

  async deleteHoliday(date: string) {
    const { docId, dates } = await this.getHolidays();
    const newDates = dates.filter(
      (x) => !isSameDay(new Date(x), new Date(date))
    );

    const ref = this.fire.firestore.collection("holidays").doc(docId);
    await ref.set({ dates: newDates });

    return newDates;
  }
}
