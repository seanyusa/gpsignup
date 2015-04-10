var express = require('express');
var router = express.Router();

var events = require('../controllers/events.controller');

router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening on event.');
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/events')

    // create a event (accessed at POST api/events)
    .post(events.create)
    // get a list of events
    .get(events.list);

router.route('/events/:event_id')

    // get the event with that id (accessed at GET /api/events/:event_id)
    .get(events.single).
    // update the event with that id (accessed at PUT /api/events/:event_id)
    .put(events.update);

module.exports = router;