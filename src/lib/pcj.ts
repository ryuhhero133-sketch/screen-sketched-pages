import { z } from 'zod';

/**
 * Páginas do gibi em src/GIBI. O Vite resolve todos os .png da pasta
 * em URLs prontas (dev e build) — basta soltar um arquivo novo em
 * src/GIBI para ele aparecer no painel administrativo.
 */
const gibiFiles = import.meta.glob('../GIBI/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/** Ordem de leitura do gibi: 01, 02, 03, 4, 5 … 16-1, 17-1, 18, 19, 20. */
function pageNumber(path: string): number {
  const n = Number.parseInt(path.split('/').pop() ?? '', 10);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
}

export const gibiPages = Object.entries(gibiFiles)
  .sort(([a], [b]) => pageNumber(a) - pageNumber(b))
  .map(([path, src], i) => ({ src, alt: `Página ${i + 1} do gibi`, note: '' }));

const pageSchema = z.object({
  src: z.string().refine(s => s.startsWith('/') || /^https:\/\//.test(s), 'Use uma imagem local ou HTTPS.'),
  alt: z.string().min(1).max(200),
  note: z.string().max(1000).default(''),
});

export const comicSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(2500),
  pages: z.array(pageSchema).min(1).max(40),
});

export type Comic = z.infer<typeof comicSchema>;

export const defaultComic: Comic = {
  title: 'Concessão Judicial de Seguro de Vida',
  description:
    'Uma narrativa jurídica que acompanha a negativa de um seguro de vida, a atuação dos advogados, o processo judicial e a conquista do direito da beneficiária — contada em quadrinhos, com linguagem simples e envolvente.',
  pages: gibiPages.length
    ? gibiPages
    : [{ src: '/favicon.png', alt: 'Página 1 do gibi', note: '' }],
};

export function assertAdmin(isAdmin: unknown) {
  if (isAdmin !== true) throw new Error('Acesso reservado ao administrador.');
}

export function assertSameUser(actual: string | undefined, expected: string) {
  if (actual !== expected) throw new Error('Confirmação de senha inválida.');
}
