import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const schema = await readFile(path.join(process.cwd(), 'supabase', 'schema.sql'), 'utf8');
    return new NextResponse(schema, {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return NextResponse.json({ error: 'Schema file is not available.' }, { status: 404 });
  }
}