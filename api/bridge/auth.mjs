import {validateHeaders} from '../../lib/request.mjs';
import {getAuthCookie, getBridgeCookies} from '../../lib/intracto.mjs';
import {handleAuthenticationError, handleValidationError} from '../../lib/errors.mjs';

export default async function Auth(request, response) {
  try {
    validateHeaders(request, ['authorization']);
  } catch (error) {
    return handleValidationError(response, error);
  }

  try {
    let cookies = [];
    const authCookie = await getAuthCookie(request.headers.authorization);
    cookies.push(authCookie);

    const ciSession = await getBridgeCookies(authCookie);
    cookies = [...cookies, ...ciSession];
    console.log(cookies);

    response.setHeader('Set-Cookie', cookies);
    return response.end('OK');
  } catch (error) {
    return handleAuthenticationError(response, error);
  }
}
