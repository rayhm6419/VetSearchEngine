import { NextResponse, NextResponseInit } from 'next/server';

export type ApiErrorShape = { code: string; message: string };
export type ApiResponseShape<T> = { ok: true; data: T } | { ok: false; error: ApiErrorShape };

export function apiResponse<T>(data: T, init?: NextResponseInit) {
  return NextResponse.json({ ok: true, data } as ApiResponseShape<T>, init);
}

export function apiError(code: string, message: string, status = 400, init?: NextResponseInit) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status, ...(init || {}) });
}

export function buildPagination({ take, skip, total }: { take: number; skip: number; total?: number }) {
  const out: { take: number; skip: number; total?: number } = { take, skip };
  if (typeof total === 'number') out.total = total;
  return out;
}

