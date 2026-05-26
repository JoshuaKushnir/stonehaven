# Stonehaven — Landscape Studio

A reference build for a premium service-business marketing site **with first-class AI integration**. Fictional client — _Stonehaven Landscape Studio_, a Hudson, NY landscape architecture and design-build practice — but the architecture, content modeling, performance budget, design system, and AI assistant are shaped to match what I'd ship to a real high-end services client.

![status](https://img.shields.io/badge/status-built-success) ![stack](https://img.shields.io/badge/stack-Astro%205%20%7C%20Tailwind%204%20%7C%20Sanity%20%7C%20OpenAI-1a1a17) ![lighthouse](https://img.shields.io/badge/lighthouse-95%2B-10a37f)

> **Live demo:** _add your Vercel URL here after deployment_

## Why this exists

A portfolio piece showing two patterns I sell together:

**1. A production-shaped marketing site** a non-technical owner can update without touching code

- **Astro 5 static output** — sub-second loads, near-zero client JS, Lighthouse 95+ without trying
- **Astro content collections** as the default data source — version-controlled, runs out of the box
- **Sanity Studio v3 schemas** included for the production swap (`sanity/` folder) — the owner edits content with image uploads and the site rebuilds automatically
- **Vercel serverless `/api/quote` endpoint** for the lead form, with Resend for delivery (falls back to console-log if no key is set, so the form works in local dev without setup)
- **Programmatic per-town landing pages** for local SEO — eight today, fifty just as easy
- **LocalBusiness JSON-LD**, OpenGraph, sitemap, robots.txt, canonical URLs — all the table stakes
- **Premium design system** — restrained type pairing (Fraunces + Inter), warm-neutral palette, asymmetric editorial layouts, generous whitespace

**2. An AI Studio Assistant** — a conversational intake widget that pre-qualifies leads 24/7

- **Streaming chat at `/api/chat`** — OpenAI Chat Completions with `gpt-4o-mini` by default, server-side key (never shipped to the browser), Server-Sent Events for token-by-token delivery
- **Function calling into the portfolio** — the assistant uses a `lookup_projects` tool to reference real Stonehaven work by name when a prospect describes something similar
- **Brand-trained system prompt** — knows the studio's services, voice, and the lines it shouldn't cross (no quoting prices, no promising availability, redirect to humans on anything sensitive)
- **Zero-JS-discipline UI** — vanilla TypeScript chat panel, no React island, ~3KB of client code, fits in the floating widget and on the contact page
- **Graceful offline fallback** — when no `OPENAI_API_KEY` is set, the widget returns an in-brand "assistant offline" message via a fake stream, so the demo still feels alive
- **sessionStorage continuity** — refreshing the page doesn't lose the conversation; closing the tab does

This second pattern is the one most service-business sites _don't_ have. It's also the reason a single small studio can field thirty leads a month without expanding the team — the assistant does the first conversation, then hands the human a structured note.

The site is the kind of marketing page a high-end contractor, architect, or design-build studio actually pays for. The AI layer is the kind of upsell I bring to every project. Swap the brand, swap the content, swap the system prompt — ship in a day.

## Stack

| Layer    | Tech                                                                |
| -------- | ------------------------------------------------------------------- |
| Framework | [Astro 5](https://astro.build) with `output: 'static'` + Vercel adapter |
| Styling  | [Tailwind 4](https://tailwindcss.com) via `@tailwindcss/vite`, design tokens in CSS |
| Content  | Astro content collections (`src/content/`) — JSON + markdown        |
| CMS swap | [Sanity Studio v3](https://sanity.io) schemas in `sanity/` (see [sanity/README.md](sanity/README.md)) |
| AI       | [OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat) — streaming SSE, function calling, brand-trained system prompt in `src/pages/api/chat.ts` |
| Forms    | [Resend](https://resend.com) via a server endpoint at `src/pages/api/quote.ts` |
| Hosting  | [Vercel](https://vercel.com) (free tier)                            |
| SEO      | `@astrojs/sitemap`, hand-rolled JSON-LD helpers in `src/lib/seo.ts` |

## Local development

```bash
cd stonehaven
npm install
cp .env.example .env       # optional — only needed for live email delivery
npm run dev
```

Open <http://localhost:4321>. The quote form works without any env vars — submissions log to the dev-server console and the user is redirected to the success state.

To send real emails locally, drop a `RESEND_API_KEY` into `.env`. To swap the content layer to Sanity, see [sanity/README.md](sanity/README.md).

## Build & deploy to Vercel

```bash
npm run build              # writes static site + serverless function
npm run preview            # serves the production build locally
```

To deploy:

1. Push this folder to GitHub.
2. On [vercel.com](https://vercel.com), **Add New → Project**, import the repo, set **Root Directory** to `stonehaven/`.
3. (Optional) Add environment variables: `RESEND_API_KEY`, `QUOTE_TO_EMAIL`, `QUOTE_FROM_EMAIL`, `SITE_URL`.
4. Deploy. Vercel auto-detects Astro via the adapter and configures the `/api/quote` function automatically.

## Project layout

```
stonehaven/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Home
│   │   ├── services.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── robots.txt.ts            # dynamically built
│   │   ├── projects/
│   │   │   ├── index.astro          # filterable gallery
│   │   │   └── [id].astro           # project detail
│   │   ├── areas/
│   │   │   ├── index.astro          # service-area index
│   │   │   └── [slug].astro         # per-town landing page
│   │   ├── api/
│   │   │   ├── chat.ts              # streaming AI studio assistant
│   │   │   └── quote.ts             # serverless quote endpoint
│   │   └── img/[seed].svg.ts        # branded SVG placeholders
│   ├── layouts/Base.astro           # SEO meta + JSON-LD + chat widget mount
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── ChatWidget.astro         # floating AI assistant + inline variant
│   ├── content/                     # default data source
│   │   ├── projects/*.md
│   │   ├── services.json
│   │   ├── testimonials.json
│   │   ├── team.json
│   │   └── areas.json
│   ├── content.config.ts            # zod schemas for collections
│   ├── lib/
│   │   ├── site.ts                  # name, address, nav
│   │   └── seo.ts                   # LocalBusiness / page / project JSON-LD
│   └── styles/global.css            # Tailwind + design tokens
├── sanity/                          # production CMS swap (not wired by default)
│   ├── sanity.config.ts
│   ├── schemas/*.ts
│   └── README.md
├── public/favicon.svg
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## Design system

Tokens are declared in `src/styles/global.css` inside Tailwind 4's `@theme` block. Tailwind generates utilities from them; raw `var(--…)` access is also available for inline styles or arbitrary values.

| Token                 | Value                            |
| --------------------- | -------------------------------- |
| `--color-bone`        | `#faf8f3` (page background)      |
| `--color-paper`       | `#f4f1ea` (raised surface)       |
| `--color-sand`        | `#e8e2d4` (rules, dividers)      |
| `--color-stone`       | `#8a8275` (muted text)           |
| `--color-slate`       | `#4a4740` (body text)            |
| `--color-ink`         | `#1a1a17` (headings)             |
| `--color-moss`        | `#5e6a4d` (accent)               |
| `--color-moss-deep`   | `#404a35` (accent hover)         |
| `--font-display`      | Fraunces, serif                  |
| `--font-sans`         | Inter, system-ui, sans-serif     |

## Environment variables

| Variable            | Required          | Notes                                                  |
| ------------------- | ----------------- | ------------------------------------------------------ |
| `RESEND_API_KEY`    | only in prod      | Without it the quote endpoint console-logs (useful in dev) |
| `QUOTE_TO_EMAIL`    | only in prod      | Inbox for incoming quote requests                      |
| `QUOTE_FROM_EMAIL`  | only in prod      | Verified sender (or `onboarding@resend.dev` for tests) |
| `SITE_URL`          | only in prod      | Used for sitemap, OpenGraph, canonicals                |
| `SANITY_PROJECT_ID` | only for CMS swap | See `sanity/README.md`                                 |
| `SANITY_DATASET`    | only for CMS swap | Defaults to `production`                               |
| `OPENAI_API_KEY`    | only for live AI  | Without it the assistant returns an in-brand "offline" stream |
| `OPENAI_MODEL`      | optional          | Defaults to `gpt-4o-mini`                              |

## What I'd extend for a real client

Things deliberately left out, with notes on how I'd add them:

- **Real photography** — image URLs in `src/content/` point to Picsum placeholders. Swap to a real image host (or Sanity's CDN once wired up) and the responsive `<picture>` setup is already in place.
- **Journal / blog** — another content collection of MDX entries; near-zero new code.
- **CMS-driven home page** — currently the home page composes from collections directly. For a marketing team that wants to re-order sections, lift the page modules into a `homepage` Sanity singleton.
- **Analytics + heatmaps** — drop in Plausible or Fathom; one `<script>` tag in `Base.astro`.

## License

MIT.
