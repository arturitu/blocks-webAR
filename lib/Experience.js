'use strict';

const defaults = require('lodash.defaults');

const GBlockLoader = require('./utils/GBlockLoader');

const defaultParams = {
}

const Dummy = require('./assets/Dummy');

const RecognitionManager = require('./assets/RecognitionManager.js');

function Experience (app,params) {
  params = defaults(params, defaultParams);

  this.app = app;
  THREE.Object3D.call(this);

  this.dummyArr = [];
  this.activeDummy;

  this.mixer = null;

  app.renderer.domElement.addEventListener('touchstart', this.onClick.bind(this), false);

  this.myRecognizer = new RecognitionManager(app);
  this.app.emitter.on('recognized', this.recognized.bind(this));
  this.app.emitter.on('notRecognized', this.notRecognized.bind(this));

}

Experience.prototype = Object.create(THREE.Object3D.prototype);

Experience.prototype.addDummy = function () {
  if(this.activeDummy && this.activeDummy.state === 'pending'){
    this.removeDummy();
  }
  var dummy = new Dummy(this.app);
  dummy.position.set(10000, 10000, 10000);
  this.app.scene.add(dummy);
  this.dummyArr.push(dummy);
  this.activeDummy = dummy;

}

Experience.prototype.recognized = function (text) {
  // console.log('---',text);
  // Search on Google
  // this.activeDummy.addText(text);
  var self = this;
  this.activeDummy.searching(text);
  var xhr = new XMLHttpRequest();
  var url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyCzPnxUNXDhqPdJHrXqR8wQ_hgDsKNAKyM&cx=005677168257634972215:a3cm8betzc8&q=' + text;
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
          var json = JSON.parse(xhr.responseText);
          console.log(json);
          if(json.items && json.items.length>0){
            var idModel = json.items[0].formattedUrl.substr(30, json.items[0].formattedUrl.length);
            self.searchGLTFModel(idModel);
          }else{
            self.nothingFound();
          }
      }
  };
  xhr.send();
}

Experience.prototype.searchGLTFModel = function (id) {
  var self = this;
  // https://github.com/archilogic-com/aframe-gblock/blob/master/src/gblock.js
  fetch('https://gblock.herokuapp.com/get-gltf-url/' + id).then(function (response) {
    return response.text().then(function (text) {
      if (!response.ok){
        // throw new Error('ERROR: ' + response.status + ' "' + text + '"')
        self.errorGettingGBlock(text);
      }else{
        // load glTF model from original URL
        self.loadModel(text);
        self.activeDummy.loading(text);
      }
    })
  });

}

Experience.prototype.loadModel = function (gltfUrl) {
  var self = this;
  self.loader = new GBlockLoader();
  self.loader.load( gltfUrl, function gltfLoaded (gltfModel) {
    self.model = gltfModel.scene || gltfModel.scenes[0];
    console.log('Model loaded',self.model);
    // FIXME: adapt projection matrix in original shaders
    self.model.traverse(function (child) {
      if (child.material){
        child.material = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors });
      }
    })
    // for (var i = 0; i < self.model.children.length; i++) {
    //   console.log(self.model.children[i]);
    //   self.activeDummy.add(self.model.children[i]);
    // }
    var container = new THREE.Group();
    container.children = self.model.children;
    console.log('---',container);
    // var mesh = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1));
    self.model.scale.set(0.25,0.25,0.25);
    self.activeDummy.add(self.model);
    self.activeDummy.state = 'complete';
    self.activeDummy.mesh.visible = false;
    self.activeDummy.stationLabel.visible = false;
    self.model.animations = gltfModel.animations;
    
  },function (){},function gltfError (e) {
    console.log('Error:',e);
  });
}

Experience.prototype.errorGettingGBlock = function (text) {
  this.activeDummy.stationLabel.setText('Error: ' + text);
  this.activeDummy.destroyIn(2000);
}

Experience.prototype.nothingFound = function () {
  this.activeDummy.stationLabel.setText('Nothing found');
  var self = this;
  this.activeDummy.destroyIn(2000);
}

Experience.prototype.notRecognized = function (text) {
  this.removeDummy();
}

Experience.prototype.removeDummy = function (){
  // TODO to remove correctly
  if(this.activeDummy){
    this.activeDummy.complete();
  }
}

Experience.prototype.onClick = function(e){
    this.addDummy();
    // If we don't have a touches object, abort
    // TODO: is this necessary?
    if (!e.touches[0]) {
      return;
    }
    // Inspect the event object and generate normalize screen coordinates
    // (between 0 and 1) for the screen position.
    // var x = e.touches[0].pageX / window.innerWidth;
    // var y = e.touches[0].pageY / window.innerHeight;
    var x = 0.5;
    var y = 0.5;
    // Send a ray from the point of click to the real world surface
    // and attempt to find a hit. `hitTest` returns an array of potential
    // hits.
    var hits = this.app.vrDisplay.hitTest(x, y);
    // If a hit is found, just use the first one
    if (hits && hits.length) {
      var hit = hits[0];
      // Use the `placeObjectAtHit` utility to position
      // the cube where the hit occurred
      THREE.ARUtils.placeObjectAtHit(this.activeDummy,  // The object to place
                                     hit,   // The VRHit object to move the cube to
                                     true, // Whether or not we also apply orientation
                                     1);    // Easing value from 0 to 1; we want to move
                                            // the cube directly to the hit position
    }
    this.myRecognizer.init();
}

Experience.prototype.update = function (dt, time) {
  for (var i = 0; i < this.dummyArr.length; i++) {
    this.dummyArr[i].update(dt,time);
  }
}

module.exports = Experience;
