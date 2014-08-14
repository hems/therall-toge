app = require 'app/app'

module.exports = class threed


	constructor: ->

		# renderer
		renderer = new THREE.WebGLRenderer antialias: true, alpha: true

		renderer.setClearColor 0x000000, 0
		renderer.setSize window.innerWidth, window.innerHeight

		renderer.domElement.style.position = 'absolute'
		document.body.appendChild renderer.domElement


		# camera
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)

		camera.position.x = 1 * 160
		camera.position.y = 0.75 * 160
		camera.position.z = 1 * 160
		camera.lookAt new THREE.Vector3

		# camera.position.y = -450
		# camera.position.z = 400

		# Controls
		controls = new THREE.TrackballControls( camera, renderer.domElement )
		controls.rotateSpeed          = 1.0
		controls.zoomSpeed            = 0.3;
		controls.panSpeed             = 0.8
		# controls.noZoom 	          = true
		controls.noPan  	          = false
		controls.staticMoving 		  = true
		controls.dynamicDampingFactor = 0.5

		# scene
		scene = new THREE.Scene()

		# plane

		@geometry = new THREE.PlaneGeometry( 300, 300, 15, 15 )
		mesh     = new THREE.MeshBasicMaterial

		mesh.wireframe = true

		plane = new THREE.Mesh @geometry, mesh

		scene.add plane


		app.on 'frame', =>

			renderer.render scene, camera
			controls.update()