import {VercelRequest, VercelResponse} from '@vercel/node';
// import axios from 'axios';

export default function UserMe(req: VercelRequest, res: VercelResponse) {
  // const {data} = await axios.get('https://pokeapi.co/api/v2/pokemon');

  res.json({
    body: {
      working: true,
      // data,
    },
    query: req.query,
    cookies: req.cookies,
  });
}
