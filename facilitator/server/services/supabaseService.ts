import { createClient, SupabaseClient } from '@supabase/supabase-js';

class SupabaseService {
  private client: SupabaseClient | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.init();
  }

  public init() {
    let url = process.env.SUPABASE_URL;
    if (url) {
      url = url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    }
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (url && key && url !== 'https://your-project.supabase.co' && !url.includes('your-project')) {
      try {
        this.client = createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        this.isConfigured = true;
        console.log('[SupabaseService] Initialized Supabase client successfully.');
      } catch (err: any) {
        console.error('[SupabaseService] Initialization failed:', err.message);
        this.isConfigured = false;
      }
    } else {
      console.warn('[SupabaseService] Supabase credentials not provided or placeholder used. Running with local database bridge.');
      this.isConfigured = false;
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public hasValidConfig(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Uploads textbook PDF to Supabase Storage bucket 'textbooks'
   */
  async uploadTextbookFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string = 'application/pdf'
  ): Promise<{ path: string; publicUrl: string }> {
    if (!this.client) {
      throw new Error('Supabase client is not configured. Please supply SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }

    const path = `textbooks/${Date.now()}-${fileName}`;
    const { data, error } = await this.client.storage
      .from('textbooks')
      .upload(path, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
    }

    const { data: publicUrlData } = this.client.storage
      .from('textbooks')
      .getPublicUrl(path);

    return {
      path,
      publicUrl: publicUrlData.publicUrl,
    };
  }

  /**
   * Performs semantic vector search on textbook chunks via Supabase RPC match_textbook_chunks
   */
  async vectorSearch(
    queryEmbedding: number[],
    options: {
      textbookId?: string;
      chapter?: string;
      topic?: string;
      matchThreshold?: number;
      matchCount?: number;
    } = {}
  ): Promise<any[]> {
    if (!this.client) {
      throw new Error('Supabase client not configured for vector search.');
    }

    const { data, error } = await this.client.rpc('match_textbook_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: options.matchThreshold ?? 0.25,
      match_count: options.matchCount ?? 5,
      filter_textbook_id: options.textbookId || null,
      filter_chapter: options.chapter || null,
      filter_topic: options.topic || null,
    });

    if (error) {
      throw new Error(`Semantic search RPC failed: ${error.message}`);
    }

    return data || [];
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;

