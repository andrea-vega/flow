var Flow = require('./flow').Flow;

exports.create = function(ctx) {
    return new Flow(ctx);
};