import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const firestore = await lazyFirestore();
    const {employee} = req.body;
    const newEmployee = {
      ...employee,
      picture: '',
      created: new Date().getTime(),
    };

    const ref = firestore.collection(Collections.EMPLOYEES);
    const {id} = await ref.add(newEmployee);

    const result = {...newEmployee, id};
    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};
