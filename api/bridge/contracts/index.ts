import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from 'axios';

export default function Contracts(
  request: VercelRequest,
  response: VercelResponse
) {
  return axios
    .get(`https://bridge.hosted-tools.com/api/v1/contracts`, {
      headers: {
        Cookie: request.headers.cookie || '',
      },
    })
    .then((res) => response.json(res.data))
    .catch((err) => response.json(err));
}
