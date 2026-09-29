module.exports = {
  apps: [
    {
      name: "cnweb-backend",
      cwd: "/home/ubuntu/CN_Web/b2b-backend/apps/backend",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: "9000",
        STOREFRONT_REVALIDATE_URL:
          "http://127.0.0.1:8000/api/internal/catalog/revalidate",
        REVALIDATE_SECRET:
          "cnweb_catalog_revalidate_secret_2026_prod_v1",
      },
      max_restarts: 10,
      restart_delay: 3000,
      out_file: "/home/ubuntu/CN_Web/logs/backend.out.log",
      error_file: "/home/ubuntu/CN_Web/logs/backend.err.log",
    },
    {
      name: "cnweb-storefront",
      cwd: "/home/ubuntu/CN_Web/b2b-storefront",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: "8000",
        CATALOG_SOURCE: "medusa",
        // SSR must hit Medusa locally. Nginx catch-all sends /store|/health to Next,
        // so https://controlnautas.com as MEDUSA_BACKEND_URL causes 5xx loops.
        MEDUSA_BACKEND_URL: "http://127.0.0.1:9000",
        REVALIDATE_SECRET:
          "cnweb_catalog_revalidate_secret_2026_prod_v1",
      },
      max_restarts: 10,
      restart_delay: 3000,
      out_file: "/home/ubuntu/CN_Web/logs/storefront.out.log",
      error_file: "/home/ubuntu/CN_Web/logs/storefront.err.log",
    },
  ],
};
