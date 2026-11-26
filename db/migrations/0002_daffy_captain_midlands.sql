CREATE TABLE `events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`externalId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`startTime` varchar(5),
	`city` varchar(32) NOT NULL,
	`type` enum('MEETUP','EXHIBITION','RALLY','FESTIVAL','OTHER') NOT NULL,
	`location` varchar(255),
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE INDEX `events_city_date_idx` ON `events` (`city`,`eventDate`);