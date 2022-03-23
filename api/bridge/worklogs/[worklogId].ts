/* eslint-disable camelcase */
import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from 'axios';
import {format} from 'date-fns';

export default async function Worklogs(request: VercelRequest, response: VercelResponse) {
  const worklogId = request.query.worklogId;

  if (request.method === 'PUT') {
    const {body} = request;
    const timeSpent = body.record.hours * 60 * 60;
    const worklog = {
      time_spent: timeSpent,
      time_billable: timeSpent,
      start_time: format(new Date(body.record.date), 'yyyy-MM-dd HH:mm:ss'),
      contract_id: body.contractId,
      description: 'synced from on-site hours',
      source: 'on-site',
      source_id: 1, // random number, we don't need an identifier
      source_reference: 'on-site hours',
    };

    try {
      await axios.put(`${process.env.BRIDGE_URL}/api/v1/worklogs/${worklogId}`, worklog, {
        headers: {
          Cookie: request.headers.cookie || '',
        },
      });

      return response.send('OK');
    } catch (e) {
      return response.status(e.response.status).json({
        message: e.message,
      });
    }
  }

  if (request.method === 'DELETE') {
    try {
      await axios.delete(`${process.env.BRIDGE_URL}/api/v1/worklogs/${worklogId}`, {
        headers: {
          Cookie: request.headers.cookie || '',
        },
      });

      return response.send('OK');
    } catch (e) {
      return response.status(e.response.status).json({
        message: e.message,
      });
    }
  }
}
