import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  const firestore = await lazyFirestore();
  const {customer} = req.body;
  const newCustomer = {...customer} as any;
  delete newCustomer.id;

  const response = await firestore
    .collection(Collections.CUSTOMERS)
    .doc(customer.id)
    .update(newCustomer);

  return res.status(200).json(response);
};
