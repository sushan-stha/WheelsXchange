// supabase-config.js
const SUPABASE_URL = 'https://eoempahzfldeugjbwyrs.supabase.co'; // Replace with your project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZW1wYWh6ZmxkZXVnamJ3eXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTM2NjgsImV4cCI6MjA3OTI4OTY2OH0.yviCvvxUz3IzY2Ul8IFrpSfvlJLn2ier6f-tCRUvoNY'; // Replace with your anon key

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);