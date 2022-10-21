import {VercelRequest, VercelResponse} from '@vercel/node';
import {FieldPath} from '@google-cloud/firestore';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';
import {Employee} from '~/interfaces/employee';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(504).json({});
    }
    const firestore = await lazyFirestore();
    const employeeId = req.query.employeeId;
    const email = req.query.email as string;
    let result;

    let ref = await firestore.collection(Collections.EMPLOYEES);

    if (employeeId) {
      ref = ref.where(FieldPath.documentId(), '==', employeeId);
    }

    const adminsRef = firestore.collection(Collections.ADMINS);
    const adminSnapshot = await adminsRef.get();
    const adminEmails = (adminSnapshot.docs[0].data().admins || []) as string[];

    let fmMail = '';
    let ioMail = '';
    if (email) {
      fmMail = email.replace('@iodigital.com', '@frontmen.nl');
      ioMail = email.replace('@frontmen.nl', '@iodigital.com');

      ref = ref.where('email', 'in', [fmMail, ioMail]);
    }

    const snapshot = await ref.get();
    if ((employeeId || email) && !snapshot.empty) {
      const employee = snapshot.docs[0].data() as Omit<Employee, 'id'>;
      result = {
        id: snapshot.docs[0].id,
        ...employee,
        isAdmin: adminEmails.includes(employee.email),
      };
    } else {
      result = snapshot.docs.map((res: any) => {
        const employee = res.data();
        return {
          id: res.id,
          ...employee,
          isAdmin: adminEmails.includes(employee.email),
        };
      });
    }

    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};
