import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from '../../lib/axios';

export default async function UserMe(request: VercelRequest, response: VercelResponse) {
  try {
    const {data: bridgeUid} = await axios.get<Number>(`${process.env.BRIDGE_URL}/api/v1/users/me`, {
      headers: {
        Cookie: request.headers.cookie || '',
      },
    });

    return response.json({
      bridgeUid,
    });
  } catch (e) {
    if (e instanceof Error) {
      return response.status(401).json({
        message: e.message,
      });
    }

    return response.status(500);
  }
}
