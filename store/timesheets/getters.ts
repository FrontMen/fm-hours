import {GetterTree} from 'vuex';
import {recordStatus} from '~/helpers/record-status';

const getters: GetterTree<TimesheetsStoreState, RootStoreState> = {
  timesheetStatus(state) {
    return state.weeklyTimesheet.info
      ? state.weeklyTimesheet.info.status
      : (recordStatus.NEW as TimesheetStatus);
  },
  isReadonly(_, getters) {
    return (
      getters.timesheetStatus === recordStatus.APPROVED ||
      getters.timesheetStatus === recordStatus.PENDING
    );
  },
  projectsOrdered(state): TimesheetProject[] {
    return [...state.weeklyTimesheet.projects].sort(
      (projectA: TimesheetProject, projectB: TimesheetProject) => {
        // Casting because TS doesn't like to subtract booleans
        const defaultCompare =
          +projectA.project.customer.isDefault - +projectB.project.customer.isDefault;
        return defaultCompare !== 0
          ? defaultCompare
          : projectA.project.customer.name.localeCompare(projectB.project.customer.name);
      }
    );
  },
  hasRestDayHours(state) {
    return state.weeklyTimesheet.projects.reduce((_: boolean, project: TimesheetProject) => {
      return project.values.reduce((acc, value, index) => {
        if (!value) return acc;

        const day = state.weeklyTimesheet.week[index];

        return index === 5 || index === 6 || day.isHoliday || day.isLeaveDay;
      }, false);
    }, false);
  },
};

export default getters;
