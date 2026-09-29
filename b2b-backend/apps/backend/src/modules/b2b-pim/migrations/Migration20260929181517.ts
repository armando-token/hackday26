import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260929181517 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "technical_profile" drop constraint if exists "technical_profile_variant_id_unique";`);
    this.addSql(`create table if not exists "technical_fact" ("id" text not null, "variant_id" text not null, "property" text check ("property" in ('mounting', 'supply_voltage', 'analog_input', 'analog_output', 'protocol', 'interface', 'sensor_element', 'control_function')) not null, "normalized_value_json" jsonb null, "display_value" text null, "source_id" text null, "page" integer null, "section" text null, "excerpt" text null, "polarity" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "technical_fact_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technical_fact_deleted_at" ON "technical_fact" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technical_fact_variant_id" ON "technical_fact" ("variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technical_fact_property" ON "technical_fact" ("property") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technical_fact_source_id" ON "technical_fact" ("source_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technical_fact_variant_property" ON "technical_fact" ("variant_id", "property") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "technical_profile" ("id" text not null, "variant_id" text not null, "model" text null, "revision" text null, "demo" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "technical_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_technical_profile_variant_id_unique" ON "technical_profile" ("variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technical_profile_deleted_at" ON "technical_profile" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technical_profile_variant_id" ON "technical_profile" ("variant_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "technical_source" ("id" text not null, "url" text null, "kind" text null, "revision" text null, "checksum" text null, "published_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "technical_source_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technical_source_deleted_at" ON "technical_source" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technical_source_url" ON "technical_source" ("url") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_technical_source_checksum" ON "technical_source" ("checksum") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "technical_fact" cascade;`);

    this.addSql(`drop table if exists "technical_profile" cascade;`);

    this.addSql(`drop table if exists "technical_source" cascade;`);
  }

}
