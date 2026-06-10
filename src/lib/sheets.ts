import { google } from 'googleapis';
import type { Employee } from '@/types';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const SHEET_GID = process.env.GOOGLE_SHEET_GID;

function getAuth() {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  // Handle both literal \n strings and actual newlines
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey;

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

async function getSheetTitle(): Promise<string> {
  if (!SHEET_GID) return 'Sheet1';

  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = meta.data.sheets?.find(s => String(s.properties?.sheetId) === SHEET_GID);
  return sheet?.properties?.title || 'Sheet1';
}

function normalizeHeader(h: string): keyof Employee | null {
  const lower = h.toLowerCase().trim();
  if (lower === 'name' || lower === 'employee name') return 'name';
  if (lower.includes('title') && !lower.includes('reporting')) return 'title';
  if (lower.includes('manager') || lower.includes('reporting')) return 'reporting_manager';
  if (lower.includes('start date') || (lower.includes('onboarding') && lower.includes('date'))) return 'onboarding_start_date';
  if (lower.includes('attendance') && !lower.includes('rate')) return 'attendance';
  if (lower.includes('engagement')) return 'engagement';
  if ((lower.includes('learning') || lower.includes('comprehension')) && !lower.includes('product')) return 'learning_comprehension';
  if (lower.includes('product') || lower.includes('role understanding')) return 'product_role_understanding';
  if (lower.includes('communication')) return 'communication_skills';
  if (lower.includes('quiz')) return 'quiz_result';
  if (lower.includes('overall') || lower.includes('performance score')) return 'overall_performance_score';
  if (lower.includes('note') || lower.includes('comment')) return 'final_notes';
  if (lower.includes('video') || lower.includes('link') || lower.includes('url')) return 'video_link';
  return null;
}

function parseIntRating(val: string | null | undefined): number | null {
  if (!val) return null;
  const n = parseInt(val.trim(), 10);
  if (isNaN(n) || n < 1 || n > 5) return null;
  return n;
}

function rowHash(data: Partial<Employee>): string {
  const str = JSON.stringify({
    name: data.name,
    title: data.title,
    reporting_manager: data.reporting_manager,
    onboarding_start_date: data.onboarding_start_date,
    attendance: data.attendance,
    engagement: data.engagement,
    learning_comprehension: data.learning_comprehension,
    product_role_understanding: data.product_role_understanding,
    communication_skills: data.communication_skills,
    quiz_result: data.quiz_result,
    overall_performance_score: data.overall_performance_score,
    final_notes: data.final_notes,
    video_link: data.video_link,
  });
  return createHash('sha256').update(str).digest('hex');
}

function employeeId(name: string, startDate: string): string {
  return createHash('sha256')
    .update(`${name.trim().toLowerCase()}|${(startDate || '').trim()}`)
    .digest('hex')
    .slice(0, 16);
}

export async function fetchSheetData(): Promise<Omit<Employee, 'created_at' | 'updated_at'>[]> {
  if (!SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Sheets credentials not configured. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY env vars.');
  }

  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const title = await getSheetTitle();
  const range = `'${title}'`;

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });

  const rows = resp.data.values;
  if (!rows || rows.length < 2) return [];

  const headers = (rows[0] as string[]).map(h => String(h || ''));
  const fieldMap: (keyof Employee | null)[] = headers.map(normalizeHeader);

  const now = new Date().toISOString();
  const results: Omit<Employee, 'created_at' | 'updated_at'>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as (string | number | null)[];
    const raw: Record<string, string> = {};

    fieldMap.forEach((field, colIdx) => {
      if (field) {
        const cell = row[colIdx];
        raw[field] = cell !== null && cell !== undefined ? String(cell).trim() : '';
      }
    });

    if (!raw.name) continue;

    const emp: Omit<Employee, 'created_at' | 'updated_at'> = {
      id: employeeId(raw.name || '', raw.onboarding_start_date || ''),
      name: raw.name || '',
      title: raw.title || null,
      reporting_manager: raw.reporting_manager || null,
      onboarding_start_date: raw.onboarding_start_date || null,
      attendance: raw.attendance || null,
      engagement: raw.engagement || null,
      learning_comprehension: raw.learning_comprehension || null,
      product_role_understanding: parseIntRating(raw.product_role_understanding),
      communication_skills: parseIntRating(raw.communication_skills),
      quiz_result: raw.quiz_result || null,
      overall_performance_score: parseIntRating(raw.overall_performance_score),
      final_notes: raw.final_notes || null,
      video_link: raw.video_link || null,
      row_hash: '',
      sheet_row: i + 1,
      synced_at: now,
    };

    emp.row_hash = rowHash(emp);
    results.push(emp);
  }

  return results;
}
