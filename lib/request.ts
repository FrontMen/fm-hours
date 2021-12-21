import {VercelRequest} from '@vercel/node';

export function validateParams(request: VercelRequest, params: string[]) {
  params.forEach((param) => {
    if (!request.query[param]) {
      throw new Error(`Missing param '${param}'`);
    }
  });
}

export function validateHeaders(request: VercelRequest, headers: string[]) {
  headers.forEach((header) => {
    if (!request.headers[header]) {
      throw new Error(`Missing header '${header}'`);
    }
  });
}
