import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(504).json({});
    }

    const firestore = await lazyFirestore();

    const {employee} = req.body;
    const newEmployee = {...employee} as any;
    const isAdmin = newEmployee.isAdmin;
    delete newEmployee.isAdmin;
    delete newEmployee.id;

    const result = await firestore
      .collection(Collections.EMPLOYEES)
      .doc(employee.id)
      .set(newEmployee, {merge: true});

    const docs = await firestore.collection(Collections.ADMINS).get();
    let adminList = docs.docs[0].data().admins;
    adminList = adminList.filter((a: string) => a !== employee.email);
    if (isAdmin) {
      adminList.push(employee.email);
    }
    const docId = docs.docs[0].id;
    const ref = await firestore.collection(Collections.ADMINS).doc(docId);
    await ref.update({admins: adminList});

    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};
