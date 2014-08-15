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
var App, app, happens,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

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
      sound = s.loadSound('sound/therall_toge.mp3');
      sound.rate(0.4);
      sound2 = s.loadSound('sound/therall_toge.mp3');
      sound2.rate(0.5);
      sound.disconnect();
      sound.connect(filter);
      return filter.freq(500);
    };
    s.setup = function() {
      var delay;
      reverb = new p5.Reverb();
      delay = new p5.Delay();
      canvas = s.createCanvas(s.windowWidth, s.windowHeight);
      delay.process(filter);
      delay.setType('pingPong');
      delay.delayTime(0.2);
      delay.feedback(0.4);
      sound.loop();
      fft = new p5.FFT(0.9, 16 * 64);
      return fft_cheap = new p5.FFT(0.9, 16);
    };
    return s.draw = function() {
      var h, i, row, spectrum, waveform, x, y;
      counter++;
      app.emit('frame');
      s.background(0);
      spectrum = fft_cheap.analyze();
      s.noStroke();
      s.fill(50, 50, 50);
      if (counter % 1 === 0) {
        i = _this.threed.geometry.vertices.length - 1;
        while (i > 15) {
          _this.threed.geometry.vertices[i].z = _this.threed.geometry.vertices[i - 16].z;
          i--;
        }
      }
      i = 0;
      row = _this.threed.geometry.vertices;
      while (i < spectrum.length) {
        x = s.map(i, 0, spectrum.length, 0, s.width);
        h = -s.height + s.map(spectrum[i], 0, 255, s.height, 0) * 1;
        s.rect(x, s.height, s.width / spectrum.length, h);
        _this.threed.geometry.vertices[i].z = h / 20;
        i++;
      }
      _this.threed.geometry.verticesNeedUpdate = true;
      _this.threed.geometry.normalsNeedUpdate = true;
      waveform = fft.waveform();
      s.beginShape();
      s.stroke(100, 100, 100);
      s.strokeWeight(1);
      i = 0;
      while (i < waveform.length) {
        x = s.map(i, 0, waveform.length, 0, s.width);
        y = s.map(waveform[i], 0, 255, 0, s.height);
        s.vertex(x, y);
        i++;
      }
      return s.endShape();
    };
  };

  return App;

})();

module.exports = app = new App();

}, {"happens":"node_modules/happens/index","./threed":"src/app/threed"});
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
    this.geometry = new THREE.PlaneGeometry(150, 150, 15, 150);
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
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjoxNDYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL2FwcC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyAkID0gcmVxdWlyZSAnanF1ZXJ5J1xuXG5oYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuY2xhc3MgQXBwXG5cblx0Y29uc3RydWN0b3I6IC0+IFxuXG5cdFx0aGFwcGVucyBAXG5cblx0XHQkID0+XG5cblx0XHRcdHRocmVlZCA9IHJlcXVpcmUgJy4vdGhyZWVkJ1xuXHRcdFx0QHRocmVlZCA9IG5ldyB0aHJlZWQoKVxuXG5cdFx0XHRuZXcgcDUgQHNrZXRjaFxuXG5cdHNrZXRjaDogKHMpID0+XG5cblx0XHRzb3VuZCA9IG51bGxcblx0XHRzb3VuZDIgPSBudWxsXG5cdFx0ZmZ0ICAgPSBudWxsXG5cdFx0ZmZ0X2NoZWFwID0gbnVsbFxuXHRcdGNhbnZhcyA9IG51bGxcblx0XHRyZXZlcmIgPSBudWxsXG5cdFx0ZmlsdGVyID0gbmV3IHA1LkJhbmRQYXNzKCk7XG5cblx0XHRjb3VudGVyID0gMFxuXG5cdFx0IyBUT0RPOiBmaXggcmVzaXplIFxuXHRcdCMgJCggd2luZG93ICkucmVzaXplIC0+IFxuXG5cdFx0IyBcdGNhbnZhcy53aWR0aCAgPSBzLndpbmRvd1dpZHRoXG5cdFx0IyBcdGNhbnZhcy5oZWlnaHQgPSBzLndpbmRvd0hlaWdodFxuXG5cdFx0cy5wcmVsb2FkID0gLT5cblxuXHRcdFx0c291bmQgPSBzLmxvYWRTb3VuZCAnc291bmQvdGhlcmFsbF90b2dlLm1wMydcblx0XHRcdHNvdW5kLnJhdGUoMC40KVxuXHRcdFx0IyBzb3VuZC5yYXRlKDAuNSlcblxuXHRcdFx0c291bmQyID0gcy5sb2FkU291bmQgJ3NvdW5kL3RoZXJhbGxfdG9nZS5tcDMnXG5cdFx0XHRzb3VuZDIucmF0ZSgwLjUpXG5cblx0XHRcdHNvdW5kLmRpc2Nvbm5lY3QoKVxuXHRcdFx0c291bmQuY29ubmVjdCBmaWx0ZXJcblxuXHRcdFx0IyBmaWx0ZXIuc2V0VHlwZSAnaGlnaHBhc3MnXG5cdFx0XHRmaWx0ZXIuZnJlcSg1MDApXG5cblx0XHRzLnNldHVwID0gLT5cblx0XHRcdHJldmVyYiA9IG5ldyBwNS5SZXZlcmIoKVxuXHRcdFx0ZGVsYXkgPSBuZXcgcDUuRGVsYXkoKTtcblx0XHRcdGNhbnZhcyA9IHMuY3JlYXRlQ2FudmFzIHMud2luZG93V2lkdGgsIHMud2luZG93SGVpZ2h0XG5cblx0XHRcdCMgcmV2ZXJiLnByb2Nlc3MoIHNvdW5kLCA0LCAyIClcblx0XHRcdGRlbGF5LnByb2Nlc3MoIGZpbHRlciApXG5cdFx0XHRkZWxheS5zZXRUeXBlICdwaW5nUG9uZydcblx0XHRcdGRlbGF5LmRlbGF5VGltZSAwLjJcblx0XHRcdGRlbGF5LmZlZWRiYWNrIDAuNFxuXG5cblxuXHRcdFx0c291bmQubG9vcCgpO1xuXHRcdFx0IyBzb3VuZDIubG9vcCgpXG5cblx0XHRcdGZmdCA9IG5ldyBwNS5GRlQgMC45LCAxNiAqIDY0XG5cdFx0XHRmZnRfY2hlYXAgPSBuZXcgcDUuRkZUIDAuOSwgMTZcblxuXHRcdHMuZHJhdyA9ID0+XG5cblx0XHRcdGNvdW50ZXIrK1xuXG5cdFx0XHRhcHAuZW1pdCAnZnJhbWUnXG5cblx0XHRcdHMuYmFja2dyb3VuZCAwXG5cdFx0XHRzcGVjdHJ1bSA9IGZmdF9jaGVhcC5hbmFseXplKClcblxuXHRcdFx0cy5ub1N0cm9rZSgpXG5cdFx0XHRzLmZpbGwgNTAsIDUwLCA1MCAjIHNwZWN0cnVtIGlzIGdyZWVuXG5cblxuXG5cdFx0XHRpZiBjb3VudGVyICUgMSA9PSAwXG5cblx0XHRcdFx0aSA9IEB0aHJlZWQuZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoIC0gMVxuXHRcdFx0XHR3aGlsZSBpID4gMTVcblxuXHRcdFx0XHRcdEB0aHJlZWQuZ2VvbWV0cnkudmVydGljZXNbaV0ueiA9IEB0aHJlZWQuZ2VvbWV0cnkudmVydGljZXNbaS0xNl0uelxuXHRcdFx0XHRcdGktLVxuXG5cdFx0XHRpID0gMFxuXG5cblx0XHRcdHJvdyA9IEB0aHJlZWQuZ2VvbWV0cnkudmVydGljZXNcblx0XHRcdHdoaWxlIGkgPCBzcGVjdHJ1bS5sZW5ndGhcblx0XHRcdFx0eCA9IHMubWFwKCBpLCAwLCBzcGVjdHJ1bS5sZW5ndGgsIDAsIHMud2lkdGggKVxuXG5cdFx0XHRcdGggPSAtcy5oZWlnaHQgKyBzLm1hcChzcGVjdHJ1bVtpXSwgMCwgMjU1LCBzLmhlaWdodCwgMCkgKiAxXG5cblx0XHRcdFx0cy5yZWN0IHgsIHMuaGVpZ2h0LCBzLndpZHRoIC8gc3BlY3RydW0ubGVuZ3RoLCBoXG5cblx0XHRcdFx0IyBAdGhyZWVkLmdlb21ldHJ5LnZlcnRpY2VzW2ldLnogPSBzcGVjdHJ1bVtpXVxuXG5cdFx0XHRcdCMgY29uc29sZS5sb2cgXCIje2l9IDogI3tzLmhlaWdodH1cIlxuXG5cdFx0XHRcdEB0aHJlZWQuZ2VvbWV0cnkudmVydGljZXNbaV0ueiA9IGggLyAyMFxuXG5cdFx0XHRcdGkrK1xuXG5cdFx0XHRAdGhyZWVkLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRAdGhyZWVkLmdlb21ldHJ5Lm5vcm1hbHNOZWVkVXBkYXRlID0gdHJ1ZTtcblxuXHRcdFx0d2F2ZWZvcm0gPSBmZnQud2F2ZWZvcm0oKVxuXG5cdFx0XHRzLmJlZ2luU2hhcGUoKVxuXHRcdFx0cy5zdHJva2UgMTAwLCAxMDAsIDEwMCAjIHdhdmVmb3JtIGlzIHJlZFxuXHRcdFx0cy5zdHJva2VXZWlnaHQgMVxuXHRcdFx0aSA9IDBcblxuXHRcdFx0d2hpbGUgaSA8IHdhdmVmb3JtLmxlbmd0aFxuXHRcdFx0ICB4ID0gcy5tYXAoaSwgMCwgd2F2ZWZvcm0ubGVuZ3RoLCAwLCBzLndpZHRoKVxuXHRcdFx0ICB5ID0gcy5tYXAod2F2ZWZvcm1baV0sIDAsIDI1NSwgMCwgcy5oZWlnaHQpXG5cdFx0XHQgIHMudmVydGV4IHgsIHlcblx0XHRcdCAgaSsrXG5cblx0XHRcdHMuZW5kU2hhcGUoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBhcHAgPSBuZXcgQXBwKCkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsSUFBQSxhQUFBO0dBQUEsK0VBQUE7O0FBQUEsQ0FBQSxFQUFVLElBQVYsRUFBVTs7QUFFSixDQUZOO0NBSWMsQ0FBQSxDQUFBLFVBQUE7Q0FFWixzQ0FBQTtDQUFBLE9BQUEsSUFBQTtDQUFBLEdBQUEsR0FBQTtDQUFBLEVBRUUsQ0FBRixLQUFFO0NBRUQsS0FBQSxJQUFBO0NBQUEsRUFBUyxHQUFULENBQVMsR0FBQTtDQUFULEVBQ2MsQ0FBQSxDQUFiLENBQUQ7Q0FFTyxDQUFILEVBQUEsQ0FBSSxDQUFKLE9BQUE7Q0FMTCxJQUFFO0NBSkgsRUFBYTs7Q0FBYixFQVdRLEdBQVIsR0FBUztDQUVSLE9BQUEsc0RBQUE7T0FBQSxLQUFBO0NBQUEsRUFBUSxDQUFSLENBQUE7Q0FBQSxFQUNTLENBQVQsRUFBQTtDQURBLEVBRUEsQ0FBQTtDQUZBLEVBR1ksQ0FBWixLQUFBO0NBSEEsRUFJUyxDQUFULEVBQUE7Q0FKQSxFQUtTLENBQVQsRUFBQTtDQUxBLENBTWUsQ0FBRixDQUFiLEVBQUEsRUFBYTtDQU5iLEVBUVUsQ0FBVixHQUFBO0NBUkEsRUFnQlksQ0FBWixHQUFBLEVBQVk7Q0FFWCxFQUFRLEVBQVIsQ0FBQSxHQUFRLGVBQUE7Q0FBUixFQUNBLENBQUEsQ0FBSyxDQUFMO0NBREEsRUFJUyxHQUFULEdBQVMsZUFBQTtDQUpULEVBS0EsQ0FBQSxFQUFBO0NBTEEsSUFPSyxDQUFMLElBQUE7Q0FQQSxJQVFLLENBQUwsQ0FBQTtDQUdPLEVBQVAsQ0FBQSxFQUFNLE9BQU47Q0E3QkQsSUFnQlk7Q0FoQlosRUErQlUsQ0FBVixDQUFBLElBQVU7Q0FDVCxJQUFBLEtBQUE7Q0FBQSxDQUFlLENBQUYsQ0FBQSxFQUFiO0NBQUEsQ0FDYyxDQUFGLENBQUEsQ0FBWixDQUFBO0NBREEsQ0FFdUMsQ0FBOUIsR0FBVCxLQUFTLENBQUE7Q0FGVCxJQUtLLENBQUwsQ0FBQTtDQUxBLElBTUssQ0FBTCxDQUFBLEdBQUE7Q0FOQSxFQU9BLEVBQUssQ0FBTCxHQUFBO0NBUEEsRUFRQSxFQUFLLENBQUwsRUFBQTtDQVJBLEdBWUEsQ0FBSyxDQUFMO0NBWkEsQ0FlWSxDQUFaLENBQVUsRUFBVjtDQUNtQixDQUFELENBQUYsQ0FBQSxLQUFoQixJQUFBO0NBaERELElBK0JVO0NBbUJULEVBQVEsQ0FBVCxLQUFTLEVBQVQ7Q0FFQyxTQUFBLHlCQUFBO0FBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQTtDQUFBLEVBRUcsQ0FBSCxFQUFBLENBQUE7Q0FGQSxLQUlBLElBQUE7Q0FKQSxFQUtXLEdBQVgsQ0FBVyxDQUFYLENBQW9CO0NBTHBCLEtBT0EsRUFBQTtDQVBBLENBUUEsRUFBQSxFQUFBO0NBSUEsRUFBYSxDQUFWLENBQWUsQ0FBbEIsQ0FBRztDQUVGLEVBQUksRUFBQyxDQUFNLEVBQVg7Q0FDQSxDQUFBLENBQVUsWUFBSjtDQUVMLENBQTJELENBQTFCLEVBQWhDLENBQU0sRUFBUyxFQUFoQjtBQUNBLENBREEsQ0FBQSxRQUNBO0NBTkYsUUFHQztRQWZEO0NBQUEsRUFvQkksR0FBSjtDQXBCQSxFQXVCQSxFQUFPLENBQVAsRUFBc0I7Q0FDdEIsRUFBVSxHQUFWLEVBQWtCLEtBQVo7Q0FDTCxDQUFjLENBQVYsRUFBQSxDQUFBLEVBQUo7QUFFSyxDQUZMLENBRW1DLENBQS9CLEdBQUEsRUFBSjtDQUZBLENBSVUsQ0FBb0IsQ0FBOUIsQ0FBb0IsQ0FBcEIsRUFBQTtDQUpBLENBQUEsQ0FVaUMsRUFBaEMsQ0FBTSxFQUFQO0FBRUEsQ0FaQSxDQUFBLE1BWUE7Q0FyQ0QsTUF3QkE7Q0F4QkEsRUF1Q3NDLENBdkN0QyxDQXVDQyxDQUFELEVBQWdCLFVBQWhCO0NBdkNBLEVBd0NxQyxDQXhDckMsQ0F3Q0MsQ0FBRCxFQUFnQixTQUFoQjtDQXhDQSxFQTBDVyxHQUFYLEVBQUE7Q0ExQ0EsS0E0Q0EsSUFBQTtDQTVDQSxDQTZDYyxDQUFkLEdBQUE7Q0E3Q0EsS0E4Q0EsTUFBQTtDQTlDQSxFQStDSSxHQUFKO0NBRUEsRUFBVSxHQUFWLEVBQWtCLEtBQVo7Q0FDSixDQUFhLENBQVQsRUFBQSxDQUFBLEVBQUo7Q0FBQSxDQUN1QixDQUFuQixHQUFBLEVBQUo7Q0FEQSxDQUVZLElBQVosRUFBQTtBQUNBLENBSEEsQ0FBQSxNQUdBO0NBckRGLE1BaURBO0NBTUMsT0FBRCxLQUFBO0NBN0dNLElBb0RFO0NBL0RWLEVBV1E7O0NBWFI7O0NBSkQ7O0FBZ0lBLENBaElBLEVBZ0lpQixDQUFVLEVBQXJCLENBQU4ifX0seyJvZmZzZXQiOnsibGluZSI6MjQ2LCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC90aHJlZWQuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcCA9IHJlcXVpcmUgJ2FwcC9hcHAnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgdGhyZWVkXG5cblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdCMgcmVuZGVyZXJcblx0XHRyZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyIGFudGlhbGlhczogdHJ1ZSwgYWxwaGE6IHRydWVcblxuXHRcdHJlbmRlcmVyLnNldENsZWFyQ29sb3IgMHgwMDAwMDAsIDBcblx0XHRyZW5kZXJlci5zZXRTaXplIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHRcblxuXHRcdHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCByZW5kZXJlci5kb21FbGVtZW50XG5cblxuXHRcdCMgY2FtZXJhXG5cdFx0Y2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMClcblxuXHRcdHdpbmRvdy5jYW1lcmEgPSBjYW1lcmFcblx0XHRjYW1lcmEucG9zaXRpb24ueCA9IDBcblx0XHRjYW1lcmEucG9zaXRpb24ueSA9IDc1XG5cdFx0Y2FtZXJhLnBvc2l0aW9uLnogPSAyMDBcblxuXHRcdCMgY2FtZXJhLnBvc2l0aW9uLnggPSAyMDBcblx0XHQjIGNhbWVyYS5wb3NpdGlvbi55ID0gMjAwXG5cdFx0IyBjYW1lcmEucG9zaXRpb24ueiA9IDIwMFxuXG5cdFx0Y2FtZXJhLmxvb2tBdCBuZXcgVEhSRUUuVmVjdG9yM1xuXG5cdFx0IyBjYW1lcmEucG9zaXRpb24ueSA9IC00NTBcblx0XHQjIGNhbWVyYS5wb3NpdGlvbi56ID0gNDAwXG5cblx0XHQjIENvbnRyb2xzXG5cdFx0Y29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoIGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCApXG5cdFx0Y29udHJvbHMucm90YXRlU3BlZWQgICAgICAgICAgPSAxLjBcblx0XHRjb250cm9scy56b29tU3BlZWQgICAgICAgICAgICA9IDAuMztcblx0XHRjb250cm9scy5wYW5TcGVlZCAgICAgICAgICAgICA9IDAuOFxuXHRcdCMgY29udHJvbHMubm9ab29tIFx0ICAgICAgICAgID0gdHJ1ZVxuXHRcdGNvbnRyb2xzLm5vUGFuICBcdCAgICAgICAgICA9IGZhbHNlXG5cdFx0Y29udHJvbHMuc3RhdGljTW92aW5nIFx0XHQgID0gdHJ1ZVxuXHRcdGNvbnRyb2xzLmR5bmFtaWNEYW1waW5nRmFjdG9yID0gMC41XG5cblx0XHQjIHNjZW5lXG5cdFx0c2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXG5cdFx0IyBwbGFuZVxuXG5cdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDE1MCwgMTUwLCAxNSwgMTUwIClcblx0XHRtZXNoICAgICA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXG5cdFx0bWVzaC53aXJlZnJhbWUgPSB0cnVlXG5cblx0XHRwbGFuZSA9IG5ldyBUSFJFRS5NZXNoIEBnZW9tZXRyeSwgbWVzaFxuXG5cdFx0d2luZG93Lmdlb21ldHJ5ID0gQGdlb21ldHJ5XG5cdFx0d2luZG93LnBsYW5lID0gcGxhbmVcblxuXHRcdHBsYW5lLnJvdGF0aW9uLnggPSA5MCAqIE1hdGguUEkgLyAxODBcblx0XHRwbGFuZS5yb3RhdGlvbi56ID0gNDUgKiBNYXRoLlBJIC8gMTgwXG5cblx0XHRzY2VuZS5hZGQgcGxhbmVcblxuXHRcdCMgYXhpcyA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKDIwMCk7XG5cdFx0IyBzY2VuZS5hZGQgYXhpc1xuXG5cblx0XHRhcHAub24gJ2ZyYW1lJywgPT5cblxuXHRcdFx0cmVuZGVyZXIucmVuZGVyIHNjZW5lLCBjYW1lcmFcblx0XHRcdGNvbnRyb2xzLnVwZGF0ZSgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsT0FBQTs7QUFBQSxDQUFBLEVBQUEsSUFBTSxFQUFBOztBQUVOLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUdjLENBQUEsQ0FBQSxhQUFBO0NBR1osT0FBQSxzQ0FBQTtPQUFBLEtBQUE7Q0FBQSxFQUFlLENBQWYsQ0FBb0IsR0FBcEIsS0FBZTtDQUFvQixDQUFXLEVBQVgsRUFBQSxHQUFBO0NBQUEsQ0FBd0IsRUFBeEIsQ0FBaUIsQ0FBQTtDQUFwRCxLQUFlO0NBQWYsQ0FFaUMsRUFBakMsSUFBUSxLQUFSO0NBRkEsQ0FHb0MsRUFBcEMsRUFBdUIsQ0FBdkIsQ0FBUSxFQUFSLENBQUE7Q0FIQSxFQUtxQyxDQUFyQyxDQUF5QixHQUFqQixFQUFXO0NBTG5CLEdBTUEsSUFBUSxFQUFSLENBQUE7Q0FOQSxDQVVhLENBQUEsQ0FBYixDQUFrQixDQUFsQixJQUF5QyxDQUE1QixNQUFBO0NBVmIsRUFZZ0IsQ0FBaEIsRUFBTTtDQVpOLEVBYW9CLENBQXBCLEVBQU0sRUFBUztDQWJmLENBQUEsQ0Fjb0IsQ0FBcEIsRUFBTSxFQUFTO0NBZGYsRUFlb0IsQ0FBcEIsRUFBTSxFQUFTO0FBTUQsQ0FyQmQsRUFxQmMsQ0FBZCxDQUF1QixDQUFqQixDQUFOO0NBckJBLENBMkJnRCxDQUFqQyxDQUFmLENBQW9CLENBQUwsRUFBZixFQUFlLE9BQUE7Q0EzQmYsRUE0QmdDLENBQWhDLElBQVEsR0FBUjtDQTVCQSxFQTZCZ0MsQ0FBaEMsSUFBUSxDQUFSO0NBN0JBLEVBOEJnQyxDQUFoQyxJQUFRO0NBOUJSLEVBZ0M2QixDQUE3QixDQUFBLEdBQVE7Q0FoQ1IsRUFpQzRCLENBQTVCLElBQVEsSUFBUjtDQWpDQSxFQWtDZ0MsQ0FBaEMsSUFBUSxZQUFSO0NBbENBLEVBcUNZLENBQVosQ0FBQTtDQXJDQSxDQXlDMEMsQ0FBMUIsQ0FBaEIsQ0FBcUIsR0FBckIsS0FBZ0I7QUFDTCxDQTFDWCxFQTBDVyxDQUFYLENBQW9CLFlBMUNwQjtDQUFBLEVBNENpQixDQUFqQixLQUFBO0NBNUNBLENBOENrQyxDQUF0QixDQUFaLENBQUEsR0FBWTtDQTlDWixFQWdEa0IsQ0FBbEIsRUFBTSxFQUFOO0NBaERBLEVBaURlLENBQWYsQ0FBQSxDQUFNO0NBakROLENBbURtQixDQUFBLENBQW5CLENBQUssR0FBUztDQW5EZCxDQW9EbUIsQ0FBQSxDQUFuQixDQUFLLEdBQVM7Q0FwRGQsRUFzREEsQ0FBQSxDQUFLO0NBdERMLENBNERBLENBQUcsQ0FBSCxHQUFBLEVBQWdCO0NBRWYsQ0FBdUIsR0FBdkIsQ0FBQSxFQUFRO0NBQ0MsS0FBVCxFQUFRLEtBQVI7Q0FIRCxJQUFnQjtDQS9EakIsRUFBYTs7Q0FBYjs7Q0FMRCJ9fV19
*/})()