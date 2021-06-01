import * as admin from "firebase-admin";

import { createEmployee } from "./createEmployee";
import { sendMail } from "./sendMail";

admin.initializeApp();

exports.createEmployee = createEmployee;
exports.sendMail = sendMail;
