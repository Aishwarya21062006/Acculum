import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import dbManager from './db/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  // Initialize database first
  await dbManager.init();

  // Seed default facilitator account if not exists
  const defaultFac = dbManager.get('SELECT id FROM facilitators WHERE email = ?', ['facilitator@acculum.edu']);
  if (!defaultFac) {
    const pwHash = crypto.createHash('sha256').update('Acculum2026!acculum_salt_2024').digest('hex');
    const now = new Date().toISOString();
    dbManager.run(
      `INSERT INTO facilitators (id, email, password_hash, full_name, school, facilitator_id, subjects, classes, preferred_language, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'FAC-DEFAULT-001',
        'facilitator@acculum.edu',
        pwHash,
        'Dr. Priya Sharma',
        'Delhi Public School',
        'FAC-2026-01',
        JSON.stringify(['Mathematics', 'Science']),
        JSON.stringify(['8', '9']),
        'English',
        now,
        now,
      ]
    );
  }

  const app = express();
  const PORT = process.env.PORT || 3001;

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // Middleware
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
    credentials: true,
  }));
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Routes (dynamic imports to avoid top-level issues before db init)
  const { router: authRouter } = await import('./routes/auth.js');
  const { router: reportsRouter } = await import('./routes/reports.js');
  const { router: studentsRouter } = await import('./routes/students.js');
  const { router: interventionsRouter, reassessmentsRouter } = await import('./routes/interventions.js');
  const { router: analyticsRouter } = await import('./routes/analytics.js');
  const { router: demoRouter } = await import('./routes/demo.js');
  const { router: textbooksRouter } = await import('./routes/textbooks.js');
  const { router: studentTextbooksRouter } = await import('./routes/studentTextbooks.js');
  const { router: quizzesRouter } = await import('./routes/quizzes.js');
  const { router: textbookAnalyticsRouter } = await import('./routes/textbookAnalytics.js');

  app.use('/api/auth', authRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/students', studentsRouter);
  app.use('/api/interventions', interventionsRouter);
  app.use('/api/reassessments', reassessmentsRouter);
  app.use('/api/analytics/textbook', textbookAnalyticsRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/notifications', analyticsRouter); // shares analytics router
  app.use('/api/demo', demoRouter);
  app.use('/api/textbooks', textbooksRouter);
  app.use('/api/student/textbooks', studentTextbooksRouter);
  app.use('/api/quizzes', quizzesRouter);

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  // Serve client build in production
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(clientDist, 'index.html'));
      }
      next();
    });
  }

  app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════════════════════╗`);
    console.log(`║   Acculum Facilitator Dashboard — API Server         ║`);
    console.log(`║   Running on http://localhost:${PORT}                   ║`);
    console.log(`╚══════════════════════════════════════════════════════╝\n`);
    console.log(`  Endpoints:`);
    console.log(`  POST  /api/auth/register`);
    console.log(`  POST  /api/auth/login`);
    console.log(`  GET   /api/students`);
    console.log(`  POST  /api/reports/import`);
    console.log(`  GET   /api/analytics/dashboard`);
    console.log(`  POST  /api/demo/load`);
    console.log(`\n  Client: http://localhost:5173 (run npm run client)\n`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[SERVER] Shutting down gracefully...');
    dbManager.close();
    process.exit(0);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Failed to start:', err.message);
  process.exit(1);
});
