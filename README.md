# Musehouse — artist-owned creative engines

A live, self-serve prototype built for `AI_art`. This is a **creative engine marketplace, not a commission marketplace**. Customers explore creators, pick a private engine, create inside an AI portal, and receive results without contacting the artist.

**Live site:** https://musehouse-ai-art.vercel.app  
**Repository:** https://github.com/wtrak/AI_art

## What's working now

- Discovery page with eight visual engines across four **fictional** pilot creators, plus a future music-engine concept.
- Multiple specialized engines per creator, artist pages, discovery categories and search, saved engines.
- Interactive portal: choose engine, write a prompt, optional image upload, canvas aspect ratio, influence strength.
- Offline procedural style studies to explore the interface; these are **not AI outputs** and should not be mistaken for them.
- AI generation using Vercel AI Gateway with `generateImage`, or a direct OpenAI API fallback, via a private server route. **Live AI calls require configured billing/access and must be smoke-tested by an authorized user.**
- Creator workshop for *local browser-only drafts*. These drafts are not published, not encrypted and not wired to live AI.
- Download of results, local history, saved outputs and simulated credit accounting.
- Illustrative subscription/royalty allocation model (no billing, no actual payments, no real payouts).

## Private AI setup

The app is deployed on Vercel. To activate real AI generation, open **Vercel → musehouse-ai-art → Settings → Environment Variables**:

- `PROTOTYPE_ACCESS_CODE` (required): private site-owner access code. Already configured in Vercel. Treat as a shared secret, **do not post publicly**.
- `VERCEL_OIDC_TOKEN` (automatically provided in supported deployments): allows the Vercel AI SDK to authenticate through AI Gateway. Alternatively set `AI_GATEWAY_API_KEY`, or `OPENAI_API_KEY` for the direct-image-API fallback.
- `GATEWAY_IMAGE_MODEL` (optional): defaults to `openai/gpt-image-2.5-flare`.
- `PRIVATE_STYLE_RECIPES_JSON` (optional, server-only): JSON map of published engine ID → full licensed private workflow, e.g. `{"sunprint":"PRIVATE RECIPE FROM A CONSENTING CREATOR","streetlight":"..." }`. Keep this out of GitHub and client code.
- `PRIVATE_STYLE_RULES_JSON` (optional): JSON map of published engine ID → restriction flags, e.g. `{"sunprint":{"prohibitedTerms":["political campaign"],"acceptPhotoEdits":false}}`.
- `REQUIRE_PRIVATE_RECIPES=true`: disables fallback demonstration styles, so no engine can run until a licensed private workflow is installed. **Enable this before opening real artist engines to customers.**

The exposed API route is `POST /api/generate`, accepts only a published engine ID, never a recipe from the browser, and returns only an image. The prompt/workflow is **not returned to the client**, but generating images with a third-party model requires sending private instructions and user inputs to that provider. Artists must consent to this processing. A style can still be statistically imitated from observed outputs, so do not promise perfect secrecy or exclusivity.

## Run locally

`index.html`, `styles.css` and `app.js` can be opened directly, with style studies available offline. To run the serverless API locally, use `npx vercel dev` with the appropriate environment configured in your own Vercel project.

## What is **not** implemented yet

Persistent authentication and creator accounts, an encrypted private-style vault, creator onboarding/verification, real payments and subscriptions, server-side generation credits and spend quotas, rate limiting, abuse prevention, real royalties/tax reporting/payouts, commercial licensing contracts, image safety pipeline, privacy/consent for uploaded photos, and actual audio/music generation.

**Safety note:** The access code is a modest beta gate, not production authorization. Browser “credits” are stored in localStorage and are easily reset. **Do not publish the access code or allow unrestricted API use until proper authenticated server-side metering, billing and abuse controls exist.** 

## Design intent

A joyful shared creative space, closer to an art club than a professional-services listing site. The product centers **artist-made private engines as products**. Users never book the artist, submit a commission to them, or wait on manual approval.
