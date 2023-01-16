/* eslint-disable camelcase */
import axios from '../../../lib/axios.mjs';
import {validateParams} from '../../../lib/request.mjs';
import {handleAxiosError, handleValidationError} from '../../../lib/errors.mjs';

export default async function Workscheme(request, response) {
  try {
    validateParams(request, ['bridgeUid', 'date_from', 'date_to']);
  } catch (error) {
    return handleValidationError(response, error);
  }

  const {bridgeUid, date_from: dateFrom, date_to: dateTo} = request.query;

  try {
    const apiWorkScheme = await getWorkscheme(
      request.headers.cookie || '',
      bridgeUid,
      dateFrom,
      dateTo
    );

    const workScheme = apiWorkScheme.map(ws => ({
      date: ws.date,
      theoreticalHours: ws.theoretical_hours,
      absenceHours: ws.absence_hours,
      workHours: ws.work_hours,
      holiday: !!ws.holiday,
    }));

    return response.json({
      data: workScheme,
    });
  } catch (error) {
    return handleAxiosError(response, error);
  }
}

async function getWorkscheme(cookies, bridgeUid, date_from, date_to) {
  const {data: response} = await axios.get(
    `${process.env.BRIDGE_URL}/api/v1/users/${bridgeUid}/worktime`,
    {
      params: {
        date_from,
        date_to,
      },
      headers: {
        Cookie: cookies,
      },
    }
  );

  return response.data;
}
