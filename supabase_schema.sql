-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users Table
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role TEXT DEFAULT 'user',
    branch_name TEXT,
    name TEXT NOT NULL,
    nic TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    index_number TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Create Attendance Table
CREATE TABLE public.attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME WITHOUT TIME ZONE NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    type TEXT NOT NULL CHECK (type IN ('auto', 'manual')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
    reason_if_manual TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Create Papers Taken Table
CREATE TABLE public.papers_taken (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    paper_model TEXT NOT NULL,
    paper_number TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Optional: Create Indexes for faster lookups based on common queries
CREATE INDEX idx_users_nic ON public.users(nic);
CREATE INDEX idx_users_index_number ON public.users(index_number);
CREATE INDEX idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_papers_taken_user_id ON public.papers_taken(user_id);
CREATE INDEX idx_papers_taken_date ON public.papers_taken(date);
