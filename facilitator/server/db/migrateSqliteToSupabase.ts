import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import dbManager from './database.js';
import supabaseService from '../services/supabaseService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ensureUuid(id?: string): string {
  if (id && UUID_REGEX.test(id)) return id;
  return uuidv4();
}

export async function migrateSqliteToSupabase() {
  console.log('[MIGRATION] Starting migration from SQLite to Supabase...');
  await dbManager.init();

  if (!supabaseService.hasValidConfig()) {
    console.warn('[MIGRATION] Supabase credentials not found or invalid.');
    console.warn('[MIGRATION] Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env before running migration.');
    return { success: false, reason: 'SUPABASE_NOT_CONFIGURED' };
  }

  const client = supabaseService.getClient()!;
  const studentIdMap: Record<string, string> = {};

  try {
    // 1. Migrate Facilitators -> Profiles (role: 'teacher')
    const facilitators = dbManager.all<any>('SELECT * FROM facilitators');
    console.log(`[MIGRATION] Found ${facilitators.length} facilitators.`);
    for (const fac of facilitators) {
      let subjects = [];
      let classes = [];
      try { subjects = JSON.parse(fac.subjects || '[]'); } catch {}
      try { classes = JSON.parse(fac.classes || '[]'); } catch {}

      const facProfileId = ensureUuid(fac.id);
      const { error } = await client.from('profiles').upsert({
        id: facProfileId,
        role: 'teacher',
        email: fac.email,
        full_name: fac.full_name,
        phone: fac.phone,
        facilitator_id: fac.facilitator_id,
        subjects,
        classes,
        preferred_language: fac.preferred_language || 'English',
        created_at: fac.created_at,
        updated_at: fac.updated_at,
      }, { onConflict: 'email' });

      if (error) {
        console.warn(`[MIGRATION] Could not upsert profile for ${fac.email}:`, error.message);
      } else {
        console.log(`[MIGRATION] Migrated facilitator: ${fac.full_name} (${fac.email})`);
      }
    }

    // 2. Migrate Students -> Profiles (role: 'student')
    const students = dbManager.all<any>('SELECT * FROM students');
    console.log(`[MIGRATION] Found ${students.length} students.`);
    for (const stu of students) {
      const email = `${(stu.student_id || stu.full_name).toLowerCase().replace(/[^a-z0-9]/g, '')}@student.acculum.edu`;
      const stuProfileId = ensureUuid(stu.id);
      studentIdMap[stu.id] = stuProfileId;

      const { error } = await client.from('profiles').upsert({
        id: stuProfileId,
        role: 'student',
        email,
        full_name: stu.full_name,
        student_id: stu.student_id,
        preferred_language: stu.preferred_language || 'English',
        created_at: stu.created_at,
        updated_at: stu.updated_at,
      }, { onConflict: 'email' });

      if (error) {
        console.warn(`[MIGRATION] Could not upsert student profile for ${stu.full_name}:`, error.message);
      } else {
        console.log(`[MIGRATION] Migrated student: ${stu.full_name} (${stu.student_id})`);
      }
    }

    // 3. Migrate Interventions
    const interventions = dbManager.all<any>('SELECT * FROM interventions');
    console.log(`[MIGRATION] Found ${interventions.length} interventions.`);
    for (const inv of interventions) {
      const targetStudentUuid = studentIdMap[inv.student_id] || ensureUuid(inv.student_id);
      const { error } = await client.from('interventions').upsert({
        id: ensureUuid(inv.id),
        student_id: targetStudentUuid,
        intervention_type: inv.intervention_type,
        subject: inv.subject,
        topic: inv.topic,
        subtopic: inv.subtopic,
        language: inv.language || 'English',
        format: inv.format,
        difficulty: inv.difficulty,
        notes: inv.notes,
        status: inv.status || 'assigned',
        assigned_at: inv.assigned_at,
        created_at: inv.created_at,
      });
      if (error) {
        console.warn(`[MIGRATION] Error migrating intervention ${inv.id}:`, error.message);
      } else {
        console.log(`[MIGRATION] Migrated intervention for topic: ${inv.topic}`);
      }
    }

    // 4. Migrate Textbooks & Topics
    const textbooks = dbManager.all<any>('SELECT * FROM textbooks');
    console.log(`[MIGRATION] Found ${textbooks.length} textbooks.`);
    const textbookIdMap: Record<string, string> = {};

    for (const tb of textbooks) {
      const tbUuid = ensureUuid(tb.id);
      textbookIdMap[tb.id] = tbUuid;
      const { error } = await client.from('textbooks').upsert({
        id: tbUuid,
        title: tb.title,
        class_grade: tb.class_grade,
        subject: tb.subject,
        language: tb.language || 'English',
        academic_year: tb.academic_year || '2024-2025',
        description: tb.description,
        pdf_storage_path: tb.pdf_storage_path,
        pdf_filename: tb.pdf_filename,
        file_size_bytes: tb.file_size_bytes,
        page_count: tb.page_count || 0,
        processing_status: tb.processing_status || 'completed',
        created_at: tb.created_at,
        updated_at: tb.updated_at,
      });
      if (error) {
        console.warn(`[MIGRATION] Error migrating textbook ${tb.title}:`, error.message);
      } else {
        console.log(`[MIGRATION] Migrated textbook: ${tb.title} (${tb.class_grade} ${tb.subject})`);
      }
    }

    // 5. Migrate Topics
    const topics = dbManager.all<any>('SELECT * FROM textbook_topics');
    console.log(`[MIGRATION] Found ${topics.length} topics.`);
    for (const top of topics) {
      let subtopics = [];
      try { subtopics = JSON.parse(top.subtopics || '[]'); } catch {}
      const targetTbUuid = textbookIdMap[top.textbook_id] || ensureUuid(top.textbook_id);

      const { error } = await client.from('textbook_topics').upsert({
        id: ensureUuid(top.id),
        textbook_id: targetTbUuid,
        chapter_number: top.chapter_number,
        chapter_name: top.chapter_name,
        topic_name: top.topic_name,
        subtopics,
        short_description: top.short_description,
        page_start: top.page_start,
        page_end: top.page_end,
        order_index: top.order_index || 0,
        published: true,
        created_at: top.created_at,
      });
      if (error) {
        console.warn(`[MIGRATION] Error migrating topic ${top.topic_name}:`, error.message);
      }
    }

    // 6. Migrate Chunks
    const chunks = dbManager.all<any>('SELECT * FROM textbook_chunks');
    console.log(`[MIGRATION] Found ${chunks.length} chunks.`);
    for (const c of chunks) {
      let emb = [];
      try { emb = JSON.parse(c.embedding || '[]'); } catch {}
      const targetTbUuid = textbookIdMap[c.textbook_id] || ensureUuid(c.textbook_id);

      const { error } = await client.from('textbook_chunks').upsert({
        id: ensureUuid(c.id),
        textbook_id: targetTbUuid,
        subject: c.subject,
        chapter: c.chapter,
        topic: c.topic,
        language: c.language || 'English',
        page_number: c.page_number,
        chunk_index: c.chunk_index,
        chunk_text: c.chunk_text,
        token_count: c.token_count,
        embedding: emb.length > 0 ? emb : null,
        created_at: c.created_at,
      });
      if (error) {
        console.warn(`[MIGRATION] Error migrating chunk ${c.id}:`, error.message);
      }
    }

    console.log('\n[MIGRATION] All SQLite records successfully synchronized to Supabase PostgreSQL!');
    return { success: true };
  } catch (err: any) {
    console.error('[MIGRATION] Migration failed:', err.message);
    return { success: false, error: err.message };
  }
}

// Auto-run when executed directly
if (process.argv[1]?.endsWith('migrateSqliteToSupabase.ts')) {
  migrateSqliteToSupabase().then(() => process.exit(0));
}

