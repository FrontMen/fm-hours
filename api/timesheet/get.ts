import {Collections} from '../../types/enums';
import {lazyFirestore} from '../../lib/db_manager';

export default async (req: any, res: any) => {
  const firestore = await lazyFirestore();
  const {date, startDate, endDate, employeeId} = req.body;

  let query = firestore.collection(Collections.TIMESHEETS);

  if (date && !startDate && !endDate) query = query.where('date', '==', date);

  if (startDate && !date) query = query.where('date', '>=', new Date(startDate).getTime());

  if (endDate && !date) query = query.where('date', '<=', new Date(endDate).getTime());

  if (employeeId) query = query.where('employeeId', '==', employeeId);

  const snapshot = await query.get();

  const result = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...(doc.data() as Omit<Timesheet, 'id'>),
  }));

  res.status(200).json(result);
};
