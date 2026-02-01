CREATE TABLE IF NOT EXISTS "receipt_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"qtd" numeric(10, 2) NOT NULL,
	"unit" text NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "total_price" numeric(10, 2) NOT NULL;