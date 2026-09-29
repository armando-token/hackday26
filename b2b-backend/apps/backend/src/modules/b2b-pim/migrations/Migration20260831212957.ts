import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831212957 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pim_info" drop constraint if exists "pim_info_product_id_unique";`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pim_info_product_id_unique" ON "pim_info" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pim_info_product_id" ON "pim_info" ("product_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_pim_info_product_id_unique";`);
    this.addSql(`drop index if exists "IDX_pim_info_product_id";`);
  }

}
