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
      var color, h, i, row, spectrum, x, y;
      app.emit('frame');
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
        h = -s.height + s.map(spectrum[i], 0, 255, s.height, 0) * 1;
        x = counter;
        y = s.map(i, 0, spectrum.length, 0, s.height);
        color = 255 - (255 - spectrum[i]);
        s.fill(color, color, color);
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
    this.geometry = new THREE.PlaneGeometry(150, 150, 15, 160);
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
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjoxNDYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL2FwcC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyAkID0gcmVxdWlyZSAnanF1ZXJ5J1xuXG5oYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuY2xhc3MgQXBwXG5cblx0Y29uc3RydWN0b3I6IC0+IFxuXG5cdFx0aGFwcGVucyBAXG5cblx0XHQkID0+XG5cblx0XHRcdHRocmVlZCA9IHJlcXVpcmUgJy4vdGhyZWVkJ1xuXHRcdFx0QHRocmVlZCA9IG5ldyB0aHJlZWQoKVxuXG5cdFx0XHRuZXcgcDUgQHNrZXRjaFxuXG5cdHNrZXRjaDogKHMpID0+XG5cblx0XHRzb3VuZCA9IG51bGxcblx0XHRzb3VuZDIgPSBudWxsXG5cdFx0ZmZ0ICAgPSBudWxsXG5cdFx0ZmZ0X2NoZWFwID0gbnVsbFxuXHRcdGNhbnZhcyA9IG51bGxcblx0XHRyZXZlcmIgPSBudWxsXG5cdFx0ZmlsdGVyID0gbmV3IHA1LkJhbmRQYXNzKCk7XG5cblx0XHRjb3VudGVyID0gMFxuXG5cdFx0IyBUT0RPOiBmaXggcmVzaXplIFxuXHRcdCMgJCggd2luZG93ICkucmVzaXplIC0+IFxuXG5cdFx0IyBcdGNhbnZhcy53aWR0aCAgPSBzLndpbmRvd1dpZHRoXG5cdFx0IyBcdGNhbnZhcy5oZWlnaHQgPSBzLndpbmRvd0hlaWdodFxuXG5cdFx0cy5wcmVsb2FkID0gPT5cblxuXHRcdFx0c291bmQgPSBzLmxvYWRTb3VuZCAnc291bmQvdGhlcmFsbF90b2dlLm1wMydcblx0XHRcdHNvdW5kLnJhdGUoMC40KVxuXHRcdFx0IyBzb3VuZC5yYXRlKDAuNSlcblxuXHRcdFx0c291bmQyID0gcy5sb2FkU291bmQgJ3NvdW5kL3RoZXJhbGxfdG9nZS5tcDMnXG5cdFx0XHRzb3VuZDIucmF0ZSgwLjUpXG5cblx0XHRcdHNvdW5kLmRpc2Nvbm5lY3QoKVxuXHRcdFx0c291bmQuY29ubmVjdCBmaWx0ZXJcblxuXHRcdFx0IyBmaWx0ZXIuc2V0VHlwZSAnaGlnaHBhc3MnXG5cdFx0XHRmaWx0ZXIuZnJlcSg1MDApXG5cblx0XHRzLnNldHVwID0gPT5cblxuXHRcdFx0cmV2ZXJiID0gbmV3IHA1LlJldmVyYigpXG5cdFx0XHRkZWxheSA9IG5ldyBwNS5EZWxheSgpO1xuXHRcdFx0Y2FudmFzID0gcy5jcmVhdGVDYW52YXMgcy53aW5kb3dXaWR0aCwgcy53aW5kb3dIZWlnaHRcblxuXG5cdFx0XHQjIHRocmVlZCAgPSByZXF1aXJlICcuL3RocmVlZCdcblx0XHRcdCMgQHRocmVlZCA9IG5ldyB0aHJlZWQoKVxuXG5cdFx0XHQjIHB1dHMgcDUgYmVoaW5kIHRocmVlLmpzXG5cdFx0XHQjICQoICdib2R5JyApLmFwcGVuZCBjYW52YXMuY2FudmFzXG5cblx0XHRcdCMgcmV2ZXJiLnByb2Nlc3MoIHNvdW5kLCA0LCAyIClcblx0XHRcdGRlbGF5LnByb2Nlc3MoIGZpbHRlciApXG5cdFx0XHRkZWxheS5zZXRUeXBlICdwaW5nUG9uZydcblx0XHRcdGRlbGF5LmRlbGF5VGltZSAwLjJcblx0XHRcdGRlbGF5LmZlZWRiYWNrIDAuNFxuXG5cdFx0XHRzb3VuZC5sb29wKCk7XG5cdFx0XHQjIHNvdW5kMi5sb29wKClcblxuXHRcdFx0ZmZ0ID0gbmV3IHA1LkZGVCAwLjksIDE2ICogNjRcblx0XHRcdGZmdF9jaGVhcCA9IG5ldyBwNS5GRlQgMC45LCAxNlxuXG5cblx0XHRzLmRyYXcgPSA9PlxuXG5cdFx0XHRhcHAuZW1pdCAnZnJhbWUnXG5cblx0XHRcdCMgcy5iYWNrZ3JvdW5kIDBcblx0XHRcdHNwZWN0cnVtID0gZmZ0X2NoZWFwLmFuYWx5emUoKVxuXG5cdFx0XHRzLm5vU3Ryb2tlKClcblx0XHRcdHMuZmlsbCA1MCwgNTAsIDUwICMgc3BlY3RydW0gaXMgZ3JlZW5cblxuXG5cblx0XHRcdGlmIGNvdW50ZXIgJSAxID09IDBcblxuXHRcdFx0XHRpID0gQHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGggLSAxXG5cdFx0XHRcdHdoaWxlIGkgPiAxNVxuXG5cdFx0XHRcdFx0QHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gQHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlc1tpLTE2XS56XG5cdFx0XHRcdFx0aS0tXG5cblx0XHRcdGkgPSAwXG5cblxuXHRcdFx0cm93ID0gQHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlc1xuXHRcdFx0d2hpbGUgaSA8IHNwZWN0cnVtLmxlbmd0aFxuXG5cdFx0XHRcdCMgcmVndWxhciBzcXVhcmUgYmFuZHNcblx0XHRcdFx0IyB4ID0gcy5tYXAoIGksIDAsIHNwZWN0cnVtLmxlbmd0aCwgMCwgcy53aWR0aCApXG5cdFx0XHRcdGggPSAtcy5oZWlnaHQgKyBzLm1hcChzcGVjdHJ1bVtpXSwgMCwgMjU1LCBzLmhlaWdodCwgMCkgKiAxXG5cdFx0XHRcdCMgcy5yZWN0IHgsIHMuaGVpZ2h0LCBzLndpZHRoIC8gc3BlY3RydW0ubGVuZ3RoLCBoXG5cblx0XHRcdFx0eCA9IGNvdW50ZXJcblxuXHRcdFx0XHR5ID0gcy5tYXAoIGksIDAsIHNwZWN0cnVtLmxlbmd0aCwgMCwgcy5oZWlnaHQgKVxuXG5cdFx0XHRcdGNvbG9yID0gMjU1IC0gKCAyNTUgLSBzcGVjdHJ1bVtpXSApXG5cblx0XHRcdFx0cy5maWxsIGNvbG9yLCBjb2xvciwgY29sb3JcblxuXHRcdFx0XHRzLnJlY3QgeCwgeSwgMSwgcy5oZWlnaHQgLyBzcGVjdHJ1bS5sZW5ndGhcblxuXHRcdFx0XHRcblxuXHRcdFx0XHQjIGggPSAtcy5oZWlnaHQgKyBzLm1hcChzcGVjdHJ1bVtpXSwgMCwgMjU1LCBzLmhlaWdodCwgMCkgKiAxXG5cdFx0XHRcdEB0aHJlZWQuZ2VvbWV0cnkudmVydGljZXNbaV0ueiA9IGggLyAyMFxuXG5cdFx0XHRcdGkrK1xuXG5cdFx0XHRAdGhyZWVkLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRAdGhyZWVkLmdlb21ldHJ5Lm5vcm1hbHNOZWVkVXBkYXRlID0gdHJ1ZTtcblxuXHRcdFx0IyB3YXZlZm9ybSA9IGZmdC53YXZlZm9ybSgpXG5cblx0XHRcdCMgcy5iZWdpblNoYXBlKClcblx0XHRcdCMgcy5zdHJva2UgMTAwLCAxMDAsIDEwMCAjIHdhdmVmb3JtIGlzIHJlZFxuXHRcdFx0IyBzLnN0cm9rZVdlaWdodCAxXG5cdFx0XHQjIGkgPSAwXG5cblx0XHRcdCMgd2hpbGUgaSA8IHdhdmVmb3JtLmxlbmd0aFxuXHRcdFx0IyAgIHggPSBzLm1hcChpLCAwLCB3YXZlZm9ybS5sZW5ndGgsIDAsIHMud2lkdGgpXG5cdFx0XHQjICAgeSA9IHMubWFwKHdhdmVmb3JtW2ldLCAwLCAyNTUsIDAsIHMuaGVpZ2h0KVxuXHRcdFx0IyAgIHMudmVydGV4IHgsIHlcblx0XHRcdCMgICBpKytcblxuXHRcdFx0IyBzLmVuZFNoYXBlKClcblxuXHRcdFx0aWYgY291bnRlciA9PSBzLndpZHRoIHRoZW4gY291bnRlciA9IDBcblxuXHRcdFx0Y291bnRlcisrXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcCA9IG5ldyBBcHAoKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxJQUFBLGFBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUVKLENBRk47Q0FJYyxDQUFBLENBQUEsVUFBQTtDQUVaLHNDQUFBO0NBQUEsT0FBQSxJQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsRUFFRSxDQUFGLEtBQUU7Q0FFRCxLQUFBLElBQUE7Q0FBQSxFQUFTLEdBQVQsQ0FBUyxHQUFBO0NBQVQsRUFDYyxDQUFBLENBQWIsQ0FBRDtDQUVPLENBQUgsRUFBQSxDQUFJLENBQUosT0FBQTtDQUxMLElBQUU7Q0FKSCxFQUFhOztDQUFiLEVBV1EsR0FBUixHQUFTO0NBRVIsT0FBQSxzREFBQTtPQUFBLEtBQUE7Q0FBQSxFQUFRLENBQVIsQ0FBQTtDQUFBLEVBQ1MsQ0FBVCxFQUFBO0NBREEsRUFFQSxDQUFBO0NBRkEsRUFHWSxDQUFaLEtBQUE7Q0FIQSxFQUlTLENBQVQsRUFBQTtDQUpBLEVBS1MsQ0FBVCxFQUFBO0NBTEEsQ0FNZSxDQUFGLENBQWIsRUFBQSxFQUFhO0NBTmIsRUFRVSxDQUFWLEdBQUE7Q0FSQSxFQWdCWSxDQUFaLEdBQUEsRUFBWTtDQUVYLEVBQVEsRUFBUixDQUFBLEdBQVEsZUFBQTtDQUFSLEVBQ0EsQ0FBQSxDQUFLLENBQUw7Q0FEQSxFQUlTLEdBQVQsR0FBUyxlQUFBO0NBSlQsRUFLQSxDQUFBLEVBQUE7Q0FMQSxJQU9LLENBQUwsSUFBQTtDQVBBLElBUUssQ0FBTCxDQUFBO0NBR08sRUFBUCxDQUFBLEVBQU0sT0FBTjtDQTdCRCxJQWdCWTtDQWhCWixFQStCVSxDQUFWLENBQUEsSUFBVTtDQUVULElBQUEsS0FBQTtDQUFBLENBQWUsQ0FBRixDQUFBLEVBQWI7Q0FBQSxDQUNjLENBQUYsQ0FBQSxDQUFaLENBQUE7Q0FEQSxDQUV1QyxDQUE5QixHQUFULEtBQVMsQ0FBQTtDQUZULElBWUssQ0FBTCxDQUFBO0NBWkEsSUFhSyxDQUFMLENBQUEsR0FBQTtDQWJBLEVBY0EsRUFBSyxDQUFMLEdBQUE7Q0FkQSxFQWVBLEVBQUssQ0FBTCxFQUFBO0NBZkEsR0FpQkEsQ0FBSyxDQUFMO0NBakJBLENBb0JZLENBQVosQ0FBVSxFQUFWO0NBQ21CLENBQUQsQ0FBRixDQUFBLEtBQWhCLElBQUE7Q0F0REQsSUErQlU7Q0EwQlQsRUFBUSxDQUFULEtBQVMsRUFBVDtDQUVDLFNBQUEsc0JBQUE7Q0FBQSxFQUFHLENBQUgsRUFBQSxDQUFBO0NBQUEsRUFHVyxHQUFYLENBQVcsQ0FBWCxDQUFvQjtDQUhwQixLQUtBLEVBQUE7Q0FMQSxDQU1BLEVBQUEsRUFBQTtDQUlBLEVBQWEsQ0FBVixDQUFlLENBQWxCLENBQUc7Q0FFRixFQUFJLEVBQUMsQ0FBTSxFQUFYO0NBQ0EsQ0FBQSxDQUFVLFlBQUo7Q0FFTCxDQUEyRCxDQUExQixFQUFoQyxDQUFNLEVBQVMsRUFBaEI7QUFDQSxDQURBLENBQUEsUUFDQTtDQU5GLFFBR0M7UUFiRDtDQUFBLEVBa0JJLEdBQUo7Q0FsQkEsRUFxQkEsRUFBTyxDQUFQLEVBQXNCO0NBQ3RCLEVBQVUsR0FBVixFQUFrQixLQUFaO0FBSUEsQ0FBTCxDQUFtQyxDQUEvQixHQUFBLEVBQUo7Q0FBQSxFQUdJLElBSEosQ0FHQTtDQUhBLENBS2MsQ0FBVixHQUFBLEVBQUo7Q0FMQSxFQU9RLEVBQVIsR0FBQTtDQVBBLENBU2MsRUFBZCxDQUFBLEdBQUE7Q0FUQSxDQVdVLENBQWlCLENBQTNCLEVBQWdCLEVBQWhCO0NBWEEsQ0FBQSxDQWdCaUMsRUFBaEMsQ0FBTSxFQUFQO0FBRUEsQ0FsQkEsQ0FBQSxNQWtCQTtDQTVDRCxNQXNCQTtDQXRCQSxFQThDc0MsQ0E5Q3RDLENBOENDLENBQUQsRUFBZ0IsVUFBaEI7Q0E5Q0EsRUErQ3FDLENBL0NyQyxDQStDQyxDQUFELEVBQWdCLFNBQWhCO0NBaUJBLEdBQUcsQ0FBVyxDQUFkLENBQUc7Q0FBd0IsRUFBVSxJQUFWLENBQUE7UUFoRTNCO0FBa0VBLENBcEVRLE1Bb0VSLE1BQUE7Q0EvSE0sSUEyREU7Q0F0RVYsRUFXUTs7Q0FYUjs7Q0FKRDs7QUFrSkEsQ0FsSkEsRUFrSmlCLENBQVUsRUFBckIsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoyMzksImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL2NhbnZhcy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXVFb0IifX0seyJvZmZzZXQiOnsibGluZSI6MjQzLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC90aHJlZWQuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcCA9IHJlcXVpcmUgJ2FwcC9hcHAnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgdGhyZWVkXG5cblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdCMgcmVuZGVyZXJcblx0XHRyZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyIGFudGlhbGlhczogdHJ1ZSwgYWxwaGE6IHRydWVcblxuXHRcdHJlbmRlcmVyLnNldENsZWFyQ29sb3IgMHgwMDAwMDAsIDBcblx0XHRyZW5kZXJlci5zZXRTaXplIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHRcblxuXHRcdHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCByZW5kZXJlci5kb21FbGVtZW50XG5cblxuXHRcdCMgY2FtZXJhXG5cdFx0Y2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMClcblxuXHRcdHdpbmRvdy5jYW1lcmEgPSBjYW1lcmFcblx0XHRjYW1lcmEucG9zaXRpb24ueCA9IDBcblx0XHRjYW1lcmEucG9zaXRpb24ueSA9IDc1XG5cdFx0Y2FtZXJhLnBvc2l0aW9uLnogPSAyMDBcblxuXHRcdCMgY2FtZXJhLnBvc2l0aW9uLnggPSAyMDBcblx0XHQjIGNhbWVyYS5wb3NpdGlvbi55ID0gMjAwXG5cdFx0IyBjYW1lcmEucG9zaXRpb24ueiA9IDIwMFxuXG5cdFx0Y2FtZXJhLmxvb2tBdCBuZXcgVEhSRUUuVmVjdG9yM1xuXG5cdFx0IyBjYW1lcmEucG9zaXRpb24ueSA9IC00NTBcblx0XHQjIGNhbWVyYS5wb3NpdGlvbi56ID0gNDAwXG5cblx0XHQjIENvbnRyb2xzXG5cdFx0Y29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoIGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCApXG5cdFx0Y29udHJvbHMucm90YXRlU3BlZWQgICAgICAgICAgPSAxLjBcblx0XHRjb250cm9scy56b29tU3BlZWQgICAgICAgICAgICA9IDAuMztcblx0XHRjb250cm9scy5wYW5TcGVlZCAgICAgICAgICAgICA9IDAuOFxuXHRcdCMgY29udHJvbHMubm9ab29tIFx0ICAgICAgICAgID0gdHJ1ZVxuXHRcdGNvbnRyb2xzLm5vUGFuICBcdCAgICAgICAgICA9IGZhbHNlXG5cdFx0Y29udHJvbHMuc3RhdGljTW92aW5nIFx0XHQgID0gdHJ1ZVxuXHRcdGNvbnRyb2xzLmR5bmFtaWNEYW1waW5nRmFjdG9yID0gMC41XG5cblx0XHQjIHNjZW5lXG5cdFx0c2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXG5cdFx0IyBwbGFuZVxuXG5cdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDE1MCwgMTUwLCAxNSwgMTYwIClcblx0XHRtZXNoICAgICA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXG5cdFx0bWVzaC53aXJlZnJhbWUgPSB0cnVlXG5cblx0XHRwbGFuZSA9IG5ldyBUSFJFRS5NZXNoIEBnZW9tZXRyeSwgbWVzaFxuXG5cdFx0d2luZG93Lmdlb21ldHJ5ID0gQGdlb21ldHJ5XG5cdFx0d2luZG93LnBsYW5lID0gcGxhbmVcblxuXHRcdHBsYW5lLnJvdGF0aW9uLnggPSA5MCAqIE1hdGguUEkgLyAxODBcblx0XHRwbGFuZS5yb3RhdGlvbi56ID0gNDUgKiBNYXRoLlBJIC8gMTgwXG5cblx0XHRzY2VuZS5hZGQgcGxhbmVcblxuXHRcdCMgYXhpcyA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKDIwMCk7XG5cdFx0IyBzY2VuZS5hZGQgYXhpc1xuXG5cblx0XHRhcHAub24gJ2ZyYW1lJywgPT5cblxuXHRcdFx0cmVuZGVyZXIucmVuZGVyIHNjZW5lLCBjYW1lcmFcblx0XHRcdGNvbnRyb2xzLnVwZGF0ZSgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsT0FBQTs7QUFBQSxDQUFBLEVBQUEsSUFBTSxFQUFBOztBQUVOLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUdjLENBQUEsQ0FBQSxhQUFBO0NBR1osT0FBQSxzQ0FBQTtPQUFBLEtBQUE7Q0FBQSxFQUFlLENBQWYsQ0FBb0IsR0FBcEIsS0FBZTtDQUFvQixDQUFXLEVBQVgsRUFBQSxHQUFBO0NBQUEsQ0FBd0IsRUFBeEIsQ0FBaUIsQ0FBQTtDQUFwRCxLQUFlO0NBQWYsQ0FFaUMsRUFBakMsSUFBUSxLQUFSO0NBRkEsQ0FHb0MsRUFBcEMsRUFBdUIsQ0FBdkIsQ0FBUSxFQUFSLENBQUE7Q0FIQSxFQUtxQyxDQUFyQyxDQUF5QixHQUFqQixFQUFXO0NBTG5CLEdBTUEsSUFBUSxFQUFSLENBQUE7Q0FOQSxDQVVhLENBQUEsQ0FBYixDQUFrQixDQUFsQixJQUF5QyxDQUE1QixNQUFBO0NBVmIsRUFZZ0IsQ0FBaEIsRUFBTTtDQVpOLEVBYW9CLENBQXBCLEVBQU0sRUFBUztDQWJmLENBQUEsQ0Fjb0IsQ0FBcEIsRUFBTSxFQUFTO0NBZGYsRUFlb0IsQ0FBcEIsRUFBTSxFQUFTO0FBTUQsQ0FyQmQsRUFxQmMsQ0FBZCxDQUF1QixDQUFqQixDQUFOO0NBckJBLENBMkJnRCxDQUFqQyxDQUFmLENBQW9CLENBQUwsRUFBZixFQUFlLE9BQUE7Q0EzQmYsRUE0QmdDLENBQWhDLElBQVEsR0FBUjtDQTVCQSxFQTZCZ0MsQ0FBaEMsSUFBUSxDQUFSO0NBN0JBLEVBOEJnQyxDQUFoQyxJQUFRO0NBOUJSLEVBZ0M2QixDQUE3QixDQUFBLEdBQVE7Q0FoQ1IsRUFpQzRCLENBQTVCLElBQVEsSUFBUjtDQWpDQSxFQWtDZ0MsQ0FBaEMsSUFBUSxZQUFSO0NBbENBLEVBcUNZLENBQVosQ0FBQTtDQXJDQSxDQXlDMEMsQ0FBMUIsQ0FBaEIsQ0FBcUIsR0FBckIsS0FBZ0I7QUFDTCxDQTFDWCxFQTBDVyxDQUFYLENBQW9CLFlBMUNwQjtDQUFBLEVBNENpQixDQUFqQixLQUFBO0NBNUNBLENBOENrQyxDQUF0QixDQUFaLENBQUEsR0FBWTtDQTlDWixFQWdEa0IsQ0FBbEIsRUFBTSxFQUFOO0NBaERBLEVBaURlLENBQWYsQ0FBQSxDQUFNO0NBakROLENBbURtQixDQUFBLENBQW5CLENBQUssR0FBUztDQW5EZCxDQW9EbUIsQ0FBQSxDQUFuQixDQUFLLEdBQVM7Q0FwRGQsRUFzREEsQ0FBQSxDQUFLO0NBdERMLENBNERBLENBQUcsQ0FBSCxHQUFBLEVBQWdCO0NBRWYsQ0FBdUIsR0FBdkIsQ0FBQSxFQUFRO0NBQ0MsS0FBVCxFQUFRLEtBQVI7Q0FIRCxJQUFnQjtDQS9EakIsRUFBYTs7Q0FBYjs7Q0FMRCJ9fV19
*/})()