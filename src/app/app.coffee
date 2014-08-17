# $ = require 'jquery'

happens = require 'happens'

Color = net.brehaut.Color

class App

	constructor: -> 

		happens @

		$ =>

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

			sound = s.loadSound '../sound/november 9th.mp3'
			# sound.rate(1)

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