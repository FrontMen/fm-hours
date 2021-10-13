/* eslint-disable camelcase */
import {VercelRequest, VercelResponse} from '@vercel/node';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

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

export default async function UserMe(
  request: VercelRequest,
  response: VercelResponse
) {
  if (!request.headers.authorization) {
    return response.status(400).json({
      message: 'Authorization header is missing',
    });
  }

  const ppid = getPpid(request.headers.authorization);
  const authCookie = await getAuthCookieValue(ppid);
  const bridgeUid = await getBridgeUid(authCookie);

  return response.json({
    bridgeUid,
  });
}

function getPpid(token: string): string {
  const {sign_in_attributes: signInAttrs} = decodeSamlToken(token).firebase;
  return signInAttrs[SIGN_IN_ATTR];
}

function decodeSamlToken(token: string): IDecodedToken {
  return jwtDecode<IDecodedToken>(token);
}

async function getAuthCookieValue(ppid: string): Promise<string> {
  const {data: connectionInfo} =
    await axios.post<IBridgeIntractoConnectionInfo>(
      `https://auth.hosted-tools.com/api/get-token/hours.frontmen.nl/bridge.hosted-tools.com/${ppid}`
    );

  return `hosted-tools-api-auth-2=${connectionInfo.cookie_value}`;
}

async function getBridgeUid(authCookie: string): Promise<Number> {
  const {data: bridgeUid} = await axios.get<Number>(
    'https://bridge.hosted-tools.com/api/v1/users/me',
    {
      headers: {
        Cookie: authCookie,
      },
    }
  );

  return bridgeUid;
}
