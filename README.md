# fm-hours

> FrontMen - Hours registration

## Pre-requisites

- [Node 12](https://nodejs.org/en/) or higher - Dev platform
- [Yarn version 1](https://classic.yarnpkg.com/lang/en/) - Package manager
- [Vercel CLI](https://vercel.com/docs/cli) - for running with lambdas

## Getting started

Clone this repo and install the dependencies:

```bash
yarn install
```

Create a `.env` based on `.env.defaults`. You can reach one of the team members for the credentials, or, if you have access to Vercel, get it from there.

> 💡 Be sure you're using development keys.

### Development

Since this project uses Vercel's lambda functions (via `/api`), instead of using the traditional `yarn dev`, you'll need to use `Vercel CLI`.

After doing login, run:

```
yarn vercel
```

It might ask you some questions about the project like Organization and if you want to link an existing project.

After that, a `.vercel` folder will be created with some sensitive files and a server will be boot and up running at `http://localhost:3000`

> 💡 .vercel folder should never be commit.

### Build

This project uses Nuxt, targeting static web app. To create a build you simply have to run:

```
yarn build
```

This command will run a build and generate the static assets in `dist` folder.

## Adding a new API endpoint

For every single request which needs to be made server-side, we use [`Serverless Functions`](https://vercel.com/docs/concepts/functions/introduction) from Vercel.

To add a new one, create a new file under `/api/` folder with the route name:

```
.
└── api
    └── auth.ts
```

Then you're good. Now, be able to reach this endpoint via `https://<preview-url>/api/auth`.

> Do not forget to add unit tests to ensure it's working as you expect 😉
