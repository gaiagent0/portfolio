# Portfolio + AI Content Pipeline

Astro 5 portfólió + blog, Qwen-alapú tartalom generálással és Cloudflare Pages deploy-jal.

## Tech stack

| Réteg | Technológia | Költség |
|-------|-------------|---------|
| Frontend | Astro 5 (SSG) + Tailwind CSS | 0 Ft |
| CDN + Hosting | Cloudflare Pages | 0 Ft |
| CI/CD | GitHub Actions | 0 Ft |
| Backup | Gitea (homelab) | 0 Ft |
| AI tartalom | Alibaba Qwen API | 0 Ft (1M tok/modell) |

## Gyors start

```bash
# 1. Clone
git clone https://github.com/yourhandle/portfolio.git
cd portfolio

# 2. Telepítés
npm install

# 3. Környezeti változók
cp .env.example .env
# Írd be a DASHSCOPE_API_KEY értékét

# 4. Dev server
npm run dev        # → http://localhost:4321

# 5. Build
npm run build      # → dist/
```

## Tartalom generálás (Qwen pipeline)

```bash
# Egy blog poszt
DASHSCOPE_API_KEY=xxx node scripts/generate-content.mjs \
  --type blog_howto \
  --topic "Hogyan állíts be Astro 5 projektet Cloudflare Pages-re?"

# Batch (topics.json alapján)
DASHSCOPE_API_KEY=xxx node scripts/generate-content.mjs --batch topics.json

# Fordítás
DASHSCOPE_API_KEY=xxx node scripts/generate-content.mjs \
  --type translation \
  --lang DE \
  --topic "$(cat src/content/blog/my-post.mdx)"
```

### Content típusok és modellek

| Típus | Modell | ~Token | Mire |
|-------|--------|--------|------|
| `tool_faq_meta` | qwen-flash | 150 | FAQ, meta description, rövid szöveg |
| `blog_howto` | qwen3-30b | 600 | Blog poszt, how-to, comparison |
| `pillar_deep` | qwen3-235b | 4000 | Pillar page, mély analízis |
| `code_demo` | qwen3-coder-plus | 800 | Tech reference, kód demo |
| `translation` | qwen-mt-turbo | 500 | Fordítás HU/EN/DE |

## GitHub Secrets beállítása

A deploy-hoz 3 secret kell (GitHub → repo → Settings → Secrets → Actions):

```
CLOUDFLARE_API_TOKEN   # Cloudflare → API Tokens → Edit Cloudflare Pages token
CLOUDFLARE_ACCOUNT_ID  # Cloudflare dashboard → jobb oldali sáv
DASHSCOPE_API_KEY      # Alibaba Model Studio → API Key
```

Gitea mirror-hoz (opcionális):
```
GITEA_URL    # pl: https://gitea.homelab.local
GITEA_TOKEN  # Gitea → User Settings → Applications → Generate Token
```

## Cloudflare Pages első deploy

1. Cloudflare dashboard → Pages → Create application → Connect to Git
2. GitHub repó kiválasztása
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy → az első build után kapsz egy `.pages.dev` URL-t
5. Ezt írd be az `astro.config.mjs` `site:` mezőjébe

## Projekt struktúra

```
portfolio/
├── src/
│   ├── content/
│   │   ├── config.ts          # Astro collection schema
│   │   └── blog/              # MDX blog posztok (AI-generált is)
│   ├── layouts/
│   │   └── Base.astro         # SEO, JSON-LD, dark mode
│   ├── pages/
│   │   ├── index.astro        # Főoldal
│   │   └── blog/
│   │       ├── index.astro    # Blog lista + tag szűrő
│   │       └── [slug].astro   # Blog poszt dinamikus route
│   └── lib/
│       └── router_v2.py       # Smart Router v2 (Python)
├── scripts/
│   └── generate-content.mjs  # Tartalom pipeline (Node.js)
├── .github/workflows/
│   └── deploy.yml             # CI/CD: build + CF Pages + Gitea mirror
├── topics.json                # Batch generálás témák
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## Smart Router v2 változások

- Hard rules: "röviden/brief/3 mondatban" → `qwen-flash`, 0 extra API hívás
- `expected_tokens < 120` → auto-downgrade tool_faq_meta-ra
- `max_tokens: 150` (volt 200), `temperature: 0.0` (volt 0.1)
- `stream_options: {include_usage: true}` → pontos token számlálás streaming mellett
