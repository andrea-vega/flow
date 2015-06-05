'use strict';

var events = require('events');
var util = require('util');
var Flow = require('./flow').Flow;
var _ = require('lodash');
var P = require('bluebird');
var $ = require('highland');

/**
 * A job processor that wraps the flow library, using itself as the context. This class should be extended. The
 * stream it creates is instrumented to provide simple monitoring capabilities.
 * @constructor
 */
function Job() {
    events.EventEmitter.call(this);
    this.steps = [];
}

util.inherits(Job, events.EventEmitter);

/**
 * Adds a step to a job
 * @param {...Object | Object[]} steps
 * @return {Job}
 */
Job.prototype.add = function(steps) {
    steps = _.isArray(steps) ? steps : [].slice.call(arguments);
    this.steps = this.steps.concat(steps.map(function (step) {
        if (_.isFunction(step)) step = { stream: step };
        return _.assign(step, { in: 0, out: 0 });
    }));
    return this;
};

/**
 * Creates a new instrumented flow
 * @return {Flow}
 */
Job.prototype.flow = function () {
    var self = this;

    /**
     * monitors outbound traffic from a stream. increments the streams in/out count while emitting a step event
     * @param {Object} stream the stream to monitor
     * @param {number} stepIndex the step being monitored
     * @param {string} inOut 'in' or 'out'
     * @return {Object} returns a new stream
     */
    function monitor(stream, stepIndex, inOut) {
        return stream.tap(function () {
            self.steps[stepIndex][inOut]++;
            self.emit('step', stepIndex);
        });
    }

    /**
     * Sandwiches a step's stream function with inbound and outbound monitor
     * @param step
     * @param index
     * @return {Function}
     */
    function instrument(step, index) {
        return function(stream, ctx) {
            return monitor($(step.stream(monitor(stream, index, 'in'), ctx)), index, 'out');
        };
    }

    // instrument the steps
    var streamFns = self.steps.map(instrument);

    return new Flow(this, streamFns);
};

/**
 * Creates and starts a flow, returning a promise which resolves once the flow ends.
 * @return {bluebird|exports|module.exports}
 */
Job.prototype.execute = function() {
    var self = this;

    return new P(function(resolve) {
        self.flow().stream().done(resolve);
    })
};

exports.Job = Job;
