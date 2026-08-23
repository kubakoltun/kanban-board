CREATE TABLE "history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"url" text DEFAULT '',
	"status" text DEFAULT 'todo' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"due_date" date,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
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
