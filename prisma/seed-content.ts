import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Seed de conteúdo para produção: só cursos, aulas e produtos. Idempotente
// (upsert por slug/key). NUNCA cria usuários -- diferente de seed.ts, que é
// só para desenvolvimento local.
async function main() {
  console.log("Seed: produtos...");
  const products = [
    { key: "COURSE_FULL" as const, name: "Curso completo — English Made Simple", priceCents: 9700 },
    { key: "COURSE_CONSTRUCTION" as const, name: "Curso — English for Construction Workers", priceCents: 9700 },
    { key: "SINGLE_CLASS" as const, name: "Aula particular avulsa", priceCents: 6000 },
    { key: "PACKAGE_4" as const, name: "Pacote de 4 aulas particulares", priceCents: 20000 },
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { key: p.key }, create: p, update: { name: p.name } });
  }

  console.log("Seed: curso English Made Simple...");
  const englishMadeSimple = await prisma.course.upsert({
    where: { slug: "english-made-simple" },
    create: {
      slug: "english-made-simple",
      title: "English Made Simple",
      description:
        "Curso completo para sair do zero e ganhar confiança para se comunicar em inglês no dia a dia.",
      level: "Iniciante",
      productKey: "COURSE_FULL",
      published: true,
      order: 1,
    },
    update: {},
  });

  const emsLessons: LessonSeed[] = [
    {
      title: "First Steps in English",
      vocabulary: [
        { en: "hello", pt: "olá" },
        { en: "goodbye", pt: "tchau" },
        { en: "please", pt: "por favor" },
        { en: "thank you", pt: "obrigado(a)" },
        { en: "yes", pt: "sim" },
        { en: "no", pt: "não" },
      ],
      phrases: [
        { en: "What's your name?", pt: "Qual é o seu nome?" },
        { en: "My name is...", pt: "Meu nome é..." },
        { en: "Nice to meet you.", pt: "Prazer em conhecê-lo(a)." },
      ],
    },
    {
      title: "Everyday Vocabulary",
      vocabulary: [
        { en: "house", pt: "casa" },
        { en: "work", pt: "trabalho" },
        { en: "family", pt: "família" },
        { en: "food", pt: "comida" },
        { en: "water", pt: "água" },
        { en: "money", pt: "dinheiro" },
      ],
      phrases: [
        { en: "I'm going home.", pt: "Estou indo para casa." },
        { en: "I need some water.", pt: "Eu preciso de água." },
      ],
    },
    {
      title: "Essential Conversations",
      vocabulary: [
        { en: "how are you", pt: "como você está" },
        { en: "fine", pt: "bem" },
        { en: "busy", pt: "ocupado" },
        { en: "tired", pt: "cansado" },
      ],
      phrases: [
        { en: "How are you doing?", pt: "Como você está?" },
        { en: "I'm doing great, thanks.", pt: "Estou muito bem, obrigado." },
      ],
    },
    {
      title: "Listening & Understanding",
      vocabulary: [
        { en: "listen", pt: "escutar" },
        { en: "understand", pt: "entender" },
        { en: "repeat", pt: "repetir" },
        { en: "slowly", pt: "lentamente" },
      ],
      phrases: [
        { en: "I don't understand.", pt: "Eu não entendo." },
        { en: "Can you speak slowly, please?", pt: "Você pode falar devagar, por favor?" },
      ],
    },
    {
      title: "Speaking Without Fear",
      vocabulary: [
        { en: "practice", pt: "praticar" },
        { en: "mistake", pt: "erro" },
        { en: "confidence", pt: "confiança" },
        { en: "try", pt: "tentar" },
      ],
      phrases: [
        { en: "It's okay to make mistakes.", pt: "Está tudo bem errar." },
        { en: "I'm still learning.", pt: "Eu ainda estou aprendendo." },
      ],
    },
    {
      title: "Real Life Situations",
      vocabulary: [
        { en: "supermarket", pt: "supermercado" },
        { en: "bank", pt: "banco" },
        { en: "pharmacy", pt: "farmácia" },
        { en: "bus stop", pt: "parada de ônibus" },
      ],
      phrases: [
        { en: "Where is the nearest pharmacy?", pt: "Onde fica a farmácia mais próxima?" },
        { en: "How much does it cost?", pt: "Quanto custa?" },
      ],
    },
    {
      title: "Common Expressions",
      vocabulary: [
        { en: "no problem", pt: "sem problema" },
        { en: "sounds good", pt: "parece bom" },
        { en: "take care", pt: "se cuida" },
        { en: "see you soon", pt: "até breve" },
      ],
      phrases: [
        { en: "No worries!", pt: "Sem preocupação!" },
        { en: "Sounds good to me.", pt: "Parece bom para mim." },
      ],
    },
    {
      title: "Confidence Practice",
      vocabulary: [
        { en: "achieve", pt: "alcançar" },
        { en: "goal", pt: "objetivo" },
        { en: "progress", pt: "progresso" },
        { en: "proud", pt: "orgulhoso" },
      ],
      phrases: [
        { en: "I'm proud of my progress.", pt: "Estou orgulhoso(a) do meu progresso." },
        { en: "I can do this!", pt: "Eu consigo fazer isso!" },
      ],
    },
  ];

  await seedLessons(englishMadeSimple.id, emsLessons);

  console.log("Seed: curso English for Construction Workers...");
  const construction = await prisma.course.upsert({
    where: { slug: "english-for-construction-workers" },
    create: {
      slug: "english-for-construction-workers",
      title: "English for Construction Workers (EUA)",
      description:
        "Inglês prático para quem trabalha na construção civil nos Estados Unidos: vocabulário, segurança e comunicação no canteiro de obras.",
      level: "Iniciante",
      productKey: "COURSE_CONSTRUCTION",
      published: true,
      order: 2,
    },
    update: {},
  });

  const constructionLessons: LessonSeed[] = [
    {
      title: "Basics on the job",
      vocabulary: [
        { en: "job site", pt: "canteiro de obras" },
        { en: "shift", pt: "turno" },
        { en: "overtime", pt: "hora extra" },
      ],
      phrases: [
        { en: "Where do I start?", pt: "Por onde eu começo?" },
        { en: "What's next?", pt: "Qual é o próximo passo?" },
      ],
    },
    {
      title: "Tools",
      vocabulary: [
        { en: "hammer", pt: "martelo" },
        { en: "drill", pt: "furadeira" },
        { en: "ladder", pt: "escada" },
        { en: "tape measure", pt: "trena" },
        { en: "level", pt: "nível" },
      ],
      phrases: [{ en: "Can you pass me the hammer?", pt: "Você pode me passar o martelo?" }],
    },
    {
      title: "Safety",
      vocabulary: [
        { en: "helmet", pt: "capacete" },
        { en: "gloves", pt: "luvas" },
        { en: "safety vest", pt: "colete de segurança" },
        { en: "hazard", pt: "risco" },
      ],
      phrases: [{ en: "Be careful!", pt: "Tenha cuidado!" }],
    },
    {
      title: "Actions on site",
      vocabulary: [
        { en: "build", pt: "construir" },
        { en: "carry", pt: "carregar" },
        { en: "measure", pt: "medir" },
        { en: "install", pt: "instalar" },
      ],
      phrases: [{ en: "I finished the job.", pt: "Eu terminei o trabalho." }],
    },
    {
      title: "Communication with boss",
      vocabulary: [
        { en: "job site", pt: "canteiro de obras" },
        { en: "shift", pt: "turno" },
        { en: "overtime", pt: "hora extra" },
      ],
      phrases: [{ en: "Can you show me again?", pt: "Você pode me mostrar de novo?" }],
    },
    {
      title: "Problem situations",
      vocabulary: [
        { en: "hazard", pt: "risco" },
        { en: "helmet", pt: "capacete" },
        { en: "install", pt: "instalar" },
      ],
      phrases: [
        { en: "What's next?", pt: "Qual é o próximo passo?" },
        { en: "I finished the job.", pt: "Eu terminei o trabalho." },
      ],
    },
  ];

  await seedLessons(construction.id, constructionLessons);

  console.log("Seed: rascunhos (não publicados)...");
  await prisma.course.upsert({
    where: { slug: "english-for-house-cleaning" },
    create: {
      slug: "english-for-house-cleaning",
      title: "English for House Cleaning",
      description: "Vocabulário e frases para quem trabalha com limpeza residencial nos EUA.",
      level: "Iniciante",
      published: false,
      order: 3,
    },
    update: {},
  });

  await prisma.course.upsert({
    where: { slug: "english-for-babysitter" },
    create: {
      slug: "english-for-babysitter",
      title: "English for Babysitter",
      description: "Inglês prático para quem cuida de crianças nos Estados Unidos.",
      level: "Iniciante",
      published: false,
      order: 4,
    },
    update: {},
  });

  console.log("Seed de conteúdo concluído.");
}

interface LessonSeed {
  title: string;
  vocabulary: { en: string; pt: string }[];
  phrases: { en: string; pt: string }[];
}

async function seedLessons(courseId: string, lessons: LessonSeed[]) {
  for (let i = 0; i < lessons.length; i += 1) {
    const lessonData = lessons[i]!;
    const order = i + 1;
    const slug = slugify(lessonData.title);

    const lesson = await prisma.lesson.upsert({
      where: { courseId_slug: { courseId, slug } },
      create: {
        courseId,
        slug,
        title: lessonData.title,
        order,
        isFreePreview: order === 1,
      },
      update: { title: lessonData.title, order, isFreePreview: order === 1 },
    });

    const existingVocab = await prisma.vocabularyItem.count({ where: { lessonId: lesson.id } });
    if (existingVocab === 0) {
      await prisma.vocabularyItem.createMany({
        data: lessonData.vocabulary.map((v, idx) => ({ ...v, lessonId: lesson.id, order: idx })),
      });
    }

    const existingPhrases = await prisma.phrase.count({ where: { lessonId: lesson.id } });
    if (existingPhrases === 0) {
      await prisma.phrase.createMany({
        data: lessonData.phrases.map((p, idx) => ({ ...p, lessonId: lesson.id, order: idx })),
      });
    }

    const existingExercises = await prisma.exercise.count({ where: { lessonId: lesson.id } });
    if (existingExercises === 0 && lessonData.vocabulary.length > 0 && lessonData.phrases.length > 0) {
      const vocabSample = lessonData.vocabulary[0]!;
      const phraseSample = lessonData.phrases[0]!;
      await prisma.exercise.createMany({
        data: [
          {
            lessonId: lesson.id,
            type: "TRANSLATE",
            prompt: `Traduza para o português: "${vocabSample.en}"`,
            answer: vocabSample.pt,
            order: 0,
          },
          {
            lessonId: lesson.id,
            type: "FILL",
            prompt: `Complete em inglês: "${phraseSample.pt}"`,
            answer: phraseSample.en,
            order: 1,
          },
          {
            lessonId: lesson.id,
            type: "SPEAK",
            prompt: `Grave-se falando em voz alta: "${phraseSample.en}"`,
            order: 2,
          },
        ],
      });
    }
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
