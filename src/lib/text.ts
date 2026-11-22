export function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function pdfText(value: string) {
  return value
    .replaceAll("œ", "oe")
    .replaceAll("Œ", "OE")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replace(/[^\u0000-\u00FF]/g, "");
}

export function personName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}
