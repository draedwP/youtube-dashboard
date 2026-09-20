# Channel Pulse

GitHub Pages dashboard tracking @theovonaction, @ducktheoryone, @foxbarra and @ManBarra.

## Setup

1. Create a repository named `youtube-dashboard`, with default branch `main`, and upload this project's contents including `.github/workflows/update.yml`.
2. In Google Cloud, enable **YouTube Data API v3**, create an API key and restrict it to that API. Scheduled GitHub runners do not have fixed IP addresses; do not apply browser-referrer restrictions to this server key.
3. In the repository: Settings → Secrets and variables → Actions → New repository secret. Name: `YOUTUBE_API_KEY`. Paste the key there, never in source code.
4. Settings → Pages → Source: **GitHub Actions**.
5. Actions → Collect snapshots and publish → Run workflow.

The site will be at https://draedwP.github.io/youtube-dashboard/ once deployment succeeds. GitHub account/plan rules determine Pages availability for private repositories. A public repository and its snapshot history are public; the deployed site is also public.

## Data and limits

Collection is scheduled twice per hour. GitHub can delay or skip scheduled runs; inactive public repositories can have schedules disabled. The page displays the collection timestamp and warns after one hour without data. Refresh reloads the published snapshot, not YouTube directly.

The 48h increase subtracts the newest stored channel counter at or before 48 hours ago, with a maximum baseline age of 49 hours. Until a qualifying baseline exists it displays a dash. This avoids presenting a partial window as 48 hours. Exact compared timestamp is shown. Seven days of snapshots are retained in the current file (older records remain in Git history).

Channel counters can change due to corrections, deleted/private videos and reporting delays. Negative increases are retained. This is not Studio realtime analytics or a sum of hourly viewing events. Latest public video is selected by publication time from the newest 50 uploads; scheduled upcoming broadcasts are excluded. Shorts are included. All channel reads must succeed before new snapshot files are written; failure leaves the last published data intact.

No OAuth is needed for public counts. No API key is included in the website. Four channels use approximately 12 API units per run (576/day) with the current requests. Actual quota is governed by Google.

Local preview: `python3 -m http.server 8000 --directory dist`. Collector: `YOUTUBE_API_KEY=... node scripts/collect.mjs` (prefer setting the environment securely rather than typing a key into shell history).
