export function toNumberInputValue(
  value: number | null | undefined
): string {
  return value == null ? '' : String(value);
}

export function parseNumberInput(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
