export function formatDate(dirtyDate) {
  const date = new Date(dirtyDate);
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function addDays(dirtyDate, days) {
  const date = new Date(dirtyDate);
  date.setDate(date.getDate() + days);
  return date;
}

export function getDateLabel(startDate, endDate, format) {
  let label = format(startDate, "dd");
  if (startDate.getMonth() !== endDate.getMonth()) {
    label += ` ${format(startDate, "MMM")}`;

    if (startDate.getFullYear() !== endDate.getFullYear()) {
      label += ` ${format(startDate, "yyyy")}`;
    }
  }
  label += ` - ${format(endDate, "dd MMM yyyy")}`;
  return label;
}
