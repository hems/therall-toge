;(function(){
// POLVO :: HELPERS

// POLVO :: LOADER
function require(path, parent){
  var realpath = require.resolve(path, parent),
      m = require.mods[realpath];

  if(!m.init){
    m.factory.call(this, require.local(realpath), m.module, m.module.exports);
    m.init = true;
  }

  return m.module.exports;
}

require.mods = {}

require.local = function( path ){
  var r = function( id ){ return require( id, path ); }
  r.resolve = function( id ){ return require.resolve( id, path ); }
  return r;
}

require.register = function(path, mod, aliases){
  require.mods[path] = {
    factory: mod,
    aliases: aliases,
    module: {exports:{}}
  };
}

require.aliases = {"app":"src/app"};
require.alias = function(path){
  for(var alias in require.aliases)
    if(path.indexOf(alias) == 0)
      return require.aliases[alias] + path.match(/\/(.+)/)[0];
  return null;
}


require.resolve = function(path, parent){
  var realpath;

  if(parent)
    if(!(realpath = require.mods[parent].aliases[path]))
      realpath = require.alias( path );

  if(!require.mods[realpath || path])
      throw new Error('Module not found: ' + path);

  return realpath || path;
}

window.require = require;
// POLVO :: MERGED FILES
require.register('node_modules/happens/index', function(require, module, exports){
/**
 * Module constructor
 * @param  {Object} target Target object to extends methods and properties into
 * @return {Object}        Target after with extended methods and properties
 */
module.exports = function(target) {
  target = target || {};
  for(var prop in Happens)
    target[prop] = Happens[prop];
  return target;
};



/**
 * Class Happens
 * @type {Object}
 */
var Happens = {

  /**
   * Initializes event
   * @param  {String} event Event name to initialize
   * @return {Array}        Initialized event pool
   */
  __init: function(event) {
    var tmp = this.__listeners || (this.__listeners = []);
    return tmp[event] || (tmp[event] = []);
  },

  /**
   * Adds listener
   * @param  {String}   event Event name
   * @param  {Function} fn    Event handler
   */
  on: function(event, fn) {
    validate(fn);
    this.__init(event).push(fn);
  },

  /**
   * Removes listener
   * @param  {String}   event Event name
   * @param  {Function} fn    Event handler
   */
  off: function(event, fn) {
    var pool = this.__init(event);
    pool.splice(pool.indexOf(fn), 1);
  },

  /**
   * Add listener the fires once and auto-removes itself
   * @param  {String}   event Event name
   * @param  {Function} fn    Event handler
   */
  once: function(event, fn) {
    validate(fn);
    var self = this, wrapper = function() {
      self.off(event, wrapper);
      fn.apply(this, arguments);
    };
    this.on(event, wrapper );
  },

  /**
   * Emit some event
   * @param  {String} event Event name -- subsequent params after `event` will
   * be passed along to the event's handlers
   */
  emit: function(event /*, arg1, arg2 */ ) {
    var i, pool = this.__init(event).slice(0);
    for(i in pool)
      pool[i].apply(this, [].slice.call(arguments, 1));
  }
};



/**
 * Validates if a function exists and is an instanceof Function, and throws
 * an error if needed
 * @param  {Function} fn Function to validate
 */
function validate(fn) {
  if(!(fn && fn instanceof Function))
    throw new Error(fn + ' is not a Function');
}
}, {});
require.register('src/app/app', function(require, module, exports){
var App, Color, app, happens,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

Color = net.brehaut.Color;

App = (function() {
  function App() {
    this.sketch = __bind(this.sketch, this);
    var _this = this;
    happens(this);
    $(function() {
      var threed;
      threed = require('./threed');
      _this.threed = new threed();
      return new p5(_this.sketch);
    });
  }

  App.prototype.sketch = function(s) {
    var canvas, counter, fft, fft_cheap, filter, reverb, sound, sound2,
      _this = this;
    sound = null;
    sound2 = null;
    fft = null;
    fft_cheap = null;
    canvas = null;
    reverb = null;
    filter = new p5.BandPass();
    counter = 0;
    s.preload = function() {
      sound = sound = s.loadSound("http://hems.io/therall-toge/streamer.php?track_id=1412201");
      return sound.rate(0.5);
    };
    s.setup = function() {
      canvas = s.createCanvas(s.windowWidth, s.windowHeight);
      sound.loop();
      fft = new p5.FFT(0.9, 16 * 64);
      return fft_cheap = new p5.FFT(0.9, 16 * 2);
    };
    return s.draw = function() {
      var color, h, i, row, spectrum, x, y;
      app.emit('frame');
      spectrum = fft_cheap.analyze();
      s.noStroke();
      s.fill(50, 50, 50);
      if (counter % 1 === 0) {
        i = _this.threed.geometry.vertices.length - 1;
        while (i > 31) {
          _this.threed.geometry.vertices[i].z = _this.threed.geometry.vertices[i - 32].z;
          i--;
        }
      }
      i = 0;
      row = _this.threed.geometry.vertices;
      while (i < spectrum.length) {
        h = -s.height + s.map(spectrum[i], 0, 255, s.height, 0) * 1;
        x = counter;
        y = s.map(i, 0, spectrum.length, 0, s.height);
        color = Color({
          hue: spectrum[i] / 255 * 360,
          saturation: 0.1,
          value: 0.1
        });
        color = color.setLightness(spectrum[i] / 255 * 0.8);
        s.fill(color.getRed() * 255, color.getGreen() * 255, color.getBlue() * 255);
        s.rect(x, y, 1, s.height / spectrum.length);
        _this.threed.geometry.vertices[i].z = h / 20;
        i++;
      }
      _this.threed.geometry.verticesNeedUpdate = true;
      _this.threed.geometry.normalsNeedUpdate = true;
      if (counter === s.width) {
        counter = 0;
      }
      return counter++;
    };
  };

  return App;

})();

module.exports = app = new App();

}, {"happens":"node_modules/happens/index","./threed":"src/app/threed"});
require.register('src/app/canvas', function(require, module, exports){


}, {});
require.register('src/app/threed', function(require, module, exports){
var app, threed;

app = require('app/app');

module.exports = threed = (function() {
  function threed() {
    var camera, controls, mesh, plane, renderer, scene,
      _this = this;
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    document.body.appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    window.camera = camera;
    camera.position.x = 0;
    camera.position.y = 75;
    camera.position.z = 200;
    camera.lookAt(new THREE.Vector3);
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 0.3;
    controls.panSpeed = 0.8;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.5;
    scene = new THREE.Scene();
    this.geometry = new THREE.PlaneGeometry(150, 150, 31, 160);
    mesh = new THREE.MeshBasicMaterial;
    mesh.wireframe = true;
    plane = new THREE.Mesh(this.geometry, mesh);
    window.geometry = this.geometry;
    window.plane = plane;
    plane.rotation.x = 90 * Math.PI / 180;
    plane.rotation.z = 45 * Math.PI / 180;
    scene.add(plane);
    app.on('frame', function() {
      renderer.render(scene, camera);
      return controls.update();
    });
  }

  return threed;

})();

}, {"app/app":"src/app/app"});
// POLVO :: INITIALIZER
require('src/app/app');
/*
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjoxNDYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL2FwcC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyAkID0gcmVxdWlyZSAnanF1ZXJ5J1xuXG5oYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuQ29sb3IgPSBuZXQuYnJlaGF1dC5Db2xvclxuXG5jbGFzcyBBcHBcblxuXHRjb25zdHJ1Y3RvcjogLT4gXG5cblx0XHRoYXBwZW5zIEBcblxuXHRcdCQgPT5cblxuXHRcdFx0dGhyZWVkID0gcmVxdWlyZSAnLi90aHJlZWQnXG5cdFx0XHRAdGhyZWVkID0gbmV3IHRocmVlZCgpXG5cblx0XHRcdG5ldyBwNSBAc2tldGNoXG5cblx0c2tldGNoOiAocykgPT5cblxuXHRcdHNvdW5kID0gbnVsbFxuXHRcdHNvdW5kMiA9IG51bGxcblx0XHRmZnQgICA9IG51bGxcblx0XHRmZnRfY2hlYXAgPSBudWxsXG5cdFx0Y2FudmFzID0gbnVsbFxuXHRcdHJldmVyYiA9IG51bGxcblx0XHRmaWx0ZXIgPSBuZXcgcDUuQmFuZFBhc3MoKTtcblxuXHRcdGNvdW50ZXIgPSAwXG5cblx0XHQjIFRPRE86IGZpeCByZXNpemUgXG5cdFx0IyAkKCB3aW5kb3cgKS5yZXNpemUgLT4gXG5cblx0XHQjIFx0Y2FudmFzLndpZHRoICA9IHMud2luZG93V2lkdGhcblx0XHQjIFx0Y2FudmFzLmhlaWdodCA9IHMud2luZG93SGVpZ2h0XG5cblx0XHRzLnByZWxvYWQgPSA9PlxuXG5cdFx0XHQjIGFwaS5zb3VuZCA9IHNvdW5kID0gcy5sb2FkU291bmQgXCJodHRwOi8vaGVtcy5pby90aGVyYWxsLXRvZ2Uvc3RyZWFtZXIucGhwP3RyYWNrX2lkPTkyNDQxOThcIlxuXHRcdFx0c291bmQgPSBzb3VuZCA9IHMubG9hZFNvdW5kIFwiaHR0cDovL2hlbXMuaW8vdGhlcmFsbC10b2dlL3N0cmVhbWVyLnBocD90cmFja19pZD0xNDEyMjAxXCJcblxuXHRcdFx0c291bmQucmF0ZSgwLjUpXG5cblx0XHRzLnNldHVwID0gPT5cblxuXHRcdFx0Y2FudmFzID0gcy5jcmVhdGVDYW52YXMgcy53aW5kb3dXaWR0aCwgcy53aW5kb3dIZWlnaHRcblxuXHRcdFx0c291bmQubG9vcCgpO1xuXG5cdFx0XHRmZnQgPSBuZXcgcDUuRkZUIDAuOSwgMTYgKiA2NFxuXG5cdFx0XHRmZnRfY2hlYXAgPSBuZXcgcDUuRkZUIDAuOSwgMTYgKiAyXG5cblxuXHRcdHMuZHJhdyA9ID0+XG5cblx0XHRcdGFwcC5lbWl0ICdmcmFtZSdcblxuXHRcdFx0IyBzLmJhY2tncm91bmQgMFxuXHRcdFx0c3BlY3RydW0gPSBmZnRfY2hlYXAuYW5hbHl6ZSgpXG5cblx0XHRcdHMubm9TdHJva2UoKVxuXHRcdFx0cy5maWxsIDUwLCA1MCwgNTAgIyBzcGVjdHJ1bSBpcyBncmVlblxuXG5cblxuXHRcdFx0aWYgY291bnRlciAlIDEgPT0gMFxuXG5cdFx0XHRcdGkgPSBAdGhyZWVkLmdlb21ldHJ5LnZlcnRpY2VzLmxlbmd0aCAtIDFcblx0XHRcdFx0d2hpbGUgaSA+IDMxXG5cblx0XHRcdFx0XHRAdGhyZWVkLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnogPSBAdGhyZWVkLmdlb21ldHJ5LnZlcnRpY2VzW2ktMzJdLnpcblx0XHRcdFx0XHRpLS1cblxuXHRcdFx0aSA9IDBcblxuXG5cdFx0XHRyb3cgPSBAdGhyZWVkLmdlb21ldHJ5LnZlcnRpY2VzXG5cdFx0XHR3aGlsZSBpIDwgc3BlY3RydW0ubGVuZ3RoXG5cblx0XHRcdFx0IyByZWd1bGFyIHNxdWFyZSBiYW5kc1xuXHRcdFx0XHQjIHggPSBzLm1hcCggaSwgMCwgc3BlY3RydW0ubGVuZ3RoLCAwLCBzLndpZHRoIClcblx0XHRcdFx0aCA9IC1zLmhlaWdodCArIHMubWFwKHNwZWN0cnVtW2ldLCAwLCAyNTUsIHMuaGVpZ2h0LCAwKSAqIDFcblx0XHRcdFx0IyBzLnJlY3QgeCwgcy5oZWlnaHQsIHMud2lkdGggLyBzcGVjdHJ1bS5sZW5ndGgsIGhcblxuXHRcdFx0XHR4ID0gY291bnRlclxuXG5cdFx0XHRcdHkgPSBzLm1hcCggaSwgMCwgc3BlY3RydW0ubGVuZ3RoLCAwLCBzLmhlaWdodCApXG5cblx0XHRcdFx0Y29sb3IgPSBDb2xvclxuXHRcdFx0XHRcdGh1ZTogc3BlY3RydW1baV0gLyAyNTUgKiAzNjBcblx0XHRcdFx0XHRzYXR1cmF0aW9uOiAwLjFcblx0XHRcdFx0XHR2YWx1ZTogMC4xXG5cblx0XHRcdFx0Y29sb3IgPSBjb2xvci5zZXRMaWdodG5lc3Mgc3BlY3RydW1baV0gLyAyNTUgKiAwLjhcblxuXHRcdFx0XHRzLmZpbGwgY29sb3IuZ2V0UmVkKCkgKiAyNTUsIGNvbG9yLmdldEdyZWVuKCkgKiAyNTUsIGNvbG9yLmdldEJsdWUoKSAqIDI1NVxuXG5cblxuXHRcdFx0XHRzLnJlY3QgeCwgeSwgMSwgcy5oZWlnaHQgLyBzcGVjdHJ1bS5sZW5ndGhcblxuXHRcdFx0XHRcblxuXHRcdFx0XHQjIGggPSAtcy5oZWlnaHQgKyBzLm1hcChzcGVjdHJ1bVtpXSwgMCwgMjU1LCBzLmhlaWdodCwgMCkgKiAxXG5cdFx0XHRcdEB0aHJlZWQuZ2VvbWV0cnkudmVydGljZXNbaV0ueiA9IGggLyAyMFxuXG5cdFx0XHRcdGkrK1xuXG5cdFx0XHRAdGhyZWVkLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRAdGhyZWVkLmdlb21ldHJ5Lm5vcm1hbHNOZWVkVXBkYXRlID0gdHJ1ZTtcblxuXHRcdFx0IyB3YXZlZm9ybSA9IGZmdC53YXZlZm9ybSgpXG5cblx0XHRcdCMgcy5iZWdpblNoYXBlKClcblx0XHRcdCMgcy5zdHJva2UgMTAwLCAxMDAsIDEwMCAjIHdhdmVmb3JtIGlzIHJlZFxuXHRcdFx0IyBzLnN0cm9rZVdlaWdodCAxXG5cdFx0XHQjIGkgPSAwXG5cblx0XHRcdCMgd2hpbGUgaSA8IHdhdmVmb3JtLmxlbmd0aFxuXHRcdFx0IyAgIHggPSBzLm1hcChpLCAwLCB3YXZlZm9ybS5sZW5ndGgsIDAsIHMud2lkdGgpXG5cdFx0XHQjICAgeSA9IHMubWFwKHdhdmVmb3JtW2ldLCAwLCAyNTUsIDAsIHMuaGVpZ2h0KVxuXHRcdFx0IyAgIHMudmVydGV4IHgsIHlcblx0XHRcdCMgICBpKytcblxuXHRcdFx0IyBzLmVuZFNoYXBlKClcblxuXHRcdFx0aWYgY291bnRlciA9PSBzLndpZHRoIHRoZW4gY291bnRlciA9IDBcblxuXHRcdFx0Y291bnRlcisrXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcCA9IG5ldyBBcHAoKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxJQUFBLG9CQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFFVixDQUZBLEVBRVEsRUFBUixFQUFtQjs7QUFFYixDQUpOO0NBTWMsQ0FBQSxDQUFBLFVBQUE7Q0FFWixzQ0FBQTtDQUFBLE9BQUEsSUFBQTtDQUFBLEdBQUEsR0FBQTtDQUFBLEVBRUUsQ0FBRixLQUFFO0NBRUQsS0FBQSxJQUFBO0NBQUEsRUFBUyxHQUFULENBQVMsR0FBQTtDQUFULEVBQ2MsQ0FBQSxDQUFiLENBQUQ7Q0FFTyxDQUFILEVBQUEsQ0FBSSxDQUFKLE9BQUE7Q0FMTCxJQUFFO0NBSkgsRUFBYTs7Q0FBYixFQVdRLEdBQVIsR0FBUztDQUVSLE9BQUEsc0RBQUE7T0FBQSxLQUFBO0NBQUEsRUFBUSxDQUFSLENBQUE7Q0FBQSxFQUNTLENBQVQsRUFBQTtDQURBLEVBRUEsQ0FBQTtDQUZBLEVBR1ksQ0FBWixLQUFBO0NBSEEsRUFJUyxDQUFULEVBQUE7Q0FKQSxFQUtTLENBQVQsRUFBQTtDQUxBLENBTWUsQ0FBRixDQUFiLEVBQUEsRUFBYTtDQU5iLEVBUVUsQ0FBVixHQUFBO0NBUkEsRUFnQlksQ0FBWixHQUFBLEVBQVk7Q0FHWCxFQUFRLEVBQVIsQ0FBQSxHQUFnQixrREFBQTtDQUVWLEVBQU4sQ0FBQSxDQUFLLFFBQUw7Q0FyQkQsSUFnQlk7Q0FoQlosRUF1QlUsQ0FBVixDQUFBLElBQVU7Q0FFVCxDQUF1QyxDQUE5QixHQUFULEtBQVMsQ0FBQTtDQUFULEdBRUEsQ0FBSyxDQUFMO0NBRkEsQ0FJWSxDQUFaLENBQVUsRUFBVjtDQUVtQixDQUFELENBQUYsQ0FBQSxLQUFoQixJQUFBO0NBL0JELElBdUJVO0NBV1QsRUFBUSxDQUFULEtBQVMsRUFBVDtDQUVDLFNBQUEsc0JBQUE7Q0FBQSxFQUFHLENBQUgsRUFBQSxDQUFBO0NBQUEsRUFHVyxHQUFYLENBQVcsQ0FBWCxDQUFvQjtDQUhwQixLQUtBLEVBQUE7Q0FMQSxDQU1BLEVBQUEsRUFBQTtDQUlBLEVBQWEsQ0FBVixDQUFlLENBQWxCLENBQUc7Q0FFRixFQUFJLEVBQUMsQ0FBTSxFQUFYO0NBQ0EsQ0FBQSxDQUFVLFlBQUo7Q0FFTCxDQUEyRCxDQUExQixFQUFoQyxDQUFNLEVBQVMsRUFBaEI7QUFDQSxDQURBLENBQUEsUUFDQTtDQU5GLFFBR0M7UUFiRDtDQUFBLEVBa0JJLEdBQUo7Q0FsQkEsRUFxQkEsRUFBTyxDQUFQLEVBQXNCO0NBQ3RCLEVBQVUsR0FBVixFQUFrQixLQUFaO0FBSUEsQ0FBTCxDQUFtQyxDQUEvQixHQUFBLEVBQUo7Q0FBQSxFQUdJLElBSEosQ0FHQTtDQUhBLENBS2MsQ0FBVixHQUFBLEVBQUo7Q0FMQSxFQU9RLEVBQVIsR0FBQTtDQUNDLENBQUssQ0FBTCxLQUFjLEVBQWQ7Q0FBQSxDQUNZLENBRFosT0FDQTtDQURBLENBRU8sQ0FGUCxFQUVBLEtBQUE7Q0FWRCxTQU9RO0NBUFIsRUFZUSxFQUFSLEdBQUEsSUFBUTtDQVpSLENBYzZCLENBQUwsQ0FBeEIsQ0FBWSxDQUFMLENBQThDLENBQXJEO0NBZEEsQ0FrQlUsQ0FBaUIsQ0FBM0IsRUFBZ0IsRUFBaEI7Q0FsQkEsQ0FBQSxDQXVCaUMsRUFBaEMsQ0FBTSxFQUFQO0FBRUEsQ0F6QkEsQ0FBQSxNQXlCQTtDQW5ERCxNQXNCQTtDQXRCQSxFQXFEc0MsQ0FyRHRDLENBcURDLENBQUQsRUFBZ0IsVUFBaEI7Q0FyREEsRUFzRHFDLENBdERyQyxDQXNEQyxDQUFELEVBQWdCLFNBQWhCO0NBaUJBLEdBQUcsQ0FBVyxDQUFkLENBQUc7Q0FBd0IsRUFBVSxJQUFWLENBQUE7UUF2RTNCO0FBeUVBLENBM0VRLE1BMkVSLE1BQUE7Q0EvR00sSUFvQ0U7Q0EvQ1YsRUFXUTs7Q0FYUjs7Q0FORDs7QUFvSUEsQ0FwSUEsRUFvSWlCLENBQVUsRUFBckIsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoyMzQsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL2NhbnZhcy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXVFb0IifX0seyJvZmZzZXQiOnsibGluZSI6MjM4LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC90aHJlZWQuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcCA9IHJlcXVpcmUgJ2FwcC9hcHAnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgdGhyZWVkXG5cblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdCMgcmVuZGVyZXJcblx0XHRyZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyIGFudGlhbGlhczogdHJ1ZSwgYWxwaGE6IHRydWVcblxuXHRcdHJlbmRlcmVyLnNldENsZWFyQ29sb3IgMHgwMDAwMDAsIDBcblx0XHRyZW5kZXJlci5zZXRTaXplIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHRcblxuXHRcdHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCByZW5kZXJlci5kb21FbGVtZW50XG5cblxuXHRcdCMgY2FtZXJhXG5cdFx0Y2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMClcblxuXHRcdHdpbmRvdy5jYW1lcmEgPSBjYW1lcmFcblx0XHRjYW1lcmEucG9zaXRpb24ueCA9IDBcblx0XHRjYW1lcmEucG9zaXRpb24ueSA9IDc1XG5cdFx0Y2FtZXJhLnBvc2l0aW9uLnogPSAyMDBcblxuXHRcdCMgY2FtZXJhLnBvc2l0aW9uLnggPSAyMDBcblx0XHQjIGNhbWVyYS5wb3NpdGlvbi55ID0gMjAwXG5cdFx0IyBjYW1lcmEucG9zaXRpb24ueiA9IDIwMFxuXG5cdFx0Y2FtZXJhLmxvb2tBdCBuZXcgVEhSRUUuVmVjdG9yM1xuXG5cdFx0IyBjYW1lcmEucG9zaXRpb24ueSA9IC00NTBcblx0XHQjIGNhbWVyYS5wb3NpdGlvbi56ID0gNDAwXG5cblx0XHQjIENvbnRyb2xzXG5cdFx0Y29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoIGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCApXG5cdFx0Y29udHJvbHMucm90YXRlU3BlZWQgICAgICAgICAgPSAxLjBcblx0XHRjb250cm9scy56b29tU3BlZWQgICAgICAgICAgICA9IDAuMztcblx0XHRjb250cm9scy5wYW5TcGVlZCAgICAgICAgICAgICA9IDAuOFxuXHRcdCMgY29udHJvbHMubm9ab29tIFx0ICAgICAgICAgID0gdHJ1ZVxuXHRcdGNvbnRyb2xzLm5vUGFuICBcdCAgICAgICAgICA9IGZhbHNlXG5cdFx0Y29udHJvbHMuc3RhdGljTW92aW5nIFx0XHQgID0gdHJ1ZVxuXHRcdGNvbnRyb2xzLmR5bmFtaWNEYW1waW5nRmFjdG9yID0gMC41XG5cblx0XHQjIHNjZW5lXG5cdFx0c2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXG5cdFx0IyBwbGFuZVxuXG5cdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDE1MCwgMTUwLCAzMSwgMTYwIClcblx0XHRtZXNoICAgICA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXG5cdFx0bWVzaC53aXJlZnJhbWUgPSB0cnVlXG5cblx0XHRwbGFuZSA9IG5ldyBUSFJFRS5NZXNoIEBnZW9tZXRyeSwgbWVzaFxuXG5cdFx0d2luZG93Lmdlb21ldHJ5ID0gQGdlb21ldHJ5XG5cdFx0d2luZG93LnBsYW5lID0gcGxhbmVcblxuXHRcdHBsYW5lLnJvdGF0aW9uLnggPSA5MCAqIE1hdGguUEkgLyAxODBcblx0XHRwbGFuZS5yb3RhdGlvbi56ID0gNDUgKiBNYXRoLlBJIC8gMTgwXG5cblx0XHRzY2VuZS5hZGQgcGxhbmVcblxuXHRcdCMgYXhpcyA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKDIwMCk7XG5cdFx0IyBzY2VuZS5hZGQgYXhpc1xuXG5cblx0XHRhcHAub24gJ2ZyYW1lJywgPT5cblxuXHRcdFx0cmVuZGVyZXIucmVuZGVyIHNjZW5lLCBjYW1lcmFcblx0XHRcdGNvbnRyb2xzLnVwZGF0ZSgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsT0FBQTs7QUFBQSxDQUFBLEVBQUEsSUFBTSxFQUFBOztBQUVOLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUdjLENBQUEsQ0FBQSxhQUFBO0NBR1osT0FBQSxzQ0FBQTtPQUFBLEtBQUE7Q0FBQSxFQUFlLENBQWYsQ0FBb0IsR0FBcEIsS0FBZTtDQUFvQixDQUFXLEVBQVgsRUFBQSxHQUFBO0NBQUEsQ0FBd0IsRUFBeEIsQ0FBaUIsQ0FBQTtDQUFwRCxLQUFlO0NBQWYsQ0FFaUMsRUFBakMsSUFBUSxLQUFSO0NBRkEsQ0FHb0MsRUFBcEMsRUFBdUIsQ0FBdkIsQ0FBUSxFQUFSLENBQUE7Q0FIQSxFQUtxQyxDQUFyQyxDQUF5QixHQUFqQixFQUFXO0NBTG5CLEdBTUEsSUFBUSxFQUFSLENBQUE7Q0FOQSxDQVVhLENBQUEsQ0FBYixDQUFrQixDQUFsQixJQUF5QyxDQUE1QixNQUFBO0NBVmIsRUFZZ0IsQ0FBaEIsRUFBTTtDQVpOLEVBYW9CLENBQXBCLEVBQU0sRUFBUztDQWJmLENBQUEsQ0Fjb0IsQ0FBcEIsRUFBTSxFQUFTO0NBZGYsRUFlb0IsQ0FBcEIsRUFBTSxFQUFTO0FBTUQsQ0FyQmQsRUFxQmMsQ0FBZCxDQUF1QixDQUFqQixDQUFOO0NBckJBLENBMkJnRCxDQUFqQyxDQUFmLENBQW9CLENBQUwsRUFBZixFQUFlLE9BQUE7Q0EzQmYsRUE0QmdDLENBQWhDLElBQVEsR0FBUjtDQTVCQSxFQTZCZ0MsQ0FBaEMsSUFBUSxDQUFSO0NBN0JBLEVBOEJnQyxDQUFoQyxJQUFRO0NBOUJSLEVBZ0M2QixDQUE3QixDQUFBLEdBQVE7Q0FoQ1IsRUFpQzRCLENBQTVCLElBQVEsSUFBUjtDQWpDQSxFQWtDZ0MsQ0FBaEMsSUFBUSxZQUFSO0NBbENBLEVBcUNZLENBQVosQ0FBQTtDQXJDQSxDQXlDMEMsQ0FBMUIsQ0FBaEIsQ0FBcUIsR0FBckIsS0FBZ0I7QUFDTCxDQTFDWCxFQTBDVyxDQUFYLENBQW9CLFlBMUNwQjtDQUFBLEVBNENpQixDQUFqQixLQUFBO0NBNUNBLENBOENrQyxDQUF0QixDQUFaLENBQUEsR0FBWTtDQTlDWixFQWdEa0IsQ0FBbEIsRUFBTSxFQUFOO0NBaERBLEVBaURlLENBQWYsQ0FBQSxDQUFNO0NBakROLENBbURtQixDQUFBLENBQW5CLENBQUssR0FBUztDQW5EZCxDQW9EbUIsQ0FBQSxDQUFuQixDQUFLLEdBQVM7Q0FwRGQsRUFzREEsQ0FBQSxDQUFLO0NBdERMLENBNERBLENBQUcsQ0FBSCxHQUFBLEVBQWdCO0NBRWYsQ0FBdUIsR0FBdkIsQ0FBQSxFQUFRO0NBQ0MsS0FBVCxFQUFRLEtBQVI7Q0FIRCxJQUFnQjtDQS9EakIsRUFBYTs7Q0FBYjs7Q0FMRCJ9fV19
*/})()