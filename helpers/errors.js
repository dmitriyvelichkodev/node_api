/**
 * Provides classes for custom Exception objects
 * @module errors
 */

/**
 * General error for API errors, receives usual error message
 * and http status code.
 *
 * @class OrgNetworkParser
 */
class APIError extends Error {
    /**
     * Constructor for APIError
     * @param {String} message Error message
     * @param {Int} status HTTP status code
     * @method constructor
     */
    constructor(message, status) {
        super(message);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

        this.status = status || 500;
    }
}

module.exports = {
    APIError: APIError,
};
