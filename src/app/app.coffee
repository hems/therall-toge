# $ = require 'jquery'

happens = require 'happens'

Color = net.brehaut.Color

###
# Stolen Query String parser + current query string parsed
###
class QueryString
	
	constructor: (@queryString) ->
		@queryString or= window.document.location.search?.substr 1
		@variables = @queryString.split '&'
		@pairs = ([key, value] = pair.split '=' for pair in @variables)
	
	get: (name) ->
		for [key, value] in @pairs
			return value if key is name

query = new QueryString


###
# Create global track_id in order to retrieve audio later,
# a default value is associated
###

track_id = 1412201


class App

	constructor: -> 

		happens @


		$ =>

			unless query.get( 'url' )
				@start()

				return


			url = query.get 'url'

			console.warn "url ->" + query.get ('url')

			url = "http://hems.io/therall-toge/resolve.php?track_url=#{url}"

			$.getJSON url, ( track ) =>


				track_id = track.id

				@start()





	start: =>
		threed = require './threed'
		@threed = new threed()

		new p5 @sketch

	sketch: (s) =>

		sound = null
		sound2 = null
		fft   = null
		fft_cheap = null
		canvas = null
		reverb = null
		filter = new p5.BandPass();

		counter = 0

		# TODO: fix resize 
		# $( window ).resize -> 

		# 	canvas.width  = s.windowWidth
		# 	canvas.height = s.windowHeight

		s.preload = =>

			# api.sound = sound = s.loadSound "http://hems.io/therall-toge/streamer.php?track_id=9244198"
			sound = sound = s.loadSound "//hems.io/therall-toge/streamer.php?track_id=#{track_id}"

			sound.rate(0.5)

		s.setup = =>

			canvas = s.createCanvas s.windowWidth, s.windowHeight

			sound.loop();

			fft = new p5.FFT 0.9, 16 * 64

			fft_cheap = new p5.FFT 0.9, 16 * 2


		s.draw = =>

			app.emit 'frame'

			# s.background 0
			spectrum = fft_cheap.analyze()

			s.noStroke()
			s.fill 50, 50, 50 # spectrum is green



			if counter % 1 == 0

				i = @threed.geometry.vertices.length - 1
				while i > 31

					@threed.geometry.vertices[i].z = @threed.geometry.vertices[i-32].z
					i--

			i = 0

			row = @threed.geometry.vertices
			while i < spectrum.length

				# regular square bands
				# x = s.map( i, 0, spectrum.length, 0, s.width )
				h = -s.height + s.map(spectrum[i], 0, 255, s.height, 0) * 1
				# s.rect x, s.height, s.width / spectrum.length, h

				x = counter

				y = s.map( i, 0, spectrum.length, 0, s.height )

				color = Color
					hue: spectrum[i] / 255 * 360
					saturation: 0.1
					value: 0.1

				color = color.setLightness spectrum[i] / 255 * 0.8

				s.fill color.getRed() * 255, color.getGreen() * 255, color.getBlue() * 255



				s.rect x, y, 1, s.height / spectrum.length

				

				# h = -s.height + s.map(spectrum[i], 0, 255, s.height, 0) * 1
				@threed.geometry.vertices[i].z = h / 20

				i++

			@threed.geometry.verticesNeedUpdate = true;
			@threed.geometry.normalsNeedUpdate = true;

			# waveform = fft.waveform()

			# s.beginShape()
			# s.stroke 100, 100, 100 # waveform is red
			# s.strokeWeight 1
			# i = 0

			# while i < waveform.length
			#   x = s.map(i, 0, waveform.length, 0, s.width)
			#   y = s.map(waveform[i], 0, 255, 0, s.height)
			#   s.vertex x, y
			#   i++

			# s.endShape()

			if counter == s.width then counter = 0

			counter++



module.exports = app = new App()