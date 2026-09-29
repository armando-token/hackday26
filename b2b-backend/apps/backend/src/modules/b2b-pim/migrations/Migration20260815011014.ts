import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260815011014 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pim_info" add column if not exists "mfr_model" text null, add column if not exists "item_number" text null, add column if not exists "purchase_mode" text check ("purchase_mode" in ('buy_now', 'quote_only', 'contact_for_price', 'made_to_order')) not null default 'buy_now', add column if not exists "availability_mode" text check ("availability_mode" in ('in_stock', 'lead_time', 'made_to_order', 'discontinued')) not null default 'in_stock', add column if not exists "lead_time_days" integer null, add column if not exists "specs" jsonb null, add column if not exists "seo_title" text null, add column if not exists "seo_description" text null, add column if not exists "og_image" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "pim_info" drop column if exists "mfr_model", drop column if exists "item_number", drop column if exists "purchase_mode", drop column if exists "availability_mode", drop column if exists "lead_time_days", drop column if exists "specs", drop column if exists "seo_title", drop column if exists "seo_description", drop column if exists "og_image";`);
  }

}
