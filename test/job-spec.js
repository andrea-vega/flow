'use strict';

var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var Job = require('../lib/job').Job;

describe('Job', function () {
    var job;

    beforeEach(function () {
        job = new Job();
    });

    it('should work with no steps', function () {
        return job.execute();
    });

    it('should work with one step', function () {
        var fn = function() {
            return [{ foo: 'bar' }];
        };

        return job
            .add(fn)
            .flow()
            .toArray()
            .then(function (arr) {
                arr.should.have.deep.members([{ foo: 'bar' }]);
            });
    });

    it('should emit step events', function () {
        var fn = function() {
            return [{ foo: 'bar' }, { bar: 'baz' }, { baz: 'foo' }];
        };

        var spy = sinon.spy();

        return job
            .add(fn)
            .on('step', spy)
            .flow()
            .toArray()
            .then(function () {
                spy.should.have.been.calledThrice;
            });
    });

    it('should emit step in progress events when there are multiple steps', function () {
        var source = function() {
            return [{ first: 'Brad', last: 'Leupen' }, { first: 'Christa', last: 'Leupen' }, { first: 'Hank', last: 'Leupen' }];
        };

        var through1 = function(stream) {
            return stream.tap(function (record) {
                record.full = record.first + record.last;
            });
        };

        var through2 = function(stream) {
            return stream.tap(function (record) {
                record.full = record.full.toUpperCase();
            });
        };

        return job
            .add({ stream: source, label: 'source' })
            .add({ stream: through1, label: 'full name'})
            .add({ stream: through2, label: 'uppercase'})
            .on('step', function () {
                console.log('\n');
                job.steps.forEach(function (step, index) {
                    console.log(index, step.label, step.in, step.out);
                });
            })
            .flow()
            .toArray();
    });
});