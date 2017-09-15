'use strict';

const TWEEN = require('@tweenjs/tween.js');

const EventEmitter = require('eventemitter3');
const emitter = new EventEmitter();

const Experience = require('./Experience');
let experience;

const HUD = require('./HUD');
let hud;

let clock = new THREE.Clock();

const scene = new THREE.Scene();

let renderer;
let container;

const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 10000);
// let camera;
let vrDisplay, vrControls, arView;
/**
 * Use the `getARDisplay()` utility to leverage the WebVR API
 * to see if there are any AR-capable WebVR VRDisplays. Returns
 * a valid display if found. Otherwise, display the unsupported
 * browser message.
 */

function App_web(){
  var self = this;
  // THREE.ARUtils.getARDisplay().then(function (display) {
  //   if (display) {
  //     vrDisplay = display;
  //     console.log(self);
  //     self.init();
  //   } else {
  //     THREE.ARUtils.displayUnsupportedMessage();
  //   }
  // });

  self.init();

}

App_web.prototype = Object.create(Object.prototype);

App_web.prototype.init = function(){

    // Turn on the debugging panel
    // let arDebug = new THREE.ARDebug(vrDisplay);
    // document.body.appendChild(arDebug.getElement());

    container = document.querySelector('#webgl-content');

    // Create the renderer.
    renderer = new THREE.WebGLRenderer({transparent: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false; 

    container.appendChild(renderer.domElement);

    // Creating the ARView, which is the object that handles
    // the rendering of the camera stream behind the three.js
    // scene
    // arView = new THREE.ARView(vrDisplay, renderer);

    // The ARPerspectiveCamera is very similar to THREE.PerspectiveCamera,
    // except when using an AR-capable browser, the camera uses
    // the projection matrix provided from the device, so that the
    // perspective camera's depth planes and field of view matches
    // the physical camera on the device.
    // camera = new THREE.ARPerspectiveCamera(
    //   vrDisplay,
    //   60,
    //   window.innerWidth / window.innerHeight,
    //   vrDisplay.depthNear,
    //   vrDisplay.depthFar
    // );

    // VRControls is a utility from three.js that applies the device's
    // orientation/position to the perspective camera, keeping our
    // real world and virtual world in sync.
    vrControls = new THREE.VRControls(camera);

    scene.add(camera);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.emitter = emitter;

    let light = new THREE.AmbientLight(0xf4f4f4, 1);
    scene.add(light);

    let pLight = new THREE.PointLight(0xf4f4f4, 1);
    pLight.position.set(2,1,-1);
    scene.add(pLight);

    experience = new Experience(this);
    scene.add(experience);

    window.addEventListener('resize', onWindowResize, false);

    hud = new HUD(this);

    animate();

    function onWindowResize (event) {
      camera.aspect = container.innerWidth / container.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( container.innerWidth, container.innerHeight );
      emitter.emit('onWindowResize');
    }

    // Request animation frame loop function
    function animate() {
      renderer.animate( render );
    }

    function render() {
      var delta = clock.getDelta() * 60;

      TWEEN.update();
      // Render the device's camera stream on screen first of all.
      // It allows to get the right pose synchronized with the right frame.
      // arView.render();
      // Update our camera projection matrix in the event that
      // the near or far planes have updated
      camera.updateProjectionMatrix();
      // Update our perspective camera's positioning
      vrControls.update();
      
      renderer.clearDepth();
      renderer.render( scene, camera );

      experience.update(delta);
    }
}

module.exports = new App_web();
