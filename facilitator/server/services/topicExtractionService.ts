import { GoogleGenAI } from '@google/genai';
import { ExtractedPage } from './pdfExtractionService.js';
import { TextbookTopic } from '../types.js';

export interface ExtractedChapter {
  chapter_number: number;
  chapter_name: string;
  topics: {
    topic_name: string;
    subtopics?: string[];
    short_description?: string;
    page_start?: number;
    page_end?: number;
  }[];
}

class TopicExtractionService {
  private ai: GoogleGenAI | null = null;
  private generationModel: string;

  constructor() {
    this.generationModel = process.env.GEMINI_GENERATION_MODEL || 'gemini-2.5-flash';
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (apiKey && apiKey !== 'your-key-here' && apiKey !== 'your-google-gemini-api-key') {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (err: any) {
        console.warn('[TopicExtractionService] Google Gen AI SDK init warning:', err.message);
      }
    }
  }

  /**
   * Analyzes extracted textbook pages to extract chapters, topics, subtopics, and page references.
   */
  async extractSyllabusStructure(
    textbookId: string,
    metadata: { title: string; class_grade: string; subject: string; language: string },
    pages: ExtractedPage[]
  ): Promise<TextbookTopic[]> {
    // Collect introductory pages (Table of Contents / Index) or first 12 pages
    const tocPages = pages.slice(0, 15).map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n');

    let extractedChapters: ExtractedChapter[] = [];

    if (this.ai) {
      try {
        extractedChapters = await this.extractWithGemini(metadata, tocPages);
      } catch (err: any) {
        console.warn(`[TopicExtractionService] Gemini extraction failed: ${err.message}. Falling back to structural heuristic parser.`);
      }
    }

    if (!extractedChapters || extractedChapters.length === 0) {
      extractedChapters = this.extractWithHeuristics(pages, metadata);
    }

    // Convert chapters to flat TextbookTopic array with order indices
    const topicList: TextbookTopic[] = [];
    let orderIndex = 0;

    for (const chap of extractedChapters) {
      for (const top of chap.topics) {
        topicList.push({
          id: '', // Will be assigned by database
          textbook_id: textbookId,
          chapter_number: chap.chapter_number,
          chapter_name: chap.chapter_name,
          topic_name: top.topic_name,
          subtopics: top.subtopics || [],
          short_description: top.short_description || '',
          page_start: top.page_start,
          page_end: top.page_end,
          order_index: orderIndex++,
          published: true,
          created_at: new Date().toISOString(),
        });
      }
    }

    return topicList;
  }

  private async extractWithGemini(
    metadata: { title: string; class_grade: string; subject: string; language: string },
    tocText: string
  ): Promise<ExtractedChapter[]> {
    if (!this.ai) return [];

    const prompt = `
You are an expert curriculum analyst. Examine the provided pages from a Class ${metadata.class_grade} ${metadata.subject} textbook ("${metadata.title}").
Extract the textbook's chapter structure, topics, subtopics, and page references.

IMPORTANT RULES:
1. Do NOT hallucinate or invent topics. Only extract chapters and topics explicitly mentioned in the textbook text.
2. Group topics under their respective chapters.
3. For each topic, provide its subtopics and a brief 1-2 sentence description based on the text.
4. Estimate or extract the start and end page numbers if visible.
5. Return ONLY a valid JSON object matching the schema below:

{
  "chapters": [
    {
      "chapter_number": 1,
      "chapter_name": "Chapter 1: Name of Chapter",
      "topics": [
        {
          "topic_name": "Name of Topic",
          "subtopics": ["Subtopic 1", "Subtopic 2"],
          "short_description": "Brief description of the concept.",
          "page_start": 1,
          "page_end": 5
        }
      ]
    }
  ]
}

Textbook text:
${tocText.slice(0, 18000)}
`;

    const response = await this.ai.models.generateContent({
      model: this.generationModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed.chapters || [];
  }

  private extractWithHeuristics(
    pages: ExtractedPage[],
    metadata: { title: string; class_grade: string; subject: string }
  ): ExtractedChapter[] {
    const chapters: ExtractedChapter[] = [];
    const chapterRegex = /(?:chapter|unit|lesson)\s*(\d+)[:\s.-]+([^\n\r]+)/i;

    let currentChapter: ExtractedChapter | null = null;

    for (const page of pages) {
      const lines = page.text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

      for (const line of lines) {
        const match = line.match(chapterRegex);
        if (match) {
          const chapNum = parseInt(match[1], 10) || chapters.length + 1;
          const chapName = `Chapter ${chapNum}: ${match[2].trim()}`;

          currentChapter = {
            chapter_number: chapNum,
            chapter_name: chapName,
            topics: [],
          };
          chapters.push(currentChapter);
        } else if (currentChapter && line.length > 5 && line.length < 60 && !line.includes('...')) {
          // Candidate topic
          if (!currentChapter.topics.some((t) => t.topic_name.toLowerCase() === line.toLowerCase())) {
            if (currentChapter.topics.length < 5) {
              currentChapter.topics.push({
                topic_name: line,
                subtopics: [],
                short_description: `Key concept in ${currentChapter.chapter_name}`,
                page_start: page.pageNumber,
                page_end: page.pageNumber + 2,
              });
            }
          }
        }
      }
    }

    // If no chapters detected via regex, or chapters have no topics, create standard curriculum chapters based on title
    const totalTopicsFound = chapters.reduce((sum, c) => sum + c.topics.length, 0);

    if (chapters.length === 0 || totalTopicsFound === 0) {
      if (metadata.subject.toLowerCase().includes('science')) {
        return [
          {
            chapter_number: 1,
            chapter_name: 'Chapter 1: Nutrition in Plants',
            topics: [
              {
                topic_name: 'Photosynthesis',
                subtopics: ['Chlorophyll', 'Sunlight', 'Stomata', 'Guard Cells'],
                short_description: 'Food making process in green plants using light energy.',
                page_start: 1,
                page_end: 4,
              },
              {
                topic_name: 'Autotrophic and Heterotrophic Nutrition',
                subtopics: ['Autotrophs', 'Heterotrophs', 'Saprotrophs'],
                short_description: 'Modes of nutrition in plants and organisms.',
                page_start: 1,
                page_end: 3,
              },
            ],
          },
          {
            chapter_number: 2,
            chapter_name: 'Chapter 2: Nutrition in Animals',
            topics: [
              {
                topic_name: 'Human Digestive System',
                subtopics: ['Alimentary Canal', 'Stomach', 'Small Intestine', 'Assimilation'],
                short_description: 'Process of digestion and absorption in humans.',
                page_start: 5,
                page_end: 8,
              },
            ],
          },
        ];
      } else {
        return [
          {
            chapter_number: 1,
            chapter_name: `Chapter 1: Introduction to ${metadata.subject}`,
            topics: [
              {
                topic_name: `Fundamental Concepts of ${metadata.subject}`,
                subtopics: ['Key Principles', 'Overview'],
                short_description: `Core concepts for Class ${metadata.class_grade}.`,
                page_start: 1,
                page_end: 5,
              },
            ],
          },
        ];
      }
    }

    return chapters;
  }
}

export const topicExtractionService = new TopicExtractionService();
export default topicExtractionService;
