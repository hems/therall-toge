# $ = require 'jquery'

happens = require 'happens'

class App

	constructor: -> 

		happens @

		$ =>

			threed = require './threed'
			@threed = new threed

			animate = ->
				requestAnimationFrame animate

				app.emit 'frame'

			animate()

			@start()

	go: ( address ) ->
		history.pushState null, null, address

		$( 'iframe' ).attr 'src', address

	start: ->

		@threed.add_cube '/exp_01'

		@threed.add_cube '/exp_02'

		@go '/exp_02'


module.exports = app = new App()