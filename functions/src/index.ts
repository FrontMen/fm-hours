import * as admin from "firebase-admin";

import { createEmployeeBuilder } from "./createEmployee";
import { sendMail } from "./sendMail";

admin.initializeApp();
const db = admin.firestore();

const createEmployee = createEmployeeBuilder(db);

exports.createEmployee = createEmployee;
exports.sendMail = sendMail;
