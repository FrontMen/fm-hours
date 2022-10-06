import {VercelRequest, VercelResponse} from '@vercel/node';
import {Collections} from '../../types/enums';
import {lazyFirestore} from '../../lib/db_manager';

export default async (_req: VercelRequest, res: VercelResponse) => {
  const firestore = await lazyFirestore();
  // ndMax: unfiltered queries will eventually give you troubles
  const ref = firestore.collection(Collections.CUSTOMERS);
  const snapshot = await ref.get();

  const response = snapshot.docs.map((res: any) => ({
    id: res.id,
    ...res.data(),
  }));

  return res.status(200).json(response);
};
