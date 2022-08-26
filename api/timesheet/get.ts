import {VercelRequest, VercelResponse} from '@vercel/node';
import {Collections} from '../../types/enums';
import {lazyFirestore} from '../../lib/db_manager';
import {Timesheet} from '../../interfaces/timesheets';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const firestore = await lazyFirestore();
    const {date, startDate, endDate, employeeId} = req.query;

    let query = firestore.collection(Collections.TIMESHEETS);

    if (date && !startDate && !endDate) query = query.where('date', '==', date);

    if (startDate && !date)
      query = query.where('date', '>=', new Date(startDate as string).getTime());

    if (endDate && !date) query = query.where('date', '<=', new Date(endDate as string).getTime());

    if (employeeId) query = query.where('employeeId', '==', employeeId);

    const snapshot = await query.get();

    const result = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as Omit<Timesheet, 'id'>),
    }));

    res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) return res.status(500).json(e.message);
  }
};
