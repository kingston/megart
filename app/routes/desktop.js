'use strict';

module.exports = function(app) {
    
    var desktop = require('../controllers/desktop');
    app.get('/viewer', desktop.viewer);

};
