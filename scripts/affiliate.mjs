// Amazon Associates : tant que le tag n'est pas encore obtenu (compte pas
// encore approuvé), on génère des liens Amazon classiques (sans tag) pour
// pouvoir publier du contenu dès maintenant. Une fois le compte approuvé,
// il suffit de renseigner AMAZON_AFFILIATE_TAG dans .env : tous les articles
// (nouveaux et anciens, au prochain build) utiliseront automatiquement le
// vrai lien d'affiliation, sans aucune modification de code.
const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG || '';

/**
 * Construit une URL de recherche Amazon pour un produit donné.
 * On utilise une recherche plutôt qu'un lien produit direct car l'IA ne
 * connaît pas d'ASIN réel garanti à jour : la recherche reste toujours valide.
 */
export function buildAffiliateSearchUrl(productName) {
  const url = new URL('https://www.amazon.fr/s');
  url.searchParams.set('k', productName);
  if (AMAZON_TAG) {
    url.searchParams.set('tag', AMAZON_TAG);
  }
  return url.toString();
}

export function hasAffiliateTag() {
  return Boolean(AMAZON_TAG);
}
