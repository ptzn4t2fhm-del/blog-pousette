// Banque de photos de couverture (poussettes, bébés, familles) issues d'Unsplash,
// vérifiées manuellement (téléchargement + inspection visuelle) pour éviter les
// images cassées, hors sujet ou avec un logo de marque visible. Voir
// scripts/pet-images.mjs pour le même principe appliqué au blog animaux.
//
// Les tags sont volontairement précis (pas de tag générique du type "poussette"
// présent partout) : ça évite qu'un sujet très spécifique (ex: "sièges auto")
// hérite d'une photo qui n'a aucun rapport juste parce qu'elle contient le mot
// "poussette". Quand aucun tag ne correspond, pickCoverImage retombe sur tout
// le pool au hasard plutôt que de forcer un mauvais match.
export const STROLLER_IMAGES = [
  { id: '1733380005522-b8d76ce49d13', tags: ['ville', 'urbaine', 'campagne', 'parc', 'promenade'] },
  { id: '1691420762495-2f1c61d70ec6', tags: ['compacte', 'légère', 'pliage', 'rangement', 'petits espaces'] },
  { id: '1694801463029-f89884a6f088', tags: ['papa', 'grands-parents', 'morphologie'] },
  { id: '1636384919179-d936e55c5cca', tags: ['nouveau-né', 'naissance', 'confort', 'nacelle'] },
  { id: '1741990811736-81fd08f449e5', tags: ['deuxième enfant', 'transports en commun'] },
  { id: '1714392512700-4cab9e51710b', tags: ['voyage', 'avion', 'vacances', 'écologie', 'durable'] },
  { id: '1537376248011-d31fb998ae8f', tags: ['jumeaux', 'multiples'] },
  { id: '1633635183107-45c87949dc01', tags: ['jumeaux', 'quatre saisons'] },
  { id: '1548289129-7445e236428d', tags: ['jogging', 'course à pied', 'running', 'sport', 'randonnée', 'vélo'] },
  { id: '1522771930-78848d9293e8', tags: ['habituer', 'confort de bébé'] },
  { id: '1543342384-1f1350e27861', tags: ['première poussette', 'naissance'] },
  { id: '1476703993599-0035a21b17a9', tags: ['plusieurs enfants', 'fratrie', 'âges différents'] },
  { id: '1673555344158-ed7f1abfc47e', tags: ['sécurité routière', 'traverser'] },
  { id: '1665578325705-cfe6de3ae2eb', tags: ['siège auto', 'sièges auto', 'cosy', 'travel system'] },
  { id: '1607180122862-1d0d773deb97', tags: ['pluie', 'habillage', 'météo'] },
];

function buildUrl(id, width = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

/**
 * Choisit une image en fonction du sujet de l'article. On préfère les images
 * dont le plus grand nombre de tags apparaît dans le sujet (les correspondances
 * les plus spécifiques l'emportent) ; en cas d'égalité, on tire au sort parmi
 * les meilleures candidates. Si rien ne correspond, on tire au sort dans tout
 * le pool plutôt que d'imposer une image sans rapport.
 */
export function pickCoverImage(topic, width = 1200) {
  const lowerTopic = topic.toLowerCase();

  let bestScore = 0;
  let bestCandidates = [];

  for (const img of STROLLER_IMAGES) {
    const score = img.tags.filter((tag) => lowerTopic.includes(tag)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCandidates = [img];
    } else if (score === bestScore && score > 0) {
      bestCandidates.push(img);
    }
  }

  const pool = bestCandidates.length > 0 ? bestCandidates : STROLLER_IMAGES;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return buildUrl(chosen.id, width);
}
