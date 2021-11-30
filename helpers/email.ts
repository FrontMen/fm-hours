import {format} from 'date-fns';

interface DenialEmailProps {
  employee: Employee;
  week: WeekDate[];
}

interface ReminderEmailProps {
  employee: {name: string; email: string};
  startDate: number;
}
interface BuildEmailProps {
  employee: {name: string; email: string};
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

export const createDenialEmal = ({employee, week}: DenialEmailProps) => {
  const startDate = getDayLabel(week[0]);
  const endDate = getDayLabel(week[6]);

  const content = `
  <p>Your timesheet for <strong>${startDate}</strong> to <strong>${endDate}</strong> has been denied.</p>
  <p>Please amend your timesheet & submit it again.</p>
  `;

  return buildEmail({employee, content, subject: 'Timesheet denied'});
};

export const createReminderEmail = ({
  employee,
  startDate,
}: ReminderEmailProps) => {
  const dayLabel = format(startDate, 'dd MMMM');
  const baseUrl = location.origin;

  const content = `
    <p>This is a reminder to submit the following <a href="${baseUrl}/${startDate}" target="_blank">timesheet</a>.</p>
    <p>Please take some time to fill it in and submit it for approval.</p>
  `;

  return buildEmail({
    employee,
    content,
    subject: `Timesheet reminder ${dayLabel}`,
  });
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
