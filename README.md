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


## Current AI curator configuration

Musehouse Artist Atelier uses **GPT-4.1 Mini** through the owner's paid Vercel AI Gateway balance by default (`ARTIST_INTERVIEW_MODEL=openai/gpt-4.1-mini`), enabling text, image and PDF analysis. The previous free-only text curator and its image-analysis block are no longer active. The optional direct Claude API integration remains supported by setting `ANTHROPIC_API_KEY` in Vercel. The interactive art-image testing engine is configured separately by `GATEWAY_IMAGE_MODEL`.

## Multiple artists and engines during the pilot

Artist Atelier now provides a **Profile Library**:

- `+ New artist / engine`: make another independent draft without overwriting your existing one.
- Open an artist/engine card to continue its interview, guide, and creative decisions.
- Duplicate to build multiple engines for one artist, reset **only** the current draft, or delete individual local drafts after confirmation.
- Export a profile JSON (artist details, interview, analysis, compiled guide and notes) to back it up or deliver it confidentially to the project owner. Import JSON creates another independent profile.
- Earlier single-draft `musehouse_creator_draft` data is migrated to the profile library on first visit. The old localStorage record is left intact as a backup.
- Reference images/PDF bytes are only kept in **browser memory**; they do not persist through a page reload and are not embedded in export JSON. Re-uploading a file with the same name reattaches it to the original annotation.

**Sharing an invite link is possible now:** https://musehouse-ai-art.vercel.app/atelier.html . Each tester independently builds their own drafts using browser-local storage. However, the prototype has **no creator signup, cloud-synced profiles, private server-side artist vault or administrator view of other people's drafts**. Those require an authenticated database-backed onboarding system. Ask testers to export their private profile JSON and send it directly to the owner for review.

Do not publicly share the owner's `PROTOTYPE_ACCESS_CODE`. Any person with that code could invoke API calls against the owner's prepaid AI Gateway budget, and the prototype lacks durable per-user rate limits and billing quotas. Invite trusted pilot artists only until real accounts, permissions and server-side credit metering exist.

## Production requirements before broader invitations

Implement individual artist authentication; private, access-controlled, encrypted reference and recipe storage; versioned engine IDs; explicit creator opt-in and licensing terms; quotas and spend tracking on the server; secure exports; moderation; creator analytics; an owner approval workflow; and deletion/retention controls. Avoid claiming the existing browser-local data is a protected, centrally hosted creator account.

## Creative DNA depth upgrades (November 2026)

This prototype deliberately distinguishes **research coverage** from **stylistic fidelity**. Research coverage is a cumulative checklist that does not fall merely because the model estimates a lower number in the next turn. It is **not** a scientifically validated measure of understanding or proof that an AI output faithfully represents the artist.

### Problems corrected
- Old behavior: a model-controlled `readiness` field overwrote progress every turn, often oscillating around 45–50%.
- Old behavior: server sent only the latest 26 chat messages; the artist's growing insights stored in the browser were NOT included in the model request.
- New: a persistent, source-aware artist rule ledger and creative north star are sent to each interview and guide compilation. A curated payload puts long-term rules before recent dialogue so the key principles survive lengthy sessions.

### Capture more than appearance
- Artists fill three optional creative north-star statements: intended emotional consequence, central conceptual principle, and deliberate sacrifices or exceptions.
- Uploaded references can be labeled `signature` (positive), `exception` (legitimate rule-break), or `near-miss` (looks similar but fails artist identity). The curator compares them instead of blindly averaging a single style.
- New `audit` action critically analyzes unanswered conceptual or emotional questions, contradictions and earlier failed tests.
- The sidebar tracks ten research dimensions (including emotion, concept, trade-offs, and quality evaluation) and lets creators explicitly approve or dispute proposed rules. Disputed interpretations stay in the memory ledger as rejections, not instructions to reproduce.
- New compiled-guide fields: `emotionalLogic`, `conceptualLogic`, `priorityHierarchy` and `counterexamples`, alongside composition, color, materials, subject adaptation, ordered instructions, and quality checks.
- A `test` action first creates a specific visual scene interpretation from the private guide and then sends that plan to the image model. It returns a private artist-facing explanation of what decisions the AI applied, making corrections easier.

### Model routing and costs
- `ARTIST_INTERVIEW_MODEL` default: `openai/gpt-5.4-mini`. Handles interview turns and multimodal reference analysis; higher capability than the original GPT-4.1 Mini configuration.
- `ARTIST_DEEP_MODEL` default: `openai/gpt-5.4`. Handles intentionally requested deep blind-spot audits and compiling/refining private guides, which use more prepaid AI Gateway credits.
- `GATEWAY_IMAGE_MODEL`: independent image generator. Artist test requests also make a small extra language-model call to interpret the scene prior to generation.
- If `ANTHROPIC_API_KEY` is set, artist interviews and guide compilation use direct Anthropic; image generation remains separate.

### Pilot limitations
AI may still misunderstand emotion or conceptual decisions; only the **participating artist** can accept the result. Neither completion percentage nor text similarity is a fidelity guarantee. Artist records remain browser-local, and there is no server-side per-user usage accounting or protected private art library. Original image binaries remain in browser memory only. Do not distribute owner pilot access credentials to an uncontrolled public audience.

### Suggested evaluation
Test the same engine on 5–10 diverse subjects, some entirely unlike its source work. For each output, ask the artist whether the emotion, central contradiction, compositional trade-offs, material carrier, and purposeful omissions are preserved—not merely the palette or decorative motifs. Record near-misses and feed their exact failure reasons back into the guide. Repeat until the artist considers the engine reliably representative.
