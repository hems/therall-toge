# $ = require 'jquery'

happens = require 'happens'

class App

	constructor: -> 

		happens @

		if window.location.host.indexOf( 'localhost' ) != -1
			@base_url = '/'
		else
			@base_url = '//hems.github.io/therall-toge/'

		$ =>

			threed = require './threed'
			@threed = new threed

			# animate = ->
			# 	requestAnimationFrame animate

				# app.emit 'frame'

			# animate()

			@start()

	go: ( address ) ->
		history.pushState null, null, @base_url + address

		$( 'iframe' ).attr 'src', address

	start: ->

		@threed.add_cube '/therall-toge/exp_01'

		@threed.add_cube '/therall-toge/exp_02'

		@go 'exp_02'


module.exports = app = new App()