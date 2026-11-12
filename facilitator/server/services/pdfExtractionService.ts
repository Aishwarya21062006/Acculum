import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { ocrService } from './ocrService.js';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface PDFExtractionResult {
  totalPages: number;
  fullText: string;
  pages: ExtractedPage[];
}

class PDFExtractionService {
  /**
   * Extracts text from a PDF file path or buffer with page-by-page tracking.
   */
  async extractText(
    filePathOrBuffer: string | Buffer,
    language: string = 'English'
  ): Promise<PDFExtractionResult> {
    let dataBuffer: Buffer;
    if (typeof filePathOrBuffer === 'string') {
      dataBuffer = fs.readFileSync(filePathOrBuffer);
    } else {
      dataBuffer = filePathOrBuffer;
    }

    const parser = new PDFParse({ data: dataBuffer });
    try {
      const result = await parser.getText();
      const totalPages = (result as any).total || (result as any).pages?.length || 1;
      const pages: ExtractedPage[] = [];

      if ((result as any).pages && Array.isArray((result as any).pages)) {
        for (const p of (result as any).pages) {
          let pageText = (p.text || '').trim();
          const pageNum = p.num || pages.length + 1;

          // If text is suspiciously short (scanned page or image), attempt OCR if possible
          if (pageText.length < 40 && typeof parser.getImage === 'function') {
            try {
              const img: any = await parser.getImage(pageNum);
              if (img && img.data) {
                const ocrText = await ocrService.recognizeTextFromBuffer(Buffer.from(img.data), language);
                if (ocrText.length > pageText.length) {
                  pageText = ocrText;
                }
              }
            } catch {
              // Ignore OCR image extract failure and keep original text
            }
          }

          pages.push({
            pageNumber: pageNum,
            text: pageText,
          });
        }
      } else {
        // Fallback single page
        pages.push({
          pageNumber: 1,
          text: (result as any).text || '',
        });
      }

      const fullText = pages.map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n');

      return {
        totalPages,
        fullText,
        pages,
      };
    } finally {
      await parser.destroy();
    }
  }
}

export const pdfExtractionService = new PDFExtractionService();
export default pdfExtractionService;

