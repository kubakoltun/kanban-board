CREATE TABLE "priorities" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statuses" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"position" integer NOT NULL
);
