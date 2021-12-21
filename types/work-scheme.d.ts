/* eslint-disable camelcase */
interface WorkScheme {
  date: string;
  theoreticalHours: number;
  absenceHours: number;
  workHours: number;
  holiday: boolean;
}

interface WorkSchemeResponse {
  status: number;
  message: string;
  data: WorkScheme[];
}
