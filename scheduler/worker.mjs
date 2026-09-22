const DISPATCH_URL = 'https://api.github.com/repos/draedwP/youtube-dashboard/actions/workflows/update.yml/dispatches';

export async function dispatch(env, fetcher = fetch) {
  if (!env.GITHUB_ACTIONS_TOKEN) throw new Error('GITHUB_ACTIONS_TOKEN is not configured');
  const response = await fetcher(DISPATCH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.GITHUB_ACTIONS_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'channel-pulse-scheduler',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ ref: 'main' }),
  });
  if (response.status !== 204) throw new Error(`GitHub workflow dispatch failed: HTTP ${response.status}`);
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(dispatch(env));
  },
};
