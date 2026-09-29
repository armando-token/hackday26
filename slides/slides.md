---
theme: default
title: Controlnautas × Muse AI
colorSchema: light
transition: fade
---

# Controlnautas × Muse AI

Industrial B2B is **not** a shopping cart.

Engineers need verified specs, live stock, and a preliminary quote  
**before** anyone is allowed to buy.

Hack Day 2026 · https://data.controlnautas.com/us

---

# Who we are

**Controlnautas** — authorized distributor of industrial electronics  
(Horner, NOVUS, PLC/HMI, process control, sensors).

Factories do **not** buy controllers like household appliances.

- Insurance only allows certified equipment
- Liability: manufacturer + installer + integrator
- A wrong SKU can stop a plant

---

# Nobody buys through an online cart

Purchases need multiple approvers:

- Plant engineers
- Factory managers
- Logistics leads

Cycles last **days → months → years**.  
Large volumes = zero tolerance for error.

Always starts with a **technical sales engineer**.

---

# What the engineer needs first

1. Real technical documentation (clear **Markdown** / datasheets)
2. Proof it meets **plant norms and standards**
3. Validation with a technical sales engineer

Price comes later. **Fit and proof come first.**

---

# Why scraping the web fails

- Critical specs often are **not on the public web**
- LLMs invent or confuse I/O, protocols, mounting
- Storefront stock/price can be **stale**
- No evidence chain → engineer cannot trust it
- Sales repeats the same Q&A for weeks

---

# The unlock: Muse AI → our API

Muse reads Controlnautas **directly via API** — not by guessing HTML.

| Muse gets | Why it matters |
| --- | --- |
| Specs + sources | Evidence-backed verdict |
| Live stock / price | Real Medusa truth |
| Preliminary quote PDF | Sales starts faster |

The LLM analyzes. Humans still authorize the buy.

---

# What we built (Hack Day)

**Ask Muse → match config → verify facts → price/stock → quote PDF**

```text
GET  /healthz
GET  /api/muse/v1/products/search
POST /api/muse/v1/evaluate
GET  /api/muse/v1/products/{id}/offer
POST /api/muse/v1/preliminary-quotes
```

Stack: Medusa 2 · Next.js 15 · Postgres · Caddy HTTPS  
Demo: data.controlnautas.com

---

# Demo catalog (live)

| SKU | Product | USD | Stock |
| --- | --- | ---: | ---: |
| CN-X5PRIME-HE-XP5 | Horner X5 Prime OCS | 890 | 3 |
| CN-N1200 | NOVUS N1200 | 480 | 2 |
| CN-THT02 | TZ THT-02 Modbus sensor | 75 | 8 |

Real manufacturer docs + photos from controlnautas.com

---

# Business impact

- **Faster cycle** — requirement → validated option → quote
- **Less sales load** — stop re-answering datasheet questions
- **Fewer errors** — API truth for plant / logistics approval

We will run this in the real Controlnautas company.

---

# Next

Muse AI is free today · it will scale · the assistant is already with the engineer.

**Demo** https://data.controlnautas.com/us  
**API** https://data.controlnautas.com/openapi.yaml  
**PR** https://github.com/armando-token/hackday26/pull/2
