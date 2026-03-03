import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const REQUIRED_VARS = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_AGENT_ORCHESTRATOR_URL'
];

const BACKEND_REQUIRED_VARS = [
    'SUPABASE_SERVICE_ROLE_KEY'
];

function checkEnv() {
    console.log('🔍 Checking Deployment Health (Environment Variables)...\n');

    let missing = [];
    let warning = [];

    // Frontend Vars
    REQUIRED_VARS.forEach(v => {
        if (!process.env[v]) {
            missing.push(`❌ Missing critical variable: ${v}`);
        } else {
            console.log(`✅ FOUND: ${v}`);
        }
    });

    // Backend Vars
    BACKEND_REQUIRED_VARS.forEach(v => {
        if (!process.env[v]) {
            warning.push(`⚠️  Missing Backend variable: ${v} (Required for db-worker)`);
        } else {
            console.log(`✅ FOUND: ${v}`);
        }
    });

    console.log('\n--- Summary ---');
    if (missing.length === 0 && warning.length === 0) {
        console.log('🎉 System Health: Green. All variables found.');
    } else {
        missing.forEach(m => console.error(m));
        warning.forEach(w => console.warn(w));

        if (missing.length > 0) {
            console.error('\n🛑 FAILED: Mission critical variables are missing. Deployment might fail.');
            process.exit(1);
        }
    }
}

checkEnv();
