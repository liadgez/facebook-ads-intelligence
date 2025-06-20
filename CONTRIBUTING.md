# Contributing to Facebook Ads Intelligence Platform

Thank you for your interest in contributing to the Facebook Ads Intelligence Platform! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/facebook-ads-intelligence.git
   cd facebook-ads-intelligence
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/facebook-ads-intelligence.git
   ```
4. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 What to Contribute

### We Welcome:
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage improvements
- 🌐 Internationalization

### Good First Issues:
Look for issues labeled `good first issue` or `help wanted`.

## 💻 Development Setup

### Scraper Development
```bash
cd scraper
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

### Webapp Development
```bash
cd webapp
# Use any local server
python -m http.server 8000
# Or use Node.js http-server
npx http-server
```

## 📝 Coding Standards

### JavaScript Style Guide
- Use ES6+ features
- Async/await over promises
- Meaningful variable names
- Comment complex logic
- No console.log in production code

### Example:
```javascript
// Good
async function extractAdData(page, adElement) {
    try {
        // Extract headline with fallback
        const headline = await adElement.$eval(
            'h2', 
            el => el.textContent?.trim()
        ) || 'No headline';
        
        return { headline };
    } catch (error) {
        log.error('Failed to extract ad data:', error);
        throw error;
    }
}

// Avoid
function getData(p, e) {
    return e.getText().then(t => {
        console.log(t);
        return t;
    });
}
```

### Commit Messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add emotional trigger analysis
fix: correct selector for Instagram ads
docs: update API documentation
style: format code with prettier
refactor: extract text parsing logic
test: add unit tests for urlBuilder
chore: update dependencies
```

## 🧪 Testing

### Running Tests
```bash
npm test                 # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # Coverage report
```

### Writing Tests
- Test file naming: `*.test.js` or `*.spec.js`
- Use descriptive test names
- Test edge cases
- Mock external dependencies

Example:
```javascript
describe('urlBuilder', () => {
    test('builds correct URL with all parameters', () => {
        const url = buildCompetitorUrl('123456', {
            active_status: 'active',
            country: 'US'
        });
        expect(url).toContain('view_all_page_id=123456');
        expect(url).toContain('active_status=active');
    });
});
```

## 📤 Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

2. **Keep your fork updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guide
- [ ] Self-reviewed code
- [ ] Updated documentation
- [ ] No console.log statements
```

## 🐛 Reporting Issues

### Before Creating an Issue:
1. Search existing issues
2. Check if it's already fixed in `main`
3. Verify it's reproducible

### Issue Template:
```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., macOS]
- Node version: [e.g., 18.0.0]
- Browser: [e.g., Chrome 120]
```

## 🏗️ Architecture Decisions

### Scraper Architecture
- **Playwright** for browser automation (better than Puppeteer for anti-detection)
- **Crawlee** for robust crawling framework
- **Modular design** with separate strategies for text extraction

### Webapp Architecture
- **Vanilla JS** for zero dependencies
- **Chart.js** for visualizations
- **Tailwind CSS** for styling
- **Local-first** approach (no backend required)

## 📚 Resources

- [Crawlee Documentation](https://crawlee.dev/docs)
- [Playwright Documentation](https://playwright.dev/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎉 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Given credit in commit messages

## ❓ Questions?

- Open a [Discussion](https://github.com/OWNER/facebook-ads-intelligence/discussions)
- Join our [Discord](https://discord.gg/INVITE)
- Email: contribute@example.com

Thank you for contributing! 🙏