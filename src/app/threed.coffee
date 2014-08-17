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

		window.camera = camera
		camera.position.x = 0
		camera.position.y = 75
		camera.position.z = 200

		# camera.position.x = 200
		# camera.position.y = 200
		# camera.position.z = 200

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

		@geometry = new THREE.PlaneGeometry( 150, 150, 15, 160 )
		mesh     = new THREE.MeshBasicMaterial

		mesh.wireframe = true

		plane = new THREE.Mesh @geometry, mesh

		window.geometry = @geometry
		window.plane = plane

		plane.rotation.x = 90 * Math.PI / 180
		plane.rotation.z = 45 * Math.PI / 180

		scene.add plane

		# axis = new THREE.AxisHelper(200);
		# scene.add axis


		app.on 'frame', =>

			renderer.render scene, camera
			controls.update()