var loadFont = require('load-bmfont')

// A utility to load a font, then a texture
module.exports = function (opt, cb) {
  loadFont(opt.font, function (err, font) {
    if (err) throw err
    // THREE.ImageUtils.loadTexture(opt.image, undefined, function (tex) {
    //   cb(font, tex)
    // })
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(opt.image, function (tex) {
      cb(font, tex)
    });
  })
}
