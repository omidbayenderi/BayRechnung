import fs from 'fs';
import dotenv from 'dotenv';
try {
  const content = fs.readFileSync('.env', 'utf-8');
  console.log("File read success. Length:", content.length);
  const parsed = dotenv.parse(content);
  console.log("VITE_SUPABASE_URL:", parsed.VITE_SUPABASE_URL);
  console.log("VITE_SUPABASE_ANON_KEY:", parsed.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set');
} catch(e) {
  console.error("Failed:", e.message);
}
