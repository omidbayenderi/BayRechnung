const VITE_SUPABASE_URL = "https://ceqitkloquydkgxwikvk.supabase.co";
const VITE_SUPABASE_ANON_KEY = "sb_publishable_P2hM1pim3jr_0ZgqaLCHeg_99DhbDgT";

const email = "demo@bayzenit.com";
const password = "demo123";

async function run() {
  const authRes = await fetch(`${VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  console.log("Auth Response Status:", authRes.status);
  const authData = await authRes.json();
  console.log("Auth Data:", authData);

  if (authData.error || authData.msg) {
    console.error("Connection issue detected.");
    return;
  }
}
run();
