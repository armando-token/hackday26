<p align="center">
  <img src="docs/hackday26-repo-cover.jpg?v=5" alt="Controlnautas × Muse AI — engineer requests PLC specs and live inventory via Muse AI; Controlnautas API returns stock, price, and preliminary quote" width="100%" />
</p>

<h1 align="center">Controlnautas Muse API — Specs, Live Inventory &amp; Quotes</h1>

<p align="center">
  <strong>Hack Day 2026 — San Francisco</strong><br/>
  Meta Muse connects to Controlnautas over a private HTTPS API — not web scraping.<br/>
  Verified industrial specs, live inventory &amp; price, preliminary quote PDF.
</p>

<p align="center">
  <a href="https://data.controlnautas.com/us"><img src="https://img.shields.io/badge/Demo-Live-C8102E?style=for-the-badge" alt="Live demo" /></a>
  <a href="https://data.controlnautas.com/openapi.yaml"><img src="https://img.shields.io/badge/OpenAPI-muse%2Fv1-185394?style=for-the-badge" alt="OpenAPI" /></a>
  <a href="https://data.controlnautas.com/healthz"><img src="https://img.shields.io/badge/Healthz-OK-0B7A3E?style=for-the-badge" alt="Healthz" /></a>
  <img src="https://img.shields.io/badge/License-Private%20demo-111111?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Meta%20Muse%20AI-Agent-0668E1?style=flat-square&logo=meta&logoColor=white" alt="Meta Muse AI" />
  <img src="https://img.shields.io/badge/Medusa-2.x-0F172A?style=flat-square&logo=medusa&logoColor=white" alt="Medusa" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Caddy-TLS-1F8787?style=flat-square&logo=caddy&logoColor=white" alt="Caddy" />
  <img src="https://img.shields.io/badge/AWS%20EC2-Ubuntu-FF9900?style=flat-square&logo=amazonec2&logoColor=white" alt="AWS EC2" />
</p>

<p align="center">
  <a href="https://data.controlnautas.com/us">Live demo</a> ·
  <a href="https://data.controlnautas.com/openapi.yaml">OpenAPI</a> ·
  <a href="#what-this-project-is">Overview</a> ·
  <a href="#agent-commerce-api-apimusev1">API</a> ·
  <a href="#judge--reviewer-quick-path">Judge path</a>
</p>

---

## What this project is

Controlnautas is an existing B2B industrial commerce stack (**Medusa 2.x** + **Next.js 15**).  
This Hack Day build adds a **machine-readable Agent Commerce API** so Meta Muse (or any compliant client) can:

1. **Search** demo catalog products by technical intent  
2. **Evaluate** structured requirements against versioned facts and sources (`meets` / `does_not_meet` / `not_documented`)  
3. **Read live USD price & stock** from Medusa (no stale storefront cache)  
4. **Create an immutable preliminary quote PDF** for human sales confirmation  

> The storefront is not rebuilt. Commerce truth stays in Medusa. LLMs formulate questions; they do **not** invent verdicts or prices.

---

## Live demo

| Surface | URL |
| --- | --- |
| Storefront (EN / USD) | https://data.controlnautas.com/us |
| Category hub | https://data.controlnautas.com/us/store/automatizacion-control |
| Health | https://data.controlnautas.com/healthz |
| OpenAPI | https://data.controlnautas.com/openapi.yaml |
| LLM discovery | https://data.controlnautas.com/llms.txt |

**Public host:** AWS EC2 · Caddy TLS · `data.controlnautas.com`

---

## Demo catalog (real manufacturer documentation)

| SKU | Product | Brand | USD | Stock |
| --- | --- | ---: | ---: | ---: |
| `CN-X5PRIME-HE-XP5` | X5 Prime OCS All-in-One Controller (HE-XP5) | Horner Automation | 890 | 3 |
| `CN-N1200` | N1200 Universal Process Controller | NOVUS | 480 | 2 |
| `CN-THT02` | THT-02 Temperature & Humidity Sensor (RS-485 Modbus RTU) | TZ / Tzone | 75 | 8 |

Product photography is sourced from the production Controlnautas catalog and served under `/cn-media`.  
Technical PDFs and Markdown specs are published under `/demo/datasheets` and `/demo/specs`.

> Commercial values are **Hack Day demo USD**. Quotes are preliminary simulations and require representative confirmation.

---

## Architecture at a glance

```text
Engineer ──► Meta Muse / API client
                 │
                 ▼
        /api/muse/v1  (Bearer token)
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
  Search     Evaluate     Live offer
     │           │           │
     └───────────┼───────────┘
                 ▼
        Medusa 2 + Postgres
        (price, stock, PIM facts)
                 │
                 ▼
     Preliminary quote snapshot + PDF
                 │
                 ▼
        Human confirmation (sales)
```

| Concern | Authority |
| --- | --- |
| SKU / variant identity | Medusa |
| Price & availability | Live Medusa commercial read |
| Technical facts & sources | PIM / technical_profile tables |
| Requirement verdicts | Deterministic evaluator (not the LLM) |
| Quote PDF | Immutable snapshot persisted by Controlnautas |

---

## Agent Commerce API (`/api/muse/v1`)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Public liveness (`status`, `version`, `commit`) |
| `GET` | `/api/muse/v1/products/search` | Demo product search + compact live offer fields |
| `GET` | `/api/muse/v1/products/{variantId}` | Technical profile, facts, sources, embedded offer |
| `POST` | `/api/muse/v1/evaluate` | Structured requirement evaluation |
| `GET` | `/api/muse/v1/products/{variantId}/offer` | Full live commercial offer |
| `POST` | `/api/muse/v1/preliminary-quotes` | Create immutable preliminary quote + PDF URL |
| `GET` | `/api/muse/v1/preliminary-quotes/{id}/pdf` | Download quote PDF |

**Auth:** `Authorization: Bearer <MUSE_API_TOKEN>`  
**Scope:** demo variants only (`CN-%` + demo flag). Admin routes are not exposed.

---

## Repository layout

```text
b2b-backend/     Medusa backend, Muse API, PIM / technical models, seed
b2b-storefront/  Next.js B2B storefront (EN UI, demo products, /cn-media)
docs/            OpenAPI, llms.txt, decisions, demo datasheets & specs
scripts/         Seed, revert, verification suites, quote PDF generator
```

Branch for this work: `hackday-2026-controlnautas-muse`

---

## Judge / reviewer quick path

1. Open the storefront and confirm the three demo products with real images.  
2. `curl -s https://data.controlnautas.com/healthz`  
3. Authenticated `search` → English titles, `currency: usd`, live stock.  
4. `evaluate` a DIN / 4–20 mA / Modbus RTU requirement set.  
5. `offer` → priced USD; then `preliminary-quotes` → open the PDF.  
6. Confirm the PDF is labeled as a preliminary simulation and matches the snapshot.

Verification suites live under `scripts/verify-phase*.ts` and `scripts/demo-e2e-pitch.ts`.

---

## Safety & demo boundaries

- Demo catalog is isolated; seed/revert does not delete unrelated products.  
- Prices are re-read at quote time; client-supplied prices are rejected.  
- Quotes are opaque, time-bounded, and not sales orders.  
- No production secrets in the repository; connector token is server-side only.

---

## Team & event

Built for **Hack Day 2026** as a deployable product demo for Controlnautas × Meta Muse — not slides.

**Demo:** https://data.controlnautas.com/us  
**API docs:** https://data.controlnautas.com/openapi.yaml

---

_Latest documented HEAD on this branch: `8b8d1c1`_
