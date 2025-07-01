# Contributing to Cheetah Payroll

Thank you for your interest in contributing to Cheetah Payroll! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- A Supabase account for testing
- Basic knowledge of TypeScript, React, and Next.js

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/your-username/cheetah-payroll.git
   cd cheetah-payroll
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials
   ```

4. **Set up database**
   ```bash
   # Apply migrations to your Supabase project
   supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Code Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types for all data structures
- Use the existing type definitions in `src/types/`
- Avoid `any` types; use proper typing

### Code Style

- Follow the existing ESLint configuration
- Use Prettier for code formatting
- Use meaningful variable and function names
- Write self-documenting code with clear comments

### Components

- Use functional components with hooks
- Follow the existing component structure
- Place reusable components in `src/components/`
- Use ShadCN UI components where possible

### File Organization

```
src/
├── app/                 # Next.js pages (App Router)
├── components/          # Reusable React components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## 🔄 Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions/improvements

Examples:
- `feature/add-bulk-import`
- `fix/payroll-calculation-bug`
- `refactor/staff-management`

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add bulk staff import functionality
fix: resolve PAYE calculation error for high earners
refactor: simplify payroll calculation engine
docs: update API documentation
test: add unit tests for tax calculations
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Follow existing patterns and conventions
   - Add tests for new functionality

3. **Test your changes**
   ```bash
   npm run lint        # Check code style
   npm run type-check  # Check TypeScript
   npm run build       # Test build
   npm test           # Run tests (when available)
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use a clear, descriptive title
   - Provide detailed description of changes
   - Reference any related issues
   - Add screenshots for UI changes

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to recreate the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable

## 💡 Feature Requests

For new features, please:

- Check existing issues to avoid duplicates
- Provide clear use case and rationale
- Consider implementation complexity
- Discuss with maintainers before starting work

## 🧪 Testing

### Manual Testing

- Test all user flows affected by your changes
- Verify responsive design on different screen sizes
- Test with different user roles and permissions
- Check browser compatibility

### Automated Testing

- Write unit tests for utility functions
- Add integration tests for complex workflows
- Test edge cases and error scenarios
- Maintain or improve test coverage

## 📚 Documentation

### Code Documentation

- Document complex functions and algorithms
- Use JSDoc comments for public APIs
- Keep README and docs up to date
- Include examples in documentation

### User Documentation

- Update user guides for new features
- Include screenshots for UI changes
- Document configuration options
- Provide troubleshooting information

## 🏗️ Architecture Guidelines

### Database Design

- Follow existing schema patterns
- Use proper foreign key relationships
- Implement Row Level Security (RLS)
- Document schema changes

### API Design

- Use consistent naming conventions
- Implement proper error handling
- Follow REST principles where applicable
- Document API endpoints

### State Management

- Use React hooks for local state
- Leverage Supabase real-time for global state
- Minimize state complexity
- Use TypeScript for state typing

## 🔒 Security Considerations

- Never commit sensitive data (keys, passwords)
- Implement proper input validation
- Use parameterized queries to prevent SQL injection
- Follow OWASP security guidelines
- Test authorization and access controls

## 📝 Review Process

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance implications considered
- [ ] Accessibility requirements met

### Review Guidelines

- Be constructive and respectful
- Focus on code quality and maintainability
- Suggest improvements, not just problems
- Consider alternative approaches
- Test the changes yourself

## 🎯 Areas for Contribution

### High Priority
- Performance optimizations
- Accessibility improvements
- Mobile responsiveness
- Error handling enhancements

### Medium Priority
- Additional reporting features
- Bulk import/export improvements
- UI/UX enhancements
- Documentation updates

### Low Priority
- Code refactoring
- Test coverage improvements
- Developer experience enhancements
- Internationalization (i18n)

## 🆘 Getting Help

If you need help:

1. Check existing documentation
2. Search closed issues for similar problems
3. Ask questions in GitHub Discussions
4. Reach out to maintainers
5. Join our community chat (if available)

## 📜 License

By contributing to Cheetah Payroll, you agree that your contributions will be licensed under the same license as the project (MIT License).

## 🙏 Recognition

Contributors will be recognized in:

- Project README contributors section
- Release notes for significant contributions
- Special recognition for major features

Thank you for contributing to Cheetah Payroll! Your efforts help make payroll management better for businesses in Rwanda and beyond.
