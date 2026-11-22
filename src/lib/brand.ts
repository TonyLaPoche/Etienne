/**
 * Couleurs relevées sur https://www.adtp.com/ (css/main.css et logo2.svg), le 22 nov. 2026.
 * - #E74536 rouge d'accent (menu, boutons, liens)
 * - #D12919 rouge de survol
 * - #6F2D2F bordeaux du mot-symbole
 * - #E52713 rouge de l'emblème
 * - #444A4F gris de texte
 * - #0F548B et #1A8B53 bleu et vert des blocs savoir-faire (intégrations / services)
 */
export const BRAND = {
  red: "#E74536",
  redDeep: "#D12919",
  burgundy: "#6F2D2F",
  emblem: "#E52713",
  ink: "#444A4F",
  muted: "#6D767C",
  sea: "#0F548B",
  leaf: "#1A8B53",
  leafDeep: "#00622F",
  blueSoft: "#5C75AD",
  orange: "#E35317",
  amber: "#EC8F30",
  plum: "#750E77",
  plumSoft: "#904099",
  rose: "#C32F4D",
  brick: "#A72C20",
} as const;

export const CHART_COLORS = [
  BRAND.red,
  BRAND.sea,
  BRAND.leaf,
  BRAND.burgundy,
  BRAND.blueSoft,
  BRAND.leafDeep,
  BRAND.orange,
  BRAND.plum,
  BRAND.rose,
  BRAND.amber,
  BRAND.plumSoft,
  BRAND.brick,
] as const;
