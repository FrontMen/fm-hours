import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const EMPLOYEE_COLLECTION = "employees";

export const createEmployee = functions.auth
  .user()
  .onCreate(async (employee) => {
    const { email, displayName, photoURL } = employee;

    try {
      const employeeCollection = admin
        .firestore()
        .collection(EMPLOYEE_COLLECTION);

      const employeeSnapshot = await employeeCollection
        .where("email", "==", email)
        .get();

      let employeeData = {};

      // Write new employee if none exist
      if (employeeSnapshot.empty) {
        const now = admin.firestore.FieldValue.serverTimestamp();
        employeeData = {
          name: displayName,
          email,
          picture: photoURL,
          projects: [],
          travelAllowance: false,
          endDate: null,
          startDate: now,
          created: now,
        };
      } else {
        employeeSnapshot.forEach((doc) => {
          employeeData = doc.data();
          doc.ref.delete().catch(() => {
            console.log("error deleting reference ");
          });
        });
      }

      return employeeCollection.doc(employee.uid).set(employeeData);
    } catch (err) {
      throw new functions.https.HttpsError("failed-precondition", err.message);
    }
  });
