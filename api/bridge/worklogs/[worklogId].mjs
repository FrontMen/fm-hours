import {format} from 'date-fns';
import axios from '../../../lib/axios.mjs';
import {handleAxiosError} from '../../../lib/errors.mjs';

export default async function Worklogs(request, response) {
  const worklogId = request.query.worklogId;

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

      return response.send('OK');
    } catch (error) {
      return handleAxiosError(response, error);
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
    } catch (error) {
      return handleAxiosError(response, error);
    }
  }
}
