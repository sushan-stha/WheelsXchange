// supabase-config.js
(function() {
    const { createClient } = window.supabase;

    const SUPABASE_URL = 'https://eoempahzfldeugjbwyrs.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZW1wYWh6ZmxkZXVnamJ3eXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTM2NjgsImV4cCI6MjA3OTI4OTY2OH0.yviCvvxUz3IzY2Ul8IFrpSfvlJLn2ier6f-tCRUvoNY';

   
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('✅ Supabase Config Loaded');
})();





















// const { createClient } = window.supabase;

// const SUPABASE_URL = 'https://eoempahzfldeugjbwyrs.supabase.co';
// const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZW1wYWh6ZmxkZXVnamJ3eXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTM2NjgsImV4cCI6MjA3OTI4OTY2OH0.yviCvvxUz3IzY2Ul8IFrpSfvlJLn2ier6f-tCRUvoNY';

// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// // Make it globally available
// window.supabaseClient = supabase;



// console.log('✅ Supabase Config Loaded');
// console.log('🔗 URL:', SUPABASE_URL);
// console.log('🔑 Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
// console.log('📦 Supabase Client:', supabaseClient);