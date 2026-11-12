import type { Database } from 'better-sqlite3';

export function runSeed(db: Database) {
  const insertStudent = db.prepare(`
    INSERT INTO students (name, class, section, school, preferredLanguage, interests, avatar, xp, level, streak, badge_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const students = [
    { name: 'Anisha', class: 8, section: 'A', school: 'Demo School', lang: 'English', interests: '["Cricket"]', avatar: '🦁', xp: 1200, level: 4, streak: 5, badges: 3 },
    { name: 'Rahul', class: 9, section: 'B', school: 'DPS Delhi', lang: 'Hindi', interests: '["Gaming", "Technology"]', avatar: '🐯', xp: 3400, level: 6, streak: 12, badges: 5 },
    { name: 'Priya', class: 6, section: 'A', school: 'NPS', lang: 'Kannada', interests: '["Art", "Reading"]', avatar: '🦋', xp: 800, level: 3, streak: 2, badges: 2 },
    { name: 'Arjun', class: 8, section: 'C', school: 'Demo School', lang: 'English', interests: '["Robotics", "Science"]', avatar: '🦅', xp: 5200, level: 7, streak: 20, badges: 8 },
    { name: 'Kavya', class: 7, section: 'A', school: 'KV Bangalore', lang: 'English', interests: '["Music", "Art"]', avatar: '🐼', xp: 450, level: 2, streak: 1, badges: 1 },
    { name: 'Ravi', class: 10, section: 'A', school: 'DPS Delhi', lang: 'English', interests: '["Football", "Technology"]', avatar: '🐻', xp: 8500, level: 8, streak: 45, badges: 12 },
    // A struggling student to trigger interventions
    { name: 'Meera', class: 7, section: 'A', school: 'KV Bangalore', lang: 'English', interests: '["Reading"]', avatar: '🦊', xp: 150, level: 1, streak: 0, badges: 0 }
  ];

  for (const s of students) {
    insertStudent.run(s.name, s.class, s.section, s.school, s.lang, s.interests, s.avatar, s.xp, s.level, s.streak, s.badges);
  }

  const insertTeacher = db.prepare(`
    INSERT INTO teachers (name, school, subjects, classes)
    VALUES (?, ?, ?, ?)
  `);

  insertTeacher.run('Mrs. Lakshmi', 'KV Bangalore', '["Science", "Mathematics"]', '[7, 8]');
  insertTeacher.run('Mr. Suresh', 'DPS Delhi', '["English", "Social Science"]', '[9, 10]');

  const insertCourse = db.prepare(`
    INSERT INTO courses (title, subject, class, difficulty, description, thumbnail, xp_reward, estimated_minutes, lesson_count, topics)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const courseRes = insertCourse.run(
    'Electricity & Circuits', 'Science', 7, 'Medium', 
    'Learn about electric current, conductors, and how to build simple circuits.', 
    '/images/electricity.jpg', 500, 120, 3, '["Electric Current", "Conductors", "Circuits"]'
  );
  
  const courseId = courseRes.lastInsertRowid;

  const insertLesson = db.prepare(`
    INSERT INTO lessons (course_id, title, "order", formats, content, estimated_minutes, xp_reward)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const lessonRes = insertLesson.run(
    courseId, 'Electric Current Basics', 1, '["Video", "Text", "Audio", "Story"]',
    JSON.stringify({
      Video: 'Video content placeholder',
      Text: 'Electric current is the flow of electric charge. In electric circuits this charge is often carried by moving electrons in a wire.',
      Audio: 'Audio transcript',
      Story: 'Once upon a time in a wire...'
    }),
    20, 100
  );
  
  const lessonId = lessonRes.lastInsertRowid;

  const insertQuestion = db.prepare(`
    INSERT INTO questions (lesson_id, topic, text, options, correct_index, explanation, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertQuestion.run(lessonId, 'Electric Current', 'What carries the electric charge in a wire?', '["Protons", "Neutrons", "Electrons", "Atoms"]', 2, 'Electrons are the negatively charged particles that move through conductors to create current.', 'Easy');
  insertQuestion.run(lessonId, 'Electric Current', 'What is the SI unit of electric current?', '["Volt", "Watt", "Ampere", "Ohm"]', 2, 'The Ampere (A) is the standard unit of electric current.', 'Medium');

  // Seed learning signals
  const insertSignal = db.prepare(`
    INSERT INTO learning_signals (student_id, topic, signal_type, confidence_score, performance_score, recommended_action, acknowledged)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Anisha: Confidence Mismatch (High confidence, low score)
  insertSignal.run(1, 'Electricity', 'confidence_mismatch_high', 5, 42, 'Revision + Conceptual Practice', 0);
  
  // Meera: Low score repeated
  insertSignal.run(7, 'Fractions', 'low_score', 2, 35, 'Concept Review', 0);
  
  // Arjun: Advanced ready
  insertSignal.run(4, 'Robotics Basics', 'high_score', 5, 95, 'Advanced Challenge', 0);
}
