/* eslint-disable camelcase */
interface WorkScheme {
  date: string;
  theoreticalHours: number;
  absenceHours: number;
  workHours: number;
  holiday: number;
}

interface ApiWorkSchema {
  absence_hours: number;
  date: string;
  holiday: number;
  present_hours: number;
  theoretical_hours: number;
  work_hours: number;
}

interface WorkSchemeResponse {
  status: number;
  message: string;
  data: ApiWorkSchema[];
}
