var _ = require('lodash');
var Flow = require('./flow').Flow;

/**
 * Creates a new flow
 * @param ctx
 * @param through
 * @return {*|Flow}
 */
exports.create = function(ctx, through) {
    through = _.isArray(through) ? through : [].slice.call(arguments, 1);

    return new Flow(ctx, through);
};