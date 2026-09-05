# IMG Delivery Bridge Lab

Purpose: determine the simplest reliable PC ↔ County iPhone architecture for IMG Delivery before rebuilding the production app.

## Target workflow

PC: prepare delivery appointments.

iPhone: open the same upcoming-delivery list, tap an appointment, capture photo + signature, complete receipt, share through Outlook.

There should be no route-file export, QR handoff, email-to-self, local server, firewall prompt, or manual sync in the final workflow.

## Phase 1 — compatibility probe

`index.html` is a standalone diagnostic page. Open the same hosted page on both the County PC and County iPhone and run the tests.

It checks:

- secure HTTPS context
- browser local storage
- Web Share API
- File/Blob support
- camera/photo input
- Clipboard API
- live Share Sheet invocation
- reachability of candidate bridge services: GitHub, GitHub Pages, Supabase, Firebase, Cloudflare, Netlify

Use only fake/test data during this phase.

## Phase 2 — shared queue prototype

Once the PC and phone reports show which HTTPS services are reachable, the repo will be patched with the shared appointment queue using the simplest viable combination.

## Automated regression

`.github/workflows/validate.yml` checks every push/PR for required app markers and JavaScript syntax.

## Hosting note

This repository is currently private. GitHub Pages availability for private repositories depends on GitHub plan/settings. For the easiest zero-install compatibility test, make the repo public if policy permits and enable GitHub Pages from the `main` branch, or use another approved static HTTPS host.
