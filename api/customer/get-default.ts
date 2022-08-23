import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (_req: VercelRequest, res: VercelResponse) => {
  const firestore = await lazyFirestore();
  const ref = firestore.collection(Collections.CUSTOMERS).where('isDefault', '==', true);
  const snapshot = await ref.get();

  const response = snapshot.docs.map((res: any) => ({
    id: res.id,
    ...res.data(),
  }));

  return res.status(200).json(response);
};
