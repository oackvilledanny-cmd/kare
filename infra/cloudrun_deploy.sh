#!/usr/bin/env bash
set -euo pipefail
PROJECT_ID=${PROJECT_ID:?set PROJECT_ID}
REGION=${REGION:-northamerica-northeast1}
SERVICE=${SERVICE:-tsx-scanner-api}

gcloud builds submit backend --tag gcr.io/${PROJECT_ID}/${SERVICE}
gcloud run deploy ${SERVICE} \
  --image gcr.io/${PROJECT_ID}/${SERVICE} \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars APP_ENV=prod

echo "Cloud Run deployed"
