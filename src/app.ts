import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import health from './routes/health.js';
import doctorsRouter from './routes/doctors.routes.js';
import appointmentsRouter from './routes/appointments.js';
import meRouter from './routes/me.routes.js';
import adminUsersRouter from './routes/admin.users.routes.js';

const app = express();

const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

app.use(
  cors({
    origin: true, // reflect the request origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.options('*', cors()); // handle preflight

// In your app.js
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'default-src': ["'self'"],
        // FIX THE PORT HERE!
        'connect-src': ["'self'", 'http://localhost:3000'],
      },
    },
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));

// Routes
app.use('/healthz', health);
app.use('/v1/doctors', doctorsRouter);
app.use('/v1/appointments', appointmentsRouter);
app.use('/v1/me', meRouter);
app.use('/v1/admin', adminUsersRouter);

// Error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
