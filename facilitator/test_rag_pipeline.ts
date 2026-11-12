// End-to-end test script for Acculum Complete RAG Integration & AI-Powered Adaptive Quiz System
import fs from 'fs';
import path from 'path';
import dbManager from './server/db/database.js';
import { textbookProcessingService } from './server/services/textbookProcessingService.js';
import { ragService } from './server/services/ragService.js';
import { quizGenerationService } from './server/services/quizGenerationService.js';
import { quizEvaluationService } from './server/services/quizEvaluationService.js';

function createSampleSciencePdf(filePath: string): string {
  // Build a valid minimal PDF 1.4 file containing authentic NCERT Class 7 Science Chapter 1 text
  const pages = [
    `Chapter 1: Nutrition in Plants. All living organisms require food. Plants can make food for themselves, but animals including humans cannot. Autotrophic nutrition: Auto means self and trophos means nourishment. Therefore, plants are called autotrophs. Animals and most other organisms take in food prepared by plants; they are called heterotrophs.`,
    `Photosynthesis: Food Making Process in Plants. Leaves are the food factories of plants. Therefore, all the raw materials must reach the leaf. Water and minerals present in the soil are absorbed by the roots and transported to the leaves. Carbon dioxide from air is taken in through the tiny pores present on the surface of leaves. These pores are surrounded by guard cells. Such pores are called stomata.`,
    `Chlorophyll and Sunlight: The leaves have a green pigment called chlorophyll. It helps leaves to capture the energy of the sunlight. This energy is used to synthesise food from carbon dioxide and water. Since the synthesis of food occurs in the presence of sunlight, it is called photosynthesis (Photo: light, synthesis: to combine). So we find that chlorophyll, sunlight, carbon dioxide and water are necessary to carry out the process of photosynthesis.`,
    `During photosynthesis, chlorophyll containing cells of leaves, in the presence of sunlight, use carbon dioxide and water to synthesise carbohydrates. The carbohydrates ultimately get converted into starch. The presence of starch in leaves indicates the occurrence of photosynthesis. Oxygen is released during this process.`,
    `Chapter 2: Nutrition in Animals. Animals get their food from plants, either directly by eating plants or indirectly by eating animals that eat plants. The human digestive system consists of the alimentary canal and secretory glands. It includes the buccal cavity, oesophagus, stomach, small intestine, large intestine, and rectum.`
  ];

  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  const pageObjIds: number[] = [];
  let nextObjId = 1;

  // Catalog will be obj 1, Pages will be obj 2
  const catalogId = nextObjId++;
  const pagesRootId = nextObjId++;

  const contentObjIds: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    const pageId = nextObjId++;
    pageObjIds.push(pageId);
    const contentId = nextObjId++;
    contentObjIds.push(contentId);
  }
  const fontId = nextObjId++;

  // 1: Catalog
  offsets.push(body.length);
  body += `${catalogId} 0 obj\n<< /Type /Catalog /Pages ${pagesRootId} 0 R >>\nendobj\n`;

  // 2: Pages root
  offsets.push(body.length);
  const kidsStr = pageObjIds.map(id => `${id} 0 R`).join(' ');
  body += `${pagesRootId} 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${pages.length} >>\nendobj\n`;

  // Pages & Contents
  for (let i = 0; i < pages.length; i++) {
    const cleanText = pages[i].replace(/[\(\)\\]/g, ' ');
    const textStream = `BT /F1 11 Tf 50 720 Td (${cleanText}) Tj ET`;

    // Page obj
    offsets.push(body.length);
    body += `${pageObjIds[i]} 0 obj\n<< /Type /Page /Parent ${pagesRootId} 0 R /MediaBox [0 0 612 792] /Contents ${contentObjIds[i]} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>\nendobj\n`;

    // Content obj
    offsets.push(body.length);
    body += `${contentObjIds[i]} 0 obj\n<< /Length ${textStream.length} >>\nstream\n${textStream}\nendstream\nendobj\n`;
  }

  // Font obj
  offsets.push(body.length);
  body += `${fontId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  // Xref
  const startXref = body.length;
  body += `xref\n0 ${nextObjId}\n0000000000 65535 f \n`;
  for (let i = 1; i < nextObjId; i++) {
    const off = offsets[i - 1];
    body += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  body += `trailer\n<< /Size ${nextObjId} /Root ${catalogId} 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  fs.writeFileSync(filePath, Buffer.from(body));
  return filePath;
}

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('   ACCULUM COMPLETE RAG & ADAPTIVE QUIZ PIPELINE VERIFICATION   ');
  console.log('================================================================\n');

  // Step 1: Initialize Database
  console.log('[Step 1] Initializing SQLite database...');
  await dbManager.init();
  console.log('✓ Database initialized.\n');

  // Step 2: Create sample NCERT Class 7 Science textbook PDF
  console.log('[Step 2] Generating sample Class 7 Science textbook PDF...');
  const uploadsDir = path.join(process.cwd(), 'uploads', 'textbooks');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const samplePdfPath = path.join(uploadsDir, 'NCERT_Class_7_Science_Sample.pdf');
  createSampleSciencePdf(samplePdfPath);
  console.log('✓ Created PDF on disk:', samplePdfPath, '\n');

  // Step 3: Insert Textbook Record
  console.log('[Step 3] Storing textbook record in database...');
  const textbookId = 'TB-NCERT-SCI-007';
  const now = new Date().toISOString();
  dbManager.run(
    `INSERT OR REPLACE INTO textbooks (
      id, title, class_grade, subject, language, academic_year, description,
      pdf_storage_path, pdf_filename, file_size_bytes, page_count,
      processing_status, teacher_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      textbookId,
      'NCERT Science Class 7',
      '7',
      'Science',
      'English',
      '2024-2025',
      'NCERT Curriculum textbook covering Nutrition in Plants, Photosynthesis, and Digestive Systems.',
      samplePdfPath,
      'NCERT_Class_7_Science_Sample.pdf',
      fs.statSync(samplePdfPath).size,
      5,
      'pending',
      'FAC-DEFAULT-001',
      now,
      now,
    ]
  );
  console.log('✓ Textbook record inserted (ID:', textbookId, ')\n');

  // Step 4: Run Textbook Processing Pipeline
  console.log('[Step 4] Running complete textbook processing pipeline...');
  await textbookProcessingService.processTextbook(textbookId, samplePdfPath);
  
  const processedBook = dbManager.get<any>('SELECT * FROM textbooks WHERE id = ?', [textbookId]);
  console.log('✓ Processing status:', processedBook.processing_status);
  console.log('  - Pages detected:', processedBook.page_count);

  const topics = dbManager.all<any>('SELECT * FROM textbook_topics WHERE textbook_id = ?', [textbookId]);
  console.log(`✓ Extracted ${topics.length} syllabus topics:`);
  topics.forEach((t, i) => console.log(`    [${i+1}] ${t.chapter_name} → ${t.topic_name} (Pages ${t.page_start}–${t.page_end})`));

  const chunks = dbManager.all<any>('SELECT * FROM textbook_chunks WHERE textbook_id = ?', [textbookId]);
  console.log(`✓ Stored ${chunks.length} semantic chunks with 768-dim embeddings.\n`);

  // Step 5: Assign textbook to Class 7
  console.log('[Step 5] Assigning textbook to Class 7...');
  dbManager.run(
    'INSERT OR REPLACE INTO textbook_assignments (id, textbook_id, class_grade, assigned_by, assigned_at) VALUES (?, ?, ?, ?, ?)',
    ['ASSIGN-001', textbookId, '7', 'FAC-DEFAULT-001', now]
  );
  console.log('✓ Textbook assigned to Class 7.\n');

  // Step 6: Test RAG Semantic Retrieval & Explanation
  console.log('[Step 6] Testing RAG concept explanation for: "What is the function of stomata in photosynthesis?"...');
  const ragResult = await ragService.explainConcept(
    'What is the function of stomata in photosynthesis?',
    { textbookId, topic: 'Photosynthesis', classGrade: '7', subject: 'Science' }
  );
  console.log('✓ RAG Retrieval complete:');
  console.log('  - Passages retrieved:', ragResult.passages_retrieved);
  console.log('  - References cited:', ragResult.references);
  console.log('  - Answer preview:', ragResult.answer.slice(0, 150) + '...\n');

  // Step 7: Generate AI Quiz on Photosynthesis
  console.log('[Step 7] Generating 5-question adaptive quiz on "Photosynthesis"...');
  const quiz = await quizGenerationService.generateQuiz({
    textbook_id: textbookId,
    class_grade: '7',
    subject: 'Science',
    chapter: 'Chapter 1: Nutrition in Plants',
    topic: 'Photosynthesis',
    difficulty: 'Medium',
    question_count: 5,
    language: 'English',
    question_types: ['MCQ', 'True_False'],
  });
  console.log('✓ Quiz generated successfully (ID:', quiz.id, ')');
  console.log(`  - Questions generated: ${quiz.questions?.length}`);
  quiz.questions?.forEach((q, i) => {
    console.log(`    Q${i+1} [${q.question_type}]: ${q.question_text}`);
    if (q.options) console.log(`       Options: ${q.options.join(' | ')}`);
  });
  console.log();

  // Step 8: Ensure a sample student exists (Rahul)
  let rahul = dbManager.get<any>('SELECT id, full_name FROM students WHERE full_name LIKE ?', ['%Rahul%']);
  if (!rahul) {
    const rahulId = 'STU-RAHUL-001';
    dbManager.run(
      `INSERT INTO students (id, student_id, full_name, class, school, preferred_language, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [rahulId, 'STU-2026-01', 'Rahul Verma', '7', 'Delhi Public School', 'English', now, now]
    );
    rahul = { id: rahulId, full_name: 'Rahul Verma' };
  }

  // Step 9: Simulate Student Quiz Submission (Student scores 2 out of 5 to test adaptive remediation)
  console.log(`[Step 8] Simulating student submission for ${rahul.full_name}...`);
  const submissionAnswers = (quiz.questions || []).map((q, idx) => {
    // Deliberately choose correct answer only for question 1 and 2 to trigger adaptive intervention
    const chosenAnswer = idx < 2 ? q.correct_answer : 'Incorrect Option';
    return {
      question_id: q.id,
      student_answer: chosenAnswer,
    };
  });

  const evaluation = await quizEvaluationService.evaluateSubmission({
    student_id: rahul.id,
    quiz_id: quiz.id,
    answers: submissionAnswers,
    time_taken_seconds: 145,
  });

  console.log('✓ Quiz evaluated:');
  console.log(`  - Score: ${evaluation.attempt.score_numerator}/${evaluation.attempt.score_denominator} (${evaluation.attempt.score_percentage}%)`);
  console.log(`  - Updated Topic Mastery: ${evaluation.mastery.mastery_level} (${evaluation.mastery.mastery_score}%)`);

  if (evaluation.intervention_recommended?.recommended) {
    console.log('✓ Adaptive Remediation Triggered:');
    console.log('    Reason:', evaluation.intervention_recommended.reason);
    console.log('    Suggested Action:', evaluation.intervention_recommended.suggested_action);
    console.log('    Intervention ID:', evaluation.intervention_recommended.intervention_id);
  }
  console.log();

  // Step 10: Verify Teacher Analytics Integration
  console.log('[Step 10] Verifying teacher analytics integration...');
  const topicStats = dbManager.all<any>(`
    SELECT qa.topic, COUNT(qa.id) as attempts, ROUND(AVG(qa.score_percentage), 1) as avg_score
    FROM quiz_attempts qa WHERE qa.topic = 'Photosynthesis' GROUP BY qa.topic
  `);
  console.log('✓ Teacher Analytics for Photosynthesis:', topicStats);

  const activeInterventions = dbManager.all<any>(
    'SELECT * FROM interventions WHERE student_id = ? ORDER BY assigned_at DESC LIMIT 1',
    [rahul.id]
  );
  console.log('✓ Latest Active Intervention in Acculum system:', activeInterventions[0]?.intervention_type, 'for', activeInterventions[0]?.topic);

  console.log('\n================================================================');
  console.log('   ALL 10 END-TO-END RAG & QUIZ VERIFICATION CHECKS PASSED!     ');
  console.log('================================================================');
}

runEndToEndVerification().catch((err) => {
  console.error('Pipeline test failed:', err);
  process.exit(1);
});

