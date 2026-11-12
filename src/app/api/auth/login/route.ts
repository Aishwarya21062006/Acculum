import { NextRequest, NextResponse } from 'next/server';
import { getStudentByNameAndClass, getTeacherByName } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, name, classNum } = body;

    if (role === 'student') {
      if (!name || !classNum) {
        return NextResponse.json({ error: 'Name and class are required' }, { status: 400 });
      }
      
      const student = getStudentByNameAndClass(name, parseInt(classNum, 10));
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
      return NextResponse.json({ user: student, role: 'student' });
    } 
    
    if (role === 'teacher') {
      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
      
      const teacher = getTeacherByName(name);
      if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
      }
      return NextResponse.json({ user: teacher, role: 'teacher' });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
