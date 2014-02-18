'use strict';

exports.render = function(req, res) {
  var ua = req.header('user-agent');
  console.log(ua);
  if (/mobile/i.test(ua)) {
    res.redirect('/controller');
  } else {
    res.redirect('/viewer');
  }
    //res.render('index', {layout: "public", title: "Megart"});
};
