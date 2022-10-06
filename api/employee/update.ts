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
    const newEmployee = {...employee.data} as any;
    delete newEmployee.id;

    const result = await firestore
      .collection(Collections.EMPLOYEES)
      .doc(employee.data.id)
      .set(newEmployee, {merge: true});

    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};
