'use strict';

module.exports = function(app) {
    
    var mobile = require('../controllers/mobile');
    app.get('/controller', mobile.controller);

};
