import {VercelRequest, VercelResponse} from '@vercel/node';
import {Collections} from '../../types/enums';
import {lazyFirestore} from '../../lib/db_manager';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const firestore = await lazyFirestore();
    const {ids} = req.query;

    const ref = firestore
      .collection(Collections.CUSTOMERS)
      .where(firestore.FieldPath.documentId(), 'in', ids);

    const snapshot = await ref.get();

    const response = snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));

    return res.status(200).json(response);
  } catch (e: unknown) {
    if (e instanceof Error) return res.status(500).json(e.message);
  }
};
