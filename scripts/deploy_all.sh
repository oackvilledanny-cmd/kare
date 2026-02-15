#!/usr/bin/env bash
set -euo pipefail

# Requires: gcloud auth, firebase login
PROJECT_ID=${PROJECT_ID:?set PROJECT_ID}
REGION=${REGION:-northamerica-northeast1}
SERVICE=${SERVICE:-tsx-scanner-api}
FIREBASE_PROJECT=${FIREBASE_PROJECT:?set FIREBASE_PROJECT}

./infra/cloudrun_deploy.sh

API_URL=$(gcloud run services describe ${SERVICE} --region ${REGION} --format='value(status.url)')
cd frontend
npm install
NEXT_PUBLIC_API_BASE=${API_URL} npm run build
npx firebase-tools use ${FIREBASE_PROJECT}
npx firebase-tools deploy --only hosting
