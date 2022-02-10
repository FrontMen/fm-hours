import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from 'axios';

export default async function UserMe(request: VercelRequest, response: VercelResponse) {
  try {
    const {data: bridgeUid} = await axios.get<Number>(
      'https://bridge.hosted-tools.com/api/v1/users/me',
      {
        headers: {
          Cookie: request.headers.cookie || '',
        },
      }
    );

    return response.json({
      bridgeUid,
    });
  } catch (e) {
    return response.status(401).json({
      message: e.message,
    });
  }
}
