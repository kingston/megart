$(->
  (new ViewerApplication()).run()

)

# set up globals object for paperscript communication
window.globals = {
}

class ViewerApplication
  socket: null
  controllers: null
  initialized: false

  # overlay logic
  # =============

  run: ->
    @socket = io.connect('/viewer')
    @_registerSocketEvents(@socket)

    # start connection
    @socket.on('connect', =>
      @_registerViewer()
    )

    $("#thecanvas").width($(window).width())
                   .height($(window).height())

  _registerViewer: () ->
    @socket.emit('register', (success, controllers) =>
      if (!success)
        @_setOverlayStatus("Waiting for canvas to become available...")
      else
        for own id, controller of @controllers
          controller.remove()
        @controllers = {}
        if (controllers.length > 0)
          @_startViewer(controllers)
    )

  _showOverlay: (status) ->
    $("#overlay").fadeIn()
    @_setOverlayStatus(status)

  _registerSocketEvents: (socket) ->
    socket.on('no viewer', =>
      @_registerViewer()
    )
    socket.on('disconnect', =>
      @_showOverlay("Lost connection...")
    )
    socket.on('joined', (id) =>
      if not @initialized
        @_startViewer([id])
      else
        @_addNewController(id)
    )
    socket.on('left', (id) =>
      if (id of @controllers)
        console.log(id + " left")
        @controllers[id].remove()
        delete @controllers[id]
    )
    socket.on('start press', (id) =>
      if (id of @controllers)
        @controllers[id].beginPress()
    )
    socket.on('end press', (id) =>
      if (id of @controllers)
        @controllers[id].endPress()
    )
    socket.on('update', (id, angle, magnitude) =>
      if (id of @controllers)
        @controllers[id].update(angle, magnitude)
    )

  _setOverlayStatus: (status) ->
    $("#status").text(status)

  # canvas logic
  # ============

  _startViewer: (controllers) ->
    @initialized = true
    for id in controllers
      @_addNewController(id)
    $("#overlay").fadeOut()

  _addNewController: (id) ->
    console.log(id + " joined")
    @controllers[id] = new Controller(id, @socket)
