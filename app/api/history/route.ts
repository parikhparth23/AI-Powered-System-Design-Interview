import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .order('date', { ascending: false })
      .limit(200);
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('GET /api/history error', err);
    return NextResponse.json({ error: 'Failed to read history' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const row = {
      question: body.question || '',
      response: body.response || '',
      evaluation: body.evaluation || null,
      drawing_data: body.drawingData || null,
      date: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('history').insert([row]).select();
    if (error) throw error;
    return NextResponse.json(data?.[0] ?? row, { status: 201 });
  } catch (err) {
    console.error('POST /api/history error', err);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // delete all rows
    const { error } = await supabase.from('history').delete().neq('id', 0);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/history error', err);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
