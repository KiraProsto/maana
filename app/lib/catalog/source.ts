import 'server-only';

export function usesDatabaseCatalog() {
  return process.env.CATALOG_SOURCE === 'database';
}
