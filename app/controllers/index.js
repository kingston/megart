'use strict';

exports.render = function(req, res) {
    res.render('index', {layout: "public", title: "Megart"});
};
