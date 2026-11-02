import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const BRAND_BLUE = rgb(0x4f / 255, 0xa7 / 255, 0xe0 / 255);
const BRAND_DARK = rgb(0x2b / 255, 0x2f / 255, 0x36 / 255);
const GRAY = rgb(0x6b / 255, 0x72 / 255, 0x80 / 255);

const PHRASES: { en: string; pt: string }[] = [
  { en: "Good morning!", pt: "Bom dia!" },
  { en: "How are you?", pt: "Como você está?" },
  { en: "Nice to meet you.", pt: "Prazer em conhecê-lo(a)." },
  { en: "Can you help me, please?", pt: "Você pode me ajudar, por favor?" },
  { en: "I don't understand.", pt: "Eu não entendo." },
  { en: "Can you repeat that, please?", pt: "Você pode repetir, por favor?" },
  { en: "How much is this?", pt: "Quanto custa isso?" },
  { en: "Where is the bathroom?", pt: "Onde é o banheiro?" },
  { en: "I'm looking for...", pt: "Estou procurando por..." },
  { en: "What time is it?", pt: "Que horas são?" },
  { en: "Can I have the bill, please?", pt: "Pode trazer a conta, por favor?" },
  { en: "See you later!", pt: "Até mais!" },
  { en: "Thank you very much.", pt: "Muito obrigado(a)." },
  { en: "Excuse me.", pt: "Com licença." },
  { en: "I'm sorry.", pt: "Desculpe." },
];

async function main() {
  const doc = await PDFDocument.create();
  const fontBody = await doc.embedFont(StandardFonts.Helvetica);
  const fontHeading = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;

  // Capa
  const cover = doc.addPage([pageWidth, pageHeight]);
  cover.drawRectangle({ x: 0, y: pageHeight - 220, width: pageWidth, height: 220, color: BRAND_BLUE });
  cover.drawText("Descomplica English", {
    x: 50,
    y: pageHeight - 110,
    size: 28,
    font: fontHeading,
    color: rgb(1, 1, 1),
  });
  cover.drawText("@inglesnapraticausa", {
    x: 50,
    y: pageHeight - 140,
    size: 14,
    font: fontBody,
    color: rgb(1, 1, 1),
  });
  cover.drawText("Inglês simples para o dia a dia", {
    x: 50,
    y: pageHeight - 300,
    size: 24,
    font: fontHeading,
    color: BRAND_DARK,
  });
  cover.drawText(
    "15 frases essenciais em inglês, com tradução, para você usar hoje mesmo",
    { x: 50, y: pageHeight - 330, size: 13, font: fontBody, color: GRAY, maxWidth: pageWidth - 100 },
  );
  cover.drawText("Inglês simples e prático para o dia a dia.", {
    x: 50,
    y: 60,
    size: 11,
    font: fontBody,
    color: GRAY,
  });

  // Conteúdo
  let page = doc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - 70;
  page.drawText("Frases do dia a dia", { x: 50, y: cursorY, size: 20, font: fontHeading, color: BRAND_DARK });
  cursorY -= 40;

  for (const phrase of PHRASES) {
    if (cursorY < 80) {
      page = doc.addPage([pageWidth, pageHeight]);
      cursorY = pageHeight - 70;
    }
    page.drawText(phrase.en, { x: 50, y: cursorY, size: 14, font: fontHeading, color: BRAND_DARK });
    page.drawText(phrase.pt, { x: 320, y: cursorY, size: 14, font: fontBody, color: GRAY });
    cursorY -= 10;
    page.drawLine({
      start: { x: 50, y: cursorY },
      end: { x: pageWidth - 50, y: cursorY },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
    cursorY -= 26;
  }

  const last = doc.addPage([pageWidth, pageHeight]);
  last.drawText("Quer ir além dessas frases?", {
    x: 50,
    y: pageHeight - 100,
    size: 20,
    font: fontHeading,
    color: BRAND_DARK,
  });
  last.drawText(
    "Conheça os cursos English Made Simple e English for Construction Workers",
    { x: 50, y: pageHeight - 130, size: 13, font: fontBody, color: GRAY, maxWidth: pageWidth - 100 },
  );
  last.drawText("na plataforma Descomplica English.", {
    x: 50,
    y: pageHeight - 150,
    size: 13,
    font: fontBody,
    color: GRAY,
  });
  last.drawText("Siga @inglesnapraticausa no Instagram.", {
    x: 50,
    y: pageHeight - 190,
    size: 13,
    font: fontHeading,
    color: BRAND_BLUE,
  });

  const bytes = await doc.save();
  const outDir = path.join(process.cwd(), "public", "materiais");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "ingles-simples-dia-a-dia.pdf");
  await writeFile(outPath, bytes);
  console.log(`PDF gerado em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
