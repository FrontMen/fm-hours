import {VercelRequest, VercelResponse} from '@vercel/node';
import {Collections} from '../../types/enums';
import {Timesheet} from '../../interfaces/timesheets';
import {lazyFirestore} from '../../lib/db_manager';
import {recordStatus} from '../../helpers/record-status';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const {startDate, endDate} = req.query;
    const firestore = await lazyFirestore();

    const snapshot = await firestore
      .collection(Collections.TIMESHEETS)
      .where('status', '==', recordStatus.APPROVED)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();

    const result = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as Omit<Timesheet, 'id'>),
    }));

    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) return res.status(500).json(e.message);
  }
};
