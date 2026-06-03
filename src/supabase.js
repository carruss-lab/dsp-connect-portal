import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rwahggesqzeabkyvbhab.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3YWhnZ2VzcXplYWJreXZiaGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDE3MzQsImV4cCI6MjA5NjAxNzczNH0.Xb8GzYAMnUOAx8RvC_eGRIZSdopt6C39wvP6DKJeKfs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
