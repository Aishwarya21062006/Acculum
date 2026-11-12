import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/ with original name
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // slot = 'voice' → demo-voice-video.mp4, slot = 'text' → demo-text-video.mp4, else → demo-video.mp4
    const slot = formData.get('slot') as string | null;
    const demoName = slot === 'voice' ? 'demo-voice-video.mp4' : slot === 'text' ? 'demo-text-video.mp4' : 'demo-video.mp4';
    const demoPath = path.join(process.cwd(), 'public', demoName);
    await writeFile(demoPath, buffer);

    return NextResponse.json({
      success: true,
      fileName,
      url: `/uploads/${fileName}`,
      demoUrl: file.type.startsWith('video') ? '/demo-video.mp4' : null,
    });
  } catch (err: any) {
    console.error('[Upload Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
