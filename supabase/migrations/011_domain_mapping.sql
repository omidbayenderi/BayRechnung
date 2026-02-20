-- Migration: Domain Mapping
-- Description: Adds subdomain and custom_domain columns to company_settings

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS subdomain TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS custom_domain TEXT;

-- Create unique indexes for domain lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_subdomain ON company_settings(subdomain);
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_custom_domain ON company_settings(custom_domain);
