import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id) as any;
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const updates = [];
    const values = [];

    if (body.preferredLanguage) {
      updates.push('preferredLanguage = ?');
      values.push(body.preferredLanguage);
    }
    
    if (body.interests) {
      updates.push('interests = ?');
      values.push(JSON.stringify(body.interests));
    }

    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
