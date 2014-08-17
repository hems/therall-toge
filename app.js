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
      sound = s.loadSound('../sound/therall_toge.mp3');
      sound.rate(0.4);
      sound2 = s.loadSound('../sound/therall_toge.mp3');
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
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjoxNDYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL2FwcC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyAkID0gcmVxdWlyZSAnanF1ZXJ5J1xuXG5oYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuY2xhc3MgQXBwXG5cblx0Y29uc3RydWN0b3I6IC0+IFxuXG5cdFx0aGFwcGVucyBAXG5cblx0XHQkID0+XG5cblx0XHRcdHRocmVlZCA9IHJlcXVpcmUgJy4vdGhyZWVkJ1xuXHRcdFx0QHRocmVlZCA9IG5ldyB0aHJlZWQoKVxuXG5cdFx0XHRuZXcgcDUgQHNrZXRjaFxuXG5cdHNrZXRjaDogKHMpID0+XG5cblx0XHRzb3VuZCA9IG51bGxcblx0XHRzb3VuZDIgPSBudWxsXG5cdFx0ZmZ0ICAgPSBudWxsXG5cdFx0ZmZ0X2NoZWFwID0gbnVsbFxuXHRcdGNhbnZhcyA9IG51bGxcblx0XHRyZXZlcmIgPSBudWxsXG5cdFx0ZmlsdGVyID0gbmV3IHA1LkJhbmRQYXNzKCk7XG5cblx0XHRjb3VudGVyID0gMFxuXG5cdFx0IyBUT0RPOiBmaXggcmVzaXplIFxuXHRcdCMgJCggd2luZG93ICkucmVzaXplIC0+IFxuXG5cdFx0IyBcdGNhbnZhcy53aWR0aCAgPSBzLndpbmRvd1dpZHRoXG5cdFx0IyBcdGNhbnZhcy5oZWlnaHQgPSBzLndpbmRvd0hlaWdodFxuXG5cdFx0cy5wcmVsb2FkID0gPT5cblxuXHRcdFx0c291bmQgPSBzLmxvYWRTb3VuZCAnLi4vc291bmQvdGhlcmFsbF90b2dlLm1wMydcblx0XHRcdHNvdW5kLnJhdGUoMC40KVxuXHRcdFx0IyBzb3VuZC5yYXRlKDAuNSlcblxuXHRcdFx0c291bmQyID0gcy5sb2FkU291bmQgJy4uL3NvdW5kL3RoZXJhbGxfdG9nZS5tcDMnXG5cdFx0XHRzb3VuZDIucmF0ZSgwLjUpXG5cblx0XHRcdHNvdW5kLmRpc2Nvbm5lY3QoKVxuXHRcdFx0c291bmQuY29ubmVjdCBmaWx0ZXJcblxuXHRcdFx0IyBmaWx0ZXIuc2V0VHlwZSAnaGlnaHBhc3MnXG5cdFx0XHRmaWx0ZXIuZnJlcSg1MDApXG5cblx0XHRzLnNldHVwID0gPT5cblxuXHRcdFx0cmV2ZXJiID0gbmV3IHA1LlJldmVyYigpXG5cdFx0XHRkZWxheSA9IG5ldyBwNS5EZWxheSgpO1xuXHRcdFx0Y2FudmFzID0gcy5jcmVhdGVDYW52YXMgcy53aW5kb3dXaWR0aCwgcy53aW5kb3dIZWlnaHRcblxuXG5cdFx0XHQjIHRocmVlZCAgPSByZXF1aXJlICcuL3RocmVlZCdcblx0XHRcdCMgQHRocmVlZCA9IG5ldyB0aHJlZWQoKVxuXG5cdFx0XHQjIHB1dHMgcDUgYmVoaW5kIHRocmVlLmpzXG5cdFx0XHQjICQoICdib2R5JyApLmFwcGVuZCBjYW52YXMuY2FudmFzXG5cblx0XHRcdCMgcmV2ZXJiLnByb2Nlc3MoIHNvdW5kLCA0LCAyIClcblx0XHRcdGRlbGF5LnByb2Nlc3MoIGZpbHRlciApXG5cdFx0XHRkZWxheS5zZXRUeXBlICdwaW5nUG9uZydcblx0XHRcdGRlbGF5LmRlbGF5VGltZSAwLjJcblx0XHRcdGRlbGF5LmZlZWRiYWNrIDAuNFxuXG5cdFx0XHRzb3VuZC5sb29wKCk7XG5cdFx0XHQjIHNvdW5kMi5sb29wKClcblxuXHRcdFx0ZmZ0ID0gbmV3IHA1LkZGVCAwLjksIDE2ICogNjRcblx0XHRcdGZmdF9jaGVhcCA9IG5ldyBwNS5GRlQgMC45LCAxNlxuXG5cblx0XHRzLmRyYXcgPSA9PlxuXG5cdFx0XHRhcHAuZW1pdCAnZnJhbWUnXG5cblx0XHRcdCMgcy5iYWNrZ3JvdW5kIDBcblx0XHRcdHNwZWN0cnVtID0gZmZ0X2NoZWFwLmFuYWx5emUoKVxuXG5cdFx0XHRzLm5vU3Ryb2tlKClcblx0XHRcdHMuZmlsbCA1MCwgNTAsIDUwICMgc3BlY3RydW0gaXMgZ3JlZW5cblxuXG5cblx0XHRcdGlmIGNvdW50ZXIgJSAxID09IDBcblxuXHRcdFx0XHRpID0gQHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGggLSAxXG5cdFx0XHRcdHdoaWxlIGkgPiAxNVxuXG5cdFx0XHRcdFx0QHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gQHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlc1tpLTE2XS56XG5cdFx0XHRcdFx0aS0tXG5cblx0XHRcdGkgPSAwXG5cblxuXHRcdFx0cm93ID0gQHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlc1xuXHRcdFx0d2hpbGUgaSA8IHNwZWN0cnVtLmxlbmd0aFxuXG5cdFx0XHRcdCMgcmVndWxhciBzcXVhcmUgYmFuZHNcblx0XHRcdFx0IyB4ID0gcy5tYXAoIGksIDAsIHNwZWN0cnVtLmxlbmd0aCwgMCwgcy53aWR0aCApXG5cdFx0XHRcdGggPSAtcy5oZWlnaHQgKyBzLm1hcChzcGVjdHJ1bVtpXSwgMCwgMjU1LCBzLmhlaWdodCwgMCkgKiAxXG5cdFx0XHRcdCMgcy5yZWN0IHgsIHMuaGVpZ2h0LCBzLndpZHRoIC8gc3BlY3RydW0ubGVuZ3RoLCBoXG5cblx0XHRcdFx0eCA9IGNvdW50ZXJcblxuXHRcdFx0XHR5ID0gcy5tYXAoIGksIDAsIHNwZWN0cnVtLmxlbmd0aCwgMCwgcy5oZWlnaHQgKVxuXG5cdFx0XHRcdGNvbG9yID0gMjU1IC0gKCAyNTUgLSBzcGVjdHJ1bVtpXSApXG5cblx0XHRcdFx0cy5maWxsIGNvbG9yLCBjb2xvciwgY29sb3JcblxuXHRcdFx0XHRzLnJlY3QgeCwgeSwgMSwgcy5oZWlnaHQgLyBzcGVjdHJ1bS5sZW5ndGhcblxuXHRcdFx0XHRcblxuXHRcdFx0XHQjIGggPSAtcy5oZWlnaHQgKyBzLm1hcChzcGVjdHJ1bVtpXSwgMCwgMjU1LCBzLmhlaWdodCwgMCkgKiAxXG5cdFx0XHRcdEB0aHJlZWQuZ2VvbWV0cnkudmVydGljZXNbaV0ueiA9IGggLyAyMFxuXG5cdFx0XHRcdGkrK1xuXG5cdFx0XHRAdGhyZWVkLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRAdGhyZWVkLmdlb21ldHJ5Lm5vcm1hbHNOZWVkVXBkYXRlID0gdHJ1ZTtcblxuXHRcdFx0IyB3YXZlZm9ybSA9IGZmdC53YXZlZm9ybSgpXG5cblx0XHRcdCMgcy5iZWdpblNoYXBlKClcblx0XHRcdCMgcy5zdHJva2UgMTAwLCAxMDAsIDEwMCAjIHdhdmVmb3JtIGlzIHJlZFxuXHRcdFx0IyBzLnN0cm9rZVdlaWdodCAxXG5cdFx0XHQjIGkgPSAwXG5cblx0XHRcdCMgd2hpbGUgaSA8IHdhdmVmb3JtLmxlbmd0aFxuXHRcdFx0IyAgIHggPSBzLm1hcChpLCAwLCB3YXZlZm9ybS5sZW5ndGgsIDAsIHMud2lkdGgpXG5cdFx0XHQjICAgeSA9IHMubWFwKHdhdmVmb3JtW2ldLCAwLCAyNTUsIDAsIHMuaGVpZ2h0KVxuXHRcdFx0IyAgIHMudmVydGV4IHgsIHlcblx0XHRcdCMgICBpKytcblxuXHRcdFx0IyBzLmVuZFNoYXBlKClcblxuXHRcdFx0aWYgY291bnRlciA9PSBzLndpZHRoIHRoZW4gY291bnRlciA9IDBcblxuXHRcdFx0Y291bnRlcisrXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcCA9IG5ldyBBcHAoKSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxJQUFBLGFBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUVKLENBRk47Q0FJYyxDQUFBLENBQUEsVUFBQTtDQUVaLHNDQUFBO0NBQUEsT0FBQSxJQUFBO0NBQUEsR0FBQSxHQUFBO0NBQUEsRUFFRSxDQUFGLEtBQUU7Q0FFRCxLQUFBLElBQUE7Q0FBQSxFQUFTLEdBQVQsQ0FBUyxHQUFBO0NBQVQsRUFDYyxDQUFBLENBQWIsQ0FBRDtDQUVPLENBQUgsRUFBQSxDQUFJLENBQUosT0FBQTtDQUxMLElBQUU7Q0FKSCxFQUFhOztDQUFiLEVBV1EsR0FBUixHQUFTO0NBRVIsT0FBQSxzREFBQTtPQUFBLEtBQUE7Q0FBQSxFQUFRLENBQVIsQ0FBQTtDQUFBLEVBQ1MsQ0FBVCxFQUFBO0NBREEsRUFFQSxDQUFBO0NBRkEsRUFHWSxDQUFaLEtBQUE7Q0FIQSxFQUlTLENBQVQsRUFBQTtDQUpBLEVBS1MsQ0FBVCxFQUFBO0NBTEEsQ0FNZSxDQUFGLENBQWIsRUFBQSxFQUFhO0NBTmIsRUFRVSxDQUFWLEdBQUE7Q0FSQSxFQWdCWSxDQUFaLEdBQUEsRUFBWTtDQUVYLEVBQVEsRUFBUixDQUFBLEdBQVEsa0JBQUE7Q0FBUixFQUNBLENBQUEsQ0FBSyxDQUFMO0NBREEsRUFJUyxHQUFULEdBQVMsa0JBQUE7Q0FKVCxFQUtBLENBQUEsRUFBQTtDQUxBLElBT0ssQ0FBTCxJQUFBO0NBUEEsSUFRSyxDQUFMLENBQUE7Q0FHTyxFQUFQLENBQUEsRUFBTSxPQUFOO0NBN0JELElBZ0JZO0NBaEJaLEVBK0JVLENBQVYsQ0FBQSxJQUFVO0NBRVQsSUFBQSxLQUFBO0NBQUEsQ0FBZSxDQUFGLENBQUEsRUFBYjtDQUFBLENBQ2MsQ0FBRixDQUFBLENBQVosQ0FBQTtDQURBLENBRXVDLENBQTlCLEdBQVQsS0FBUyxDQUFBO0NBRlQsSUFZSyxDQUFMLENBQUE7Q0FaQSxJQWFLLENBQUwsQ0FBQSxHQUFBO0NBYkEsRUFjQSxFQUFLLENBQUwsR0FBQTtDQWRBLEVBZUEsRUFBSyxDQUFMLEVBQUE7Q0FmQSxHQWlCQSxDQUFLLENBQUw7Q0FqQkEsQ0FvQlksQ0FBWixDQUFVLEVBQVY7Q0FDbUIsQ0FBRCxDQUFGLENBQUEsS0FBaEIsSUFBQTtDQXRERCxJQStCVTtDQTBCVCxFQUFRLENBQVQsS0FBUyxFQUFUO0NBRUMsU0FBQSxzQkFBQTtDQUFBLEVBQUcsQ0FBSCxFQUFBLENBQUE7Q0FBQSxFQUdXLEdBQVgsQ0FBVyxDQUFYLENBQW9CO0NBSHBCLEtBS0EsRUFBQTtDQUxBLENBTUEsRUFBQSxFQUFBO0NBSUEsRUFBYSxDQUFWLENBQWUsQ0FBbEIsQ0FBRztDQUVGLEVBQUksRUFBQyxDQUFNLEVBQVg7Q0FDQSxDQUFBLENBQVUsWUFBSjtDQUVMLENBQTJELENBQTFCLEVBQWhDLENBQU0sRUFBUyxFQUFoQjtBQUNBLENBREEsQ0FBQSxRQUNBO0NBTkYsUUFHQztRQWJEO0NBQUEsRUFrQkksR0FBSjtDQWxCQSxFQXFCQSxFQUFPLENBQVAsRUFBc0I7Q0FDdEIsRUFBVSxHQUFWLEVBQWtCLEtBQVo7QUFJQSxDQUFMLENBQW1DLENBQS9CLEdBQUEsRUFBSjtDQUFBLEVBR0ksSUFISixDQUdBO0NBSEEsQ0FLYyxDQUFWLEdBQUEsRUFBSjtDQUxBLEVBT1EsRUFBUixHQUFBO0NBUEEsQ0FTYyxFQUFkLENBQUEsR0FBQTtDQVRBLENBV1UsQ0FBaUIsQ0FBM0IsRUFBZ0IsRUFBaEI7Q0FYQSxDQUFBLENBZ0JpQyxFQUFoQyxDQUFNLEVBQVA7QUFFQSxDQWxCQSxDQUFBLE1Ba0JBO0NBNUNELE1Bc0JBO0NBdEJBLEVBOENzQyxDQTlDdEMsQ0E4Q0MsQ0FBRCxFQUFnQixVQUFoQjtDQTlDQSxFQStDcUMsQ0EvQ3JDLENBK0NDLENBQUQsRUFBZ0IsU0FBaEI7Q0FpQkEsR0FBRyxDQUFXLENBQWQsQ0FBRztDQUF3QixFQUFVLElBQVYsQ0FBQTtRQWhFM0I7QUFrRUEsQ0FwRVEsTUFvRVIsTUFBQTtDQS9ITSxJQTJERTtDQXRFVixFQVdROztDQVhSOztDQUpEOztBQWtKQSxDQWxKQSxFQWtKaUIsQ0FBVSxFQUFyQixDQUFOIn19LHsib2Zmc2V0Ijp7ImxpbmUiOjIzOSwiY29sdW1uIjowfSwibWFwIjp7InZlcnNpb24iOjMsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzIjpbInNyYy9hcHAvY2FudmFzLmNvZmZlZSJdLCJzb3VyY2VzQ29udGVudCI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBdUVvQiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoyNDMsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL3RocmVlZC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwID0gcmVxdWlyZSAnYXBwL2FwcCdcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyB0aHJlZWRcblxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdFx0IyByZW5kZXJlclxuXHRcdHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIgYW50aWFsaWFzOiB0cnVlLCBhbHBoYTogdHJ1ZVxuXG5cdFx0cmVuZGVyZXIuc2V0Q2xlYXJDb2xvciAweDAwMDAwMCwgMFxuXHRcdHJlbmRlcmVyLnNldFNpemUgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodFxuXG5cdFx0cmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIHJlbmRlcmVyLmRvbUVsZW1lbnRcblxuXG5cdFx0IyBjYW1lcmFcblx0XHRjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCAxLCAxMDAwKVxuXG5cdFx0d2luZG93LmNhbWVyYSA9IGNhbWVyYVxuXHRcdGNhbWVyYS5wb3NpdGlvbi54ID0gMFxuXHRcdGNhbWVyYS5wb3NpdGlvbi55ID0gNzVcblx0XHRjYW1lcmEucG9zaXRpb24ueiA9IDIwMFxuXG5cdFx0IyBjYW1lcmEucG9zaXRpb24ueCA9IDIwMFxuXHRcdCMgY2FtZXJhLnBvc2l0aW9uLnkgPSAyMDBcblx0XHQjIGNhbWVyYS5wb3NpdGlvbi56ID0gMjAwXG5cblx0XHRjYW1lcmEubG9va0F0IG5ldyBUSFJFRS5WZWN0b3IzXG5cblx0XHQjIGNhbWVyYS5wb3NpdGlvbi55ID0gLTQ1MFxuXHRcdCMgY2FtZXJhLnBvc2l0aW9uLnogPSA0MDBcblxuXHRcdCMgQ29udHJvbHNcblx0XHRjb250cm9scyA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyggY2FtZXJhLCByZW5kZXJlci5kb21FbGVtZW50IClcblx0XHRjb250cm9scy5yb3RhdGVTcGVlZCAgICAgICAgICA9IDEuMFxuXHRcdGNvbnRyb2xzLnpvb21TcGVlZCAgICAgICAgICAgID0gMC4zO1xuXHRcdGNvbnRyb2xzLnBhblNwZWVkICAgICAgICAgICAgID0gMC44XG5cdFx0IyBjb250cm9scy5ub1pvb20gXHQgICAgICAgICAgPSB0cnVlXG5cdFx0Y29udHJvbHMubm9QYW4gIFx0ICAgICAgICAgID0gZmFsc2Vcblx0XHRjb250cm9scy5zdGF0aWNNb3ZpbmcgXHRcdCAgPSB0cnVlXG5cdFx0Y29udHJvbHMuZHluYW1pY0RhbXBpbmdGYWN0b3IgPSAwLjVcblxuXHRcdCMgc2NlbmVcblx0XHRzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpXG5cblx0XHQjIHBsYW5lXG5cblx0XHRAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggMTUwLCAxNTAsIDE1LCAxNjAgKVxuXHRcdG1lc2ggICAgID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsXG5cblx0XHRtZXNoLndpcmVmcmFtZSA9IHRydWVcblxuXHRcdHBsYW5lID0gbmV3IFRIUkVFLk1lc2ggQGdlb21ldHJ5LCBtZXNoXG5cblx0XHR3aW5kb3cuZ2VvbWV0cnkgPSBAZ2VvbWV0cnlcblx0XHR3aW5kb3cucGxhbmUgPSBwbGFuZVxuXG5cdFx0cGxhbmUucm90YXRpb24ueCA9IDkwICogTWF0aC5QSSAvIDE4MFxuXHRcdHBsYW5lLnJvdGF0aW9uLnogPSA0NSAqIE1hdGguUEkgLyAxODBcblxuXHRcdHNjZW5lLmFkZCBwbGFuZVxuXG5cdFx0IyBheGlzID0gbmV3IFRIUkVFLkF4aXNIZWxwZXIoMjAwKTtcblx0XHQjIHNjZW5lLmFkZCBheGlzXG5cblxuXHRcdGFwcC5vbiAnZnJhbWUnLCA9PlxuXG5cdFx0XHRyZW5kZXJlci5yZW5kZXIgc2NlbmUsIGNhbWVyYVxuXHRcdFx0Y29udHJvbHMudXBkYXRlKCkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxPQUFBOztBQUFBLENBQUEsRUFBQSxJQUFNLEVBQUE7O0FBRU4sQ0FGQSxFQUV1QixHQUFqQixDQUFOO0NBR2MsQ0FBQSxDQUFBLGFBQUE7Q0FHWixPQUFBLHNDQUFBO09BQUEsS0FBQTtDQUFBLEVBQWUsQ0FBZixDQUFvQixHQUFwQixLQUFlO0NBQW9CLENBQVcsRUFBWCxFQUFBLEdBQUE7Q0FBQSxDQUF3QixFQUF4QixDQUFpQixDQUFBO0NBQXBELEtBQWU7Q0FBZixDQUVpQyxFQUFqQyxJQUFRLEtBQVI7Q0FGQSxDQUdvQyxFQUFwQyxFQUF1QixDQUF2QixDQUFRLEVBQVIsQ0FBQTtDQUhBLEVBS3FDLENBQXJDLENBQXlCLEdBQWpCLEVBQVc7Q0FMbkIsR0FNQSxJQUFRLEVBQVIsQ0FBQTtDQU5BLENBVWEsQ0FBQSxDQUFiLENBQWtCLENBQWxCLElBQXlDLENBQTVCLE1BQUE7Q0FWYixFQVlnQixDQUFoQixFQUFNO0NBWk4sRUFhb0IsQ0FBcEIsRUFBTSxFQUFTO0NBYmYsQ0FBQSxDQWNvQixDQUFwQixFQUFNLEVBQVM7Q0FkZixFQWVvQixDQUFwQixFQUFNLEVBQVM7QUFNRCxDQXJCZCxFQXFCYyxDQUFkLENBQXVCLENBQWpCLENBQU47Q0FyQkEsQ0EyQmdELENBQWpDLENBQWYsQ0FBb0IsQ0FBTCxFQUFmLEVBQWUsT0FBQTtDQTNCZixFQTRCZ0MsQ0FBaEMsSUFBUSxHQUFSO0NBNUJBLEVBNkJnQyxDQUFoQyxJQUFRLENBQVI7Q0E3QkEsRUE4QmdDLENBQWhDLElBQVE7Q0E5QlIsRUFnQzZCLENBQTdCLENBQUEsR0FBUTtDQWhDUixFQWlDNEIsQ0FBNUIsSUFBUSxJQUFSO0NBakNBLEVBa0NnQyxDQUFoQyxJQUFRLFlBQVI7Q0FsQ0EsRUFxQ1ksQ0FBWixDQUFBO0NBckNBLENBeUMwQyxDQUExQixDQUFoQixDQUFxQixHQUFyQixLQUFnQjtBQUNMLENBMUNYLEVBMENXLENBQVgsQ0FBb0IsWUExQ3BCO0NBQUEsRUE0Q2lCLENBQWpCLEtBQUE7Q0E1Q0EsQ0E4Q2tDLENBQXRCLENBQVosQ0FBQSxHQUFZO0NBOUNaLEVBZ0RrQixDQUFsQixFQUFNLEVBQU47Q0FoREEsRUFpRGUsQ0FBZixDQUFBLENBQU07Q0FqRE4sQ0FtRG1CLENBQUEsQ0FBbkIsQ0FBSyxHQUFTO0NBbkRkLENBb0RtQixDQUFBLENBQW5CLENBQUssR0FBUztDQXBEZCxFQXNEQSxDQUFBLENBQUs7Q0F0REwsQ0E0REEsQ0FBRyxDQUFILEdBQUEsRUFBZ0I7Q0FFZixDQUF1QixHQUF2QixDQUFBLEVBQVE7Q0FDQyxLQUFULEVBQVEsS0FBUjtDQUhELElBQWdCO0NBL0RqQixFQUFhOztDQUFiOztDQUxEIn19XX0=
*/})()