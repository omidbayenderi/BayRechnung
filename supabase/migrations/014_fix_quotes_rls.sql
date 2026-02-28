-- Fix RLS for quotes and documentation tables
-- Ensure users can Manage (All actions) their own records

-- Quotes
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can manage own quotes" ON quotes;
CREATE POLICY "Users can manage own quotes" ON quotes FOR ALL USING (auth.uid() = user_id);

-- Expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own expenses" ON expenses;
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);

-- Recurring Templates
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own recurring templates" ON recurring_templates;
CREATE POLICY "Users can manage own recurring templates" ON recurring_templates FOR ALL USING (auth.uid() = user_id);

-- Invoice Customization
ALTER TABLE invoice_customization ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own customization" ON invoice_customization;
CREATE POLICY "Users can manage own customization" ON invoice_customization FOR ALL USING (auth.uid() = user_id);
