export interface WorkScheme {
  date: string;
  theoreticalHours: number;
  absenceHours: number;
  workHours: number;
  holiday: boolean;
}

export interface WorkSchemeResponse {
  status: number;
  message: string;
  data: WorkScheme[];
}
