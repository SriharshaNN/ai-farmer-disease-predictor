const SESSION_KEY = 'farmguard-session-id';

export function getFarmerSessionId(): bigint {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            return BigInt(stored);
        }
    } catch {
        // Invalid stored value
    }

    // Generate new session ID based on timestamp
    const newId = BigInt(Date.now());
    try {
        localStorage.setItem(SESSION_KEY, newId.toString());
    } catch {
        // Storage unavailable
    }
    return newId;
}
