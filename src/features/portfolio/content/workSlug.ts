import { Work } from './model';

export function slugifyWorkTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function getWorkSlug(work: Work) {
  const slug = slugifyWorkTitle(work.title);
  return slug || work.id;
}
