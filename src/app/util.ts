import { Ponudba } from './models';

/** "070 258 245" → "+38670258245" */
export function telLink(telefon: string): string {
  const d = telefon.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) return d;
  if (d.startsWith('00')) return '+' + d.slice(2);
  if (d.startsWith('0')) return '+386' + d.slice(1);
  return d;
}

/** "Mavrični grad!" → "mavricni-grad" */
export function slugify(besedilo: string): string {
  return besedilo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export const poVrsti = (a: Ponudba, b: Ponudba) => a.vrstni_red - b.vrstni_red || a.ime.localeCompare(b.ime, 'sl');

export function datumSl(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('sl-SI', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' });
}

/** Današnji datum kot YYYY-MM-DD v lokalnem času. */
export function danes(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/** Zmanjša fotografijo pred nalaganjem (max 1600 px, JPEG). */
export async function pomanjsajSliko(file: File, max = 1600): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * s);
    canvas.height = Math.round(bmp.height * s);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b ?? file), 'image/jpeg', 0.85));
  } catch {
    return file;
  }
}
