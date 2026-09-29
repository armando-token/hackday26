import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260626013101 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "pim_info" ("id" text not null, "product_id" text not null, "technical_pdf" text null, "manual_pdf" text null, "ip_certification" text null, "voltage" text null, "thread_size" text null, "material" text null, "oem_brand" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pim_info_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pim_info_deleted_at" ON "pim_info" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pim_info" cascade;`);
  }

}
