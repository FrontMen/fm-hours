import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  const firestore = await lazyFirestore();
  const {customer} = req.body;
  const ref = firestore.collection(Collections.CUSTOMERS);
  const {id} = await ref.add(customer);

  const response = {
    ...customer,
    id,
  };

  return res.status(200).json(response);
};
