import { ExtractedPage } from './pdfExtractionService.js';
import { TextbookTopic } from '../types.js';

export interface ChunkItem {
  chunkIndex: number;
  pageNumber: number;
  chapter: string;
  topic: string;
  chunkText: string;
  tokenCount: number;
}

class ChunkingService {
  /**
   * Approximate token counter (roughly 4 characters per token in English).
   */
  estimateTokenCount(text: string): number {
    return Math.ceil(text.trim().split(/\s+/).length * 1.3);
  }

  /**
   * Chunks textbook pages into sections of 500-800 tokens with 80-120 token overlap.
   */
  chunkPages(
    pages: ExtractedPage[],
    topics: TextbookTopic[] = [],
    defaultChapter: string = 'General',
    defaultTopic: string = 'General'
  ): ChunkItem[] {
    const chunks: ChunkItem[] = [];
    let chunkIndex = 0;

    const targetTokens = 650; // Between 500 and 800
    const overlapTokens = 100; // Between 80 and 120

    for (const page of pages) {
      const pageText = page.text.trim();
      if (!pageText) continue;

      // Identify corresponding chapter and topic for this page
      const matchedTopic = this.findMatchingTopic(page.pageNumber, pageText, topics);
      const chapter = matchedTopic?.chapter_name || defaultChapter;
      const topic = matchedTopic?.topic_name || defaultTopic;

      // Split page text into paragraphs or sentences
      const paragraphs = pageText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      let currentChunkText = '';
      let currentTokens = 0;

      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const paraTokens = this.estimateTokenCount(paragraph);

        if (currentTokens + paraTokens > targetTokens && currentChunkText.length > 0) {
          // Finalize current chunk
          chunks.push({
            chunkIndex: chunkIndex++,
            pageNumber: page.pageNumber,
            chapter,
            topic,
            chunkText: currentChunkText.trim(),
            tokenCount: currentTokens,
          });

          // Create overlap from the end of currentChunkText
          const words = currentChunkText.split(/\s+/);
          const overlapWordCount = Math.min(words.length, Math.round(overlapTokens * 0.75));
          const overlapText = words.slice(-overlapWordCount).join(' ');

          currentChunkText = overlapText + '\n\n' + paragraph;
          currentTokens = this.estimateTokenCount(currentChunkText);
        } else {
          currentChunkText = currentChunkText ? `${currentChunkText}\n\n${paragraph}` : paragraph;
          currentTokens += paraTokens;
        }
      }

      // Add remaining text as last chunk for this page if non-empty
      if (currentChunkText.trim().length > 50) {
        chunks.push({
          chunkIndex: chunkIndex++,
          pageNumber: page.pageNumber,
          chapter,
          topic,
          chunkText: currentChunkText.trim(),
          tokenCount: currentTokens,
        });
      }
    }

    return chunks;
  }

  private findMatchingTopic(
    pageNumber: number,
    pageText: string,
    topics: TextbookTopic[]
  ): TextbookTopic | null {
    if (!topics || topics.length === 0) return null;

    // 1. Check page ranges if defined
    for (const t of topics) {
      if (t.page_start && t.page_end) {
        if (pageNumber >= t.page_start && pageNumber <= t.page_end) {
          return t;
        }
      }
    }

    // 2. Check topic name presence in page text
    const lowerText = pageText.toLowerCase();
    for (const t of topics) {
      if (t.topic_name && lowerText.includes(t.topic_name.toLowerCase())) {
        return t;
      }
    }

    // 3. Check chapter name presence
    for (const t of topics) {
      if (t.chapter_name && lowerText.includes(t.chapter_name.toLowerCase())) {
        return t;
      }
    }

    // Fallback: return the first topic or closest order
    return topics[0] || null;
  }
}

export const chunkingService = new ChunkingService();
export default chunkingService;

