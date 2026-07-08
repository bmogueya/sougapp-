export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

export function sanitizeNullable(input: string | null | undefined): string {
  if (!input) return '';
  return sanitizeText(input);
}
