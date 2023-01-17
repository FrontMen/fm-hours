import axios from '../../lib/axios.mjs';

export default async function UserMe(request, response) {
  try {
    const {data: bridgeUid} = await axios.get(`${process.env.BRIDGE_URL}/api/v1/users/me`, {
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
