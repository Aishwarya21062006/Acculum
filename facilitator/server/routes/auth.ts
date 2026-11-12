import express from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbManager from '../db/database.js';

export const router = express.Router();

function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw + 'acculum_salt_2024').digest('hex');
}

function createSession(facilitatorId: string): string {
  const sessionId = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  dbManager.run(
    'INSERT INTO sessions (id, facilitator_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
    [sessionId, facilitatorId, now.toISOString(), expiresAt.toISOString()]
  );
  return sessionId;
}

export function authenticate(req: any, res: any, next: any) {
  const token = req.headers['x-session-token'] as string;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  const session = dbManager.get<{ facilitator_id: string; expires_at: string }>(
    'SELECT facilitator_id, expires_at FROM sessions WHERE id = ?',
    [token]
  );
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });
  if (new Date(session.expires_at) < new Date()) {
    dbManager.run('DELETE FROM sessions WHERE id = ?', [token]);
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }

  req.facilitatorId = session.facilitator_id;
  next();
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { email, password, full_name, phone, school, facilitator_id, subjects, classes, preferred_language } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }

    const existing = dbManager.get('SELECT id FROM facilitators WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

    const id = uuidv4();
    const now = new Date().toISOString();
    dbManager.run(
      `INSERT INTO facilitators (id, email, password_hash, full_name, phone, school, facilitator_id, subjects, classes, preferred_language, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, email, hashPassword(password), full_name,
        phone || null, school || null, facilitator_id || null,
        subjects ? JSON.stringify(subjects) : null,
        classes ? JSON.stringify(classes) : null,
        preferred_language || 'English', now, now,
      ]
    );

    const token = createSession(id);
    const facilitator = dbManager.get('SELECT id, email, full_name, phone, school, facilitator_id, subjects, classes, preferred_language FROM facilitators WHERE id = ?', [id]);
    return res.status(201).json({ token, facilitator });
  } catch (err: any) {
    console.error('[AUTH] Register error:', err.message);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const facilitator = dbManager.get<any>('SELECT * FROM facilitators WHERE email = ?', [email]);
    if (!facilitator) return res.status(401).json({ message: 'Invalid email or password' });
    if (facilitator.password_hash !== hashPassword(password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createSession(facilitator.id);
    const { password_hash, ...safe } = facilitator;
    if (safe.subjects) safe.subjects = JSON.parse(safe.subjects);
    if (safe.classes) safe.classes = JSON.parse(safe.classes);
    return res.json({ token, facilitator: safe });
  } catch (err: any) {
    console.error('[AUTH] Login error:', err.message);
    return res.status(500).json({ message: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req: any, res) => {
  const token = req.headers['x-session-token'] as string;
  dbManager.run('DELETE FROM sessions WHERE id = ?', [token]);
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: any, res) => {
  try {
    const f = dbManager.get<any>('SELECT id, email, full_name, phone, school, facilitator_id, subjects, classes, preferred_language FROM facilitators WHERE id = ?', [req.facilitatorId]);
    if (!f) return res.status(404).json({ message: 'Facilitator not found' });
    if (f.subjects) f.subjects = JSON.parse(f.subjects);
    if (f.classes) f.classes = JSON.parse(f.classes);
    return res.json(f);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
});
