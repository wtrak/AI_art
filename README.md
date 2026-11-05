# MUSEHOUSE — creative engines by real artists

A customer-facing, self-service AI creation portal prototype. Artists build a private, reusable creative workflow; subscribers pick a specific engine, make creations independently, and support the artists through usage-based royalty allocation.

This is **not** an artist commission system. No customer-to-artist contact is required.

## Run locally
Open `index.html` in a browser. The client-only creative style-study mode works without an account. For a local API server, run `npx vercel dev` with the environment variables below.

## Live AI mode
Deploy as a Vercel project linked to this GitHub repo. Configure these Vercel server environment variables:
- `OPENAI_API_KEY` — private API key, never place in a public repo or client JS
- `PROTOTYPE_ACCESS_CODE` — an access code to prevent publicly accessible paid generations; do not reuse an important password
- `PRIVATE_STYLE_RECIPES_JSON` — optional JSON object mapping IDs to private artist-authored style recipes (e.g. `{"sunprint":"licensed workflow...", "streetlight":"licensed workflow..."}`). This must be stored **only** server-side, with rights/permission to use the material.
- `IMAGE_MODEL` — optional, defaults to `gpt-image-2.5-flare`

The image route is `POST /api/generate`, and supports text-to-image and editing an uploaded reference photograph. The server injects the private recipe after validating the selected engine, and returns **only the final image**, never the private prompt or recipe. Real private recipes must not be included in this public GitHub repository. Client-side demo art is labeled as procedural style studies rather than AI generations.

The route enforces a basic access code, input limits, and server-side controls, but **does not yet implement production-grade authentication, billing, rate limits, payouts, or abuse prevention**. Do not distribute the access code publicly or enable paid API traffic at scale before adding those safeguards.

## Features
- Creator discovery and editorial gallery, creator profiles, multiple engines per creator
- Interactive AI workstation with prompt inputs, aspect ratio, influence dial, starter suggestions and optional user photo
- Local visual style-study rendering with PNG download and history, so testing works before AI billing is connected
- Real server-side generation path for GPT Image with a configured API key
- Saved engines and generation history (browser localStorage demo)
- Artist's creator studio mock-up to edit draft public listings and private-workflow placeholders, saved locally only
- Subscription allocation simulator, and artist royalty dashboard illustrative mock-up

## Rights & economics
All pilot artists, identities, and recipes are fictional. Artists must opt in and grant express, scope-limited licenses for any real style or reference assets. The code cannot guarantee someone could never reverse engineer a style from finished works. We can avoid distributing the recipes themselves.

Subscription pricing and artist payouts shown in the demo are **illustrative, not transactions or actual accounts**. A payout system should use settled net revenue after taxes/refunds, direct image-generation costs, payment fees and fraud, with a disclosed artist revenue pool attributed to measured qualifying usage.

## Future work
Authentication; consent/versioned private style vault; moderation; secure user uploads; database and idempotent metering; actual payments and revenue settlements; platform-specific media generation adapters (images, photography, audio); export and commercial licensing controls; creator analytics.

Built as HTML, CSS, modern browser JavaScript and a Vercel serverless Node function without a frontend build step.
