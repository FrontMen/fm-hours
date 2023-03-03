import jwtDecode from 'jwt-decode';
import pkg from 'axios';
import axios from './axios.mjs';

const {AxiosError} = pkg;

export const SIGN_IN_ATTR =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/privatepersonalidentifier';

function decodeSamlToken(token) {
  return jwtDecode(token);
}

function getPpid(token) {
  const {sign_in_attributes: signInAttrs} = decodeSamlToken(token).firebase;
  return signInAttrs[SIGN_IN_ATTR];
}

export async function getAuthCookie(token) {
  if (!token) {
    throw new Error('Missing auth token');
  }
  const secondsInADay = 86400;

  const ppid = getPpid(token);

  const {data: connectionInfo} = await axios.post(
    `${process.env.AUTH_URL}/api/get-token/hours.frontmen.nl/${process.env.BRIDGE_URL?.replace(
      'https://',
      ''
    )}/${ppid}`
  );

  return `hosted-tools-api-auth-2=${connectionInfo.cookie_value}; Path=/; Secure; Max-Age=${secondsInADay}; Same-Site=Lax`;
}

export async function getBridgeCookies(authCookie) {
  try {
    // Is going to throw a 307 Temporary Redirect
    await axios.get(`${process.env.BRIDGE_URL}/apps/`, {
      maxRedirects: 0,
      headers: {
        Cookie: authCookie,
      },
    });
  } catch (e) {
    if (e instanceof AxiosError) {
      // Return all cookies from Bridge
      return e?.response?.headers?.['set-cookie'] || [];
    }
  }

  return '';
}
