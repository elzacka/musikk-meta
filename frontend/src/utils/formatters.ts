const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function fmtDuration(ms: number | null | undefined): string {
  if (!ms) return '–';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function fmtKey(key: number | null | undefined, mode: number | null | undefined): string {
  if (key === null || key === undefined) return '–';
  const k = KEY_NAMES[key] ?? '?';
  if (mode === null || mode === undefined) return k;
  return `${k} ${mode === 1 ? 'dur' : 'moll'}`;
}

export function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined) return '–';
  return `${Math.round(v * 100)} %`;
}

export function fmtNum(v: number | null | undefined): string {
  if (v === null || v === undefined) return '–';
  return String(Math.round(v));
}

export function fmtFloat(v: number | null | undefined, d = 1): string {
  if (v === null || v === undefined) return '–';
  return v.toFixed(d);
}
