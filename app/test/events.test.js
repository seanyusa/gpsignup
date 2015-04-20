var _ = require('lodash'),
    assert = require('chai').assert,
    app = require('../../server'),
    request = require('supertest-as-promised')(app),
    moment = require('moment'),
    mongoose = require('mongoose'),
    Event = mongoose.model('Event'),
    Slot = mongoose.model('Slot');

var start = moment();
var end = moment(start).add(1, 'days').add(3, 'hours');
var ev = {
    name: 'Test Event',
    description: 'this is a test',
    start: start.toISOString(),
    end: end.toISOString(),
    duration: 60
};

describe('Event tests', function() {
    before(function(done) {
        // ping server
        var res = request.get('/api')
            .expect(200, done);
    });

    it('event CRUD test', function(done) {
        var id;
        // POST
        request.post('/api/events')
            .send(ev)
            .expect(200)
            .expect(function(res) {
                id = res.body._id;
                assert.propertyVal(res.body, 'name', ev.name);
            })
            // list
            .then(function() {
                return request.get('/api/events')
                    .expect(200)
                    .expect(function(res) {
                        assert.propertyVal(_.find(res.body, ev), 'name', ev.name);
                    });
            })
            // GET
            .then(function() {
                return request.get('/api/events/' + id)
                    .expect(200)
                    .expect(function(res) {
                        assert.propertyVal(res.body, 'name', ev.name);
                    });
            })
            // PUT
            .then(function() {
                var changed = _.extend(_.clone(ev), { name: 'Tabling' });
                return request.put('/api/events/' + id)
                    .send(changed)
                    .expect(200)
                    .expect(function(res) {
                        assert.propertyVal(res.body, 'name', changed.name);
                    });
            })
            // DELETE
            .then(function() {
                return request.delete('/api/events/' + id)
                    .expect(200);
            })
            // verify deleted
            .then(function() {
                request.get('/api/events/' + id)
                    .expect(404);
                done();
            })
            .catch(function(err) {
                done(err);
            });
    });

    it('creating/deleting an event should create/delete slots', function(done) {
        var id;
        request.post('/api/events')
            .send(ev)
            .expect(200)
            .expect(function(res) {
                id = res.body._id;
                assert.propertyVal(res.body, 'name', ev.name);
            })
            // verify slots
            .then(function() {
                return Slot.find().exec().then(function(err, slots) {
                    console.log(slots);
                    if (!slots) {
                        assert(false, 'No slots found!');
                    }
                    assert.equal(slots.length, 6);
                });
            })
            // delete event
            .then(function() {
                return request.delete('/api/events/' + id)
                    .expect(200);
            })
            // verify event deleted
            .then(function() {
                return request.get('/api/events/' + id)
                    .expect(404);
            })
            // verify slots deleted
            .then(function() {
                Slot.find().exec(function(err, slots) {
                    assert.isUndefined(slots, 'Slots were not deleted!');
                    done();
                });
            })
            .catch(function(err) {
                done(err);
            });
    });

    afterEach(function(done) {
        Event.remove().exec();
        Slot.remove().exec();
        done();
    });
});