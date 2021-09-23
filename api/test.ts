import {VercelRequest, VercelResponse} from '@vercel/node';

export default function (req: VercelRequest, res: VercelResponse) {
  res.json({
    body: {
      ...req.body,
      hello: 'world',
      test: 'test',
    },
    query: req.query,
    cookies: req.cookies,
  });
}
