## Local setup

The project has a Next.js frontend at the repository root and a FastAPI backend in
`backend`. Use Node.js 20.9 or newer and Python 3.12.

### Backend

From the repository root, create the virtual environment and install the backend
dependencies:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API is available at `http://127.0.0.1:8000` and its interactive docs are at
`http://127.0.0.1:8000/docs`. The SQLite database is created as
`backend/ai_visibility.db` when the backend starts. Existing database files are
not replaced. For an existing database that needs the included schema migration,
run `.\.venv\Scripts\python.exe -m app.migrate_database` from `backend` after
ensuring its `audits` table exists.

### Frontend

In a second terminal, from the repository root:

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`. The frontend uses the backend at
`http://127.0.0.1:8000`; start the backend first. Firecrawl enrichment is
optional and requires a real Firecrawl API key and an
`INTEGRATION_ENCRYPTION_KEY` in `backend/.env`.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
