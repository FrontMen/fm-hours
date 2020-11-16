import Vue from 'vue'
import { format } from 'date-fns';

Vue.filter('formatDate', (value, formatString) => {
    formatString = formatString || '';
    const date = new Date();
    return format(date, formatString);
})