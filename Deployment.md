
# Firebase Deployment Guide for Cheetah Payroll

Follow these step-by-step instructions to deploy your Cheetah Payroll app (React SPA and optional Node/Express API) to Firebase Hosting and Cloud Functions.

---

## 1. Install Prerequisites
1. Make sure you have Node.js and npm installed.
2. Install the Firebase CLI globally:
   - Open your terminal.
   - Run this command:
     ```sh
     npm install -g firebase-tools
     ```
   - Wait for the installation to finish before continuing.
3. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
4. Build your app for production:
   - In your terminal, run:
     ```sh
     npm run build
     # or
     npx webpack --config webpack.config.js --mode production
     ```
   - Wait for the build to finish. You should see a message indicating success (such as "Compiled successfully" or "Build complete").
   - If you see an error message, read it carefully and fix any issues before continuing.

---

## 2. Initialize Firebase in Your Project
1. Open a terminal in your project root.
2. Log in to Firebase:
   ```sh
   firebase login
   ```
3. Initialize Firebase:
   ```sh
   firebase init
   ```
4. When prompted, select:
   - **Hosting** (for the React frontend)
   - **Functions** (for the backend, if you have an Express API)
   - (Optional) **Firestore** and **Authentication** if your app uses them
5. For Hosting:
   - Set `dist` as the public directory
   - Choose **Yes** for single-page app configuration
   - If asked, do **not** overwrite `index.html`
6. For Functions:
   - Choose TypeScript
   - Use the default `functions` directory

---

## 3. Prepare Your Build Output
1. Make sure your production build output is in the `dist` folder (Webpack output).
2. The `dist` folder should contain `index.html`, JavaScript bundles, and all assets.

---

## 4. Deploy the Frontend (React SPA)
1. Deploy your frontend to Firebase Hosting:
   ```sh
   firebase deploy --only hosting
   ```
2. After deployment, copy the Hosting URL provided by Firebase to access your app.

---

## 5. Deploy the Backend (Optional: Express API as Cloud Function)
1. Move your Express server code into the `functions` directory created by Firebase.
2. In `functions/index.ts`, wrap your Express app like this:
   ```ts
   import * as functions from 'firebase-functions';
   import app from './server'; // Adjust the import if needed
   export const api = functions.https.onRequest(app);
   ```
3. Deploy your backend functions:
   ```sh
   firebase deploy --only functions
   ```
4. Your API will be available at:
   `https://<your-project-id>.cloudfunctions.net/api`

---

## 6. Set Environment Variables (If Needed)
1. To set environment variables for Cloud Functions, run:
   ```sh
   firebase functions:config:set key=value
   ```
2. Access these variables in your code using `functions.config()`.

---

## 7. (Optional) Set Up a Custom Domain
1. In the Firebase Console, go to Hosting.
2. Add your custom domain and follow the verification steps.

---

## 8. Useful Firebase Commands
- `firebase serve` — Preview your app locally
- `firebase deploy` — Deploy both frontend and backend
- `firebase deploy --only hosting` — Deploy frontend only
- `firebase deploy --only functions` — Deploy backend only

---

## 9. References
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**You’re done! Your Cheetah Payroll app is now live on Firebase.**
