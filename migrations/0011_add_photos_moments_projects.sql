CREATE TABLE `photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image_url` text NOT NULL,
	`thumbnail_url` text,
	`album` text DEFAULT 'default',
	`tags` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	`updated_at` integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `photos_album_idx` ON `photos` (`album`);--> statement-breakpoint
CREATE TABLE `moments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`images` text,
	`mood` text,
	`location` text,
	`visibility` text DEFAULT 'public' NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	`updated_at` integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `moments_created_at_idx` ON `moments` (`created_at`);--> statement-breakpoint
CREATE INDEX `moments_visibility_idx` ON `moments` (`visibility`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text,
	`image_url` text,
	`project_url` text,
	`repo_url` text,
	`tech_stack` text,
	`status` text DEFAULT 'active' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	`updated_at` integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `projects_featured_idx` ON `projects` (`featured`);
