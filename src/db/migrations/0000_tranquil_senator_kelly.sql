CREATE TABLE IF NOT EXISTS "receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"uf" text NOT NULL,
	"metadata" jsonb,
	"html_content" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "receipts_code_unique" UNIQUE("code")
);
