import * as admin from "firebase-admin";

import { createEmployee } from "./createEmployee";

admin.initializeApp();

exports.createEmployee = createEmployee;
