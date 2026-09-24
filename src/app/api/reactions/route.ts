import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { noteId, emoji } = body;
    if (!noteId || !emoji) {
      return NextResponse.json({ error: 'Missing noteId or emoji' }, { status: 400 });
    }
    return NextResponse.json({ success: true, noteId, emoji });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
