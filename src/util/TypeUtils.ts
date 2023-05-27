export function isPresent<T>(e: T | null): e is T {
  return Boolean(e);
}

export function isArray<T>(e: T | T[]): e is T[] {
  return e instanceof Array;
}
