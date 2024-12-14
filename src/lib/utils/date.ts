export function formatDate(date: string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
}
