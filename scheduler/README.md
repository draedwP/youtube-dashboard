# Reliable scheduled trigger

GitHub's scheduled workflow events have repeatedly been delayed by several hours. This optional Cloudflare Worker sends a `workflow_dispatch` to the existing GitHub Action twice per hour. GitHub Pages remains the dashboard host, and `YOUTUBE_API_KEY` remains in the repository's Actions secret.

## Activate

1. Create a fine-grained GitHub personal access token scoped only to `draedwP/youtube-dashboard`. Grant **Actions: Read and write**. No Contents permission is needed for this token. Choose an expiration and renew it before expiry.
2. Log into Cloudflare and deploy this Worker from the `scheduler` directory using Wrangler: `npx wrangler deploy`. The Worker does not expose a website (`workers_dev: false`). Alternatively create a Worker through Cloudflare's dashboard, paste `worker.mjs`, and configure cron triggers for `13,43 * * * *` UTC.
3. Set `GITHUB_ACTIONS_TOKEN` as a Cloudflare Worker **secret**, using `npx wrangler secret put GITHUB_ACTIONS_TOKEN` or the dashboard's secret editor. Do not add it to the repository or send it in chat. Cron changes can take several minutes to propagate.
4. Confirm a `workflow_dispatch` run appears in the repository Actions tab, and check the dashboard's published `Last collected` time. Only after two successful external triggers, remove the GitHub `schedule` block in `.github/workflows/update.yml`; keep `workflow_dispatch` and `push`.

If the Worker has no logs, pull these changes and run `npx wrangler deploy` again from `scheduler`. Check Workers & Pages → `channel-pulse-scheduler` → Settings → Triggers for `13,43 * * * *` (UTC), and Settings → Variables and Secrets for the *name* `GITHUB_ACTIONS_TOKEN`. Open Observability after the next :13 or :43. A `Scheduled trigger started` log confirms the Cron Trigger; `GitHub workflow dispatch accepted` confirms GitHub accepted the request. If it logs HTTP 401/403, fix the token's Actions permission and expiry. Never share the token value or full logs containing credentials.

The Worker checks for HTTP 204 from GitHub and raises an error otherwise. Keep GitHub's built-in schedule enabled as a fallback until verified. GitHub's workflow still avoids YouTube API collection when its most recent snapshot is younger than 25 minutes.
