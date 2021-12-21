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

  const authCookie = await getAuthCookieValue(request.headers.authorization);

  response.setHeader('Set-Cookie', [`${authCookie}; Path=/;`]);
  return response.end('OK');
}
