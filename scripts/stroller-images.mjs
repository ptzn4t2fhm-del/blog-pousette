// Banque de photos de couverture (poussettes, bébés, familles) issues d'Unsplash,
// vérifiées manuellement (téléchargement + inspection visuelle) pour éviter les
// images cassées ou hors sujet. Voir scripts/pet-images.mjs pour le même principe
// appliqué au blog animaux.
export const STROLLER_IMAGES = [
  { id: '1733380005522-b8d76ce49d13', tags: ['poussette', 'ville', 'urbaine', 'parc'] },
  { id: '1691420762495-2f1c61d70ec6', tags: ['poussette', 'compacte', 'légère', 'pliage'] },
  { id: '1694801463029-f89884a6f088', tags: ['papa', 'grands-parents', 'poussette'] },
  { id: '1636384919179-d936e55c5cca', tags: ['nouveau-né', 'naissance', 'confort', 'nacelle'] },
  { id: '1741990811736-81fd08f449e5', tags: ['deuxième enfant', 'transports', 'promenade'] },
  { id: '1714392512700-4cab9e51710b', tags: ['voyage', 'avion', 'vacances'] },
  { id: '1537376248011-d31fb998ae8f', tags: ['jumeaux', 'multiples'] },
  { id: '1633635183107-45c87949dc01', tags: ['jumeaux', 'hiver', 'saisons'] },
  { id: '1548289129-7445e236428d', tags: ['jogging', 'course', 'running', 'sport'] },
  { id: '1522771930-78848d9293e8', tags: ['bébé', 'hiver', 'habillage'] },
  { id: '1543342384-1f1350e27861', tags: ['naissance', 'première poussette'] },
  { id: '1476703993599-0035a21b17a9', tags: ['plusieurs enfants', 'fratrie', 'âges différents', 'budget'] },
];

function buildUrl(id, width = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export function pickCoverImage(topic, width = 1200) {
  const lowerTopic = topic.toLowerCase();
  const matches = STROLLER_IMAGES.filter((img) =>
    img.tags.some((tag) => lowerTopic.includes(tag)),
  );
  const pool = matches.length > 0 ? matches : STROLLER_IMAGES;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return buildUrl(chosen.id, width);
}
