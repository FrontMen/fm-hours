import {VercelRequest, VercelResponse} from '@vercel/node';
import {validateHeaders} from '../../lib/request';
import {getAuthCookieValue} from '../../lib/intracto';

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
    const authCookie = await getAuthCookieValue(request.headers.authorization);
    const secondsInADay = 86400;

    response.setHeader('Set-Cookie', [
      `${authCookie}; Path=/; Secure; Max-Age=${secondsInADay}; Same-Site=Lax`,
    ]);
    return response.end('OK');
  } catch (e) {
    return response.status(401).json({
      message: e.message,
    });
  }
}
