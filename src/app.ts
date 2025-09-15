import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import health from './routes/health.js';
import doctorsRouter from './routes/doctors.routes.js';

const app = express();

const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({ origin: allowed.length ? allowed : true }));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));

// Routes
app.use('/healthz', health);
app.use('/v1/doctors', doctorsRouter);

// Error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
