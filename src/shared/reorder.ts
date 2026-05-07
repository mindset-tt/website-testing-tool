export function reorderItems<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (
    fromIndex < 0
    || fromIndex >= items.length
    || toIndex < 0
    || toIndex >= items.length
    || fromIndex === toIndex
  ) {
    return [...items];
  }

  const next = [...items];
  const [movedItem] = next.splice(fromIndex, 1);

  next.splice(toIndex, 0, movedItem);

  return next;
}
