# $ = require 'jquery'

happens = require 'happens'

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
			sound.rate(0.4)
			# sound.rate(0.5)

			# sound2 = s.loadSound '../sound/november 9th.mp3'
			# sound2.rate(0.5)

			sound.disconnect()
			sound.connect filter

			# filter.setType 'highpass'
			filter.freq(500)

		s.setup = =>

			reverb = new p5.Reverb()
			delay = new p5.Delay();
			canvas = s.createCanvas s.windowWidth, s.windowHeight


			# threed  = require './threed'
			# @threed = new threed()

			# puts p5 behind three.js
			# $( 'body' ).append canvas.canvas

			# reverb.process( sound, 4, 2 )
			delay.process( filter )
			delay.setType 'pingPong'
			delay.delayTime 0.2
			delay.feedback 0.4

			sound.loop();
			# sound2.loop()

			fft = new p5.FFT 0.9, 16 * 64
			fft_cheap = new p5.FFT 0.9, 16


		s.draw = =>

			app.emit 'frame'

			# s.background 0
			spectrum = fft_cheap.analyze()

			s.noStroke()
			s.fill 50, 50, 50 # spectrum is green



			if counter % 1 == 0

				i = @threed.geometry.vertices.length - 1
				while i > 15

					@threed.geometry.vertices[i].z = @threed.geometry.vertices[i-16].z
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

				color = 255 - ( 255 - spectrum[i] )

				s.fill color, color, color

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