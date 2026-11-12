import { NextRequest, NextResponse } from 'next/server';
import { getAllCourses } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classNum = searchParams.get('class');
    
    const courses = getAllCourses(classNum ? parseInt(classNum, 10) : undefined);
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
