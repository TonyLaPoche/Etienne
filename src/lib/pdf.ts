import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { CHART_COLORS } from "@/lib/brand";
import {
  appreciationSlices,
  averageNote,
  formatDate,
  formatScore,
  noteSlices,
  skillAverageRows,
  skillTotalSlices,
  sortCharacters,
  type Slice,
} from "@/lib/stats";
import { pdfText, personName } from "@/lib/text";
import { appreciationLabel, type Character, type Skill } from "@/lib/types";

type Doc = jsPDF & { lastAutoTable?: { finalY: number } };

type PieImage = { url: string; width: number; height: number };

function pieImage(slices: Slice[], title: string): PieImage | null {
  if (typeof document === "undefined" || slices.length === 0) return null;
  const width = 1200;
  const rowHeight = 46;
  const height = Math.max(680, 120 + slices.length * rowHeight);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#6F2D2F";
  context.font = "700 36px sans-serif";
  context.fillText(title, 40, 56);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const cx = 300;
  const cy = Math.max(360, height / 2 + 10);
  const radius = 210;
  let angle = -Math.PI / 2;

  if (slices.length === 1) {
    context.beginPath();
    context.fillStyle = CHART_COLORS[0];
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.fill();
  } else {
    slices.forEach((slice, index) => {
      const sweep = (slice.value / total) * Math.PI * 2;
      context.beginPath();
      context.moveTo(cx, cy);
      context.arc(cx, cy, radius, angle, angle + sweep);
      context.closePath();
      context.fillStyle = CHART_COLORS[index % CHART_COLORS.length];
      context.fill();
      angle += sweep;
    });
  }

  slices.forEach((slice, index) => {
    const y = 120 + index * rowHeight;
    context.fillStyle = CHART_COLORS[index % CHART_COLORS.length];
    context.fillRect(560, y - 22, 28, 28);
    context.fillStyle = "#444A4F";
    context.font = "28px sans-serif";
    const percent = Math.round((slice.value / total) * 100);
    const label = slice.label.length > 32 ? `${slice.label.slice(0, 31)}...` : slice.label;
    const score = Number.isInteger(slice.value) ? String(slice.value) : formatScore(slice.value);
    context.fillText(pdfText(`${label}  ${score}  (${percent} %)`), 604, y);
  });

  return { url: canvas.toDataURL("image/png"), width, height };
}

function paintChrome(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFillColor(231, 69, 54);
    doc.rect(0, 0, 210, 7, "F");
    doc.setFillColor(111, 45, 47);
    doc.rect(0, 7, 210, 1.2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(109, 118, 124);
    doc.text(pdfText("ADTP Fiches — POC Antoine Terrade pour Étienne et ADTP"), 14, 292);
    doc.text(`${page} / ${pages}`, 196, 292, { align: "right" });
  }
}

function heading(doc: jsPDF, text: string, y: number, size = 16) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(111, 45, 47);
  doc.text(pdfText(text), 14, y);
}

function ensure(doc: jsPDF, y: number, needed: number) {
  if (y + needed <= 280) return y;
  doc.addPage();
  return 18;
}

function table(doc: Doc, y: number, head: string[], body: string[][]) {
  autoTable(doc, {
    startY: y,
    head: [head.map(pdfText)],
    body: body.map((row) => row.map(pdfText)),
    margin: { top: 16, bottom: 16, left: 14, right: 14 },
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: [68, 74, 79],
      cellPadding: 2.4,
      lineColor: [213, 218, 221],
      lineWidth: 0.1,
    },
    headStyles: { fillColor: [231, 69, 54], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [244, 244, 244] },
    columnStyles: { 0: { cellWidth: 48 } },
  });
  return (doc.lastAutoTable?.finalY ?? y) + 8;
}

function skillRows(character: Character, skills: Skill[]) {
  const names = new Map(skills.map((skill) => [skill.id, skill.name]));
  if (character.skills.length === 0) {
    return [["Aucune compétence", "-", "-", "-"]];
  }
  return character.skills.map((skill) => [
    names.get(skill.skillId) ?? "Compétence retirée",
    `${skill.note}/10`,
    appreciationLabel(skill.appreciation),
    skill.commentaire || "-",
  ]);
}

function placeImage(doc: jsPDF, image: PieImage, y: number) {
  const width = 182;
  const height = (width * image.height) / image.width;
  let top = y;
  if (top + height > 280) {
    doc.addPage();
    top = 18;
  }
  doc.addImage(image.url, "PNG", 14, top, width, height);
  return top + height + 6;
}

function fileSlug(value: string) {
  return pdfText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function downloadCharacterPdf(character: Character, skills: Skill[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true }) as Doc;
  const name = personName(character.firstName, character.lastName);
  doc.setProperties({
    title: pdfText(`Fiche ${name}`),
    author: "Antoine Terrade",
    subject: "Fiche personnage ADTP",
  });
  heading(doc, "Fiche personnage", 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(68, 74, 79);
  doc.text(pdfText(name), 14, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const average = averageNote(character.skills);
  doc.text(
    pdfText(
      `${character.age} ans · mise à jour le ${formatDate(character.updatedAt)}${
        average === null ? "" : ` · moyenne ${formatScore(average)}/10`
      }`,
    ),
    14,
    33,
  );
  heading(doc, "Tableau", 42, 12);
  let y = table(doc, 46, ["Compétence", "Note", "Appréciation", "Commentaire"], skillRows(character, skills));
  const image = pieImage(noteSlices(character, skills), "Camembert des notes");
  if (image) placeImage(doc, image, y);
  else {
    y = ensure(doc, y, 12);
    doc.setFontSize(11);
    doc.setTextColor(68, 74, 79);
    doc.text("Aucune note supérieure à 0 pour tracer un camembert.", 14, y);
  }
  paintChrome(doc);
  doc.save(`adtp-fiche-${fileSlug(name) || "personnage"}.pdf`);
}

export async function downloadGroupPdf(characters: Character[], skills: Skill[]) {
  const picked = sortCharacters(characters);
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true }) as Doc;
  const stamp = new Date().toISOString().slice(0, 10);
  doc.setProperties({
    title: "Export groupé des fiches ADTP",
    author: "Antoine Terrade",
    subject: "Fiches personnages",
  });
  heading(doc, "Export groupé", 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(68, 74, 79);
  doc.text(pdfText(`${picked.length} fiche(s) · ${formatDate(new Date().toISOString())}`), 14, 26);

  heading(doc, "Tableau des fiches", 36, 12);
  let y = table(
    doc,
    40,
    ["Personne", "Âge", "Compétences", "Moyenne"],
    picked.map((character) => {
      const average = averageNote(character.skills);
      return [
        personName(character.firstName, character.lastName),
        `${character.age} ans`,
        String(character.skills.length),
        average === null ? "-" : `${formatScore(average)}/10`,
      ];
    }),
  );

  const appreciations = appreciationSlices(picked);
  y = ensure(doc, y, 20);
  heading(doc, "Tableau des appréciations", y, 12);
  y = table(
    doc,
    y + 4,
    ["Appréciation", "Nombre"],
    appreciations.length > 0
      ? appreciations.map((slice) => [slice.label, String(slice.value)])
      : [["Aucune évaluation", "-"]],
  );

  const averages = skillAverageRows(picked, skills);
  y = ensure(doc, y, 20);
  heading(doc, "Tableau des compétences", y, 12);
  y = table(
    doc,
    y + 4,
    ["Compétence", "Moyenne", "Total des notes", "Fiches"],
    averages.length > 0
      ? averages.map((row) => [row.name, `${formatScore(row.average)}/10`, String(row.total), String(row.count)])
      : [["Aucune compétence", "-", "-", "-"]],
  );

  const appreciationPie = pieImage(appreciations, "Camembert des appréciations");
  if (appreciationPie) y = placeImage(doc, appreciationPie, y);
  const skillPie = pieImage(skillTotalSlices(picked, skills), "Camembert des notes cumulées");
  if (skillPie) placeImage(doc, skillPie, y);

  for (const character of picked) {
    doc.addPage();
    const name = personName(character.firstName, character.lastName);
    heading(doc, name, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(68, 74, 79);
    const average = averageNote(character.skills);
    doc.text(
      pdfText(`${character.age} ans${average === null ? "" : ` · moyenne ${formatScore(average)}/10`}`),
      14,
      26,
    );
    heading(doc, "Tableau", 34, 12);
    const afterTable = table(
      doc,
      38,
      ["Compétence", "Note", "Appréciation", "Commentaire"],
      skillRows(character, skills),
    );
    const image = pieImage(noteSlices(character, skills), "Camembert des notes");
    if (image) placeImage(doc, image, afterTable);
  }

  paintChrome(doc);
  doc.save(`adtp-fiches-${stamp}.pdf`);
}
