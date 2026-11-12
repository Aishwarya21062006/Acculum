import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const DATA_DIR = './data';
const DB_PATH = path.join(DATA_DIR, 'acculum.db');

type SqlValue = string | number | null | Uint8Array;
type ParamMap = Record<string, SqlValue>;

interface RowObject {
  [key: string]: SqlValue;
}

class DatabaseManager {
  private db: InstanceType<Awaited<ReturnType<typeof initSqlJs>>['Database']> | null = null;

  async init(): Promise<void> {
    const SQL = await initSqlJs();
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
    }
    this.createTables();
    console.log('[DB] Database initialized');
  }

  private save(): void {
    if (!this.db) return;
    const data = this.db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }

  private getDb() {
    if (!this.db) throw new Error('Database not initialized. Call init() first.');
    return this.db;
  }

  run(sql: string, params: ParamMap | SqlValue[] = {}): void {
    const db = this.getDb();
    db.run(sql, params as any);
    this.save();
  }

  get<T = RowObject>(sql: string, params: ParamMap | SqlValue[] = []): T | null {
    const db = this.getDb();
    const stmt = db.prepare(sql);
    const hasParams = params && (Array.isArray(params) ? params.length > 0 : Object.keys(params).length > 0);
    if (hasParams) {
      stmt.bind(params as any);
    }
    if (stmt.step()) {
      const row = stmt.getAsObject() as T;
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  all<T = RowObject>(sql: string, params: ParamMap | SqlValue[] = []): T[] {
    const db = this.getDb();
    const stmt = db.prepare(sql);
    const hasParams = params && (Array.isArray(params) ? params.length > 0 : Object.keys(params).length > 0);
    if (hasParams) {
      stmt.bind(params as any);
    }
    const rows: T[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return rows;
  }

  exec(sql: string): any[] {
    return this.getDb().exec(sql);
  }

  close(): void {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
    }
  }

  private createTables(): void {
    const db = this.getDb();
    db.run(`
      CREATE TABLE IF NOT EXISTS facilitators (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        school TEXT,
        facilitator_id TEXT,
        subjects TEXT,
        classes TEXT,
        preferred_language TEXT DEFAULT 'English',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        facilitator_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        student_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        class TEXT,
        school TEXT,
        preferred_language TEXT,
        interests TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS student_reports (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        report_version TEXT NOT NULL,
        report_date TEXT NOT NULL,
        raw_json TEXT NOT NULL,
        imported_at TEXT NOT NULL,
        imported_by TEXT NOT NULL,
        is_demo INTEGER DEFAULT 0,
        FOREIGN KEY (student_id) REFERENCES students(id)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS learning_activities (
        id TEXT PRIMARY KEY,
        report_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        subject TEXT,
        topic TEXT,
        subtopic TEXT,
        difficulty TEXT,
        language TEXT,
        score_numerator INTEGER,
        score_denominator INTEGER,
        time_spent_seconds INTEGER,
        completed INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 1,
        hints_requested INTEGER DEFAULT 0,
        questions_skipped INTEGER DEFAULT 0,
        repeated_mistakes INTEGER DEFAULT 0,
        confidence_rating INTEGER,
        activity_date TEXT,
        extra_data TEXT,
        created_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS learning_signals (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        report_id TEXT NOT NULL,
        signal_type TEXT NOT NULL,
        subject TEXT,
        topic TEXT,
        subtopic TEXT,
        severity TEXT DEFAULT 'medium',
        evidence TEXT NOT NULL,
        confidence_score REAL,
        recommended_action TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS interventions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        signal_id TEXT,
        facilitator_id TEXT NOT NULL,
        intervention_type TEXT NOT NULL,
        subject TEXT,
        topic TEXT,
        subtopic TEXT,
        language TEXT DEFAULT 'English',
        format TEXT,
        difficulty TEXT,
        notes TEXT,
        status TEXT DEFAULT 'assigned',
        assigned_at TEXT NOT NULL,
        completed_at TEXT,
        created_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS reassessments (
        id TEXT PRIMARY KEY,
        intervention_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        subject TEXT,
        topic TEXT,
        before_score_numerator INTEGER,
        before_score_denominator INTEGER,
        after_score_numerator INTEGER,
        after_score_denominator INTEGER,
        before_report_id TEXT,
        after_report_id TEXT,
        improvement_percentage REAL,
        status TEXT DEFAULT 'pending',
        completed_at TEXT,
        created_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS facilitator_action_log (
        id TEXT PRIMARY KEY,
        facilitator_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        target_student_id TEXT,
        target_report_id TEXT,
        details TEXT,
        created_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        facilitator_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        student_id TEXT,
        report_id TEXT,
        read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS textbooks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        class_grade TEXT NOT NULL,
        subject TEXT NOT NULL,
        language TEXT DEFAULT 'English',
        academic_year TEXT DEFAULT '2024-2025',
        description TEXT,
        pdf_storage_path TEXT NOT NULL,
        pdf_filename TEXT NOT NULL,
        file_size_bytes INTEGER,
        page_count INTEGER DEFAULT 0,
        processing_status TEXT DEFAULT 'pending',
        error_message TEXT,
        teacher_id TEXT,
        school_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS textbook_chunks (
        id TEXT PRIMARY KEY,
        textbook_id TEXT NOT NULL,
        class_grade TEXT,
        subject TEXT,
        chapter TEXT,
        topic TEXT,
        language TEXT DEFAULT 'English',
        page_number INTEGER NOT NULL,
        chunk_index INTEGER NOT NULL,
        chunk_text TEXT NOT NULL,
        token_count INTEGER,
        embedding TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (textbook_id) REFERENCES textbooks(id)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS textbook_topics (
        id TEXT PRIMARY KEY,
        textbook_id TEXT NOT NULL,
        chapter_number INTEGER,
        chapter_name TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        subtopics TEXT,
        short_description TEXT,
        page_start INTEGER,
        page_end INTEGER,
        order_index INTEGER DEFAULT 0,
        published INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (textbook_id) REFERENCES textbooks(id)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS textbook_assignments (
        id TEXT PRIMARY KEY,
        textbook_id TEXT NOT NULL,
        class_grade TEXT NOT NULL,
        assigned_by TEXT,
        assigned_at TEXT NOT NULL,
        FOREIGN KEY (textbook_id) REFERENCES textbooks(id)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS generated_quizzes (
        id TEXT PRIMARY KEY,
        textbook_id TEXT,
        created_by TEXT,
        class_grade TEXT NOT NULL,
        subject TEXT NOT NULL,
        chapter TEXT,
        topic TEXT NOT NULL,
        difficulty TEXT DEFAULT 'Medium',
        question_count INTEGER DEFAULT 5,
        language TEXT DEFAULT 'English',
        question_types TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        question_number INTEGER NOT NULL,
        question_type TEXT NOT NULL,
        question_text TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        chapter TEXT,
        topic TEXT,
        page_reference INTEGER,
        chunk_ids TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (quiz_id) REFERENCES generated_quizzes(id)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        textbook_id TEXT,
        chapter TEXT,
        topic TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        score_numerator INTEGER DEFAULT 0,
        score_denominator INTEGER DEFAULT 0,
        score_percentage REAL DEFAULT 0.0,
        time_taken_seconds INTEGER DEFAULT 0,
        submitted_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        student_answer TEXT,
        is_correct INTEGER DEFAULT 0,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS topic_mastery (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        mastery_level TEXT DEFAULT 'Low',
        mastery_score REAL DEFAULT 0.0,
        total_attempts INTEGER DEFAULT 1,
        last_attempt_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    this.save();
    console.log('[DB] All tables created/verified');
  }
}

export const dbManager = new DatabaseManager();
export default dbManager;
