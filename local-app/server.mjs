import { createServer } from 'node:http';
import nodemailer from 'nodemailer';

const port = Number(process.env.API_PORT ?? 3000);
const redditUsername = process.env.REDDIT_USERNAME ?? 'Timschweizerch';
const userAgent = process.env.REDDIT_USER_AGENT ?? 'web:tim-schweizer-portfolio:v1.0 (by u/Timschweizerch)';
const githubUsername = process.env.GITHUB_USERNAME ?? 'TimSchweizer441';
const contactEmail = 'timschweizer.ch@gmail.com';

class HttpError extends Error {
  constructor(statusCode, code) {
    super(code);
    this.statusCode = statusCode;
  }
}

if (!/^[A-Za-z0-9_-]{3,20}$/.test(redditUsername)) {
  throw new Error('REDDIT_USERNAME must be a valid Reddit username.');
}
if (!/^[A-Za-z0-9-]{1,39}$/.test(githubUsername)) {
  throw new Error('GITHUB_USERNAME must be a valid GitHub username.');
}

let accessToken;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const error = new Error('Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in local-app/.env.');
    error.statusCode = 503;
    throw error;
  }

  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': userAgent,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });

  if (!response.ok) {
    throw new Error(`Reddit OAuth returned HTTP ${response.status}.`);
  }

  const token = await response.json();
  if (typeof token.access_token !== 'string' || typeof token.expires_in !== 'number') {
    throw new Error('Reddit OAuth returned an invalid access token response.');
  }

  accessToken = token.access_token;
  tokenExpiresAt = Date.now() + Math.max(0, token.expires_in - 60) * 1000;
  return accessToken;
}

async function getRedditPosts() {
  const token = await getAccessToken();
  const url = new URL(`https://oauth.reddit.com/user/${encodeURIComponent(redditUsername)}/submitted`);
  url.searchParams.set('limit', '10');
  url.searchParams.set('raw_json', '1');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': userAgent,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Reddit API returned HTTP ${response.status}.`);
  }

  const listing = await response.json();
  if (!Array.isArray(listing?.data?.children)) {
    throw new Error('Reddit API returned an invalid post listing.');
  }

  return listing.data.children.map(({ data: post }) => ({
    id: post.id,
    title: post.title,
    subreddit: post.subreddit_name_prefixed ?? `r/${post.subreddit}`,
    permalink: `https://www.reddit.com${post.permalink}`,
    selftext: post.selftext ?? '',
    createdUtc: post.created_utc,
    score: post.score,
    numComments: post.num_comments,
    viewCount: typeof post.view_count === 'number' ? post.view_count : null,
  }));
}

async function getGitHubRepositories() {
  const url = new URL(`https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos`);
  url.searchParams.set('type', 'owner');
  url.searchParams.set('sort', 'updated');
  url.searchParams.set('per_page', '6');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tim-schweizer-portfolio',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned HTTP ${response.status}.`);
  }

  const repositories = await response.json();
  if (!Array.isArray(repositories)) {
    throw new Error('GitHub API returned an invalid repository listing.');
  }

  return repositories.map((repository) => {
    if (
      typeof repository.id !== 'number' ||
      typeof repository.name !== 'string' ||
      typeof repository.html_url !== 'string' ||
      typeof repository.stargazers_count !== 'number' ||
      typeof repository.forks_count !== 'number' ||
      typeof repository.updated_at !== 'string'
    ) {
      throw new Error('GitHub API returned an invalid repository.');
    }

    return {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      htmlUrl: repository.html_url,
      description: typeof repository.description === 'string' ? repository.description : null,
      language: typeof repository.language === 'string' ? repository.language : null,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      updatedAt: repository.updated_at,
    };
  });
}

async function readJsonBody(request, maxBytes = 10_000) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) {
      throw new HttpError(413, 'invalid_contact');
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'invalid_contact');
  }
}

function validateContactMessage(payload) {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof payload.name !== 'string' ||
    typeof payload.email !== 'string' ||
    typeof payload.message !== 'string'
  ) {
    throw new HttpError(400, 'invalid_contact');
  }

  const name = payload.name.trim();
  const email = payload.email.trim();
  const message = payload.message.trim();

  if (
    name.length < 1 ||
    name.length > 100 ||
    /[\r\n]/.test(name) ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    message.length < 1 ||
    message.length > 5000
  ) {
    throw new HttpError(400, 'invalid_contact');
  }

  return { name, email, message };
}

async function sendContactEmail({ name, email, message }) {
  const smtpUser = process.env.SMTP_USER;
  const smtpAppPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '');

  if (!smtpUser || !smtpAppPassword) {
    throw new HttpError(503, 'email_not_configured');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpAppPassword },
  });

  try {
    await transporter.sendMail({
      from: `Portfolio-Kontakt <${smtpUser}>`,
      to: contactEmail,
      replyTo: email,
      subject: `Neue Nachricht von ${name}`,
      text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
    });
  } catch (error) {
    console.error('Contact email delivery failed:', error instanceof Error ? error.message : 'Unknown SMTP error');
    throw new HttpError(502, 'email_delivery_failed');
  } finally {
    transporter.close();
  }
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/contact') {
    try {
      if (!request.headers['content-type']?.includes('application/json')) {
        throw new HttpError(415, 'invalid_contact');
      }
      const payload = validateContactMessage(await readJsonBody(request));
      await sendContactEmail(payload);
      sendJson(response, 200, { message: 'sent' });
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      const errorCode = error instanceof HttpError ? error.message : 'email_delivery_failed';
      sendJson(response, statusCode, { error: errorCode });
    }
    return;
  }

  if (request.method !== 'GET' || !['/api/reddit/posts', '/api/github/repos'].includes(request.url)) {
    sendJson(response, 404, { error: 'Not found.' });
    return;
  }

  try {
    if (request.url === '/api/reddit/posts') {
      sendJson(response, 200, { posts: await getRedditPosts() });
      return;
    }
    sendJson(response, 200, { repositories: await getGitHubRepositories() });
  } catch (error) {
    const statusCode = error instanceof HttpError ? error.statusCode : Number.isInteger(error.statusCode) ? error.statusCode : 502;
    console.error(error);
    sendJson(response, statusCode, { error: error instanceof Error ? error.message : 'Request failed.' });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Reddit API proxy listening on http://127.0.0.1:${port}`);
});
