class window.Util
  @randInt: (min, max) -> Math.floor((Math.random()*max)+min);

  @now: -> (new Date()).getTime()
