'use strict';

const defaults = require('lodash.defaults');

const defaultParams = {
}

function HUD (app,params) {
  params = defaults(params, defaultParams);
}

HUD.prototype = Object.create(Object.prototype);

module.exports = HUD;
