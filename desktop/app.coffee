$(->
  (new ViewerApplication()).run()
)

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
    @_registerViewer()

  _registerViewer: () ->
    @socket.emit('register', (success, controllers) =>
      if (!success)
        @_setOverlayStatus("Waiting for canvas to become available...")
      else
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
      if (id in @controllers)
        console.log(id + " left")
        delete @controllers[id]
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
    @controllers[id] = {}
