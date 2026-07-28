# Blog Poussettes

Blog d'affiliation Amazon sur les poussettes, avec publication automatique
quotidienne d'un article de ~2500 mots (comparatif / guide complet / article
thématique, en rotation) généré par l'API Claude.

## Structure

```text
/
├── public/                  # fichiers statiques (robots.txt, etc.)
├── src/
│   ├── content/articles/    # articles générés (Markdown + frontmatter)
│   ├── content.config.ts    # schéma des articles (content collections)
│   ├── components/          # AffiliateButton, ComparisonTable, ProductCard, FAQ
│   ├── layouts/              # BaseLayout (SEO), ArticleLayout (JSON-LD)
│   └── pages/                # accueil + page article dynamique
├── scripts/
│   ├── generate-article.mjs # appelle l'API Claude et écrit l'article du jour
│   ├── topics.mjs            # banque de sujets + rotation/anti-répétition
│   ├── affiliate.mjs         # construction des liens Amazon (avec/sans tag)
│   ├── publish.sh            # génère + commit + push (déclenche le déploiement)
│   ├── data/state.json       # état de rotation des sujets (généré automatiquement)
│   └── com.blogpoussettes.dailypublish.plist  # tâche planifiée macOS (launchd)
```

## Mise en route

1. `npm install`
2. Copier `.env.example` en `.env` et renseigner `ANTHROPIC_API_KEY`
   (`AMAZON_AFFILIATE_TAG` peut rester vide en attendant l'approbation Amazon Associates)
3. `npm run dev` pour prévisualiser le site en local
4. `node scripts/generate-article.mjs` pour générer un article manuellement
5. `npm run build` pour vérifier que le site compile

## Publication automatique

`scripts/publish.sh` génère un article puis fait un `git commit` + `git push`,
ce qui déclenche le redéploiement automatique sur Vercel/Netlify.

Le fichier `scripts/com.blogpoussettes.dailypublish.plist` planifie ce script
tous les jours à 8h via `launchd`. Il n'est **pas activé automatiquement** —
voir les instructions fournies séparément pour l'installer.

## Amazon Associates

Tant que `AMAZON_AFFILIATE_TAG` n'est pas renseigné, les liens produits
pointent vers des recherches Amazon classiques (sans commission). Une fois le
tag ajouté dans `.env`, les prochains articles (et les précédents, dès le
prochain build) utiliseront automatiquement le vrai lien d'affiliation.
