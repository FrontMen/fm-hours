interface BuildEmailDataProps {
  employee: Employee;
  week: WeekDate[];
  denialMessage: string;
}

export const buildEmailData = ({
  employee,
  week,
  denialMessage,
}: BuildEmailDataProps) => {
  const getDayLabel = (day: WeekDate) => `${day.monthDay}/${day.month}`;

  const startDate = getDayLabel(week[0]);
  const endDate = getDayLabel(week[6]);

  const html = `
  <p>Dear ${employee.name},</p><br />
  <p>Your admin has denied your timesheet of period of <strong>${startDate}</strong> to <strong>${endDate}</strong>.</p>
  <p>The reason for your timesheet not be accepted is described as:</p>
  <blockquote cite="Frontmen Hours Team" style="padding: 15px; background: #eee; border-radius: 5px;">${denialMessage}</blockquote>
  <p>Please, resubmit your report with the corrections asked or contact your manager.</p>
  `;

  return {
    to: `${employee.name} ${employee.email}`,
    subject: "A problem happened with your timesheet",
    html,
  };
};
