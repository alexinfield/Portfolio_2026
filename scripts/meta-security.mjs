import { createHash } from 'node:crypto';

// Run after every HTML rewrite, including redirect scripts and RSC payloads.
export function secureHtml(html) {
  // Public companion documents may use HTML's implicit head. Materialize it
  // before placing a meta policy so it also precedes resource discovery.
  if (!/<head[\s>]/i.test(html)) {
    html = html.replace(/(<html\b[^>]*>)/i, '$1<head>').replace(/<body\b/i, '</head><body');
  }
  html = html.replace(/<meta\b(?=[^>]*http-equiv="Content-Security-Policy")[^>]*>/gi, '');
  const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([,attrs,body]) => !/\bsrc\s*=/i.test(attrs) && body)
    .map(([, ,body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  const policy = [
    "default-src 'self'",
    `script-src 'self' ${[...new Set(hashes)].join(' ')} https://www.googletagmanager.com https://*.clarity.ms`,
    "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com https://*.g.doubleclick.net https://*.clarity.ms https://c.bing.com",
    "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://www.google.com https://*.g.doubleclick.net https://*.clarity.ms https://c.bing.com",
    "style-src 'self' 'unsafe-inline'", "font-src 'self'", "media-src 'self'", "worker-src 'none'", "frame-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'none'", "upgrade-insecure-requests",
  ].join('; ');
  return html.replace(/<head>(\s*<meta\b[^>]*\bcharset\s*=[^>]*>)?/i,
    (_match, charset = '') => `<head>${charset}<meta http-equiv="Content-Security-Policy" content="${policy}"/>`);
}
