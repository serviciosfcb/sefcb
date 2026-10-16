// Inicio de sesión del panel de contenido con GitHub (paso 2 de 2).
// GitHub vuelve aquí con un código; se cambia por un token y se entrega solo
// a la ventana del panel en este mismo dominio.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') || '';
  const saved = (cookie.match(/(?:^|;\s*)cms_oauth_state=([^;]+)/) || [])[1];

  if (!code || !state || !saved || state !== saved) {
    return page(url.origin, 'error', { message: 'La sesión de inicio no es válida o expiró. Cierre esta ventana e intente de nuevo.' });
  }

  let data = {};
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'sefcb-panel' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/api/callback`,
      }),
    });
    data = await res.json();
  } catch {
    return page(url.origin, 'error', { message: 'No fue posible comunicarse con GitHub. Intente de nuevo en unos minutos.' });
  }

  if (!data.access_token) {
    return page(url.origin, 'error', { message: data.error_description || 'GitHub no autorizó el acceso.' });
  }
  return page(url.origin, 'success', { token: data.access_token, provider: 'github' });
}

function page(origin, status, content) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const safe = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
  const text = status === 'success' ? 'Ingreso correcto. Esta ventana se cerrará sola.' : escapeHtml(content.message);
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Panel de contenido</title>
<style>body{font:16px/1.5 system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;color:#1c1a19;background:#f2f2f0;text-align:center}</style>
</head><body><p>${text}</p>
<script>
(function () {
  var origin = ${safe(origin)};
  var message = ${safe(message)};
  function receive(e) {
    if (e.origin !== origin) return;
    window.removeEventListener('message', receive);
    window.opener.postMessage(message, origin);
    ${status === 'success' ? 'setTimeout(function () { window.close(); }, 400);' : ''}
  }
  if (window.opener) {
    window.addEventListener('message', receive, false);
    window.opener.postMessage('authorizing:github', origin);
  }
})();
</script></body></html>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': 'cms_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
