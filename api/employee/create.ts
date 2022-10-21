import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(504);
    }

    const firestore = await lazyFirestore();
    const {employee} = req.body;
    const isAdmin = employee.isAdmin;
    delete employee.isAdmin;

    const newEmployee = {
      ...employee,
      picture: '',
      created: new Date().getTime(),
    };

    const ref = firestore.collection(Collections.EMPLOYEES);
    const {id} = await ref.add(newEmployee);

    if (isAdmin) {
      const docs = await firestore.collection(Collections.ADMINS).get();
      const adminList = docs.docs[0].data().admins;
      adminList.push(employee.email);
      const docId = docs.docs[0].id;
      const ref = await firestore.collection(Collections.ADMINS).doc(docId);
      await ref.update({admins: adminList});
    }

    const result = {...newEmployee, id};
    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};
