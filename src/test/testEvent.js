const Event = require('events');
const eventTest = new Event();

eventTest.on('come', function () {
    console.log('test: I am coming');
});

module.exports = {
    eventTest
};
