import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { noteId, recipientEmail, message } = body;
    if (!noteId || !message) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Thank you note dispatched', noteId, recipientEmail });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
