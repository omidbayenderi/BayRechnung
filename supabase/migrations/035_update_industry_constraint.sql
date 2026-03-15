-- Update industry check constraint to support construction and other industries
ALTER TABLE company_settings DROP CONSTRAINT IF EXISTS company_settings_industry_check;

ALTER TABLE company_settings ADD CONSTRAINT company_settings_industry_check 
CHECK (industry IN (
    'automotive', 
    'general', 
    'construction', 
    'gastronomy', 
    'healthcare', 
    'it', 
    'retail', 
    'crafts', 
    'consulting', 
    'education'
));
