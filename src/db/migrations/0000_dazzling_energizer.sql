CREATE TABLE "field_report_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"revision_number" integer NOT NULL,
	"markdown" text NOT NULL,
	"rubric_scores" jsonb NOT NULL,
	"passed" boolean NOT NULL,
	"feedback" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_name" text NOT NULL,
	"gps_lat" numeric NOT NULL,
	"gps_lng" numeric NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"raw_transcript" text NOT NULL,
	"raw_image_refs" text[] NOT NULL,
	"target_audience" text NOT NULL,
	"final_markdown" text,
	"image_prompts" jsonb,
	"flagged_for_human_review" boolean DEFAULT false NOT NULL,
	"langsmith_run_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "field_report_revisions" ADD CONSTRAINT "field_report_revisions_report_id_field_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."field_reports"("id") ON DELETE cascade ON UPDATE no action;