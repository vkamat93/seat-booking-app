import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';

const DbEnvToggle = () => {
    const [currentEnv, setCurrentEnv] = useState('staging');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnv = async () => {
            try {
                const response = await adminAPI.getDbEnv();
                setCurrentEnv(response.data.data.env);
            } catch (error) {
                console.error('Failed to fetch DB environment:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnv();
    }, []);

    const handleToggle = async () => {
        const targetEnv = currentEnv === 'staging' ? 'prod' : 'staging';
        const warningMessage = targetEnv === 'prod'
            ? '⚠️ WARNING: You are about to switch to the PRODUCTION database. This will affect all live data. Are you sure?'
            : 'You are switching back to the STAGING database. Proceed?';

        if (window.confirm(warningMessage)) {
            try {
                setLoading(true);
                await adminAPI.switchDbEnv(targetEnv);
                // Refresh everything and keep user on same page
                window.location.reload();
            } catch (error) {
                alert('Failed to switch database environment: ' + (error.response?.data?.message || error.message));
                setLoading(false);
            }
        }
    };

    if (loading && !currentEnv) return <div className="db-env-container"><span className="db-env-label">Loading Env...</span></div>;

    const isStaging = currentEnv === 'staging';

    return (
        <div className="db-env-container">
            <span className="db-env-label">Database Environment</span>
            <div className="db-env-status">
                <div className={`env-indicator ${currentEnv}`}></div>
                <span className="env-name">{currentEnv}</span>
            </div>
            <button
                className={`db-toggle-btn ${isStaging ? 'to-prod' : 'to-staging'}`}
                onClick={handleToggle}
                disabled={loading}
            >
                {loading ? 'Switching...' : `Switch to ${isStaging ? 'Production' : 'Staging'}`}
            </button>
        </div>
    );
};

export default DbEnvToggle;
