#!/usr/bin/env bash
set -euo pipefail

# Requires: gcloud auth login && gcloud auth application-default login
# Requires: npm access for frontend dependencies + firebase-tools via npx
PROJECT_ID=${PROJECT_ID:?set PROJECT_ID}
REGION=${REGION:-northamerica-northeast1}
SERVICE=${SERVICE:-tsx-scanner-api}
FIREBASE_PROJECT=${FIREBASE_PROJECT:?set FIREBASE_PROJECT}

./infra/cloudrun_deploy.sh

API_URL=$(gcloud run services describe ${SERVICE} --region ${REGION} --format='value(status.url)')

pushd frontend >/dev/null
npm install
NEXT_PUBLIC_API_BASE=${API_URL} npm run build
npx firebase-tools deploy --project ${FIREBASE_PROJECT} --only hosting
popd >/dev/null

echo "Deploy complete"
echo "Backend: ${API_URL}"
