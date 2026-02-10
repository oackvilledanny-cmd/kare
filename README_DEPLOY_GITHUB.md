# Deploying K-Daycare OS via GitHub Actions

This project is configured to automatically deploy to **Google Cloud Run** whenever you push updates to the `main` branch.

## Prerequisites

1.  **Google Cloud Platform Project**: You need an active GCP project.
2.  **GitHub Repository**: This code must be pushed to a GitHub repository.

## Setup Instructions

### 1. Enable APIs on Google Cloud
In your GCP Console, enable the following APIs:
*   **Cloud Run API**
*   **Container Registry API** (or Artifact Registry)
*   **Cloud Build API**

### 2. Create a Service Account
1.  Go to **IAM & Admin** > **Service Accounts**.
2.  Create a new Service Account (e.g., `github-deployer`).
3.  Grant it the following roles:
    *   **Cloud Run Admin**
    *   **Storage Admin** (for Container Registry)
    *   **Service Account User**
4.  Click on the created service account > **Keys** tab > **Add Key** > **Create new key** > **JSON**.
5.  Save the JSON file; you will need its content shortly.

### 3. Configure GitHub Secrets
Go to your **GitHub Repository** > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.

Add the following secrets:

| Name | Value |
| :--- | :--- |
| `GCP_PROJECT_ID` | `daycaremgt` (This is the "project_id" from your JSON) |
| `GCP_SA_KEY` | Paste the **entire JSON content** you just shared (starting with `{` and ending with `}`) |
| `VITE_GEMINI_API_KEY` | Your Gemini API Key (starts with `AIza...`) |

### 4. Trigger Deployment
Simply push your changes to the `main` branch:

```bash
git add .
git commit -m "Configure GitHub Actions deployment"
git push origin main
```

Go to the **Actions** tab in your GitHub repository to watch the deployment progress. Once finished, it will output the URL of your live application.
