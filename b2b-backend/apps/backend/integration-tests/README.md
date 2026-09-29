# Pruebas automatizadas del backend

## Requisito previo: PostgreSQL de pruebas

Las pruebas de integración **nunca** deben apuntar al PostgreSQL de producción
(`medusa-db`, puerto 5432). El runner de Medusa crea y destruye bases de datos
por cada ejecución, de modo que apuntarlo a producción sería destructivo.

Antes de ejecutarlas, levante la instancia desechable:

```bash
docker run -d --name medusa-test-db \
  -e POSTGRES_PASSWORD=test -e POSTGRES_USER=postgres \
  -p 127.0.0.1:55432:5432 postgres:15
```

Para detenerla y borrarla:

```bash
docker rm -f medusa-test-db
```

La configuración vive en `.env.test`, que apunta al puerto 55432.

## Ejecución

```bash
npm run test:unit               # validadores y logica pura, sin base de datos
npm run test:integration:http   # contrato HTTP de la API Admin
```

## Detalles que cuesta descubrir

**`DB_HOST` debe decir `localhost`, no `127.0.0.1`.** El runner activa SSL salvo
que la URL de conexión contenga literalmente la cadena `localhost`
(`@medusajs/test-utils/dist/medusa-test-runner-utils/config.js`). Con la IP
numérica intenta TLS contra un servidor que no lo ofrece y la conexión se cuelga
hasta agotar el pool, con un error que no menciona SSL en ningún momento.

**No defina `DATABASE_URL` en `.env.test`.** El runner genera una base efímera
por ejecución e inyecta su URL en la configuración. Fijarla a mano la
sobrescribe y la aplicación intenta conectarse a una base que no existe.

**`integration-tests/setup.js` carga el entorno.** `@medusajs/test-utils` captura
las credenciales de PostgreSQL en constantes de módulo al ser importado, así que
el entorno debe estar cargado antes de que las suites lo importen.

**La autenticación no pasa por el login.** `helpers/create-admin-user.ts` firma
el JWT directamente, porque `POST /auth/user/emailpass` exige el proof-of-work
de ALTCHA (ver `src/api/middlewares.ts`). El helper
`helpers/admin-auth.js` sí resuelve el PoW y sirve para pruebas manuales contra
un servidor en marcha.

## Cobertura actual

- `src/api/admin/products/[id]/pim/__tests__/validators.unit.spec.ts` — 32
  pruebas del contrato de validación: normalización de texto, rechazo de claves
  desconocidas, URLs admitidas, reglas de disponibilidad y plazo (decisión D5),
  especificaciones técnicas y límites SEO.
- `integration-tests/http/pim.spec.ts` — 12 pruebas del contrato HTTP: lectura
  sin datos, 404, 401, creación (201), actualización (200), idempotencia,
  normalización y los distintos rechazos con 400.
