# 🇮🇳 Nagrik Mitra — Smart Bharat AI Civic Companion

**Live demo:** [prompt-proj.vercel.app](https://prompt-proj.vercel.app)
Built for the **PromptWars Hackathon**.

Nagrik Mitra ("citizen's friend") is a glass-box AI civic assistant for Indian
citizens. Instead of hiding behind a black-box chatbot, it exposes the exact
prompt architecture and reasoning trail behind every answer — so users (and
reviewers) can see *why* the assistant said what it said, not just the answer
itself.

---

## Why "glass-box"

Most civic-service chatbots are opaque: you ask a question, you get an answer,
and you have no way to check whether it's grounded in anything real. For a
domain like government services — where a wrong answer can waste someone's
entire afternoon at the wrong office — that opacity is a real cost.

Nagrik Mitra takes the opposite approach: the system prompt architecture is
shown directly in the UI, so a user (or evaluator) can inspect the same
structure the model is reasoning from.

## Features

- **Multi-language support** — English, Hindi, and Hinglish, matched
  automatically to the citizen's query language.
- **Consult Companion** — ask a free-form civic question (e.g. Aadhaar
  correction, ration card, RTI filing, pothole reporting) and get a
  structured, step-by-step answer.
- **Document Ready-Reckoner** — a quick checklist of documents needed for
  common services (Aadhaar, Ration Card, PAN, Passport, Birth Certificate,
  Income Certificate) before visiting an office.
- **Transparent Prompt Architecture panel** — shows the actual system prompt
  design in four layers:
  1. Persona & tone guidelines (empathetic, neutral, language-matching)
  2. Grounded reference data (8–12 real Indian civic services and rules)
  3. Structured output constraint (forces a consistent JSON response:
     language, query understanding, service match, explanation, action
     steps, disclaimer)
  4. Accuracy caveat — every answer includes a disclaimer to verify at the
     official government portal before taking offline action.

## Grounded scenarios

New Aadhaar enrollment (incl. children), Aadhaar correction, Ration Card
application, Birth Certificate registration, RTI filing, Pothole grievances,
Municipal water issues, Social pensions, PAN–Aadhaar linking, Caste
certificates, Income verification.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind / PostCSS
- LLM-backed reasoning via a structured system prompt (see `lib/`)
- Deployed on [Vercel](https://vercel.com)

## Project structure

```
├── app/            # Next.js app router pages
├── components/     # UI components (chat panel, prompt architecture viewer, document checklist)
├── lib/            # System prompt definitions, grounded reference data, response parsing
└── public/          # Static assets
```

## Running locally

```bash
git clone https://github.com/Abhigyat1211/Prompt-Proj.git
cd Prompt-Proj
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need to add an API key for your LLM provider — see `.env.example`
*(add this file if it doesn't exist yet — see improvements below)*.

## Known limitations / what I'd do next

- Add automated eval cases for the grounded scenarios (right now correctness
  relies on the system prompt being followed, with no test harness).
- Add a `.env.example` so others can run this without guessing which env vars
  are required.
- Expand grounded reference data beyond the initial 8–12 services.
- Add citations/links to the actual official portal for each service inside
  the response itself, not just a generic disclaimer.

---

*This README replaces the default `create-next-app` boilerplate that was
here before — see git history if you want the original scaffold text.*
