# fm-hours

## Prerequisites

Node version 12

## Build Setup

```bash
# install dependencies
$ yarn install
$ cd functions && yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Add an API endpoint

For every single request which needs to be made server side, we use [`Serverless Functions`](https://vercel.com/docs/concepts/functions/introduction) from Vercel.

To add a new one, create a new file under `/api/` folder with the route name:

```
.
└── api
    └── auth.ts
```

After that, you have to register that route on `vercel.json` file:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/auth",
      "dest": "/api/auth.ts"
    }
  ],
  // other configs
}
```

Then you're good.

You'll be able to reach this endpoint via `https://<preview-url>/api/auth`.

> Do not forget to add unit tests to ensure it's working as you expect 😉
