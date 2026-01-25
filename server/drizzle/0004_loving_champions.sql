CREATE TABLE "strings" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"context" text,
	"project_id" text NOT NULL,
	CONSTRAINT "unique_key_per_project" UNIQUE("key","project_id"),
	CONSTRAINT "key_not_empty" CHECK (LENGTH(TRIM("strings"."key")) > 0)
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"string_id" text NOT NULL,
	"locale" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "unique_locale_per_string" UNIQUE("string_id","locale"),
	CONSTRAINT "locale_not_empty" CHECK (LENGTH(TRIM("translations"."locale")) > 0)
);
--> statement-breakpoint
ALTER TABLE "strings" ADD CONSTRAINT "strings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_string_id_strings_id_fk" FOREIGN KEY ("string_id") REFERENCES "public"."strings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strings_project_id_idx" ON "strings" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "translations_string_id_locale_idx" ON "translations" USING btree ("string_id","locale");