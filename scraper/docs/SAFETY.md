# 🛡️ Safety Guide - Facebook Ads Intelligence Scraper

## ⚠️ Critical Safety Information

This guide contains essential information to avoid detection and ensure safe scraping. **Read this completely before running the scraper.**

## 🚨 Signs of Detection

### Immediate Stop Signals
If you encounter ANY of these, **STOP immediately**:

1. **Captcha Challenge** - "Verify you're human"
2. **Security Check** - "We've detected unusual activity"
3. **Login Prompt** - When not expected
4. **Empty Results** - Ads suddenly stop loading
5. **Rate Limit Message** - "You're going too fast"
6. **Account Warning** - Any security notification

### What to Do If Detected

1. **Stop the scraper immediately** (Ctrl+C)
2. **Do not retry** for at least 24-48 hours
3. **Clear all session data**: `npm run reset`
4. **Consider using a different IP** (VPN/proxy)
5. **Reduce rate limits** when you resume

## 🔒 Anti-Detection Features

### 1. Stealth Mode (Enabled by Default)
```javascript
// Automatically applied:
- Hides webdriver property
- Spoofs browser plugins
- Randomizes browser fingerprint
- Mimics human viewport
```

### 2. Human Behavior Simulation
```javascript
// Random delays between actions
MIN_DELAY_MS=3000  // 3 seconds minimum
MAX_DELAY_MS=8000  // 8 seconds maximum

// Natural scrolling patterns
- Variable scroll speed
- Random pause points
- Reading simulation
```

### 3. Session Management
```javascript
// Persistent sessions to appear like regular user
PERSIST_SESSIONS=true

// Rotation of user agents
ROTATE_USER_AGENTS=true
```

## 📊 Safe Scraping Limits

### Recommended Limits

| Metric | Safe Limit | Aggressive | Risky |
|--------|-----------|------------|-------|
| Ads per session | 100-200 | 200-500 | 500+ |
| Pages per session | 3-5 | 5-10 | 10+ |
| Requests per minute | 20-30 | 30-50 | 50+ |
| Sessions per day | 2-3 | 3-5 | 5+ |
| Competitors per day | 3-5 | 5-10 | 10+ |

### Time-Based Safety

**Best Times to Scrape:**
- Business hours (9 AM - 5 PM local time)
- Weekdays over weekends
- Avoid: 12 AM - 6 AM (suspicious)

**Session Spacing:**
- Minimum 2 hours between sessions
- Different competitors each session
- Vary your patterns

## 🛠️ Configuration for Maximum Safety

### Essential .env Settings
```bash
# Conservative settings for maximum safety
CRAWLEE_HEADLESS=false          # See what's happening
CRAWLEE_MAX_CONCURRENCY=1       # One request at a time
MIN_DELAY_MS=5000               # 5 second minimum delay
MAX_DELAY_MS=10000              # 10 second maximum delay
MAX_REQUESTS_PER_MINUTE=20      # Very conservative
TEST_MODE=true                  # Start with test mode
MAX_ADS_PER_SESSION=50          # Low initial limit
```

### Progressive Approach
1. **Week 1**: Test mode, 50 ads max, 5-10s delays
2. **Week 2**: Increase to 100 ads, 3-8s delays
3. **Week 3**: Normal mode, 200 ads, standard delays
4. **Ongoing**: Monitor and adjust based on success

## 🚦 Pre-Flight Checklist

Before each scraping session:

- [ ] Check Facebook Ads Library manually first
- [ ] Verify target has active ads
- [ ] Clear old session data if needed
- [ ] Set conservative rate limits
- [ ] Have proxy/VPN ready (just in case)
- [ ] Monitor first 10 requests closely
- [ ] Check browser console for warnings
- [ ] Ensure delays are working properly

## 🔍 Monitoring During Scraping

### Watch For:
1. **Console Warnings** - Detection attempts
2. **Network Errors** - Rate limiting
3. **Slow Loading** - Soft throttling
4. **Missing Data** - Partial blocks

### Healthy Scraping Looks Like:
- Consistent 3-8 second delays
- All data fields populated
- No security prompts
- Natural scrolling behavior
- Session persistence working

## 🚫 What NOT to Do

### Never:
- ❌ Decrease delay times below 3 seconds
- ❌ Run multiple instances simultaneously
- ❌ Scrape the same competitor repeatedly
- ❌ Ignore warning signs
- ❌ Use datacenter proxies (if using proxy)
- ❌ Run 24/7 without breaks
- ❌ Share session data between machines

### Avoid:
- ⚠️ Scraping during Facebook maintenance
- ⚠️ Large sessions late at night
- ⚠️ Predictable patterns
- ⚠️ Aggressive concurrency settings

## 🔧 Troubleshooting

### "No ads found"
1. Verify manually that ads exist
2. Check if selectors have changed
3. Increase wait times
4. Clear session data

### "Browser not launching"
```bash
npx playwright install chromium
npx playwright install-deps
```

### "Session errors"
```bash
npm run reset  # Clear all session data
```

### "Timeout errors"
- Increase `REQUEST_TIMEOUT_SECS`
- Check internet connection
- Reduce concurrent requests

## 🚀 Recovery Procedures

### After Soft Ban (captcha/warning)
1. Wait 24-48 hours minimum
2. Clear all data: `npm run clean`
3. Use different IP if possible
4. Start with TEST_MODE=true
5. Reduce all limits by 50%

### After Hard Ban (account action)
1. Stop all scraping for 1 week
2. Review and improve safety measures
3. Consider residential proxy service
4. Implement additional randomization
5. Consult legal advice if needed

## 📞 Emergency Commands

```bash
# Stop all Playwright processes
pkill -f playwright

# Clear everything and start fresh
npm run clean && npm run reset

# Check if Facebook is blocking you
curl -I https://www.facebook.com/ads/library/

# Test with minimal settings
TEST_MODE=true MAX_ADS_PER_SESSION=5 npm start
```

## 💡 Pro Tips

1. **Build Trust**: Start slow, increase gradually
2. **Be Irregular**: Vary times and patterns
3. **Monitor Actively**: Watch first runs carefully
4. **Document Issues**: Keep logs of any problems
5. **Stay Updated**: Facebook changes frequently
6. **Use Breaks**: Take days off between heavy scraping
7. **Rotate Targets**: Don't focus on one competitor

## ⚖️ Legal Reminder

- Always comply with Terms of Service
- Respect robots.txt
- Use data ethically
- Don't overload servers
- Consider reaching out to competitors directly
- Consult legal counsel for commercial use

---

**Remember**: The goal is sustainable, long-term intelligence gathering. It's better to get 100 ads safely than risk getting banned trying for 1000.

**Golden Rule**: When in doubt, wait it out!