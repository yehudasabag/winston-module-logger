const winston = require('winston');
const assert = require("assert");

let logger;

function initialize(logLevel = 'info') {
    logger = winston.createLogger({
        transports: [
            new winston.transports.Console({
                handleExceptions: true,
                json: true,
                timestamp: true,
                level: logLevel,
                stringify: (obj) => JSON.stringify(obj)
            })
        ]
    });
}

class ModuleLogger {
    constructor(tagsObj) {
        assert(logger, 'You must call init() before calling getLogger()');
        this._tags = tagsObj;
    }

    _getTags(extraTags) {
        if (extraTags){
            return Object.assign(this._tags, extraTags);
        }
        return this._tags;
    }
    info(msg, extraTags) {
        logger.info(msg, this._getTags(extraTags));
    }

    warn(msg, extraTags) {
        logger.warn(msg, this._getTags(extraTags));
    }

    debug(msg, extraTags) {
        logger.debug(msg, this._getTags(extraTags));
    }

    error(msg, ex, extraTags) {
        logger.error(msg, ex ? this._getTags(Object.assign({ stack: ex.stack}, extraTags)) : this._tags);
    }

}

function generateLogger(moduleName, extraTags = {}) {
    let tags = Object.assign(extraTags, { moduleName: moduleName });
    return new ModuleLogger(tags);
}

module.exports = {
    /**
     * This module is for generating a ModuleLogger for each module that will be default log to winston with the
     * relevant tags
     * @param moduleName
     * @param extraTags
     * @returns {ModuleLogger}
     */
    getLogger: generateLogger,
    init: initialize
};
