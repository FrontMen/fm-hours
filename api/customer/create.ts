import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405);
    }

    const firestore = await lazyFirestore();
    const {customer} = req.body;
    const ref = firestore.collection(Collections.CUSTOMERS);
    const {id} = await ref.add(customer);

    const response = {
      ...customer,
      id,
    };

    return res.status(200).json(response);
  } catch (e: unknown) {
    if (e instanceof Error) return res.status(500).json(e.message);
  }
};
