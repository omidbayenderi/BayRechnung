/**
 * DB_AGENT_PATCH: Orchestrator Communication Helper
 * Sends health and error reports to the central Agent Orchestrator.
 */

const ORCHESTRATOR_URL = import.meta.env.VITE_AGENT_ORCHESTRATOR_URL;

export const reportToOrchestrator = async (type, payload) => {
    // DB_AGENT_PATCH: Prevent blocking the main thread, fire and forget
    if (!ORCHESTRATOR_URL) {
        console.warn(`[Orchestrator] URL not configured. Dropped report: ${type}`);
        return;
    }

    try {
        const body = {
            type,
            payload: {
                ...payload,
                timestamp: new Date().toISOString(),
                environment: import.meta.env.MODE
            }
        };

        // We use fetch with a short timeout to not block the agent worker
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        fetch(ORCHESTRATOR_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        }).then(null, err => console.error("[Orchestrator] Post failed:", err.message))
            .finally(() => clearTimeout(timeout));

    } catch (err) {
        console.error("[Orchestrator] Critical error in reporting tool:", err);
    }
};
