---
name: Never expose API keys
description: User shares API keys in chat - store securely in .env.local only, never commit to git
type: feedback
---

User tends to share API keys directly in chat. Always store them in .env.local and ensure .gitignore covers them. Never commit API keys to repositories.

**Why:** Security best practice - API keys in git history are permanently exposed.
**How to apply:** When user provides API keys, immediately add to .env.local and remind about security.
