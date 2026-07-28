import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import yaml from 'js-yaml';

import { getNextTopic } from './topics.mjs';
import { buildAffiliateSearchUrl } from './affiliate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');

const CATEGORY_INSTRUCTIONS = {
  comparatif: `Ceci est un GUIDE COMPARATIF. Compare 3 à 5 produits (poussettes) concrets et
réalistes (marques reconnues : Bugaboo, Babyzen Yoyo, Chicco, Joie, Cybex, Thule, UPPAbaby,
Bébé Confort, Hauck, etc.). Pour chaque produit : nom précis (marque + modèle), une note sur 5,
3 avantages et 2-3 inconvénients concrets. Structure l'article avec une intro, une section par
critère de comparaison (prix, poids, sécurité, confort, praticité), un classement final
(ex: "meilleure globale", "meilleur rapport qualité-prix", "meilleure pour voyager").`,
  guide: `Ceci est un GUIDE COMPLET (evergreen). Couvre le sujet en profondeur avec des sections
H2/H3 claires, des conseils pratiques et actionnables. Tu peux mentionner 1 à 3 produits
concrets et réalistes à titre d'exemple ou de recommandation, avec nom précis, note sur 5,
avantages et inconvénients, mais ce n'est pas obligatoire si le sujet ne s'y prête pas.`,
  article: `Ceci est un ARTICLE THÉMATIQUE de type magazine (conseils, style de vie, réflexion).
Ton informatif et chaleureux. Tu peux mentionner 0 à 2 produits concrets pertinents avec nom
précis, note sur 5, avantages et inconvénients, uniquement si cela apporte une réelle valeur.`,
};

const GeneratedArticleSchema = z.object({
  title: z
    .string()
    .describe('Titre SEO accrocheur, 50-65 caractères, en français, sans guillemets.'),
  metaDescription: z
    .string()
    .describe('Meta description SEO, 140-160 caractères, incitant au clic.'),
  slug: z
    .string()
    .describe('Slug URL en kebab-case, en minuscules, sans accents ni caractères spéciaux.'),
  keywords: z
    .array(z.string())
    .describe('5 à 8 mots-clés SEO pertinents pour cet article, en français.'),
  bodyMarkdown: z
    .string()
    .describe(
      "Corps de l'article au format Markdown, environ 2500 mots. NE PAS inclure de titre H1 " +
        '(le titre est déjà affiché séparément) : commencer directement par un paragraphe ' +
        "d'introduction puis structurer avec des sous-titres ## et ###.",
    ),
  products: z
    .array(
      z.object({
        name: z.string().describe('Nom précis du produit : marque + modèle.'),
        rating: z.number().min(0).max(5),
        pros: z.array(z.string()).min(2).max(4),
        cons: z.array(z.string()).min(1).max(3),
      }),
    )
    .describe('Produits recommandés dans cet article (peut être vide selon la catégorie).'),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .min(4)
    .max(6)
    .describe('4 à 6 questions fréquentes avec réponses concises, pour le SEO (FAQ).'),
});

function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateArticle() {
  const { category, topic } = await getNextTopic();
  console.log(`Catégorie: ${category} | Sujet: ${topic}`);

  const client = new Anthropic();

  const systemPrompt = `Tu es un rédacteur web expert en SEO et spécialiste de la puériculture,
en particulier des poussettes. Tu écris en français, pour un blog d'affiliation Amazon
français destiné aux parents. Ton contenu est concret, précis, utile, sans blabla superflu,
et optimisé pour le référencement naturel (structure claire, mots-clés naturellement intégrés,
réponses directes aux questions que se posent les parents). Tu ne mentionnes jamais de prix
exacts (ils changent trop souvent) ; parle plutôt de gammes de prix (entrée de gamme, milieu de
gamme, premium). Tu ne dois jamais inventer de caractéristiques techniques absurdes ou
dangereuses.`;

  const userPrompt = `Rédige un article de blog d'environ 2500 mots sur le sujet suivant :
"${topic}"

${CATEGORY_INSTRUCTIONS[category]}

L'article doit être parfaitement optimisé pour le référencement naturel (SEO) : structure avec
des sous-titres H2/H3, réponses claires aux intentions de recherche, mots-clés pertinents
intégrés naturellement, et une FAQ finale.`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'high',
      format: zodOutputFormat(GeneratedArticleSchema),
    },
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  stream.on('text', (delta) => process.stdout.write(delta));

  const finalMessage = await stream.finalMessage();
  const textBlock = finalMessage.content.find((block) => block.type === 'text');
  if (!textBlock) {
    throw new Error("Aucun contenu texte reçu depuis l'API Claude.");
  }

  const parsedJson = JSON.parse(textBlock.text);
  const article = GeneratedArticleSchema.parse(parsedJson);

  const products = article.products.map((product) => ({
    name: product.name,
    affiliateUrl: buildAffiliateSearchUrl(product.name),
    rating: product.rating,
    pros: product.pros,
    cons: product.cons,
  }));

  const pubDate = new Date();
  const dateStr = pubDate.toISOString().slice(0, 10);
  const fileSlug = `${dateStr}-${slugify(article.slug || article.title)}`;

  const frontmatter = yaml.dump({
    title: article.title,
    description: article.metaDescription,
    pubDate: pubDate.toISOString(),
    category,
    keywords: article.keywords,
    products,
    faq: article.faq,
  });

  const fileContent = `---\n${frontmatter}---\n\n${article.bodyMarkdown.trim()}\n`;

  await mkdir(ARTICLES_DIR, { recursive: true });
  const filePath = path.join(ARTICLES_DIR, `${fileSlug}.md`);
  await writeFile(filePath, fileContent, 'utf-8');

  console.log(`\n\nArticle généré : ${filePath}`);
  console.log(`Tokens utilisés — entrée: ${finalMessage.usage.input_tokens}, sortie: ${finalMessage.usage.output_tokens}`);

  return filePath;
}

generateArticle().catch((error) => {
  console.error('Erreur lors de la génération de l\'article :', error);
  process.exit(1);
});
