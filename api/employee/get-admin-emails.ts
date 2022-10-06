import {VercelRequest, VercelResponse} from '@vercel/node';
import {Collections} from '../../types/enums';
import {lazyFirestore} from '../../lib/db_manager';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(504);
    }
    const firestore = await lazyFirestore();

    const ref = firestore.collection(Collections.ADMINS);
    const snapshot = await ref.get();
    const result = (snapshot.docs[0].data().admins || []) as string[];

    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};
