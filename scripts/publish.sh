#!/bin/bash
# Génère l'article du jour puis le publie sur GitHub (déclenche le déploiement
# automatique Vercel/Netlify). Appelé par launchd tous les jours.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

LOG_DIR="$PROJECT_DIR/scripts/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d).log"

{
  echo "=== Publication du $(date) ==="

  node scripts/generate-article.mjs

  git add src/content/articles scripts/data/state.json
  if git diff --cached --quiet; then
    echo "Rien à publier (aucun changement détecté)."
    exit 0
  fi

  ARTICLE_FILE="$(git diff --cached --name-only -- src/content/articles | head -n 1)"
  git commit -m "Article du $(date +%Y-%m-%d) : $(basename "${ARTICLE_FILE:-article}" .md)"
  git push

  echo "Publication terminée avec succès."
} >> "$LOG_FILE" 2>&1
