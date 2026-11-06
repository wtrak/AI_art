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


## Direct Claude API for artist onboarding (Claude Max subscribers)

Musehouse can run its private **Artist Atelier AI curator** directly on the Claude API without using Vercel AI Gateway. Use your Claude Max monthly API credit allowance where eligible:

1. On https://claude.ai navigate to **Settings > Billing > API credits > Link organization** and link a Claude Console organization. Anthropic states eligible Max plans include $100 USD/month of Claude API credits, usually claimable after 7 days on Max; the credits refresh each billing cycle, don't roll over, and are separate from chat usage. Anthropic may change these policies; confirm in your Claude billing UI.
2. Create a key in the linked organization's https://platform.claude.com/settings/keys . Do **not** paste the key into chat or GitHub.
3. Open the Vercel project's **Settings > Environment Variables**. Add `ANTHROPIC_API_KEY` as an **encrypted** server environment variable for Production (and Preview if needed). Optionally set `CLAUDE_ARTIST_MODEL` (default `claude-sonnet-5-5`). Deploy the new environment configuration.
4. Return to https://musehouse-ai-art.vercel.app/atelier.html . The artist AI curator automatically selects **direct Anthropic** whenever `ANTHROPIC_API_KEY` exists; otherwise it falls back to Vercel AI Gateway.

The `PROTOTYPE_ACCESS_CODE` remains in place as a simple demo protection. **Do not expose the key, access code or private creative guides in the public GitHub repo.** The prototype lacks production-grade per-account limits and quotas. Configure spending limits in Claude Console, leave auto-reload off if you want to prevent additional paid charges, and use a separate production-authentication system before inviting actual creators.

Claude handles multimodal reference analysis, clarifying questions, interview and guide compilation. **It does not generate the final artwork.** Image tests still use the separate Vercel AI Gateway route and may require Gateway billing, or another image-generation service to be connected in future.


## AI Gateway free-tier model selection — November 2026

Vercel's AI Gateway may respond with HTTP 403 `RestrictedModelsError` even after adding a valid payment card and receiving the $5 monthly free-credit allowance. This is a **model access tier restriction**, not a missing card. The prior curator model `openai/gpt-5.4-mini` produced this exact error.

The default `ARTIST_INTERVIEW_MODEL` is currently `reflection/beam-free`, a text-only promotional model, with `providerOptions.gateway.has=['free']` to prevent automatic paid fallback. Free-image analysis is currently unavailable because Vercel ended the earlier Ling vision free offering. Uploads of images/PDFs return a clear error on this free route; text interviews remain available if the free provider accepts the request. The default is for **nonconfidential pilot experiments only**. The model and its inference provider may have different data handling from premium providers; do not upload valuable unpublished works or private artist techniques until provider terms, data handling, and creator consent are reviewed.

When the project has purchased AI Gateway credits or a direct provider key, you can override `ARTIST_INTERVIEW_MODEL` to a higher-quality model such as `openai/gpt-5.4-mini`, or set `ANTHROPIC_API_KEY` for direct Claude artist interviewing. For now, the user should not need to buy paid AI Gateway credits to test the curator's free-model path. Availability and restrictions can change.

Model access can remain blocked until Gateway account credit-tier activation; the $5 promotional balance is not equivalent to purchased AI Gateway credits. The **Check AI connection** button sends only the fixed prompt `Reply with OK.` and no art or interview data. Failures are logged with a short diagnostic ID, upstream status, sanitized error message, selected model and action. If an upstream provider rejects the model due to free-tier restrictions, Musehouse now returns `GATEWAY_MODEL_RESTRICTED` instead of an unhelpful generic error.

The **artwork generation and artist image-test** model (`GATEWAY_IMAGE_MODEL`) is separately configured and may still require paid credits; free text/vision interviewing does not guarantee free image generation.
