const baseUrl = import.meta.env.BASE_URL || '/';

export function withBasePath(path: string) {
  if (!path.startsWith('/')) {
    return path;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBase}${normalizedPath}`;
}

export function resolveAssetUrl(path?: string) {
  if (!path) {
    return '';
  }

  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  return withBasePath(path);
}
