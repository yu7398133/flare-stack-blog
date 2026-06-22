-- Migration Number: 0012
-- Add type column to posts table for article/talk distinction
ALTER TABLE `posts` ADD `type` text NOT NULL DEFAULT 'article';
