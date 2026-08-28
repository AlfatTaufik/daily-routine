-- ================================================
-- SUPABASE DATABASE SCHEMA FOR STUDYTRACKER (V2 DATE HISTORY & OVERRIDES)
-- Run this script in your Supabase SQL Editor
-- ================================================

-- 1. Schedule Items Table (Master Weekly Template)
CREATE TABLE IF NOT EXISTS public.schedule_items (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    "desc" TEXT,
    category TEXT DEFAULT 'study',
    priority TEXT DEFAULT 'B',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Checked Items Table (Date-Based History: 'YYYY-MM-DD_itemid')
CREATE TABLE IF NOT EXISTS public.checked_items (
    id TEXT PRIMARY KEY,
    date TEXT,
    item_id TEXT,
    is_checked BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Daily Overrides Table (Custom items for a specific date YYYY-MM-DD)
CREATE TABLE IF NOT EXISTS public.daily_overrides (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    "desc" TEXT,
    category TEXT DEFAULT 'study',
    priority TEXT DEFAULT 'B',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    priority TEXT DEFAULT 'A',
    title TEXT NOT NULL,
    deadline TEXT,
    notes TEXT,
    status TEXT DEFAULT 'todo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Exams Table (Reminders)
CREATE TABLE IF NOT EXISTS public.exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Formulas Table
CREATE TABLE IF NOT EXISTS public.formulas (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Public Policies for Easy Access
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checked_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulas ENABLE ROW LEVEL SECURITY;

-- Create Permissive RLS Policies for Anon / Public Read & Write
DROP POLICY IF EXISTS "Public Read Schedule" ON public.schedule_items;
CREATE POLICY "Public Read Schedule" ON public.schedule_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Checked" ON public.checked_items;
CREATE POLICY "Public Read Checked" ON public.checked_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Overrides" ON public.daily_overrides;
CREATE POLICY "Public Read Overrides" ON public.daily_overrides FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Tasks" ON public.tasks;
CREATE POLICY "Public Read Tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Exams" ON public.exams;
CREATE POLICY "Public Read Exams" ON public.exams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Formulas" ON public.formulas;
CREATE POLICY "Public Read Formulas" ON public.formulas FOR ALL USING (true) WITH CHECK (true);
