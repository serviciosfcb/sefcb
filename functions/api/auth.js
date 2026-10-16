// Inicio de sesión del panel de contenido con GitHub (paso 1 de 2).
// Redirige a GitHub para que la persona autorice el acceso. Requiere en Cloudflare Pages
// las variables GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET de la app OAuth de GitHub.

export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID) {
    return new Response('El panel aún no está configurado: falta GITHUB_CLIENT_ID en Cloudflare Pages.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  authorize.searchParams.set('scope', 'repo');
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      // El valor aleatorio protege contra solicitudes falsificadas; se verifica al volver de GitHub
      'Set-Cookie': `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  });
}
