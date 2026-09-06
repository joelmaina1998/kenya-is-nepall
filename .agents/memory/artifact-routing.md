---
name: Artifact routing
description: Routing considerations when a Next app owns its own API routes in this workspace
---

When a web artifact contains Next.js `/api/*` routes, no separate artifact service should claim the `/api` path; the most-specific proxy route wins and can send requests away from the app.

**Why:** The workspace API scaffold originally claimed `/api`, which made the app's working routes return gateway errors even though the Next server was healthy.

**How to apply:** Keep generic API services on a non-overlapping path or remove their route claim before validating or publishing a Next-based web artifact.