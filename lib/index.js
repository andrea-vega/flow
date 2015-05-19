var Flow = require('./flow').Flow;

/**
 * Creates a new flow
 * @param ctx
 * @param through
 * @return {*|Flow}
 */
exports.create = function(ctx, through) {
    return new Flow(ctx, through);
};