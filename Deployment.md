
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



## 5. Backend, Authentication, and Database Setup

### If you do NOT need a custom backend (recommended for most apps):
Firebase provides built-in Authentication and Database services you can use directly from your frontend code. You do NOT need Express or Cloud Functions unless you have custom backend logic.

#### 1. Set up Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com/) for your project.
2. In the left menu, click **Authentication** > **Get started**.
3. Enable the sign-in providers you want (e.g., Email/Password, Google, etc.).
4. In your frontend code, use the Firebase Auth SDK to sign up, sign in, and manage users. For this project, authentication logic is implemented in:
   - `src/auth.ts` (handles authentication logic and helpers, including initializing Firebase Auth and providing helper functions for login, logout, and user state)
   - `src/components/Login.tsx` (user login form and UI, calls the login helper from `src/auth.ts`)

   Example from `src/auth.ts`:
   ```ts
   // src/auth.ts
   import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
   const auth = getAuth();
   export function login(email: string, password: string) {
     return signInWithEmailAndPassword(auth, email, password);
   }
   ```

   Example usage in `src/components/Login.tsx`:
   ```tsx
   // src/components/Login.tsx
   import { login } from '../auth';
   // ... inside your form submit handler:
   login(email, password)
     .then(user => { /* handle success */ })
     .catch(error => { /* handle error */ });
   ```

#### 2. Set up Firestore or Realtime Database
1. In the Firebase Console, click **Firestore Database** or **Realtime Database** in the left menu.
2. Click **Create database** and follow the prompts (start in test mode for development, but set secure rules before going live).
3. Use the Firebase SDK in your frontend to read/write data. In this project, Firestore logic is implemented in:
   - `src/company.ts` (CRUD and queries for company data)
   - `src/staff.ts` (CRUD and queries for staff data)
   - `src/payments.ts` (CRUD and queries for payments data)
   - `src/deductions.ts` (CRUD and queries for deductions data)
   - `src/payroll.ts` (CRUD and queries for payroll data)

   Example from `src/staff.ts`:
   ```ts
   // src/staff.ts
   import { getFirestore, collection, addDoc } from 'firebase/firestore';
   const db = getFirestore();
   export async function addStaffMember(staffData) {
     return await addDoc(collection(db, 'staff'), staffData);
   }
   ```

   Example usage in `src/components/StaffForm.tsx`:
   ```tsx
   // src/components/StaffForm.tsx
   import { addStaffMember } from '../staff';
   // ... inside your form submit handler:
   addStaffMember({ name: 'John Doe', ... })
     .then(docRef => { /* handle success */ })
     .catch(error => { /* handle error */ });
   ```

#### 3. Environment Variables
1. Create a `.env` file in your project root (do NOT commit secrets to version control).
2. Add your Firebase config (from Project Settings > General > Your apps > SDK setup and config):
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```
3. In your code, load these variables using `import.meta.env` (Vite) or `process.env` (Webpack/Node). For this project, see how environment variables are loaded in `src/auth.ts` and `src/index.tsx`.

#### 4. Deploy as usual
You do NOT need to set up or deploy Cloud Functions unless you have custom backend logic. Just use:
```sh
firebase deploy --only hosting
```

---

### If you DO need a custom backend (advanced/optional):
If you want to add custom API endpoints or server logic, you can use Express with Firebase Cloud Functions:

1. **Set up the functions directory:**
   - Run `firebase init` and select **Functions**. Choose TypeScript and use the default `functions` directory.
2. **Move your Express server code:**
   - Copy your Express app code (for example, from `src/server.ts`) into `functions/server.ts`.
   - Make sure all dependencies used by your server (like `express`, `cors`, etc.) are listed in `functions/package.json`. Install any missing ones by running `npm install <package>` inside the `functions` directory.
3. **Create or update `functions/index.ts`:**
   - Export your Express app as a Cloud Function. Example:
     ```ts
     import * as functions from 'firebase-functions';
     import app from './server';
     export const api = functions.https.onRequest(app);
     ```
4. **Install dependencies and build functions:**
   - In the `functions` directory, run:
     ```sh
     npm install
     npm run build
     ```
5. **Deploy your backend functions:**
   - From your project root, run:
     ```sh
     firebase deploy --only functions
     ```
6. **Test your API:**
   - After deployment, your API will be available at:
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
