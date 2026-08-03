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
  { id: '1537376248011-d31fb998ae8f', tags: ['jumeaux', 'multiples', 'plusieurs enfants', 'fratrie', 'âges différents'] },
  { id: '1633635183107-45c87949dc01', tags: ['jumeaux', 'quatre saisons'] },
  { id: '1548289129-7445e236428d', tags: ['jogging', 'course à pied', 'running', 'sport', 'randonnée', 'vélo'] },
  { id: '1522771930-78848d9293e8', tags: ['habituer', 'confort de bébé'] },
  { id: '1543342384-1f1350e27861', tags: ['première poussette', 'naissance'] },
  { id: '1667835327820-787abdd7e914', tags: ['sécurité routière', 'traverser'] },
  { id: '1665578325705-cfe6de3ae2eb', tags: ['siège auto', 'sièges auto', 'cosy', 'travel system'] },
  { id: '1607180122862-1d0d773deb97', tags: ['pluie', 'habillage', 'météo'] },
  { id: '1773672268537-21e349bc7273', tags: ['freins', 'freinage', 'roues', 'systèmes de freinage'] },
];

function buildUrl(id, width = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Un tag ne compte comme "présent" que s'il apparaît comme mot / expression
// entière dans le sujet, pas comme simple sous-chaîne (voir le même correctif
// dans pet-images.mjs). On autorise un "s" final optionnel pour matcher les
// pluriels français sans réintroduire de faux positifs de sous-chaîne.
function topicIncludesTag(lowerTopic, tag) {
  const pattern = new RegExp(`(?<![\\p{L}])${escapeRegex(tag.toLowerCase())}s?(?![\\p{L}])`, 'u');
  return pattern.test(lowerTopic);
}

/**
 * Choisit une image en fonction du sujet de l'article. On préfère les images
 * dont le plus grand nombre de tags apparaît dans le sujet (les correspondances
 * les plus spécifiques l'emportent) ; en cas d'égalité, on tire au sort parmi
 * les meilleures candidates, en excluant si possible les images déjà utilisées
 * par un autre article publié (voir `usedIds`) pour éviter les doublons visuels
 * sur le site. Si rien ne correspond, on tire au sort dans tout le pool plutôt
 * que d'imposer une image sans rapport.
 */
export function pickCoverImage(topic, width = 1200, usedIds = []) {
  const lowerTopic = topic.toLowerCase();
  const usedSet = new Set(usedIds);

  let bestScore = 0;
  let bestCandidates = [];

  for (const img of STROLLER_IMAGES) {
    const score = img.tags.filter((tag) => topicIncludesTag(lowerTopic, tag)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCandidates = [img];
    } else if (score === bestScore && score > 0) {
      bestCandidates.push(img);
    }
  }

  const pool = bestCandidates.length > 0 ? bestCandidates : STROLLER_IMAGES;
  const unused = pool.filter((img) => !usedSet.has(img.id));
  const finalPool = unused.length > 0 ? unused : pool;
  const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];
  return buildUrl(chosen.id, width);
}
