CREATE TABLE `cars` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`userId` bigint unsigned NOT NULL,
	`brand` varchar(120) NOT NULL,
	`model` varchar(120) NOT NULL,
	`year` int NOT NULL,
	`plateNumber` varchar(16) NOT NULL,
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `cars` ADD CONSTRAINT `cars_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `cars_userId_idx` ON `cars` (`userId`);