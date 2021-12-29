import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from 'axios';
import {validateParams} from '../../../lib/request';

export default function Contract(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    validateParams(request, ['contractId']);
  } catch (e) {
    return response.status(400).json({
      message: e.message,
    });
  }

  const {contractId} = request.query;

  return axios
    .get(`https://bridge.hosted-tools.com/api/v1/contracts?id=${contractId}`, {
      headers: {
        Cookie: request.headers.cookie || '',
      },
    })
    .then((res) => response.json(res.data))
    .catch((err) => response.json(err));
}
