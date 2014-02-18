'use strict';

exports.viewer = function(req, res) {
    res.render('viewer', {layout: "desktop", title: "Canvas"});
};
