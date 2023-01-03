import type {NuxtFireInstance} from '@nuxtjs/firebase';
import firebase from 'firebase/compat';
import GenericRepository from './GenericRepository';
import {Collections} from '~/types/enums';

export default (fire: NuxtFireInstance, fireModule: typeof firebase) => {
  // return Object.entries(Collections).reduce((acc, [key, value]) => {
  //   acc[key.toLocaleLowerCase()] = GenericRepository(value, fire, fireModule);
  //   return acc;
  // }, {});

  return {
    employees: GenericRepository(Collections.EMPLOYEES, fire, fireModule),
    admins: GenericRepository(Collections.ADMINS, fire, fireModule),
    timerecords: GenericRepository(Collections.TIMREC, fire, fireModule),
    // etc.
  };
};
