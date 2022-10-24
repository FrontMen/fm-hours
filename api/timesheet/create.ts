import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(504).json({});
    }
    const firestore = await lazyFirestore();
    const ref = firestore.collection(Collections.TIMESHEETS);
    const {timesheet} = req.body;
    const {id, ...newTimesheet} = timesheet;

    if (id) {
      await ref.doc(id).update(newTimesheet);

      const result = {id, ...newTimesheet};
      return res.status(200).json(result);
    }

    const newDocument = await ref.add(newTimesheet);

    const result = {...newTimesheet, id: newDocument.id};
    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) return res.status(500).json(e.message);
  }
};
