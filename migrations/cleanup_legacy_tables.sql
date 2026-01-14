-- Migration: Cleanup Legacy Desktop Tables
-- Run this in Supabase SQL Editor to remove tables that are now local-only (SQLite)

-- 1. Drop Tables that were moved to SQLite
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS user_api_keys CASCADE;
DROP TABLE IF EXISTS chat_summaries CASCADE;
DROP TABLE IF EXISTS rag_entities CASCADE;
DROP TABLE IF EXISTS prompt_presets CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- 2. Verify Cleanup (Optional - just strictly enforcing what remains)
-- Users table remains (Authentication)
-- Subscriptions table remains (Stripe)
-- Changelogs table remains (CMS)
-- Notion/Google Integration tables remain
