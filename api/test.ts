import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from 'axios';

export default async function (req: VercelRequest, res: VercelResponse) {
  const {data} = await axios.get('https://pokeapi.co/api/v2/pokemon');

  res.json({
    body: {
      ...req.body,
      hello: 'world',
      test: 'test',
      data,
    },
    query: req.query,
    cookies: req.cookies,
  });
}
