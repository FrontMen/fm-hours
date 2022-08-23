import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';
import {TravelRecord} from '../../interfaces/travel-record';

export default async (req: any, res: any) => {
  try {
    const firestore = await lazyFirestore();
    const {startDate, endDate} = req.body;
    const snapshot = await firestore
      .collection(Collections.TRAVELREC)
      .where('date', '>=', new Date(startDate).getTime())
      .where('date', '<=', new Date(endDate).getTime())
      .orderBy('date', 'asc')
      .get();

    const result = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as Omit<TravelRecord, 'id'>),
    }));
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json(e.message);
  }
};
