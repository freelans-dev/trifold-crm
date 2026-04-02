# Security Hardening Audit

> Task ID: devops-security-hardening-audit
> Agent: Gage (DevOps/Repo Guardian)
> Version: 1.0.0

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Runs all checks automatically
- Generates report with pass/fail/warn status
- **Best for:** CI/CD integration, quick health checks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Step-by-step guided audit
- Explains each finding and remediation
- **Best for:** First-time security hardening, learning

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Full threat modeling before checks
- Custom rules based on project specifics
- **Best for:** Production-critical deployments, compliance

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: securityHardeningAudit()
responsável: Gage (DevOps Guardian)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: project_path
  tipo: string
  obrigatório: true
  desc: "Root path of the project to audit"

- campo: deployment_platform
  tipo: string
  obrigatório: false
  default: "vercel"
  enum: ["vercel", "aws", "gcp", "docker", "other"]
  desc: "Deployment platform for platform-specific checks"

- campo: framework
  tipo: string
  obrigatório: false
  default: "nextjs"
  enum: ["nextjs", "express", "fastify", "other"]
  desc: "Web framework for framework-specific checks"

**Saída:**
- security_audit_report (markdown)
- severity_summary: { critical: number, high: number, medium: number, low: number }
- remediation_checklist (markdown checkboxes)
```

---

## Checklist: Security Headers

- [ ] `middleware.ts` exists at project root (or `src/middleware.ts`)
- [ ] `X-Content-Type-Options: nosniff` header set
- [ ] `X-Frame-Options: DENY` header set
- [ ] `Strict-Transport-Security` header configured (HSTS)
- [ ] `Content-Security-Policy` header configured
- [ ] `Referrer-Policy` header set
- [ ] `Permissions-Policy` header set
- [ ] `X-Powered-By` header removed (`poweredByHeader: false`)

## Checklist: Rate Limiting

- [ ] Rate limiting configured (Vercel WAF, Cloudflare, or application-level)
- [ ] Persistent actions enabled on deny/rate-limit rules (Vercel)
- [ ] No in-memory-only rate limiting in serverless environment
- [ ] Public API endpoints have rate limits
- [ ] Webhook endpoints have rate limits

## Checklist: Authentication & Authorization

- [ ] All API routes have explicit auth guards OR documented as intentionally public
- [ ] Webhook endpoints verify signatures/tokens (Stripe, Z-API, Google, etc.)
- [ ] Cron endpoints check `CRON_SECRET` or equivalent bearer token
- [ ] No admin endpoints accessible without `requireAdmin()` or equivalent
- [ ] CORS configured with explicit allowed origins (not wildcard `*`)

## Checklist: Input Validation

- [ ] POST/PUT/PATCH routes validate input with Zod or similar
- [ ] File upload size limits enforced
- [ ] Query parameter limits set (pagination max, string max length)
- [ ] No raw SQL string concatenation (use parameterized queries/ORM)

## Checklist: Billing & Abuse Protection (Vercel)

- [ ] Spend Management configured with auto-pause threshold
- [ ] Spend notifications enabled (email/SMS at 50%, 75%, 100%)
- [ ] Attack Challenge Mode enabled
- [ ] Scanner paths blocked (/.env, /wp-admin, /phpMyAdmin, etc.)
- [ ] Bot User-Agent patterns blocked (python-requests, Go-http-client, scrapy)
- [ ] `maxDuration` set on serverless functions to prevent runaway execution

## Checklist: Secrets Management

- [ ] `.env.local` / `.env` in `.gitignore`
- [ ] `.env.example` exists with all required keys (no real values)
- [ ] No hardcoded secrets in source code
- [ ] Service role keys only used server-side (not `NEXT_PUBLIC_*`)

## Checklist: Infrastructure Config

- [ ] `vercel.json` / deployment config is version-controlled
- [ ] Functions have `maxDuration` limits
- [ ] Region configured for latency optimization
- [ ] Preview deployments have password protection (if applicable)

---

## Execution Steps

### Step 1: Scan Project Structure
```
Search for: middleware.ts, next.config.ts, vercel.json, .env.example, package.json
Verify existence and location of security-critical files.
```

### Step 2: Audit Security Headers
```
Read middleware.ts and next.config.ts.
Check each header in the checklist above.
Report missing headers as HIGH severity.
```

### Step 3: Audit Rate Limiting
```
Search for rate-limit patterns in codebase.
Check if in-memory rate limiting is used on serverless (CRITICAL if yes).
Verify Vercel WAF rules if deployment_platform == "vercel".
```

### Step 4: Audit Authentication
```
List all API route files.
For each route, verify auth guard usage.
Flag unprotected routes as MEDIUM-HIGH severity.
Flag webhook routes without signature verification as CRITICAL.
```

### Step 5: Audit Input Validation
```
Check POST/PUT/PATCH handlers for Zod/schema validation.
Flag handlers with raw body access and no validation.
```

### Step 6: Generate Report
```
Compile findings into severity-tagged markdown report.
Generate remediation checklist with specific file paths and code suggestions.
```

---

## Output Format

```markdown
# Security Audit Report — {project_name}
**Date:** {date}
**Auditor:** @devops (Gage)
**Platform:** {deployment_platform}

## Summary
| Severity | Count |
|----------|-------|
| CRITICAL | X     |
| HIGH     | X     |
| MEDIUM   | X     |
| LOW      | X     |

## Findings

### [CRITICAL] Finding Title
- **File:** path/to/file.ts
- **Issue:** Description of the vulnerability
- **Impact:** What can happen if exploited
- **Fix:** Specific remediation steps

### [HIGH] Finding Title
...

## Remediation Checklist
- [ ] Fix: Description (file.ts:line)
- [ ] Fix: Description (file.ts:line)
```
