import { v4 as uuidv4 } from 'uuid';
import dbManager from '../db/database.js';
import pdfExtractionService from './pdfExtractionService.js';
import chunkingService from './chunkingService.js';
import topicExtractionService from './topicExtractionService.js';
import embeddingService from './embeddingService.js';
import supabaseService from './supabaseService.js';
import { Textbook } from '../types.js';

class TextbookProcessingService {
  /**
   * Processes an uploaded textbook through the complete pipeline:
   * PDF Parsing -> Topic Identification -> Semantic Chunking -> Gemini Embeddings -> Database & Vector Storage
   */
  async processTextbook(textbookId: string, pdfPath: string): Promise<void> {
    console.log(`[TextbookProcessing] Starting processing for textbook ID: ${textbookId}`);

    const textbook = dbManager.get<Textbook>('SELECT * FROM textbooks WHERE id = ?', [textbookId]);
    if (!textbook) {
      console.error(`[TextbookProcessing] Textbook not found: ${textbookId}`);
      return;
    }

    // Step 1: Update status to 'processing'
    const nowIso = new Date().toISOString();
    dbManager.run(
      'UPDATE textbooks SET processing_status = ?, updated_at = ? WHERE id = ?',
      ['processing', nowIso, textbookId]
    );

    const supabaseClient = supabaseService.getClient();
    if (supabaseService.hasValidConfig() && supabaseClient) {
      try {
        await supabaseClient.from('textbooks').upsert({
          id: textbookId,
          title: textbook.title,
          class_grade: textbook.class_grade,
          subject: textbook.subject,
          language: textbook.language || 'English',
          academic_year: textbook.academic_year || '2024-2025',
          description: textbook.description || null,
          pdf_storage_path: textbook.pdf_storage_path,
          pdf_filename: textbook.pdf_filename,
          file_size_bytes: textbook.file_size_bytes,
          processing_status: 'processing',
          updated_at: nowIso,
        });
      } catch (err: any) {
        console.warn('[TextbookProcessing] Supabase textbook upsert warning:', err.message);
      }
    }

    try {
      // Step 2: Extract text and pages
      console.log(`[TextbookProcessing] Extracting PDF text from: ${pdfPath}`);
      const extraction = await pdfExtractionService.extractText(pdfPath, textbook.language);
      console.log(`[TextbookProcessing] Extracted ${extraction.totalPages} pages.`);

      // Step 3: Identify chapters and topics with Gemini AI
      console.log('[TextbookProcessing] Identifying syllabus structure and topics...');
      const topics = await topicExtractionService.extractSyllabusStructure(
        textbookId,
        {
          title: textbook.title,
          class_grade: textbook.class_grade,
          subject: textbook.subject,
          language: textbook.language,
        },
        extraction.pages
      );

      // Save topics into database
      dbManager.run('DELETE FROM textbook_topics WHERE textbook_id = ?', [textbookId]);
      const supabaseTopics: any[] = [];

      for (const t of topics) {
        const topicId = uuidv4();
        t.id = topicId;
        dbManager.run(
          `INSERT INTO textbook_topics (
            id, textbook_id, chapter_number, chapter_name, topic_name,
            subtopics, short_description, page_start, page_end, order_index, published, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            topicId,
            textbookId,
            t.chapter_number || null,
            t.chapter_name,
            t.topic_name,
            JSON.stringify(t.subtopics || []),
            t.short_description || null,
            t.page_start || null,
            t.page_end || null,
            t.order_index || 0,
            1,
            new Date().toISOString(),
          ]
        );

        if (supabaseService.hasValidConfig() && supabaseClient) {
          supabaseTopics.push({
            id: topicId,
            textbook_id: textbookId,
            chapter_number: t.chapter_number || null,
            chapter_name: t.chapter_name,
            topic_name: t.topic_name,
            subtopics: t.subtopics || [],
            short_description: t.short_description || null,
            page_start: t.page_start || null,
            page_end: t.page_end || null,
            order_index: t.order_index || 0,
            published: true,
            created_at: new Date().toISOString(),
          });
        }
      }
      console.log(`[TextbookProcessing] Stored ${topics.length} topics in textbook_topics.`);

      if (supabaseTopics.length > 0 && supabaseClient) {
        try {
          await supabaseClient.from('textbook_topics').insert(supabaseTopics);
          console.log(`[TextbookProcessing] Synced ${supabaseTopics.length} topics to Supabase textbook_topics.`);
        } catch (sbTopErr: any) {
          console.warn('[TextbookProcessing] Supabase topics sync warning:', sbTopErr.message);
        }
      }

      // Step 4: Semantic Chunking
      console.log('[TextbookProcessing] Chunking text into 500-800 token sections...');
      const chunks = chunkingService.chunkPages(
        extraction.pages,
        topics,
        topics[0]?.chapter_name || 'Chapter 1',
        topics[0]?.topic_name || 'General'
      );
      console.log(`[TextbookProcessing] Generated ${chunks.length} chunks.`);

      // Step 5: Generate Gemini Embeddings (768 dimensions)
      console.log('[TextbookProcessing] Generating Gemini embeddings for chunks...');
      const chunkTexts = chunks.map((c) => c.chunkText);
      const embeddings = await embeddingService.generateBatchEmbeddings(chunkTexts, 5);

      // Step 6: Store Chunks and Embeddings in DB (SQLite + Supabase pgvector)
      dbManager.run('DELETE FROM textbook_chunks WHERE textbook_id = ?', [textbookId]);

      const supabaseRecords: any[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const emb = embeddings[i] || new Array(768).fill(0);
        const chunkId = uuidv4();
        const now = new Date().toISOString();

        // Local SQLite storage
        dbManager.run(
          `INSERT INTO textbook_chunks (
            id, textbook_id, class_grade, subject, chapter, topic, language,
            page_number, chunk_index, chunk_text, token_count, embedding, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            chunkId,
            textbookId,
            textbook.class_grade,
            textbook.subject,
            chunk.chapter,
            chunk.topic,
            textbook.language,
            chunk.pageNumber,
            chunk.chunkIndex,
            chunk.chunkText,
            chunk.tokenCount,
            JSON.stringify(emb),
            now,
          ]
        );

        // Prepare Supabase record
        if (supabaseService.hasValidConfig() && supabaseClient) {
          supabaseRecords.push({
            id: chunkId,
            textbook_id: textbookId,
            class_id: null,
            subject: textbook.subject,
            chapter: chunk.chapter,
            topic: chunk.topic,
            language: textbook.language,
            page_number: chunk.pageNumber,
            chunk_index: chunk.chunkIndex,
            chunk_text: chunk.chunkText,
            token_count: chunk.tokenCount,
            embedding: emb,
            created_at: now,
          });
        }
      }

      // Batch insert into Supabase if connected
      if (supabaseRecords.length > 0 && supabaseClient) {
        try {
          const { error: sbError } = await supabaseClient.from('textbook_chunks').insert(supabaseRecords);
          if (sbError) {
            console.warn('[TextbookProcessing] Supabase chunks insert warning:', sbError.message);
          } else {
            console.log(`[TextbookProcessing] Successfully synced ${supabaseRecords.length} chunks to Supabase pgvector.`);
          }
        } catch (sbErr: any) {
          console.warn('[TextbookProcessing] Supabase sync caught error:', sbErr.message);
        }
      }

      // Step 7: Update textbook to 'completed'
      const completedIso = new Date().toISOString();
      dbManager.run(
        `UPDATE textbooks SET
          processing_status = 'completed',
          page_count = ?,
          error_message = NULL,
          updated_at = ?
         WHERE id = ?`,
        [extraction.totalPages, completedIso, textbookId]
      );

      if (supabaseService.hasValidConfig() && supabaseClient) {
        try {
          await supabaseClient.from('textbooks').update({
            processing_status: 'completed',
            page_count: extraction.totalPages,
            error_message: null,
            updated_at: completedIso,
          }).eq('id', textbookId);
        } catch (sbUpErr: any) {
          console.warn('[TextbookProcessing] Supabase final update warning:', sbUpErr.message);
        }
      }

      console.log(`[TextbookProcessing] Processing completed successfully for ${textbookId}!`);
    } catch (err: any) {
      console.error(`[TextbookProcessing] Pipeline error for ${textbookId}:`, err);
      dbManager.run(
        `UPDATE textbooks SET
          processing_status = 'failed',
          error_message = ?,
          updated_at = ?
         WHERE id = ?`,
        [err.message || 'Processing failed', new Date().toISOString(), textbookId]
      );

      if (supabaseService.hasValidConfig() && supabaseClient) {
        try {
          await supabaseClient.from('textbooks').update({
            processing_status: 'failed',
            error_message: err.message || 'Processing failed',
            updated_at: new Date().toISOString(),
          }).eq('id', textbookId);
        } catch {}
      }
    }
  }
}

export const textbookProcessingService = new TextbookProcessingService();
export default textbookProcessingService;

