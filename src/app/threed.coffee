app = require 'app/app'

module.exports = class threed

	cubes: null

	
	constructor: ->

		@cubes = []

		# renderer
		renderer = new THREE.WebGLRenderer antialias: true, alpha: true

		renderer.setClearColor 0x000000, 0
		renderer.setSize window.innerWidth, window.innerHeight

		renderer.domElement.style.position = 'absolute'
		$( 'body' ).prepend renderer.domElement


		# camera
		@camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000)

		window.camera = @camera
		@camera.position.x = 0
		@camera.position.y = 0
		@camera.position.z = 200

		# scene
		@scene = new THREE.Scene()

		axis = new THREE.AxisHelper(200);
		@scene.add axis


		app.on 'frame', =>

			console.log 'frame'

			renderer.render @scene, @camera

	add_cube: ( link ) ->

		width = 10

		@geometry = new THREE.BoxGeometry width, width, width
		mesh      = new THREE.MeshBasicMaterial

		mesh.wireframe = true

		cube = new THREE.Mesh @geometry, mesh

		cube.position.x += @cubes.length * width * 2

		@cubes.push cube

		@scene.add cube