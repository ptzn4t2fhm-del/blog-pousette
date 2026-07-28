import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

// Rotation quotidienne : comparatif -> guide -> article -> comparatif -> ...
const CATEGORY_ROTATION = ['comparatif', 'guide', 'article'];

export const TOPIC_BANK = {
  comparatif: [
    'Poussette canne vs poussette 3 roues : laquelle choisir ?',
    'Meilleures poussettes légères en 2026',
    'Poussette combinée vs poussette + nacelle séparée',
    'Top poussettes pour jumeaux',
    'Poussette tout-terrain vs poussette urbaine',
    'Meilleures poussettes compactes pour petits espaces',
    'Poussette réversible vs poussette face à la route uniquement',
    'Comparatif poussettes haut de gamme (premium)',
    'Meilleures poussettes pas chères pour petit budget',
    'Poussette 3 en 1 vs poussette 2 en 1',
    'Meilleures poussettes pour voyager en avion',
    'Comparatif sièges auto compatibles avec poussettes',
    'Poussette parapluie vs poussette classique',
    'Meilleures poussettes pour la course à pied (jogging)',
    'Comparatif poussettes évolutives, de la naissance à 3-4 ans',
    'Meilleures marques de poussettes en 2026',
    'Poussette électrique vs poussette manuelle',
    'Meilleures poussettes tout-en-un avec accessoires inclus',
    'Comparatif poussettes pour nouveau-nés',
    'Poussette d\'occasion vs neuve : que choisir ?',
  ],
  guide: [
    'Guide complet pour choisir sa première poussette',
    'Comment bien régler la poussette de son bébé',
    'Guide d\'entretien et de nettoyage d\'une poussette',
    'Tout savoir sur les normes de sécurité des poussettes',
    'Guide complet des accessoires indispensables pour poussette',
    'Comment choisir la poussette adaptée à sa morphologie de parent',
    'Guide d\'achat : poussette pour la ville vs poussette pour la campagne',
    'Tout savoir sur les nacelles et leur compatibilité avec la poussette',
    'Guide complet sur le pliage et le rangement des poussettes',
    'Comment transporter sa poussette en voiture facilement',
    'Guide complet des poussettes pour jumeaux et multiples',
    'Tout savoir sur le poids et l\'encombrement des poussettes',
    'Guide d\'achat : quand passer d\'une nacelle à une poussette assise',
    'Comment choisir une poussette pour un budget serré',
    'Guide complet sur les habillages pluie et hiver pour poussette',
    'Tout savoir sur la garantie et le SAV des poussettes',
    'Guide d\'achat : poussette pour plusieurs enfants d\'âges différents',
    'Comment adapter sa poussette aux quatre saisons',
    'Guide complet des systèmes de freinage et de sécurité',
    'Tout savoir sur l\'achat d\'une poussette de seconde main en toute sécurité',
  ],
  article: [
    'Poussette et transports en commun : nos astuces',
    'Les erreurs à éviter lors de l\'achat d\'une poussette',
    'Poussette et voyage : comment bien s\'organiser',
    'À quel âge arrêter la poussette ?',
    'Poussette et running : peut-on courir avec bébé ?',
    'Comment habituer bébé à la poussette',
    'Poussette et sécurité routière : ce qu\'il faut savoir',
    'Les tendances poussettes de 2026',
    'Poussette et écologie : quelles options durables ?',
    'Poussette et confort de bébé : ce qui compte vraiment',
    'Combien coûte réellement une poussette sur toute sa durée de vie ?',
    'Poussette et deuxième enfant : faut-il en racheter une ?',
    'Les accessoires poussette qui changent vraiment la vie des parents',
    'Poussette et enfants qui grandissent vite : comment anticiper',
    'Poussette en appartement sans ascenseur : nos solutions',
    'Poussette et grands-parents : bien choisir un modèle secondaire',
    'Poussette et sport en famille : randonnée, vélo, etc.',
    'Les idées reçues sur les poussettes',
    'Poussette et style de vie urbain vs rural',
    'Comment revendre sa poussette au meilleur prix',
  ],
};

async function loadState() {
  if (!existsSync(STATE_FILE)) {
    return { dayCount: 0, usedTopics: { comparatif: [], guide: [], article: [] } };
  }
  const raw = await readFile(STATE_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function saveState(state) {
  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * Retourne le prochain sujet à traiter en suivant la rotation
 * comparatif -> guide -> article, en évitant les sujets déjà utilisés
 * tant qu'il en reste de disponibles dans la banque.
 */
export async function getNextTopic() {
  const state = await loadState();
  const category = CATEGORY_ROTATION[state.dayCount % CATEGORY_ROTATION.length];

  const allTopics = TOPIC_BANK[category];
  const used = state.usedTopics[category] ?? [];
  let available = allTopics.filter((t) => !used.includes(t));

  // Toute la banque a été utilisée : on recommence un nouveau cycle.
  if (available.length === 0) {
    state.usedTopics[category] = [];
    available = allTopics;
  }

  const topic = available[Math.floor(Math.random() * available.length)];

  state.usedTopics[category] = [...(state.usedTopics[category] ?? []), topic];
  state.dayCount += 1;
  await saveState(state);

  return { category, topic };
}
