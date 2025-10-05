import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalizers for streaming rows coming from different backends
export type RawRow = any

export function normalizeId(row: RawRow): string {
  // Support both Kepler (id, kepoi_name, koi) and TESS (tid, toi) fields
  return String(
    row?.id ?? row?.tid ?? row?.object_id ?? row?.kepoi_name ?? row?.toi ?? row?.koi ?? row?.ID ?? row?.name ?? ''
  ).trim()
}

export function normalizeClassification(row: RawRow): 'Confirmed' | 'Candidate' | 'False Positive' {
  const raw = String(
    row?.classificacao ?? row?.classification ?? row?.new_classificacao ?? row?.old_classificacao ?? row?.new_classification ?? row?.old_classification ?? row?.label ?? ''
  ).toLowerCase().normalize('NFD').replace(/[^a-z ]/g,'')
  if (raw.includes('confirm')) return 'Confirmed'
  if (raw.includes('candidate') || raw.includes('candidat')) return 'Candidate'
  return 'False Positive'
}

export function normalizeProbability(row: RawRow): number {
  const probRaw = row?.probabilidade ?? row?.probability ?? row?.new_probability ?? row?.old_probability ?? row?.new_probabilidade ?? row?.old_probabilidade ?? row?.prob ?? row?.score ?? null
  const num = typeof probRaw === 'string' ? Number.parseFloat(String(probRaw).replace(',', '.')) : Number(probRaw)
  const v = Number.isFinite(num) ? num : 0
  return Math.max(0, Math.min(100, v))
}

export function normalizePubdate(row: RawRow): string | null {
  const d = row?.pubdate ?? row?.publication_date ?? row?.published_at ?? null
  return d ? String(d) : null
}

export function groupRowsById(rows: RawRow[]) {
  const map = new Map<string, RawRow[]>()
  for (const r of rows || []) {
    const id = normalizeId(r)
    if (!id) continue
    const arr = map.get(id) || []
    arr.push(r)
    map.set(id, arr)
  }
  return map
}

