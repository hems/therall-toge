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
var App, Color, QueryString, app, happens, query, track_id,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

happens = require('happens');

Color = net.brehaut.Color;

/*
# Stolen Query String parser + current query string parsed
*/


QueryString = (function() {
  function QueryString(queryString) {
    var key, pair, value, _ref;
    this.queryString = queryString;
    this.queryString || (this.queryString = (_ref = window.document.location.search) != null ? _ref.substr(1) : void 0);
    this.variables = this.queryString.split('&');
    this.pairs = (function() {
      var _i, _len, _ref1, _ref2, _results;
      _ref1 = this.variables;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        pair = _ref1[_i];
        _results.push((_ref2 = pair.split('='), key = _ref2[0], value = _ref2[1], _ref2));
      }
      return _results;
    }).call(this);
  }

  QueryString.prototype.get = function(name) {
    var key, value, _i, _len, _ref, _ref1;
    _ref = this.pairs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], key = _ref1[0], value = _ref1[1];
      if (key === name) {
        return value;
      }
    }
  };

  return QueryString;

})();

query = new QueryString;

/*
# Create global track_id in order to retrieve audio later,
# a default value is associated
*/


track_id = 1412201;

App = (function() {
  function App() {
    this.sketch = __bind(this.sketch, this);
    this.start = __bind(this.start, this);
    var _this = this;
    happens(this);
    $(function() {
      var url;
      if (!query.get('url')) {
        _this.start();
        return;
      }
      url = query.get('url');
      console.warn("url ->" + query.get('url'));
      url = "http://hems.io/therall-toge/resolve.php?track_url=" + url;
      return $.getJSON(url, function(track) {
        track_id = track.id;
        return _this.start();
      });
    });
  }

  App.prototype.start = function() {
    var threed;
    threed = require('./threed');
    this.threed = new threed();
    return new p5(this.sketch);
  };

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
      sound = sound = s.loadSound("//hems.io/therall-toge/streamer.php?track_id=" + track_id);
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
//@ sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic2VjdGlvbnMiOlt7Im9mZnNldCI6eyJsaW5lIjoxNDYsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL2FwcC5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIyAkID0gcmVxdWlyZSAnanF1ZXJ5J1xuXG5oYXBwZW5zID0gcmVxdWlyZSAnaGFwcGVucydcblxuQ29sb3IgPSBuZXQuYnJlaGF1dC5Db2xvclxuXG4jIyNcbiMgU3RvbGVuIFF1ZXJ5IFN0cmluZyBwYXJzZXIgKyBjdXJyZW50IHF1ZXJ5IHN0cmluZyBwYXJzZWRcbiMjI1xuY2xhc3MgUXVlcnlTdHJpbmdcblx0XG5cdGNvbnN0cnVjdG9yOiAoQHF1ZXJ5U3RyaW5nKSAtPlxuXHRcdEBxdWVyeVN0cmluZyBvcj0gd2luZG93LmRvY3VtZW50LmxvY2F0aW9uLnNlYXJjaD8uc3Vic3RyIDFcblx0XHRAdmFyaWFibGVzID0gQHF1ZXJ5U3RyaW5nLnNwbGl0ICcmJ1xuXHRcdEBwYWlycyA9IChba2V5LCB2YWx1ZV0gPSBwYWlyLnNwbGl0ICc9JyBmb3IgcGFpciBpbiBAdmFyaWFibGVzKVxuXHRcblx0Z2V0OiAobmFtZSkgLT5cblx0XHRmb3IgW2tleSwgdmFsdWVdIGluIEBwYWlyc1xuXHRcdFx0cmV0dXJuIHZhbHVlIGlmIGtleSBpcyBuYW1lXG5cbnF1ZXJ5ID0gbmV3IFF1ZXJ5U3RyaW5nXG5cblxuIyMjXG4jIENyZWF0ZSBnbG9iYWwgdHJhY2tfaWQgaW4gb3JkZXIgdG8gcmV0cmlldmUgYXVkaW8gbGF0ZXIsXG4jIGEgZGVmYXVsdCB2YWx1ZSBpcyBhc3NvY2lhdGVkXG4jIyNcblxudHJhY2tfaWQgPSAxNDEyMjAxXG5cblxuY2xhc3MgQXBwXG5cblx0Y29uc3RydWN0b3I6IC0+IFxuXG5cdFx0aGFwcGVucyBAXG5cblxuXHRcdCQgPT5cblxuXHRcdFx0dW5sZXNzIHF1ZXJ5LmdldCggJ3VybCcgKVxuXHRcdFx0XHRAc3RhcnQoKVxuXG5cdFx0XHRcdHJldHVyblxuXG5cblx0XHRcdHVybCA9IHF1ZXJ5LmdldCAndXJsJ1xuXG5cdFx0XHRjb25zb2xlLndhcm4gXCJ1cmwgLT5cIiArIHF1ZXJ5LmdldCAoJ3VybCcpXG5cblx0XHRcdHVybCA9IFwiaHR0cDovL2hlbXMuaW8vdGhlcmFsbC10b2dlL3Jlc29sdmUucGhwP3RyYWNrX3VybD0je3VybH1cIlxuXG5cdFx0XHQkLmdldEpTT04gdXJsLCAoIHRyYWNrICkgPT5cblxuXG5cdFx0XHRcdHRyYWNrX2lkID0gdHJhY2suaWRcblxuXHRcdFx0XHRAc3RhcnQoKVxuXG5cblxuXG5cblx0c3RhcnQ6ID0+XG5cdFx0dGhyZWVkID0gcmVxdWlyZSAnLi90aHJlZWQnXG5cdFx0QHRocmVlZCA9IG5ldyB0aHJlZWQoKVxuXG5cdFx0bmV3IHA1IEBza2V0Y2hcblxuXHRza2V0Y2g6IChzKSA9PlxuXG5cdFx0c291bmQgPSBudWxsXG5cdFx0c291bmQyID0gbnVsbFxuXHRcdGZmdCAgID0gbnVsbFxuXHRcdGZmdF9jaGVhcCA9IG51bGxcblx0XHRjYW52YXMgPSBudWxsXG5cdFx0cmV2ZXJiID0gbnVsbFxuXHRcdGZpbHRlciA9IG5ldyBwNS5CYW5kUGFzcygpO1xuXG5cdFx0Y291bnRlciA9IDBcblxuXHRcdCMgVE9ETzogZml4IHJlc2l6ZSBcblx0XHQjICQoIHdpbmRvdyApLnJlc2l6ZSAtPiBcblxuXHRcdCMgXHRjYW52YXMud2lkdGggID0gcy53aW5kb3dXaWR0aFxuXHRcdCMgXHRjYW52YXMuaGVpZ2h0ID0gcy53aW5kb3dIZWlnaHRcblxuXHRcdHMucHJlbG9hZCA9ID0+XG5cblx0XHRcdCMgYXBpLnNvdW5kID0gc291bmQgPSBzLmxvYWRTb3VuZCBcImh0dHA6Ly9oZW1zLmlvL3RoZXJhbGwtdG9nZS9zdHJlYW1lci5waHA/dHJhY2tfaWQ9OTI0NDE5OFwiXG5cdFx0XHRzb3VuZCA9IHNvdW5kID0gcy5sb2FkU291bmQgXCIvL2hlbXMuaW8vdGhlcmFsbC10b2dlL3N0cmVhbWVyLnBocD90cmFja19pZD0je3RyYWNrX2lkfVwiXG5cblx0XHRcdHNvdW5kLnJhdGUoMC41KVxuXG5cdFx0cy5zZXR1cCA9ID0+XG5cblx0XHRcdGNhbnZhcyA9IHMuY3JlYXRlQ2FudmFzIHMud2luZG93V2lkdGgsIHMud2luZG93SGVpZ2h0XG5cblx0XHRcdHNvdW5kLmxvb3AoKTtcblxuXHRcdFx0ZmZ0ID0gbmV3IHA1LkZGVCAwLjksIDE2ICogNjRcblxuXHRcdFx0ZmZ0X2NoZWFwID0gbmV3IHA1LkZGVCAwLjksIDE2ICogMlxuXG5cblx0XHRzLmRyYXcgPSA9PlxuXG5cdFx0XHRhcHAuZW1pdCAnZnJhbWUnXG5cblx0XHRcdCMgcy5iYWNrZ3JvdW5kIDBcblx0XHRcdHNwZWN0cnVtID0gZmZ0X2NoZWFwLmFuYWx5emUoKVxuXG5cdFx0XHRzLm5vU3Ryb2tlKClcblx0XHRcdHMuZmlsbCA1MCwgNTAsIDUwICMgc3BlY3RydW0gaXMgZ3JlZW5cblxuXG5cblx0XHRcdGlmIGNvdW50ZXIgJSAxID09IDBcblxuXHRcdFx0XHRpID0gQHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlcy5sZW5ndGggLSAxXG5cdFx0XHRcdHdoaWxlIGkgPiAzMVxuXG5cdFx0XHRcdFx0QHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gQHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlc1tpLTMyXS56XG5cdFx0XHRcdFx0aS0tXG5cblx0XHRcdGkgPSAwXG5cblx0XHRcdHJvdyA9IEB0aHJlZWQuZ2VvbWV0cnkudmVydGljZXNcblx0XHRcdHdoaWxlIGkgPCBzcGVjdHJ1bS5sZW5ndGhcblxuXHRcdFx0XHQjIHJlZ3VsYXIgc3F1YXJlIGJhbmRzXG5cdFx0XHRcdCMgeCA9IHMubWFwKCBpLCAwLCBzcGVjdHJ1bS5sZW5ndGgsIDAsIHMud2lkdGggKVxuXHRcdFx0XHRoID0gLXMuaGVpZ2h0ICsgcy5tYXAoc3BlY3RydW1baV0sIDAsIDI1NSwgcy5oZWlnaHQsIDApICogMVxuXHRcdFx0XHQjIHMucmVjdCB4LCBzLmhlaWdodCwgcy53aWR0aCAvIHNwZWN0cnVtLmxlbmd0aCwgaFxuXG5cdFx0XHRcdHggPSBjb3VudGVyXG5cblx0XHRcdFx0eSA9IHMubWFwKCBpLCAwLCBzcGVjdHJ1bS5sZW5ndGgsIDAsIHMuaGVpZ2h0IClcblxuXHRcdFx0XHRjb2xvciA9IENvbG9yXG5cdFx0XHRcdFx0aHVlOiBzcGVjdHJ1bVtpXSAvIDI1NSAqIDM2MFxuXHRcdFx0XHRcdHNhdHVyYXRpb246IDAuMVxuXHRcdFx0XHRcdHZhbHVlOiAwLjFcblxuXHRcdFx0XHRjb2xvciA9IGNvbG9yLnNldExpZ2h0bmVzcyBzcGVjdHJ1bVtpXSAvIDI1NSAqIDAuOFxuXG5cdFx0XHRcdHMuZmlsbCBjb2xvci5nZXRSZWQoKSAqIDI1NSwgY29sb3IuZ2V0R3JlZW4oKSAqIDI1NSwgY29sb3IuZ2V0Qmx1ZSgpICogMjU1XG5cblxuXG5cdFx0XHRcdHMucmVjdCB4LCB5LCAxLCBzLmhlaWdodCAvIHNwZWN0cnVtLmxlbmd0aFxuXG5cdFx0XHRcdFxuXG5cdFx0XHRcdCMgaCA9IC1zLmhlaWdodCArIHMubWFwKHNwZWN0cnVtW2ldLCAwLCAyNTUsIHMuaGVpZ2h0LCAwKSAqIDFcblx0XHRcdFx0QHRocmVlZC5nZW9tZXRyeS52ZXJ0aWNlc1tpXS56ID0gaCAvIDIwXG5cblx0XHRcdFx0aSsrXG5cblx0XHRcdEB0aHJlZWQuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcblx0XHRcdEB0aHJlZWQuZ2VvbWV0cnkubm9ybWFsc05lZWRVcGRhdGUgPSB0cnVlO1xuXG5cdFx0XHQjIHdhdmVmb3JtID0gZmZ0LndhdmVmb3JtKClcblxuXHRcdFx0IyBzLmJlZ2luU2hhcGUoKVxuXHRcdFx0IyBzLnN0cm9rZSAxMDAsIDEwMCwgMTAwICMgd2F2ZWZvcm0gaXMgcmVkXG5cdFx0XHQjIHMuc3Ryb2tlV2VpZ2h0IDFcblx0XHRcdCMgaSA9IDBcblxuXHRcdFx0IyB3aGlsZSBpIDwgd2F2ZWZvcm0ubGVuZ3RoXG5cdFx0XHQjICAgeCA9IHMubWFwKGksIDAsIHdhdmVmb3JtLmxlbmd0aCwgMCwgcy53aWR0aClcblx0XHRcdCMgICB5ID0gcy5tYXAod2F2ZWZvcm1baV0sIDAsIDI1NSwgMCwgcy5oZWlnaHQpXG5cdFx0XHQjICAgcy52ZXJ0ZXggeCwgeVxuXHRcdFx0IyAgIGkrK1xuXG5cdFx0XHQjIHMuZW5kU2hhcGUoKVxuXG5cdFx0XHRpZiBjb3VudGVyID09IHMud2lkdGggdGhlbiBjb3VudGVyID0gMFxuXG5cdFx0XHRjb3VudGVyKytcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gYXBwID0gbmV3IEFwcCgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLElBQUEsa0RBQUE7R0FBQSwrRUFBQTs7QUFBQSxDQUFBLEVBQVUsSUFBVixFQUFVOztBQUVWLENBRkEsRUFFUSxFQUFSLEVBQW1COztDQUVuQjs7O0NBSkE7O0FBT00sQ0FQTjtDQVNjLENBQUEsQ0FBQSxRQUFBLFVBQUU7Q0FDZCxPQUFBLGNBQUE7Q0FBQSxFQURjLENBQUQsT0FDYjtDQUFBLEdBQUEsRUFBaUI7Q0FBakIsRUFDYSxDQUFiLENBQWEsSUFBYixFQUF5QjtDQUR6QixHQUVBLENBQUE7O0NBQVU7Q0FBQTtZQUFBLGdDQUFBOzBCQUFBO0NBQUEsQ0FBQyxDQUFjLENBQUksQ0FBSixHQUFBO0NBQWY7O0NBRlY7Q0FERCxFQUFhOztDQUFiLEVBS0EsQ0FBSyxLQUFDO0NBQ0wsT0FBQSx5QkFBQTtDQUFBO0NBQUEsRUFBQSxNQUFBLGtDQUFBO0NBQ0MsQ0FESTtDQUNKLEVBQWdCLENBQUEsQ0FBTyxDQUF2QjtDQUFBLElBQUEsVUFBTztRQURSO0NBQUEsSUFESTtDQUxMLEVBS0s7O0NBTEw7O0NBVEQ7O0FBa0JBLENBbEJBLEVBa0JRLEVBQVIsTUFsQkE7O0NBcUJBOzs7O0NBckJBOztBQTBCQSxDQTFCQSxFQTBCVyxJQTFCWCxDQTBCQTs7QUFHTSxDQTdCTjtDQStCYyxDQUFBLENBQUEsVUFBQTtDQUVaLHNDQUFBO0NBQUEsb0NBQUE7Q0FBQSxPQUFBLElB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Q0FyTEEsRUFxTGlCLENBQVUsRUFBckIsQ0FBTiJ9fSx7Im9mZnNldCI6eyJsaW5lIjoyOTgsImNvbHVtbiI6MH0sIm1hcCI6eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJzcmMvYXBwL2NhbnZhcy5jb2ZmZWUiXSwic291cmNlc0NvbnRlbnQiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXVFb0IifX0seyJvZmZzZXQiOnsibGluZSI6MzAyLCJjb2x1bW4iOjB9LCJtYXAiOnsidmVyc2lvbiI6MywiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXMiOlsic3JjL2FwcC90aHJlZWQuY29mZmVlIl0sInNvdXJjZXNDb250ZW50IjpbImFwcCA9IHJlcXVpcmUgJ2FwcC9hcHAnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgdGhyZWVkXG5cblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdCMgcmVuZGVyZXJcblx0XHRyZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyIGFudGlhbGlhczogdHJ1ZSwgYWxwaGE6IHRydWVcblxuXHRcdHJlbmRlcmVyLnNldENsZWFyQ29sb3IgMHgwMDAwMDAsIDBcblx0XHRyZW5kZXJlci5zZXRTaXplIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHRcblxuXHRcdHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCByZW5kZXJlci5kb21FbGVtZW50XG5cblxuXHRcdCMgY2FtZXJhXG5cdFx0Y2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMClcblxuXHRcdHdpbmRvdy5jYW1lcmEgPSBjYW1lcmFcblx0XHRjYW1lcmEucG9zaXRpb24ueCA9IDBcblx0XHRjYW1lcmEucG9zaXRpb24ueSA9IDc1XG5cdFx0Y2FtZXJhLnBvc2l0aW9uLnogPSAyMDBcblxuXHRcdCMgY2FtZXJhLnBvc2l0aW9uLnggPSAyMDBcblx0XHQjIGNhbWVyYS5wb3NpdGlvbi55ID0gMjAwXG5cdFx0IyBjYW1lcmEucG9zaXRpb24ueiA9IDIwMFxuXG5cdFx0Y2FtZXJhLmxvb2tBdCBuZXcgVEhSRUUuVmVjdG9yM1xuXG5cdFx0IyBjYW1lcmEucG9zaXRpb24ueSA9IC00NTBcblx0XHQjIGNhbWVyYS5wb3NpdGlvbi56ID0gNDAwXG5cblx0XHQjIENvbnRyb2xzXG5cdFx0Y29udHJvbHMgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMoIGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCApXG5cdFx0Y29udHJvbHMucm90YXRlU3BlZWQgICAgICAgICAgPSAxLjBcblx0XHRjb250cm9scy56b29tU3BlZWQgICAgICAgICAgICA9IDAuMztcblx0XHRjb250cm9scy5wYW5TcGVlZCAgICAgICAgICAgICA9IDAuOFxuXHRcdCMgY29udHJvbHMubm9ab29tIFx0ICAgICAgICAgID0gdHJ1ZVxuXHRcdGNvbnRyb2xzLm5vUGFuICBcdCAgICAgICAgICA9IGZhbHNlXG5cdFx0Y29udHJvbHMuc3RhdGljTW92aW5nIFx0XHQgID0gdHJ1ZVxuXHRcdGNvbnRyb2xzLmR5bmFtaWNEYW1waW5nRmFjdG9yID0gMC41XG5cblx0XHQjIHNjZW5lXG5cdFx0c2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKVxuXG5cdFx0IyBwbGFuZVxuXG5cdFx0QGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoIDE1MCwgMTUwLCAzMSwgMTYwIClcblx0XHRtZXNoICAgICA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbFxuXG5cdFx0bWVzaC53aXJlZnJhbWUgPSB0cnVlXG5cblx0XHRwbGFuZSA9IG5ldyBUSFJFRS5NZXNoIEBnZW9tZXRyeSwgbWVzaFxuXG5cdFx0d2luZG93Lmdlb21ldHJ5ID0gQGdlb21ldHJ5XG5cdFx0d2luZG93LnBsYW5lID0gcGxhbmVcblxuXHRcdHBsYW5lLnJvdGF0aW9uLnggPSA5MCAqIE1hdGguUEkgLyAxODBcblx0XHRwbGFuZS5yb3RhdGlvbi56ID0gNDUgKiBNYXRoLlBJIC8gMTgwXG5cblx0XHRzY2VuZS5hZGQgcGxhbmVcblxuXHRcdCMgYXhpcyA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKDIwMCk7XG5cdFx0IyBzY2VuZS5hZGQgYXhpc1xuXG5cblx0XHRhcHAub24gJ2ZyYW1lJywgPT5cblxuXHRcdFx0cmVuZGVyZXIucmVuZGVyIHNjZW5lLCBjYW1lcmFcblx0XHRcdGNvbnRyb2xzLnVwZGF0ZSgpIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsT0FBQTs7QUFBQSxDQUFBLEVBQUEsSUFBTSxFQUFBOztBQUVOLENBRkEsRUFFdUIsR0FBakIsQ0FBTjtDQUdjLENBQUEsQ0FBQSxhQUFBO0NBR1osT0FBQSxzQ0FBQTtPQUFBLEtBQUE7Q0FBQSxFQUFlLENBQWYsQ0FBb0IsR0FBcEIsS0FBZTtDQUFvQixDQUFXLEVBQVgsRUFBQSxHQUFBO0NBQUEsQ0FBd0IsRUFBeEIsQ0FBaUIsQ0FBQTtDQUFwRCxLQUFlO0NBQWYsQ0FFaUMsRUFBakMsSUFBUSxLQUFSO0NBRkEsQ0FHb0MsRUFBcEMsRUFBdUIsQ0FBdkIsQ0FBUSxFQUFSLENBQUE7Q0FIQSxFQUtxQyxDQUFyQyxDQUF5QixHQUFqQixFQUFXO0NBTG5CLEdBTUEsSUFBUSxFQUFSLENBQUE7Q0FOQSxDQVVhLENBQUEsQ0FBYixDQUFrQixDQUFsQixJQUF5QyxDQUE1QixNQUFBO0NBVmIsRUFZZ0IsQ0FBaEIsRUFBTTtDQVpOLEVBYW9CLENBQXBCLEVBQU0sRUFBUztDQWJmLENBQUEsQ0Fjb0IsQ0FBcEIsRUFBTSxFQUFTO0NBZGYsRUFlb0IsQ0FBcEIsRUFBTSxFQUFTO0FBTUQsQ0FyQmQsRUFxQmMsQ0FBZCxDQUF1QixDQUFqQixDQUFOO0NBckJBLENBMkJnRCxDQUFqQyxDQUFmLENBQW9CLENBQUwsRUFBZixFQUFlLE9BQUE7Q0EzQmYsRUE0QmdDLENBQWhDLElBQVEsR0FBUjtDQTVCQSxFQTZCZ0MsQ0FBaEMsSUFBUSxDQUFSO0NBN0JBLEVBOEJnQyxDQUFoQyxJQUFRO0NBOUJSLEVBZ0M2QixDQUE3QixDQUFBLEdBQVE7Q0FoQ1IsRUFpQzRCLENBQTVCLElBQVEsSUFBUjtDQWpDQSxFQWtDZ0MsQ0FBaEMsSUFBUSxZQUFSO0NBbENBLEVBcUNZLENBQVosQ0FBQTtDQXJDQSxDQXlDMEMsQ0FBMUIsQ0FBaEIsQ0FBcUIsR0FBckIsS0FBZ0I7QUFDTCxDQTFDWCxFQTBDVyxDQUFYLENBQW9CLFlBMUNwQjtDQUFBLEVBNENpQixDQUFqQixLQUFBO0NBNUNBLENBOENrQyxDQUF0QixDQUFaLENBQUEsR0FBWTtDQTlDWixFQWdEa0IsQ0FBbEIsRUFBTSxFQUFOO0NBaERBLEVBaURlLENBQWYsQ0FBQSxDQUFNO0NBakROLENBbURtQixDQUFBLENBQW5CLENBQUssR0FBUztDQW5EZCxDQW9EbUIsQ0FBQSxDQUFuQixDQUFLLEdBQVM7Q0FwRGQsRUFzREEsQ0FBQSxDQUFLO0NBdERMLENBNERBLENBQUcsQ0FBSCxHQUFBLEVBQWdCO0NBRWYsQ0FBdUIsR0FBdkIsQ0FBQSxFQUFRO0NBQ0MsS0FBVCxFQUFRLEtBQVI7Q0FIRCxJQUFnQjtDQS9EakIsRUFBYTs7Q0FBYjs7Q0FMRCJ9fV19
*/})()