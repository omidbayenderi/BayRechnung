-- test_security.sql
-- Description: Tests for RLS and Audit Log integrity.

-- Simulate 'authenticated' role
SET ROLE 'authenticated';
SET request.jwt.claims TO '{"sub": "00000000-0000-0000-0000-000000000000", "role": "authenticated"}';

-- Test Case 1: Check if services can be read by authenticated user
SELECT count(*) FROM services;

-- Test Case 2: Verify Audit Log access
-- This depends on your specific RLS for audit_logs
SELECT count(*) FROM audit_logs LIMIT 1;

-- Reset role
RESET ROLE;
