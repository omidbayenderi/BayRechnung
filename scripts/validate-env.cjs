const fs = require('fs');
const path = require('path');

/**
 * DB_AGENT_PATCH: Deployment Health Guard
 * Scans the project for environment variables (both Vite and process.env)
 * and verifies their existence.
 */

const TARGET_DIRECTORIES = ['src', 'api', 'scripts'];
const IGNORE_PATTERNS = [/node_modules/, /\.git/, /dist/];

// List of variables that we know ARE required but might not be easily grep-able
const KNOWN_REQUIRED = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'AGENT_ORCHESTRATOR_URL'
];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!IGNORE_PATTERNS.some(pattern => pattern.test(file))) {
                getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

function scanForEnvVars() {
    const foundVars = new Set(KNOWN_REQUIRED);
    const files = [];

    TARGET_DIRECTORIES.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
            getAllFiles(dirPath, files);
        }
    });

    const envRegex = /(?:process\.env\.|import\.meta\.env\.)([A-Z0-9_]+)/g;

    files.forEach(file => {
        // Only scan JS/TS files
        if (!/\.(js|jsx|ts|tsx)$/.test(file)) return;

        const content = fs.readFileSync(file, 'utf8');
        let match;
        while ((match = envRegex.exec(content)) !== null) {
            if (match[1] && !['NODE_ENV', 'BASE_URL', 'MODE', 'DEV', 'PROD', 'SSR'].includes(match[1])) {
                foundVars.add(match[1]);
            }
        }
    });

    return Array.from(foundVars).sort();
}

function runValidation() {
    console.log("🔍 [Env Guard] Scanning project for environment variables...");
    const requiredVars = scanForEnvVars();
    console.log(`✅ Found ${requiredVars.length} variables used in code.\n`);

    const missing = [];
    const found = [];

    // Check against local environment (useful for 'vercel dev' testing)
    requiredVars.forEach(v => {
        if (process.env[v] || (v.startsWith('VITE_') && process.env[v])) {
            found.push(v);
        } else {
            missing.push(v);
        }
    });

    console.log("📊 --- DEPLOYMENT HEALTH REPORT ---");

    if (found.length > 0) {
        console.log("\n🟢 Local/Active Variables:");
        found.forEach(v => console.log(`  [OK] ${v}`));
    }

    if (missing.length > 0) {
        console.log("\n🟡 Missing/Unset Variables (Check Vercel Dashboard):");
        missing.forEach(v => {
            const importance = KNOWN_REQUIRED.includes(v) ? "CRITICAL" : "Secondary";
            console.log(`  [!!] ${v} - (${importance})`);
        });

        console.log("\n💡 Recommendation: Go to Vercel > Settings > Environment Variables");
        console.log("   and ensure the [!!] variables above are defined for Production/Preview.");
    } else {
        console.log("\n🚀 All identified environment variables are set!");
    }

    console.log("\n------------------------------------");
}

runValidation();
