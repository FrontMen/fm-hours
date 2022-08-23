/* eslint-disable camelcase */
import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from 'axios';
import {format} from 'date-fns';
import {lazyFirestore} from '../../../lib/db_manager';
import {Collections} from '../../../types/enums';

export default async function Worklogs(request: VercelRequest, response: VercelResponse) {
  const worklogId = request.query.worklogId;

  const firestore = await lazyFirestore();
  const ref = firestore.collection(Collections.TIMREC);

  if (request.method === 'PUT') {
    const {body} = request;
    const timeSpent = body.record.hours * 60 * 60;
    const worklog = {
      time_spent: timeSpent,
      time_billable: timeSpent,
      start_time: `${format(new Date(body.record.date), 'yyyy-MM-dd')} 08:00:00`,
      contract_id: body.contractId,
      description: 'synced from on-site hours',
      source: 'on-site',
      source_id: new Date().getTime(), // unique number, we don't need an identifier
      source_reference: 'on-site hours',
    };

    try {
      await axios.put(`${process.env.BRIDGE_URL}/api/v1/worklogs/${worklogId}`, worklog, {
        headers: {
          Cookie: request.headers.cookie || '',
        },
      });
      await ref.doc(body.record.id).update(body.record);

      return response.send('OK');
    } catch (e: unknown) {
      if (e instanceof Error) {
        return response.status(500).json({
          message: e.message,
        });
      }
    }
  }

  if (request.method === 'DELETE') {
    try {
      const docToDelete = await ref.doc(worklogId).get();
      await axios.delete(`${process.env.BRIDGE_URL}/api/v1/worklogs/${worklogId}`, {
        headers: {
          Cookie: request.headers.cookie || '',
        },
      });
      const newRecord: any = {...docToDelete};
      delete newRecord.id;
      newRecord.worklogId = null;
      // n.d.Max why are we doing this and not just mark it as deleted?
      const response = await ref.doc(worklogId).update(newRecord);
      return response.status(200).json(response);
    } catch (e: unknown) {
      if (e instanceof Error)
        return response.status(500).json({
          message: e.message,
        });
    }
  }
}
