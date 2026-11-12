import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/services/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context } = body;

    const responseText = await generateResponse(message, context);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}
