// Public Statistics Dashboard Routes
const { query } = require('../db/database');

function handleStatsRoutes(req, res, parsedUrl) {
    const { pathname, query: queryParams } = parsedUrl;
    const method = req.method;

    if (pathname === '/api/stats/public' && method === 'GET') {
        const includeDemo = queryParams.includeDemo !== 'false'; // default true for rich display

        const filterClause = includeDemo ? '' : 'WHERE is_demo_data = 0';

        // 1. Core counters
        const total = query(`SELECT COUNT(*) as count FROM complaints ${filterClause}`)[0].count;
        const resolved = query(`SELECT COUNT(*) as count FROM complaints ${includeDemo ? 'WHERE' : 'WHERE is_demo_data = 0 AND'} current_status IN ('Resolved', 'Closed')`)[0].count;
        const inProgress = query(`SELECT COUNT(*) as count FROM complaints ${includeDemo ? 'WHERE' : 'WHERE is_demo_data = 0 AND'} current_status IN ('In Progress', 'Reopened', 'More Information Required')`)[0].count;
        const pending = query(`SELECT COUNT(*) as count FROM complaints ${includeDemo ? 'WHERE' : 'WHERE is_demo_data = 0 AND'} current_status IN ('Submitted', 'Under Review', 'Assigned')`)[0].count;

        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        // 2. Category distribution
        const categoryRows = query(
            `SELECT category, COUNT(*) as count,
                    SUM(CASE WHEN current_status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) as resolved_count
             FROM complaints
             ${filterClause}
             GROUP BY category`
        );

        const categoryBreakdown = {};
        for (const row of categoryRows) {
            categoryBreakdown[row.category] = {
                total: row.count,
                resolved: row.resolved_count,
                pending: row.count - row.resolved_count
            };
        }

        // 3. Status distribution
        const statusRows = query(
            `SELECT current_status, COUNT(*) as count FROM complaints ${filterClause} GROUP BY current_status`
        );
        const statusCounts = {};
        for (const r of statusRows) {
            statusCounts[r.current_status] = r.count;
        }

        // 4. Privacy-safe recent public map points
        // Approximate coordinates (rounded to 3 decimal places ~100m) and no citizen identity
        const mapMarkers = query(
            `SELECT id, complaint_number, category, subcategory, priority, current_status,
                    ROUND(latitude, 3) as latitude, ROUND(longitude, 3) as longitude,
                    address, created_at, is_urgent
             FROM complaints
             ${filterClause}
             ORDER BY created_at DESC
             LIMIT 50`
        );

        // 5. Live vs Demo count indicator
        const demoCount = query(`SELECT COUNT(*) as count FROM complaints WHERE is_demo_data = 1`)[0].count;
        const liveCount = query(`SELECT COUNT(*) as count FROM complaints WHERE is_demo_data = 0`)[0].count;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            summary: {
                totalComplaints: total,
                resolvedComplaints: resolved,
                pendingComplaints: pending,
                inProgressComplaints: inProgress,
                resolutionPercentage: resolutionRate,
                liveRecordsCount: liveCount,
                demoRecordsCount: demoCount
            },
            categoryBreakdown,
            statusCounts,
            publicMarkers: mapMarkers,
            timestamp: new Date().toISOString()
        }));
    }

    return false;
}

module.exports = { handleStatsRoutes };
