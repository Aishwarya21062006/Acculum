import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dbManager from '../db/database.js';
import { authenticate } from './auth.js';
import supabaseService from '../services/supabaseService.js';
import { Textbook } from '../types.js';

export const router = express.Router();

// Configure local multer storage
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'textbooks');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported.'));
    }
  },
});

// ─── POST /api/textbooks/upload ─────────────────────────────────────────────
router.post('/upload', authenticate, upload.single('pdf'), async (req: any, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    const {
      title,
      class_grade,
      subject,
      language = 'English',
      academic_year = '2024-2025',
      description = '',
    } = req.body;

    if (!title || !class_grade || !subject) {
      // Remove temporary file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Title, Class/Grade, and Subject are required.' });
    }

    const textbookId = uuidv4();
    const now = new Date().toISOString();
    let storagePath = file.path;

    // Upload to Supabase Storage if configured
    if (supabaseService.hasValidConfig()) {
      try {
        const fileBuffer = fs.readFileSync(file.path);
        const { path: uploadedPath } = await supabaseService.uploadTextbookFile(
          fileBuffer,
          file.originalname,
          file.mimetype
        );
        storagePath = uploadedPath;
      } catch (uploadErr: any) {
        console.warn('[TextbookUpload] Supabase Storage upload error:', uploadErr.message);
        // Fall back to local path
      }
    }

    // Save to local database (SQLite)
    dbManager.run(
      `INSERT INTO textbooks (
        id, title, class_grade, subject, language, academic_year, description,
        pdf_storage_path, pdf_filename, file_size_bytes, page_count,
        processing_status, teacher_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        textbookId,
        title.trim(),
        class_grade.trim(),
        subject.trim(),
        language.trim(),
        academic_year.trim(),
        description?.trim() || null,
        storagePath,
        file.originalname,
        file.size,
        0,
        'pending',
        req.facilitatorId,
        now,
        now,
      ]
    );

    // Save to Supabase PostgreSQL textbooks table
    if (supabaseService.hasValidConfig()) {
      const client = supabaseService.getClient();
      if (client) {
        try {
          const { error: sbTbError } = await client.from('textbooks').upsert({
            id: textbookId,
            title: title.trim(),
            class_grade: class_grade.trim(),
            subject: subject.trim(),
            language: language.trim(),
            academic_year: academic_year?.trim() || '2024-2025',
            description: description?.trim() || null,
            pdf_storage_path: storagePath,
            pdf_filename: file.originalname,
            file_size_bytes: file.size,
            page_count: 0,
            processing_status: 'pending',
            created_at: now,
            updated_at: now,
          });
          if (sbTbError) {
            console.warn('[TextbookUpload] Supabase table insert warning:', sbTbError.message);
          } else {
            console.log(`[TextbookUpload] Successfully synced textbook ${textbookId} to Supabase textbooks table.`);
          }
        } catch (sbErr: any) {
          console.warn('[TextbookUpload] Supabase sync error:', sbErr.message);
        }
      }
    }

    // Auto-assign to the specified class grade by default
    dbManager.run(
      `INSERT OR IGNORE INTO textbook_assignments (id, textbook_id, class_grade, assigned_by, assigned_at)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), textbookId, class_grade.trim(), req.facilitatorId, now]
    );

    const textbook = dbManager.get<Textbook>('SELECT * FROM textbooks WHERE id = ?', [textbookId]);

    // Asynchronously trigger processing in background (imported dynamically to avoid circular references)
    import('../services/textbookProcessingService.js')
      .then(({ textbookProcessingService }) => {
        textbookProcessingService.processTextbook(textbookId, file.path).catch((err) => {
          console.error(`[TextbookProcessing] Failed for ${textbookId}:`, err);
        });
      })
      .catch(() => {
        // If textbookProcessingService not ready yet, set status to pending
        console.log(`[TextbookUpload] Textbook ${textbookId} queued for processing.`);
      });

    return res.status(201).json(textbook);
  } catch (err: any) {
    console.error('[TextbookUpload] Error:', err.message);
    return res.status(500).json({ message: err.message || 'Failed to upload textbook.' });
  }
});

// ─── GET /api/textbooks ─────────────────────────────────────────────────────
router.get('/', authenticate, (req: any, res) => {
  try {
    const textbooks = dbManager.all<any>(`
      SELECT t.*,
        (SELECT COUNT(DISTINCT chapter_name) FROM textbook_topics WHERE textbook_id = t.id) as chapter_count,
        (SELECT COUNT(*) FROM textbook_topics WHERE textbook_id = t.id) as topic_count,
        (SELECT COUNT(*) FROM textbook_chunks WHERE textbook_id = t.id) as chunk_count
      FROM textbooks t
      ORDER BY t.created_at DESC
    `);

    // Fetch assignments for each textbook
    const result = textbooks.map((tb) => {
      const assignments = dbManager.all<any>(
        'SELECT class_grade FROM textbook_assignments WHERE textbook_id = ?',
        [tb.id]
      ).map((a) => a.class_grade);

      return {
        ...tb,
        assignments,
      };
    });

    return res.json(result);
  } catch (err: any) {
    console.error('[Textbooks] List error:', err.message);
    return res.status(500).json({ message: 'Failed to fetch textbooks.' });
  }
});

// ─── GET /api/textbooks/:id ─────────────────────────────────────────────────
router.get('/:id', authenticate, (req, res) => {
  try {
    const textbook = dbManager.get<any>('SELECT * FROM textbooks WHERE id = ?', [req.params.id]);
    if (!textbook) {
      return res.status(404).json({ message: 'Textbook not found.' });
    }

    const topics = dbManager.all<any>(
      'SELECT * FROM textbook_topics WHERE textbook_id = ? ORDER BY order_index ASC, chapter_number ASC',
      [textbook.id]
    ).map((t) => {
      try {
        t.subtopics = JSON.parse(t.subtopics || '[]');
      } catch {
        t.subtopics = [];
      }
      return t;
    });

    const assignments = dbManager.all<any>(
      'SELECT class_grade FROM textbook_assignments WHERE textbook_id = ?',
      [textbook.id]
    ).map((a) => a.class_grade);

    return res.json({
      ...textbook,
      topics,
      assignments,
    });
  } catch (err: any) {
    console.error('[Textbooks] Detail error:', err.message);
    return res.status(500).json({ message: 'Failed to fetch textbook details.' });
  }
});

// ─── GET /api/textbooks/:id/file ────────────────────────────────────────────
router.get('/:id/file', authenticate, (req, res) => {
  try {
    const textbook = dbManager.get<any>('SELECT * FROM textbooks WHERE id = ?', [req.params.id]);
    if (!textbook) {
      return res.status(404).json({ message: 'Textbook not found.' });
    }

    // Check local filesystem first
    if (fs.existsSync(textbook.pdf_storage_path)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(textbook.pdf_filename)}"`);
      return fs.createReadStream(textbook.pdf_storage_path).pipe(res);
    }

    // Check in UPLOADS_DIR by filename
    const altPath = path.join(UPLOADS_DIR, path.basename(textbook.pdf_storage_path));
    if (fs.existsSync(altPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(textbook.pdf_filename)}"`);
      return fs.createReadStream(altPath).pipe(res);
    }

    // Check if URL from Supabase
    if (textbook.pdf_storage_path.startsWith('http')) {
      return res.redirect(textbook.pdf_storage_path);
    }

    return res.status(404).json({ message: 'PDF file not found on disk.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to load PDF file.' });
  }
});

// ─── POST /api/textbooks/:id/assign ─────────────────────────────────────────
router.post('/:id/assign', authenticate, (req: any, res) => {
  try {
    const { class_grades } = req.body; // e.g. ['7', '8']
    if (!Array.isArray(class_grades) || class_grades.length === 0) {
      return res.status(400).json({ message: 'class_grades array is required.' });
    }

    const textbook = dbManager.get('SELECT id FROM textbooks WHERE id = ?', [req.params.id]);
    if (!textbook) {
      return res.status(404).json({ message: 'Textbook not found.' });
    }

    // Clear existing assignments and add new ones
    dbManager.run('DELETE FROM textbook_assignments WHERE textbook_id = ?', [req.params.id]);
    const now = new Date().toISOString();

    for (const grade of class_grades) {
      dbManager.run(
        `INSERT INTO textbook_assignments (id, textbook_id, class_grade, assigned_by, assigned_at)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), req.params.id, String(grade).trim(), req.facilitatorId, now]
      );
    }

    return res.json({ message: 'Textbook assignments updated successfully.', class_grades });
  } catch (err: any) {
    console.error('[Textbooks] Assign error:', err.message);
    return res.status(500).json({ message: 'Failed to update textbook assignments.' });
  }
});

// ─── DELETE /api/textbooks/:id ──────────────────────────────────────────────
router.delete('/:id', authenticate, (req, res) => {
  try {
    const textbook = dbManager.get<any>('SELECT * FROM textbooks WHERE id = ?', [req.params.id]);
    if (!textbook) {
      return res.status(404).json({ message: 'Textbook not found.' });
    }

    // Delete local file if exists
    if (fs.existsSync(textbook.pdf_storage_path)) {
      try { fs.unlinkSync(textbook.pdf_storage_path); } catch {}
    }

    // Cascade delete in db
    dbManager.run('DELETE FROM textbook_chunks WHERE textbook_id = ?', [textbook.id]);
    dbManager.run('DELETE FROM textbook_topics WHERE textbook_id = ?', [textbook.id]);
    dbManager.run('DELETE FROM textbook_assignments WHERE textbook_id = ?', [textbook.id]);
    dbManager.run('DELETE FROM textbooks WHERE id = ?', [textbook.id]);

    if (supabaseService.hasValidConfig() && supabaseService.getClient()) {
      supabaseService.getClient()!.from('textbooks').delete().eq('id', textbook.id).then(() => {});
    }

    return res.json({ message: 'Textbook deleted successfully.' });
  } catch (err: any) {
    console.error('[Textbooks] Delete error:', err.message);
    return res.status(500).json({ message: 'Failed to delete textbook.' });
  }
});

