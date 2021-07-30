interface BuildEmailDataProps {
  employee: Employee;
  week: WeekDate[];
  denialMessage: string;
}

interface ReminderEmailProps {
  employee: Employee;
  week: WeekDate[];
}
interface BuildEmailProps {
  employee: Employee;
  content: string;
  subject: string;
}

const buildEmail = ({employee, content, subject}: BuildEmailProps) => {
  const html = `
  <p>Dear ${employee.name},</p><br />
  ${content}
  <p>For any questions contact uren@frontmen.nl or Matthias in Slack.</p>
  <br />
  <p>Thanks,</p>
  <p>Matthias</p>
  `;

  return {
    to: `${employee.name} ${employee.email}`,
    subject,
    html,
  };
};

const getDayLabel = (day: WeekDate) => `${day.monthDay}/${day.month}`;

export const buildEmailData = ({
  employee,
  week,
  denialMessage,
}: BuildEmailDataProps) => {
  const startDate = getDayLabel(week[0]);
  const endDate = getDayLabel(week[6]);

  const content = `
  <p>Your timesheet for <strong>${startDate}</strong> to <strong>${endDate}</strong> has been denied with the following reason:</p>
  <blockquote cite="Frontmen Hours Team" style="padding: 15px; background: #eee; border-radius: 5px;">${denialMessage}</blockquote>
  <p>Please amend your timesheet & submit it again.</p>
  `;

  return buildEmail({employee, content, subject: 'Timesheet denied'});
};

export const createReminderEmail = ({employee, week}: ReminderEmailProps) => {
  const startDate = new Date(week[0].date).getTime();
  const dayLabel = getDayLabel(week[0]);
  const baseUrl = location.origin;

  const content = `
    <p>This is a reminder to submit the following <a href="${baseUrl}/records/${startDate}" target="_blank">timesheet</a>.</p>
    <p>Please take some time to fill it in and submit it for approval.</p>
  `;

  return buildEmail({
    employee,
    content,
    subject: `Timesheet reminder ${dayLabel}`,
  });
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
