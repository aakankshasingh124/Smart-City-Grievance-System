-- JanSahayak AI: Supabase PostgreSQL Schema & Security Policies
-- For production deployment with Supabase Auth & PostgreSQL Row-Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    contact_information TEXT,
    active_status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. User Profiles (Extending auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK(role IN ('citizen', 'staff', 'admin')) DEFAULT 'citizen',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Complaints
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_number TEXT UNIQUE NOT NULL,
    citizen_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    guest_name TEXT,
    guest_contact TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Waste Management', 'Traffic Management', 'Energy Issues', 'Miscellaneous Public Grievances')),
    subcategory TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    landmark TEXT,
    priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
    ai_priority_suggestion TEXT,
    ai_priority_reason TEXT,
    ai_category_suggestion TEXT,
    ai_summary TEXT,
    is_urgent BOOLEAN NOT NULL DEFAULT false,
    current_status TEXT NOT NULL CHECK(current_status IN (
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
        'Rejected',
        'More Information Required',
        'Reopened'
    )) DEFAULT 'Submitted',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    assigned_staff_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    estimated_resolution_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    resolution_notes TEXT,
    citizen_feedback TEXT,
    citizen_rating INTEGER,
    is_demo_data BOOLEAN NOT NULL DEFAULT false
);

-- 4. Complaint Attachments
CREATE TABLE IF NOT EXISTS public.complaint_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    attachment_type TEXT NOT NULL CHECK(attachment_type IN ('citizen_evidence', 'progress_photo', 'resolution_photo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Complaint Updates
CREATE TABLE IF NOT EXISTS public.complaint_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    public_message TEXT NOT NULL,
    internal_note TEXT,
    progress_photo_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id TEXT,
    actor_name TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    affected_record_type TEXT NOT NULL,
    affected_record_id TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Row-Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Citizens can view and edit their own profiles
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('staff', 'admin')
    ));

-- Citizens see their complaints; Staff & Admins see complaints assigned or department-level
CREATE POLICY "Complaints viewing policy" ON public.complaints
    FOR SELECT USING (
        citizen_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('staff', 'admin'))
    );

CREATE POLICY "Complaints insertion policy" ON public.complaints
    FOR INSERT WITH CHECK (
        citizen_id = auth.uid() OR auth.uid() IS NULL
    );

-- Complaint Updates: Citizens can read public messages, staff can insert
CREATE POLICY "Public updates visible to complainant and staff" ON public.complaint_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.complaints c 
            WHERE c.id = complaint_id AND (c.citizen_id = auth.uid() OR EXISTS (
                SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('staff', 'admin')
            ))
        )
    );

-- Notifications visible only to the recipient
CREATE POLICY "Notifications recipient only" ON public.notifications
    FOR ALL USING (user_id = auth.uid());

-- Audit logs visible only to administrators
CREATE POLICY "Audit logs admin only" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
