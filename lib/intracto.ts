import jwtDecode from 'jwt-decode';
import {AxiosError} from 'axios';
import axios from './axios';

interface IDecodedToken {
  firebase: {
    sign_in_attributes: {
      [attr: string]: string;
    };
  };
}

interface IBridgeIntractoConnectionInfo {
  user_name: string;
  full_name: string;
  email: string;
  groups: string[];
  cookie_domain: string;
  cookie_value: string;
  cookie_expiration: string;
}

export const SIGN_IN_ATTR =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/privatepersonalidentifier';

function decodeSamlToken(token: string): IDecodedToken {
  return jwtDecode<IDecodedToken>(token);
}

function getPpid(token: string): string {
  const {sign_in_attributes: signInAttrs} = decodeSamlToken(token).firebase;
  return signInAttrs[SIGN_IN_ATTR];
}

export async function getAuthCookie(token: string | undefined): Promise<string> {
  if (!token) {
    throw new Error('Missing auth token');
  }
  const secondsInADay = 86400;

  const ppid = getPpid(token);

  const {data: connectionInfo} = await axios.post<IBridgeIntractoConnectionInfo>(
    `${process.env.AUTH_URL}/api/get-token/hours.frontmen.nl/${process.env.BRIDGE_URL?.replace(
      'https://',
      ''
    )}/${ppid}`
  );

  return `hosted-tools-api-auth-2=${connectionInfo.cookie_value}; Path=/; Secure; Max-Age=${secondsInADay}; Same-Site=Lax`;
}

export async function getCiSessionCookie(authCookie: string): Promise<string> {
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
      return e?.response?.headers?.['set-cookie']?.[0] || '';
    }
  }

  return '';
}
