import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "https://controlnautas.com",
    vite: (config: any) => {
      return {
        ...config,
        define: {
          ...(config?.define || {}),
          __AUTH_TYPE__: JSON.stringify("jwt"),
        },
        plugins: [
          ...(config?.plugins || []),
          {
            name: "altcha-admin-pow-injector",
            transformIndexHtml(html: string) {
              const script = `
<script>
(function() {
  var originalFetch = window.fetch;
  var cachedPayloadPromise = null;

  async function getAltchaPayload() {
    try {
      var res = await originalFetch('/auth/altcha-challenge');
      var challenge = await res.json();
      if (!challenge || !challenge.challenge) return null;

      var max = challenge.maxnumber || 20000;
      var salt = challenge.salt;
      var target = challenge.challenge;
      var encoder = new TextEncoder();

      for (var i = 1; i <= max; i++) {
        var data = encoder.encode(salt + i);
        var hashBuf = await crypto.subtle.digest('SHA-256', data);
        var hashArr = Array.from(new Uint8Array(hashBuf));
        var hashHex = hashArr.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
        if (hashHex === target) {
          var payloadObj = {
            algorithm: challenge.algorithm,
            challenge: challenge.challenge,
            number: i,
            salt: challenge.salt,
            signature: challenge.signature
          };
          return btoa(JSON.stringify(payloadObj));
        }
      }
    } catch (e) {
      console.warn('Altcha PoW error:', e);
    }
    return null;
  }

  function preload() {
    cachedPayloadPromise = getAltchaPayload();
  }

  preload();
  if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
    window.addEventListener('DOMContentLoaded', preload);
  }

  window.fetch = async function(input, init) {
    var url = '';
    var method = 'GET';
    if (typeof input === 'string') {
      url = input;
      method = (init && init.method) ? init.method.toUpperCase() : 'GET';
    } else if (input instanceof URL) {
      url = input.toString();
      method = (init && init.method) ? init.method.toUpperCase() : 'GET';
    } else if (input && input.url) {
      url = input.url;
      method = input.method ? input.method.toUpperCase() : (init && init.method ? init.method.toUpperCase() : 'GET');
    }

    if (method === 'POST' && url.indexOf('/auth/user/emailpass') !== -1) {
      var payload = cachedPayloadPromise ? await cachedPayloadPromise : null;
      if (!payload) {
        payload = await getAltchaPayload();
      }
      cachedPayloadPromise = getAltchaPayload();

      if (payload) {
        if (input instanceof Request) {
          var headers = new Headers(input.headers);
          if (init && init.headers) {
            new Headers(init.headers).forEach(function(v, k) { headers.set(k, v); });
          }
          headers.set('x-altcha-payload', payload);
          var newReq = new Request(input, { headers: headers });
          return originalFetch.call(this, newReq);
        } else {
          init = init || {};
          var h = new Headers(init.headers || {});
          h.set('x-altcha-payload', payload);
          init.headers = h;
          return originalFetch.call(this, input, init);
        }
      }
    }
    return originalFetch.call(this, input, init);
  };
})();
</script>`
              return html.replace('<head>', '<head>' + script)
            }
          }
        ]
      }
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url:
                process.env.FILE_BACKEND_URL ||
                "https://controlnautas.com/static",
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/b2b-pim",
      key: "b2bPim",
    },
    {
      resolve: "./src/modules/brand",
      key: "brandModuleService",
    },
  ]
})
