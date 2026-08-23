CREATE TABLE "history" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"url" text DEFAULT '',
	"status" text DEFAULT 'todo' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"due_date" date,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assigned_user_id" integer,
	"recurrence_type" text DEFAULT 'none' NOT NULL,
	"recurrence_interval" integer DEFAULT 1 NOT NULL,
	"recurrence_end" date,
	"total_time" bigint DEFAULT 0 NOT NULL,
	"is_tracking" boolean DEFAULT false NOT NULL,
	"last_start_time" bigint,
	"time_logs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"memo_sessions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active_memo_session" jsonb,
	"subtasks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"surname" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;