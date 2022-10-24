import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '~/lib/db_manager';
import {Collections} from '~/types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'DELETE') {
      return res.status(504);
    }
    const firestore = await lazyFirestore();
    const batch = firestore.batch();

    const {recordsToDelete} = req.body;
    recordsToDelete.forEach((record: any) => {
      if (record.id) {
        const ref = firestore.collection(Collections.TIMREC).doc(record.id!);

        batch.delete(ref);
      }
    });

    return await batch.commit();
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};
