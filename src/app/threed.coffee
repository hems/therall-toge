app = require 'app/app'

module.exports = class threed


	constructor: ->

		return
		# renderer
		renderer = new THREE.WebGLRenderer()
		renderer.setSize window.innerWidth, window.innerHeight
		document.body.appendChild renderer.domElement

		# camera
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
		camera.position.y = -450
		camera.position.z = 400
		camera.rotation.x = 45 * (Math.PI / 180)

		# scene
		scene = new THREE.Scene()

		# plane

		geometry = new THREE.PlaneGeometry(300, 300)
		mesh      = new THREE.MeshNormalMaterial()

		plane = new THREE.Mesh geometry, mesh

		scene.add plane

		console.log geometry


		app.on 'frame', -> renderer.render scene, camera