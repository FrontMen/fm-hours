import * as admin from 'firebase-admin';

import {sendMail} from './sendMail';

admin.initializeApp();

exports.sendMail = sendMail;
