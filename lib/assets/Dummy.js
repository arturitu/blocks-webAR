'use strict';

const TextSDF = require('../utils/TextSDF');
const defaults = require('lodash.defaults');

const defaultParams = {
}

function Dummy (app, params) {
  params = defaults(params, defaultParams);

  THREE.Object3D.call(this);
  
  this.app = app;
  this.state = 'pending';
  const geometry = new THREE.SphereGeometry(0.025,16,16);
  const material   = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.85 } );

  this.mesh = new THREE.Mesh(geometry,material);
  this.mesh.position.y = 0.09;
  this.add(this.mesh);

  this.stationLabel = new TextSDF(app,{owner:this,opacity:0.65, align: 'center'});
  this.add(this.stationLabel);
  this.stationLabel.setSize(0.075);
  this.stationLabel.visible = false;
  this.stationLabel.position.set(0,0.21,0);

  this.microphone = new THREE.Mesh(new THREE.PlaneGeometry(0.15,0.15), new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.65, map:  new THREE.TextureLoader().load( "textures/microphone.png" ) } ));
  this.microphone.position.y = 0.21;
  this.add(this.microphone);
}

Dummy.prototype = Object.create(THREE.Object3D.prototype);

Dummy.prototype.addText = function (text){
  this.stationLabel.visible = true;
  this.stationLabel.setText(text);
  this.microphone.visible = false;
}

Dummy.prototype.searching = function (text){
  this.stationLabel.visible = true;
  this.stationLabel.setText('Searching ' + text);
  this.microphone.visible = false;
  // this.blocksIcon.visible = true;
  this.state = 'searching';
}

Dummy.prototype.loading = function (text){
  this.stationLabel.setText('Loading Blocks');
  this.state = 'loading';
}

Dummy.prototype.update = function (dt, time) {
  if(this.state !== 'complete'){
    this.lookAt(this.app.camera.position);
  }else{
    this.rotation.set(0,0,0);
  }
}

Dummy.prototype.destroyIn = function (time){
  var self = this;
  this.state = 'complete';
  setTimeout(function() {
    self.visible = false;
    self.position.set(10000, 10000, 10000);
  }, time);
}

Dummy.prototype.complete = function (){
  this.visible = false;
  this.position.set(10000, 10000, 10000);
}

module.exports = Dummy;
