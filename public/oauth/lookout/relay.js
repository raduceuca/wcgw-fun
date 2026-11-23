(() => {
  const PROVIDERS = new Set(['google', 'instagram', 'tiktok']);
  const ALLOWED_PARAMS = ['code', 'state', 'error', 'error_description', 'error_reason', 'scope', 'scopes'];
  const provider = document.body?.dataset?.provider ?? '';
  const msg = document.getElementById('msg');
  const cta = document.getElementById('cta');

  if (!PROVIDERS.has(provider)) {
    if (msg) msg.textContent = 'Unsupported OAuth provider.';
    return;
  }

  const incoming = new URLSearchParams(window.location.search);
  const state = incoming.get('state') ?? '';
  const hasPayload = incoming.has('code') || incoming.has('error');
  const validState = /^[A-Za-z0-9_-]{16,128}$/.test(state);

  // Immediately scrub ?code=...&state=... from browser address bar & history
  if (window.location.search && window.history?.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }

  if (!hasPayload || !validState) {
    if (msg) {
      msg.textContent = 'Missing or invalid OAuth callback parameters. Start the sign-in flow from Lookout Connectors.';
    }
    return;
  }

  const forwarded = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    if (incoming.has(key)) forwarded.set(key, incoming.get(key) ?? '');
  }

  const target = `http://127.0.0.1:8796/auth/callback/${provider}?${forwarded.toString()}`;
  if (cta) cta.setAttribute('href', target);
  window.location.replace(target);
})();
