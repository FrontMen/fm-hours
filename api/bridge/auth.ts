import {VercelRequest, VercelResponse} from '@vercel/node';
import {validateHeaders} from '../../lib/request';
import {getAuthCookie, getCiSessionCookie} from '../../lib/intracto';

export default async function Auth(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    validateHeaders(request, ['authorization']);
  } catch (e) {
    return response.status(400).json({
      message: e.message,
    });
  }

  try {
    const cookies = [];
    const authCookie = await getAuthCookie(request.headers.authorization);
    cookies.push(authCookie);

    const ciSession = await getCiSessionCookie(authCookie);
    if (ciSession !== '') {
      cookies.push(ciSession);
    }

    response.setHeader('Set-Cookie', cookies);
    return response.end('OK');
  } catch (e) {
    return response.status(401).json({
      message: e.message,
    });
  }
}
