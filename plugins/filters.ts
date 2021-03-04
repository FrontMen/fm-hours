import Vue from "vue";
import { format } from "date-fns";

Vue.filter("formatDate", (value: string, formatString: string) => {
  if (!value) return "";

  formatString = formatString || "";
  const date = new Date(value);

  return format(date, formatString);
});
