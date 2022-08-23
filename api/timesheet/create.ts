import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: any, res: any) => {
  try {
    const ref = await (await lazyFirestore()).collection(Collections.TIMESHEETS);
    // n.d.Max from where it comes the id?
    const {id, ...newTimesheet} = req.body;

    if (id) {
      await ref.doc(id).update(newTimesheet);

      return {id, ...newTimesheet};
    }

    const newDocument = await ref.add(newTimesheet);

    const result = {...newTimesheet, id: newDocument.id};
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json(e.message);
  }
};
