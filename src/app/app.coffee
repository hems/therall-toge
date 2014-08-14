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
		fft   = null
		fft_cheap = null
		canvas = null

		# TODO: fix resize 
		# $( window ).resize -> 

		# 	canvas.width  = s.windowWidth
		# 	canvas.height = s.windowHeight

		s.preload = ->

			sound = s.loadSound 'sound/therall_toge.mp3'

		s.setup = ->
			canvas = s.createCanvas s.windowWidth, s.windowHeight

			sound.loop();

			fft = new p5.FFT 0.80, 16 * 64
			fft_cheap = new p5.FFT 0.80, 16

		s.draw = =>

			s.background 0
			spectrum = fft_cheap.analyze()

			s.noStroke()
			s.fill 25, 25, 25 # spectrum is green

			i = 0


			row = @threed.geometry.vertices
			while i < spectrum.length
				x = s.map( i, 0, spectrum.length, 0, s.width )

				h = -s.height + s.map(spectrum[i], 0, 255, s.height, 0) * 1

				s.rect x, s.height, s.width / spectrum.length, h

				# @threed.geometry.vertices[i].z = spectrum[i]

				# console.log "#{i} : #{s.height}"

				@threed.geometry.vertices[i].z = h

				i++

			@threed.geometry.verticesNeedUpdate = true;
			@threed.geometry.normalsNeedUpdate = true;

			app.emit 'frame'

			waveform = fft.waveform()

			s.beginShape()
			s.stroke 100, 100, 100 # waveform is red
			s.strokeWeight 1
			i = 0

			while i < waveform.length
			  x = s.map(i, 0, waveform.length, 0, s.width)
			  y = s.map(waveform[i], 0, 255, 0, s.height)
			  s.vertex x, y
			  i++

			s.endShape()



module.exports = app = new App()