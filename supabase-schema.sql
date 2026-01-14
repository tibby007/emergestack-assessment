-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create the assessment_responses table
CREATE TABLE assessment_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    respondent_name TEXT NOT NULL,
    respondent_email TEXT NOT NULL,
    respondent_title TEXT NOT NULL,
    company TEXT NOT NULL,
    responses JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for faster queries by company
CREATE INDEX idx_assessment_responses_company ON assessment_responses(company);

-- Create an index for faster queries by submission date
CREATE INDEX idx_assessment_responses_submitted_at ON assessment_responses(submitted_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow inserts from authenticated and anonymous users
-- (The anon key allows public submissions)
CREATE POLICY "Allow public inserts" ON assessment_responses
    FOR INSERT
    WITH CHECK (true);

-- Create a policy to allow only authenticated users to read
-- (You'll use your service role key or authenticated session to view responses)
CREATE POLICY "Allow authenticated reads" ON assessment_responses
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- ============================================
-- OPTIONAL: Create a view for easier reporting
-- ============================================

CREATE VIEW assessment_summary AS
SELECT 
    id,
    respondent_name,
    respondent_email,
    respondent_title,
    company,
    submitted_at,
    jsonb_object_keys(responses) as question_count
FROM assessment_responses
ORDER BY submitted_at DESC;
