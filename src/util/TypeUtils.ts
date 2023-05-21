export function isPresent<T>(e: T | null): e is T {
  return Boolean(e);
}