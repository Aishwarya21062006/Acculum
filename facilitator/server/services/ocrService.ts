import { createWorker } from 'tesseract.js';

class OCRService {
  /**
   * Recognizes text from an image buffer using Tesseract OCR.
   */
  async recognizeTextFromBuffer(imageBuffer: Buffer, language: string = 'eng'): Promise<string> {
    try {
      const langCode = language.toLowerCase().startsWith('kan') ? 'kan' : 'eng';
      const worker = await createWorker(langCode);
      const ret = await worker.recognize(imageBuffer);
      await worker.terminate();
      return ret.data.text.trim();
    } catch (err: any) {
      console.warn('[OCRService] OCR failed or language not loaded:', err.message);
      return '';
    }
  }
}

export const ocrService = new OCRService();
export default ocrService;

