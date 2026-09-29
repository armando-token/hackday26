const { loadEnv } = require("@medusajs/utils")

// `@medusajs/test-utils` captura las credenciales de PostgreSQL en constantes
// de modulo al ser importado. Si `.env.test` no esta cargado en ese instante,
// se queda con los valores por defecto (localhost:5432, usuario vacio) y la
// creacion de la base efimera falla con un timeout de conexion poco
// informativo. Cargar el entorno aqui, en `setupFiles`, garantiza que ocurra
// antes de que las suites importen test-utils.
loadEnv("test", process.cwd())

const { MetadataStorage } = require("@mikro-orm/core")

// MikroORM registra los metadatos de las entidades en un singleton global. Sin
// limpiarlo antes de cada worker de Jest, los modulos cargados por varias
// suites chocan con errores de entidad duplicada.
MetadataStorage.clear()
