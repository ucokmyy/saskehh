    const PROXY_PATHS = [
      /^\/api\/(?:game|music|chat|dashboard)(?:\/|$)/,
      /^\/game(?:\/|$)/,
      /^\/dashboard\/(?:game|profile)\/?$/,
      /^\/playground-assets\/(?:core|chat)\.(?:css|js)$/,
      /^\/ytplay\/[A-Za-z0-9_-]+\/socket$/,
      /^\/bucin\/?$/,
      /^\/(?:duck|tebak-kata|akinator|gudang-dorong|benteng-saskeh)\/?$/,
    ];

    function shouldProxy(pathname) {
      return PROXY_PATHS.some((pattern) => pattern.test(pathname));
    }

    function errorResponse(message, status) {
      return new Response(message, {
        status,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store',
        },
      });
    }

    export async function onRequest(context) {
      const { request, env, next } = context;
      const incomingUrl = new URL(request.url);

      if (!shouldProxy(incomingUrl.pathname)) {
        return next();
      }

      const configuredOrigin = String(env.BACKEND_ORIGIN || '').trim();
      if (!configuredOrigin) {
        return errorResponse(
          'Backend belum dikonfigurasi. Tambahkan BACKEND_ORIGIN di Cloudflare Pages > Settings > Variables and Secrets.',
          503,
        );
      }

      let backendOrigin;
      try {
        backendOrigin = new URL(configuredOrigin);
        if (!['https:', 'http:'].includes(backendOrigin.protocol)) throw new Error('invalid protocol');
        if (backendOrigin.username || backendOrigin.password || backendOrigin.search || backendOrigin.hash) {
          throw new Error('invalid origin');
        }
        backendOrigin.pathname = backendOrigin.pathname.replace(/\/+$/, '') || '/';
      } catch {
        return errorResponse('BACKEND_ORIGIN tidak valid. Gunakan URL HTTP/HTTPS server bot tanpa query.', 500);
      }

      const upstreamUrl = new URL(
        `${incomingUrl.pathname}${incomingUrl.search}`,
        backendOrigin,
      );
      const headers = new Headers(request.headers);
      headers.delete('host');
      headers.set('x-forwarded-host', incomingUrl.host);
      headers.set('x-forwarded-proto', incomingUrl.protocol.slice(0, -1));

      const init = {
        method: request.method,
        headers,
        redirect: 'manual',
      };

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        init.body = request.body;
      }

      try {
        const upstreamRequest = new Request(upstreamUrl, init);
        const response = await fetch(upstreamRequest);

        // Preserve the WebSocket handshake returned by the origin.
        if (response.webSocket) return response;

        if (incomingUrl.pathname.startsWith('/api/')) {
          const responseHeaders = new Headers(response.headers);
          responseHeaders.set('cache-control', 'no-store');
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
          });
        }

        return response;
      } catch {
        return errorResponse(
          'Tidak dapat terhubung ke backend Saskeh. Periksa proses bot, port WebView, dan URL Cloudflare Tunnel.',
          502,
        );
      }
    }
