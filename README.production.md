# Cheetah Payroll - Production Ready

A modern, production-ready payroll management system built with React, TypeScript, and Firebase.

## 🏗️ Architecture

This application follows a feature-based architecture pattern optimized for production use:

```
src/
├── core/                    # Core application infrastructure
│   ├── config/             # Environment and Firebase configuration
│   ├── providers/          # React context providers
│   ├── guards/             # Route and permission guards
│   └── middleware/         # Security and validation middleware
├── features/               # Feature modules
│   ├── auth/              # Authentication and authorization
│   ├── dashboard/         # Dashboard and analytics
│   ├── staff/             # Employee management
│   ├── payments/          # Salary and payment management
│   ├── deductions/        # Deduction management
│   ├── payroll/           # Payroll processing
│   ├── reports/           # Reporting and analytics
│   └── utilities/         # Utility functions
├── shared/                # Shared components and utilities
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── constants/         # Application constants
└── assets/               # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cheetah-payroll
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Development server**
   ```bash
   npm run frontend  # Frontend development server
   npm run dev       # Backend development server (if using)
   ```

## 📦 Available Scripts

### Development

- `npm run frontend` - Start frontend development server
- `npm run dev` - Start backend development server
- `npm run test:watch` - Run tests in watch mode

### Building

- `npm run build:frontend` - Build frontend for production
- `npm run build:frontend:clean` - Clean build directory and build frontend
- `npm run build` - Build backend (TypeScript compilation)

### Testing

- `npm test` - Run tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests for CI/CD

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and fix issues
- `npm run typecheck` - Run TypeScript type checking

### Security

- `npm run security:audit` - Run security audit
- `npm run security:fix` - Fix security vulnerabilities

### Analysis

- `npm run analyze` - Analyze bundle size

## 🔧 Configuration

### Environment Variables

All environment variables are prefixed with `REACT_APP_` for frontend use:

```env
# Firebase Configuration (Required)
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Application Configuration
REACT_APP_VERSION=1.0.0
REACT_APP_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password
3. Enable Firestore Database
4. Set up security rules (see `firestore.rules`)
5. Get your config from Project Settings > Your apps

## 🔐 Security Features

### Input Validation & Sanitization

- XSS protection with input sanitization
- SQL injection detection and prevention
- File upload validation with type and size limits
- Rate limiting for API endpoints

### Authentication & Authorization

- Firebase Authentication integration
- Role-based access control (RBAC)
- Route guards and permission checks
- Session management

### Security Headers

- Content Security Policy (CSP)
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security

## 📊 Performance Features

### Code Splitting

- Lazy loading of feature modules
- Dynamic imports for better initial load times
- Bundle optimization with Webpack

### Virtualization

- Virtual scrolling for large lists
- Debounced search inputs
- Performance monitoring hooks

### Caching

- Service worker for offline functionality
- Component memoization
- API response caching

## 🧪 Testing

### Test Structure

```
src/
├── __tests__/
│   ├── core/              # Core functionality tests
│   ├── features/          # Feature-specific tests
│   └── shared/            # Shared component tests
```

### Testing Utilities

- Custom render functions with providers
- Mock data factories
- Test utilities for authentication and Firebase

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for CI
npm run test:ci
```

## 🚀 Deployment

### Frontend Deployment (Firebase Hosting)

```bash
# Build for production
npm run build:frontend:clean

# Deploy to Firebase
firebase deploy
```

### Backend Deployment (if using Express)

```bash
# Build backend
npm run build

# Deploy to your hosting service
npm start
```

### CI/CD Pipeline

The application includes pre-deployment checks:

```bash
npm run predeploy
```

This runs:

- Clean build
- Type checking
- Linting
- Full test suite with coverage
- Security audit

## 📝 Development Guidelines

### Code Organization

- Feature-based folder structure
- Separation of concerns
- Shared components and utilities
- Consistent naming conventions

### Component Development

- Functional components with TypeScript
- Custom hooks for business logic
- Error boundaries for fault tolerance
- Accessibility considerations

### State Management

- React Context for global state
- Custom hooks for local state
- Immutable state updates
- Type-safe state management

### API Integration

- Centralized service layer
- Error handling and logging
- Request/response validation
- Rate limiting and caching

## 🔍 Monitoring & Logging

### Application Logging

- Centralized logging utility
- Configurable log levels
- Structured logging format
- Error tracking and reporting

### Performance Monitoring

- Custom performance hooks
- Bundle size analysis
- Runtime performance metrics
- User experience monitoring

## 📚 Documentation

- `Blueprint.md` - Business requirements and specifications
- `Deployment.md` - Deployment instructions
- `CLAUDE.md` - AI assistant guidelines
- Feature documentation in respective folders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow ESLint and Prettier configurations
- Write comprehensive tests for new features
- Update documentation as needed
- Follow semantic versioning

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Check the documentation
- Review existing issues
- Create a new issue with detailed information
- Contact the development team

## 🏆 Features

### Core Features

- ✅ User authentication and authorization
- ✅ Company management
- ✅ Employee (staff) management
- ✅ Payment processing
- ✅ Deduction management
- ✅ Payroll processing
- ✅ Reporting and analytics
- ✅ Data import/export

### Technical Features

- ✅ TypeScript for type safety
- ✅ React 18 with modern hooks
- ✅ Firebase integration
- ✅ Responsive design
- ✅ PWA capabilities
- ✅ Offline functionality
- ✅ Performance optimization
- ✅ Security hardening
- ✅ Comprehensive testing
- ✅ CI/CD ready

### Rwanda-Specific Features

- ✅ PAYE tax calculations
- ✅ Pension contributions
- ✅ CBHI and RAMA calculations
- ✅ Maternity fund contributions
- ✅ Local compliance reporting
