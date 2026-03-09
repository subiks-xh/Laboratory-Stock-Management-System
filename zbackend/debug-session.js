/**
 * Session Diagnostic Script
 * Add this to your server.js temporarily to debug session issues
 */

// Add this endpoint to server.js after the routes
app.get('/api/debug/session', (req, res) => {
    const allCookies = req.cookies || {};
    const sessionId = req.cookies?.sessionId;
    
    // Try to get session if it exists
    let sessionData = null;
    if (sessionId) {
        try {
            const { getSession } = require('./utils/sessionManager');
            sessionData = getSession(sessionId);
        } catch (error) {
            console.error('Error getting session:', error);
        }
    }
    
    res.json({
        success: true,
        debug: {
            hasCookies:!! req.cookies,
            allCookies: Object.keys(allCookies),
            hasSessionId: !!sessionId,
            sessionId: sessionId ? `${sessionId.substring(0, 10)}...` : null,
            sessionValid: !!sessionData,
            sessionUser: sessionData ? {
                userId: sessionData.userId,
                email: sessionData.email,
                role: sessionData.role
            } : null,
            headers: {
                cookie: req.headers.cookie ? 'Present' : 'Missing',
                origin: req.headers.origin,
                referer: req.headers.referer
            }
        }
    });
});

console.log('✅ Debug session endpoint added: GET /api/debug/session');
