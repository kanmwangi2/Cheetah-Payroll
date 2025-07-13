# Firebase Deployment Guide for Cheetah Payroll

Complete deployment instructions for Cheetah Payroll React application with Firebase Hosting, Authentication, and Firestore database.

---

## Prerequisites

### Required Tools
1. **Node.js 18+** and npm installed
2. **Firebase CLI** installed globally:
   ```sh
   npm install -g firebase-tools
   ```
3. **Firebase Project** created at [Firebase Console](https://console.firebase.google.com/)

### Build Configuration
The application uses Webpack for production builds. Ensure your build setup includes:
- **Entry Point**: `src/index.tsx`
- **Output Directory**: `dist/`
- **Build Command**: `npm run build:frontend`

---

## 1. Project Initialization

### Firebase Setup
1. **Login to Firebase**:
   ```sh
   firebase login
   ```

2. **Initialize Firebase in your project**:
   ```sh
   firebase init
   ```

3. **Select Firebase features**:
   - ✅ **Hosting** (for React frontend)
   - ✅ **Firestore** (for database)
   - ✅ **Authentication** (for user management)

4. **Configure Hosting**:
   - Public directory: `dist`
   - Single-page app: **Yes**
   - Automatic builds and deploys: **No** (manual deployment)

### Project Structure
```
cheetah-payroll/
├── dist/              (Webpack build output)
├── src/              (React TypeScript source)
├── firebase.json     (Firebase configuration)
├── .firebaserc       (Firebase project settings)
└── package.json      (Build scripts and dependencies)
```

---

## 2. Environment Configuration

### Firebase Configuration File
Create `src/core/config/firebase.config.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

### Environment Variables
Create `.env` file in project root:
```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

**Security Note**: Never commit `.env` files to version control. Add `.env` to `.gitignore`.

---

## 3. Firebase Services Setup

### Authentication Configuration
1. **Enable Authentication providers** in Firebase Console:
   - Email/Password ✅
   - Google (optional)
   - Microsoft (optional)

2. **Set up authorized domains**:
   - Add your production domain
   - Add localhost for development

### Firestore Database Setup
1. **Create Firestore database** in production mode
2. **Configure security rules** (`firestore.rules`):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Company-scoped data access
       match /companies/{companyId}/{document=**} {
         allow read, write: if request.auth != null && 
           request.auth.uid in resource.data.authorizedUsers;
       }
       
       // User profiles
       match /users/{userId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == userId;
       }
     }
   }
   ```

### Data Structure
```
/companies/{companyId}/
├── staff/         (Staff records)
├── payments/      (Payment definitions)
├── deductions/    (Deduction records)
├── payrolls/      (Payroll records)
└── settings/      (Company configuration)

/users/{userId}    (User profiles and roles)
/globalSettings/   (Application-wide settings)
```

---

## 4. Build and Deployment

### Production Build
1. **Install dependencies**:
   ```sh
   npm install
   ```

2. **Build for production**:
   ```sh
   npm run build:frontend
   ```

3. **Verify build output**:
   - Check `dist/` directory contains:
     - `index.html`
     - JavaScript bundles
     - CSS files
     - Static assets

### Firebase Deployment
1. **Deploy to Firebase Hosting**:
   ```sh
   firebase deploy --only hosting
   ```

2. **Deploy Firestore rules**:
   ```sh
   firebase deploy --only firestore:rules
   ```

3. **Complete deployment**:
   ```sh
   firebase deploy
   ```

### Deployment Verification
- Access your application at the provided Firebase Hosting URL
- Test authentication flow
- Verify database connectivity
- Check all modules are accessible

---

## 5. Application Configuration

### Initial Setup
1. **Create first user** through the signup process
2. **Assign Primary Admin role** via Firebase Console
3. **Create first company** through Company Management
4. **Configure global settings**:
   - Application name: "Cheetah Payroll"
   - Theme settings
   - Tax configuration for Rwanda

### User Roles Setup
Configure users with appropriate roles:
- **Primary Admin**: System-wide access
- **App Admin**: Cross-company management
- **Company Admin**: Single company management
- **Payroll Approver**: Payroll approval workflow
- **Payroll Preparer**: Data entry and payroll creation

---

## 6. Performance Optimization

### Build Optimization
- **Code Splitting**: Automatic lazy loading of feature modules
- **Bundle Analysis**: Use webpack-bundle-analyzer for optimization
- **Compression**: Enable gzip compression in Firebase Hosting
- **Caching**: Configure appropriate cache headers

### Firebase Optimization
- **Firestore Indexes**: Create composite indexes for complex queries
- **Connection Pooling**: Reuse Firebase connections
- **Offline Support**: Enable Firestore offline persistence
- **Query Optimization**: Use pagination and field selection

---

## 7. Monitoring and Maintenance

### Firebase Console Monitoring
- **Authentication**: Monitor user signups and activity
- **Firestore**: Track read/write operations and costs
- **Hosting**: Monitor traffic and performance
- **Performance**: Use Firebase Performance Monitoring

### Application Monitoring
- **Error Tracking**: Implement error boundary components
- **Performance Metrics**: Monitor React component performance
- **User Analytics**: Track feature usage and user flows

### Backup Strategy
- **Firestore Backup**: Set up automated daily backups
- **Code Repository**: Maintain version control with Git
- **Environment Configuration**: Document all environment variables

---

## 8. Security Best Practices

### Authentication Security
- **Password Policy**: Enforce strong passwords
- **Session Management**: Configure appropriate session timeouts
- **Multi-factor Authentication**: Enable for admin users
- **Account Recovery**: Set up secure password reset flow

### Data Security
- **Firestore Rules**: Implement strict security rules
- **Data Validation**: Validate all inputs on client and server
- **Encryption**: Use HTTPS and Firebase's built-in encryption
- **Access Logging**: Monitor and log all data access

### Application Security
- **Content Security Policy**: Implement CSP headers
- **XSS Protection**: Sanitize user inputs
- **CSRF Protection**: Use Firebase's built-in CSRF protection
- **Dependency Security**: Regularly update dependencies

---

## 9. Useful Commands

### Development
```sh
npm run dev              # Start development server
npm run frontend         # Start frontend dev server
npm test                 # Run test suite
firebase emulators:start # Local Firebase emulation
```

### Deployment
```sh
npm run build:frontend   # Build for production
firebase deploy          # Deploy everything
firebase deploy --only hosting  # Deploy frontend only
firebase deploy --only firestore  # Deploy database rules
```

### Maintenance
```sh
firebase projects:list   # List Firebase projects
firebase use <project>   # Switch Firebase project
firebase hosting:channel:create preview  # Create preview channel
firebase logout          # Logout from Firebase CLI
```

---

## 10. Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Authentication Errors**: Verify Firebase config and authorized domains
3. **Database Access**: Check Firestore security rules
4. **Deployment Failures**: Ensure proper Firebase CLI authentication

### Debug Mode
Enable Firebase debug logging:
```sh
firebase --debug deploy
```

### Support Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
- [Webpack Configuration](https://webpack.js.org/configuration/)

---

**Your Cheetah Payroll application is ready for production deployment on Firebase!**