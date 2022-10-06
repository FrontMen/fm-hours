import {VercelRequest, VercelResponse} from '@vercel/node';
import {Collections} from '../../types/enums';
import {lazyFirestore} from '../../lib/db_manager';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(504);
    }
    const firestore = await lazyFirestore();
    const {adminList} = req.body;

    const docs = await firestore.collection(Collections.ADMINS).get();
    const docId = docs.docs[0].id;
    const ref = await firestore.collection(Collections.ADMINS).doc(docId);

    await ref.update({admins: adminList});

    return res.status(200).json(adminList);
  } catch (e: unknown) {
    if (e instanceof Error) return res.status(500).json(e.message);
  }
};
