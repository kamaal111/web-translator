CREATE TABLE "translation_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"locale" text NOT NULL,
	"version" integer NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_version_per_project_locale" UNIQUE("project_id","locale","version")
);
--> statement-breakpoint
ALTER TABLE "translation_snapshots" ADD CONSTRAINT "translation_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "translation_snapshots_project_locale_version_idx" ON "translation_snapshots" USING btree ("project_id","locale","version");--> statement-breakpoint
CREATE INDEX "translation_snapshots_project_locale_idx" ON "translation_snapshots" USING btree ("project_id","locale");