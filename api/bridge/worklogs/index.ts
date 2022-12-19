/* eslint-disable camelcase */
import {VercelRequest, VercelResponse} from '@vercel/node';
import {format} from 'date-fns';
import axios from '../../../lib/axios';
import {handleAxiosError} from '../../../lib/errors';

export default async function Worklogs(request: VercelRequest, response: VercelResponse) {
  const {body} = request;

  const timeSpent = body.record.hours * 60 * 60;
  const worklog = {
    user_id: body.bridgeUid,
    start_time: `${format(new Date(body.record.date), 'yyyy-MM-dd')} 08:00:00`,
    contract_id: body.contractId,
    description: 'synced from on-site hours',
    time_spent: timeSpent,
    time_billable: timeSpent,
    source: 'on-site',
    source_id: new Date().getTime(), // unique number, we don't need an identifier
    source_reference: '',
  };

  try {
    const {id: worklogId} = await axios
      .post(`${process.env.BRIDGE_URL}/api/v1/worklogs`, worklog, {
        headers: {
          Cookie: request.headers.cookie || '',
        },
      })
      .then(({data}) => data.data);

    return response.json({
      worklogId,
    });
  } catch (error) {
    return handleAxiosError(response, error);
  }
}
