import db from './index';
import type { Student, Teacher, Course, Lesson, Question, QuizAttempt, Progress, ConfidenceRating, LearningSignal, Badge, XPTransaction, Assignment, Notification, PeerHelp, GKChallenge, ParentReport, UserRole, Difficulty } from '@/types';

// ==========================================
// USERS
// ==========================================

export function getStudentById(id: number): Student | undefined {
  const s: any = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  if (!s) return undefined;
  return { ...s, interests: JSON.parse(s.interests) };
}

export function getStudentsByClass(classNum: number, section?: string): Student[] {
  let query = 'SELECT * FROM students WHERE class = ?';
  const params: any[] = [classNum];
  if (section) {
    query += ' AND section = ?';
    params.push(section);
  }
  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(r => ({ ...r, interests: JSON.parse(r.interests) }));
}

export function getStudentByNameAndClass(name: string, classNum: number): Student | undefined {
  const s: any = db.prepare('SELECT * FROM students WHERE name = ? AND class = ?').get(name, classNum);
  if (!s) return undefined;
  return { ...s, interests: JSON.parse(s.interests) };
}

export function createStudent(data: Omit<Student, 'id' | 'created_at' | 'xp' | 'level' | 'streak' | 'badge_count'>): Student {
  const stmt = db.prepare(`
    INSERT INTO students (name, class, section, school, preferredLanguage, interests, avatar, xp, level, streak, badge_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, 0, 0)
  `);
  const res = stmt.run(data.name, data.class, data.section, data.school, data.preferredLanguage, JSON.stringify(data.interests), data.avatar);
  return getStudentById(res.lastInsertRowid as number)!;
}

export function updateStudentXP(id: number, xpToAdd: number) {
  const student = getStudentById(id);
  if (!student) return;
  const newXP = student.xp + xpToAdd;
  // Simplistic level calculation for DB level
  const newLevel = Math.floor(newXP / 1000) + 1; 
  db.prepare('UPDATE students SET xp = ?, level = ? WHERE id = ?').run(newXP, newLevel, id);
}

export function getTeacherById(id: number): Teacher | undefined {
  const t: any = db.prepare('SELECT * FROM teachers WHERE id = ?').get(id);
  if (!t) return undefined;
  return { ...t, subjects: JSON.parse(t.subjects), classes: JSON.parse(t.classes) };
}

export function getTeacherByName(name: string): Teacher | undefined {
  const t: any = db.prepare('SELECT * FROM teachers WHERE name = ?').get(name);
  if (!t) return undefined;
  return { ...t, subjects: JSON.parse(t.subjects), classes: JSON.parse(t.classes) };
}

// ==========================================
// COURSES & LESSONS
// ==========================================

export function getAllCourses(classNum?: number): Course[] {
  let query = 'SELECT * FROM courses';
  const params: any[] = [];
  if (classNum) {
    query += ' WHERE class = ?';
    params.push(classNum);
  }
  const rows = db.prepare(query).all(...params) as any[];
  return rows.map(r => ({ ...r, topics: JSON.parse(r.topics) }));
}

export function getCourseById(id: number): Course | undefined {
  const c: any = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  if (!c) return undefined;
  return { ...c, topics: JSON.parse(c.topics) };
}

export function getLessonsByCourse(courseId: number): Lesson[] {
  const rows = db.prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY "order" ASC').all(courseId) as any[];
  return rows.map(r => ({ ...r, formats: JSON.parse(r.formats), content: JSON.parse(r.content) }));
}

export function getLessonById(id: number): Lesson | undefined {
  const l: any = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
  if (!l) return undefined;
  return { ...l, formats: JSON.parse(l.formats), content: JSON.parse(l.content) };
}

// ==========================================
// QUIZ & PROGRESS
// ==========================================

export function getQuestionsByLesson(lessonId: number): Question[] {
  const rows = db.prepare('SELECT * FROM questions WHERE lesson_id = ?').all(lessonId) as any[];
  return rows.map(r => ({ ...r, options: JSON.parse(r.options) }));
}

export function saveQuizAttempt(data: Omit<QuizAttempt, 'id' | 'completed_at'>): QuizAttempt {
  const res = db.prepare(`
    INSERT INTO quiz_attempts (student_id, lesson_id, score, accuracy, time_taken_seconds, answers, confidence_before)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(data.student_id, data.lesson_id, data.score, data.accuracy, data.time_taken_seconds, JSON.stringify(data.answers), data.confidence_before);
  
  return db.prepare('SELECT * FROM quiz_attempts WHERE id = ?').get(res.lastInsertRowid) as any;
}

export function getProgressByStudent(studentId: number): Progress[] {
  return db.prepare('SELECT * FROM progress WHERE student_id = ?').all(studentId) as Progress[];
}

export function upsertProgress(data: Progress): void {
  db.prepare(`
    INSERT INTO progress (student_id, course_id, lesson_id, completed, score, format_used)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id, lesson_id) DO UPDATE SET
      completed = excluded.completed,
      score = excluded.score,
      format_used = excluded.format_used,
      last_accessed = CURRENT_TIMESTAMP
  `).run(data.student_id, data.course_id, data.lesson_id, data.completed ? 1 : 0, data.score, data.format_used);
}

// ==========================================
// SIGNALS & INTERVENTIONS
// ==========================================

export function saveLearningSignal(data: Omit<LearningSignal, 'id' | 'created_at' | 'acknowledged'>): void {
  db.prepare(`
    INSERT INTO learning_signals (student_id, topic, signal_type, confidence_score, performance_score, recommended_action)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(data.student_id, data.topic, data.signal_type, data.confidence_score, data.performance_score, data.recommended_action);
}

export function getInterventionAlertsForTeacher(teacherId: number): any[] {
  // Get all active signals for students in the teacher's classes
  const teacher = getTeacherById(teacherId);
  if (!teacher) return [];
  
  const classes = teacher.classes.join(',');
  const query = `
    SELECT ls.*, s.name as student_name, s.class, s.section, s.avatar
    FROM learning_signals ls
    JOIN students s ON ls.student_id = s.id
    WHERE ls.acknowledged = 0 AND s.class IN (${classes})
    ORDER BY ls.created_at DESC
  `;
  
  return db.prepare(query).all();
}

export function acknowledgeSignal(id: number): void {
  db.prepare('UPDATE learning_signals SET acknowledged = 1 WHERE id = ?').run(id);
}

// ==========================================
// ASSIGNMENTS
// ==========================================

export function createAssignment(data: Omit<Assignment, 'id' | 'created_at'>): Assignment {
  const res = db.prepare(`
    INSERT INTO assignments (teacher_id, class, section, subject, topic, type, due_date, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.teacher_id, data.class, data.section, data.subject, data.topic, data.type, data.due_date, data.message);
  return db.prepare('SELECT * FROM assignments WHERE id = ?').get(res.lastInsertRowid) as any;
}

export function getAssignmentsByClass(classNum: number, section: string): Assignment[] {
  return db.prepare('SELECT * FROM assignments WHERE class = ? AND (section = ? OR section = "All") ORDER BY due_date ASC').all(classNum, section) as Assignment[];
}
