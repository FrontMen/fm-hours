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
  <p>Your timesheet for <strong>${startDate}</strong> to <strong>${endDate}</strong> has been denied with the following reason:</p>
  <blockquote cite="Frontmen Hours Team" style="padding: 15px; background: #eee; border-radius: 5px;">${denialMessage}</blockquote>
  <p>Please amend your timesheet & submit it again.</p>
  <p>For any questions contact uren@frontmen.nl or Matthias in Slack.</p>
  <br />
  <p>Thanks,</p>
  <p>Matthias</p>
  `;

  return {
    to: `${employee.name} ${employee.email}`,
    subject: "Timesheet denied",
    html,
  };
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
