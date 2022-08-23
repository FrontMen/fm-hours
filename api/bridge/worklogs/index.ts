/* eslint-disable camelcase */
import {VercelRequest, VercelResponse} from '@vercel/node';
import {format} from 'date-fns';
import axios from 'axios';
import {lazyFirestore} from '../../../lib/db_manager';
import {Collections} from '../../../types/enums';

export default async function Worklogs(request: VercelRequest, response: VercelResponse) {
  const firestore = await lazyFirestore();
  const {timeRecords, contracts, bridgeUid} = request.body;
  const responseData = [];

  const ref = firestore.collection(Collections.TIMREC);
  const index = 0;
  for (const record of timeRecords) {
    if (record.hours <= 0) return;
    if (!record.id) return;

    const {id} = record;
    const newRecord: any = {...record};
    delete newRecord.id;

    const timeSpent = record.hours * 60 * 60;
    const worklog = {
      user_id: bridgeUid,
      start_time: `${format(new Date(record.date), 'yyyy-MM-dd')} 08:00:00`,
      contract_id: contracts[index],
      description: 'synced from on-site hours',
      time_spent: timeSpent,
      time_billable: timeSpent,
      source: 'on-site',
      source_id: new Date().getTime(), // unique number, we don't need an identifier
      source_reference: '',
    };

    try {
      const res = (
        await axios.post(`${process.env.BRIDGE_URL}/api/v1/worklogs`, worklog, {
          headers: {
            Cookie: request.headers.cookie || '',
          },
        })
      ).data;

      if (!res.worklogId)
        return response.status(500).json('Bridge did not found any worklog with this ID');

      newRecord.worklogId = res.worklogId;
      await ref.doc(id).update(newRecord);
      responseData.push(newRecord);
    } catch (e: unknown) {
      if (e instanceof Error) {
        return response.status(500).json({
          message: e.message,
        });
      }
    }
  }

  return response.status(200).json(responseData);
}
