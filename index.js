import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { toNodeHandler } from 'better-auth/node';
import { connectToMongoDB, dbState } from './db.js';
import { createAuth } from './auth.js';
import catsRouter from './routes/cats.js';
import studiosRouter, { seedStudiosIfEmpty } from './routes/studios.js';
import bookingsRouter from './routes/bookings.js';
import authRouter from './routes/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

try {
  await connectToMongoDB();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

await seedStudiosIfEmpty();

const auth = createAuth();

app.use('/api/auth', toNodeHandler(auth.handler));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: dbState() });
});

app.use('/api/cats', catsRouter);
app.use('/api/categories', catsRouter);
app.use('/api/studios', studiosRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/custom-auth', authRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  let status = err.status || err.statusCode;
  let message = err.message;

  if (err.name === 'CastError') {
    status = 404;
    message = 'Not found';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((entry) => entry.message)
      .join(', ');
  }

  if (!status || status >= 500) {
    console.error(err);
    status = status || 500;
    message = 'Internal server error';
  }

  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
  console.log(
    `Better Auth mounted at /api/auth (baseURL: ${auth.options.baseURL || process.env.BETTER_AUTH_URL})`
  );
});
