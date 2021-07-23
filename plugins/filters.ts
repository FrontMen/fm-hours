import Vue from 'vue';
import {format} from 'date-fns';

import {getDayOnGMT} from '~/helpers/dates';

Vue.filter('formatDate', (value: string, formatString: string) => {
  if (!value) return '';

  formatString = formatString || '';
  const date = getDayOnGMT(value);

  return format(date, formatString);
});
