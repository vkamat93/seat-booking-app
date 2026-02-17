/**
 * Response Standardization Middleware
 * Adds res.success and res.error methods to the response object
 */
const responsePlugin = (req, res, next) => {
    /**
     * Standard success response
     * @param {Object} data - The payload to return
     * @param {string} message - Success message
     * @param {string} code - Standardized response code (e.g., 'SUCCESS')
     */
    res.success = (data = null, message = 'Operation successful', code = 'SUCCESS') => {
        return res.json({
            success: true,
            code,
            message,
            data
        });
    };

    /**
     * Standard error response
     * @param {string} message - Error message
     * @param {string} code - Standardized error code (e.g., 'ERR_VALIDATION')
     * @param {number} status - HTTP status code
     */
    res.error = (message = 'An error occurred', code = 'ERR_INTERNAL_SERVER', status = 500) => {
        return res.status(status).json({
            success: false,
            code,
            message,
            data: null
        });
    };

    next();
};

module.exports = responsePlugin;
