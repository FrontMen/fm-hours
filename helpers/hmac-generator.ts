// eslint-disable-next-line import/named
import {MD5, HmacSHA256, enc} from 'crypto-js';

const phpUrlEncode = (toEncode: string): string =>
  encodeURIComponent(toEncode)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E')
    .replace(/%20/g, '+');

const uuidv4 = (): string =>
  '00-0-4-1-000'.replace(/[^-]/g, (s: any) =>
    (((Math.random() + ~~s) * 0x10000) >> s).toString(16).padStart(4, '0')
  );

export function createHmacHash(
  key: string,
  secret: string,
  method: string,
  endpoint: string,
  queryString: string = '',
  body: unknown = {}
) {
  const lowerCaseMethod = method.toLowerCase();

  const formattedQueryString = queryString !== '' ? `?${queryString}` : '';
  const encodedEndpoint = phpUrlEncode(`${endpoint}${formattedQueryString}`);

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const nonce = uuidv4();

  const md5Body = enc.Base64.stringify(MD5(JSON.stringify(body)));

  const input = `${key}${lowerCaseMethod}${encodedEndpoint}${timestamp}${nonce}${md5Body}`;

  const hashedHmac = enc.Base64.stringify(HmacSHA256(input, secret));

  return `hmac ${key}:${hashedHmac}:${nonce}:${timestamp}`;
}
