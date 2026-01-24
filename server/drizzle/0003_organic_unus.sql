ALTER TABLE "projects" DROP CONSTRAINT "projects_name_user_id_unique";--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "unique_name_per_user" UNIQUE("name","user_id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "name_not_empty" CHECK (LENGTH(TRIM("projects"."name")) > 0);