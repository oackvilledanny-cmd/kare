# Deploying K-Daycare OS to Google Cloud Run

Since you don't have the Google Cloud SDK (`gcloud`) installed locally, the easiest way to deploy is using **Google Cloud Shell** or **Cloud Build**.

## Option 1: Using Cloud Shell (Recommended)

1.  **Open Google Cloud Console**: Go to [https://console.cloud.google.com/](https://console.cloud.google.com/).
2.  **Open Cloud Shell**: Click the terminal icon in the top right corner.
3.  **Upload Project**:
    *   Click the "three dots" menu in the Cloud Shell toolbar -> "Upload".
    *   Select your project folder (zip it first if needed) or clone your repository if you pushed it to GitHub.
4.  **Deploy**:
    Run the following command in Cloud Shell (replace `[PROJECT_ID]` with your actual project ID):

    ```bash
    gcloud run deploy k-daycare-os \
      --source . \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --project [PROJECT_ID]
    ```

5.  **Confirm**: Type `y` when prompted to build and deploy.

## Option 2: Using Cloud Build (If code is on GitHub)

1.  Push your code to a GitHub repository.
2.  Go to **Cloud Build** -> **Triggers** in GCP Console.
3.  Create a new trigger connected to your repository.
4.  Set the Configuration to **Dockerfile**.
5.  Click **Run Trigger**.
6.  Once the image is built, go to **Cloud Run**, creating a service using the image from Container Registry.

## Important: Environment Variables

Since this app uses Firebase and Gemini AI, you must ensure your API keys are set.

For Cloud Run, you can set environment variables during deployment:

```bash
gcloud run deploy k-daycare-os \
  --source . \
  --set-env-vars VITE_GEMINI_API_KEY=[YOUR_API_KEY] \
  ...
```

Or add them in the Cloud Run Console under "Edit & Deploy New Revision" -> "Variables".
