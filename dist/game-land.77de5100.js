// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"l_react.ts":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Init = exports.modifyTree = exports.Node = exports.Component = exports.Text = exports.VElem = void 0;

var VElem =
/** @class */
function () {
  function VElem(type, props, children, value) {
    if (props === void 0) {
      props = {};
    }

    if (children === void 0) {
      children = [];
    }

    this.isRoot = false;
    this.type = type;
    this.props = props;
    this.children = children.filter(function (x) {
      return x !== null;
    });
    this.isTextNode = this.type === 'text-node';
    this.value = value;
  }

  VElem.prototype.toString = function () {
    if (this.isTextNode) {
      return this.value.toString();
    }

    var _a = this,
        props = _a.props,
        type = _a.type,
        children = _a.children;

    return "<" + type + " props=\"" + JSON.stringify(props) + "\">\n                        " + children.map(function (c) {
      return c.toString();
    }).join('\n') + "\n                </" + type + ">\n        ";
  };

  VElem.prototype.getElem = function () {
    if (!this._elem) return undefined;
    if (this.isTextNode) return {
      type: 'text',
      e: this._elem
    };
    return {
      type: 'elem',
      e: this._elem
    };
  };

  return VElem;
}();

exports.VElem = VElem;

function Text(v) {
  return new VElem('text-node', {}, [], v);
}

exports.Text = Text;

var Component =
/** @class */
function () {
  function Component(props) {
    this.props = props;
  }

  Component.prototype.setState = function (s) {
    var _a;

    if (this.state) {
      this.state = __assign(__assign({}, this.state), s);
      (_a = this.paint) === null || _a === void 0 ? void 0 : _a.call(this, this);
    }
  };

  return Component;
}();

exports.Component = Component;
Component.prototype.__isComponent = true;

function createVElement(node, props, children) {
  var asAny = node;

  if (asAny.prototype && asAny.prototype.__isComponent) {
    var C = node;
    var c_1 = new C(__assign(__assign({}, props), {
      children: children
    }));

    c_1.paint = function (x) {
      return repaint(x);
    };

    c_1._vnode = c_1.render();
    c_1._vnode._name = c_1.constructor.name;

    if (c_1.componentDidMount) {
      c_1._vnode.componentDidMount = function () {
        return c_1.componentDidMount();
      };
    }

    if (c_1.componentDidUnmount) {
      c_1._vnode.componentDidUnmount = function () {
        return c_1.componentDidUnmount();
      };
    }

    return c_1._vnode;
  } else if (typeof node === 'function') {
    var F = node;
    return F(__assign(__assign({}, props), {
      children: children
    }));
  }

  return new VElem(node, props, children);
}

function repaint(c) {
  var oldTree = c._vnode;
  var newTree = c.render();
  newTree.componentDidMount = oldTree.componentDidMount;
  newTree.componentDidUnmount = oldTree.componentDidUnmount; // console.log(oldTree.toString());
  // console.log(newTree.toString());

  var parent = oldTree === null || oldTree === void 0 ? void 0 : oldTree._parent;
  modifyTree(newTree, parent, oldTree);
  c._vnode = newTree;

  if (oldTree === null || oldTree === void 0 ? void 0 : oldTree.isRoot) {
    var domParent = oldTree._dom;
    domParent.replaceChild(newTree._elem, oldTree._elem);
    newTree.isRoot = true;
    newTree._dom = domParent;
  }
}

function Node(type, props, children) {
  if (props === void 0) {
    props = {};
  }

  if (children === void 0) {
    children = [];
  }

  return createVElement(type, props, children);
}

exports.Node = Node;

function modifyTree(tree, parent, prevTree) {
  var _a, _b;

  var props = tree.props,
      children = tree.children,
      type = tree.type;

  if (prevTree && prevTree.type === type && children.length === prevTree.children.length) {
    // replace attributes
    var pte = prevTree.getElem();
    if (!objectsShallowEqual(props, prevTree.props) && pte.type === 'elem') assignProps(pte.e, props);
    tree._elem = pte.e;
    tree._parent = prevTree._parent;

    if (tree.isTextNode && pte.type === 'text') {
      pte.e.data = tree.toString();
    } else {
      loopThroughChildren(tree, prevTree, function (c, pc, i) {
        modifyTree(c, tree, pc);
      }, function (pc, i) {
        var _a;

        prevTree._elem.removeChild(pc._elem);

        (_a = prevTree.componentDidUnmount) === null || _a === void 0 ? void 0 : _a.call(prevTree);
      });
    }
  } else {
    // replace this node and all children
    var element = tree.isTextNode ? document.createTextNode(tree.value) : document.createElement(type);
    tree._elem = element;
    tree._parent = parent;

    if (prevTree) {
      prevTree._parent._elem.replaceChild(element, prevTree._elem);

      (_a = prevTree.componentDidUnmount) === null || _a === void 0 ? void 0 : _a.call(prevTree);
    } else if (parent) {
      parent._elem.appendChild(element);
    }

    (_b = tree.componentDidMount) === null || _b === void 0 ? void 0 : _b.call(tree);
    var te = tree.getElem();
    if (te && te.type === 'elem') assignProps(te.e, props);

    if (props.ref) {
      props.ref(tree._elem);
    }

    loopThroughChildren(tree, prevTree, function (c, pc, i) {
      modifyTree(c, tree, undefined);
    }, function (pc, i) {
      var _a;

      prevTree._elem.removeChild(pc._elem);

      (_a = prevTree.componentDidUnmount) === null || _a === void 0 ? void 0 : _a.call(prevTree);
    });
  }
}

exports.modifyTree = modifyTree;

function loopThroughChildren(tree, prevTree, both, prevOnly) {
  var _a;

  var prevChildren = (_a = prevTree ? prevTree.children : []) !== null && _a !== void 0 ? _a : [];
  tree.children.forEach(function (c, i) {
    both(c, prevChildren[i], i);
  });

  if (!prevTree || tree.children.length > prevChildren.length) {
    return;
  }

  for (var i = tree.children.length; i < prevChildren.length; i++) {
    prevOnly(prevChildren[i], i);
  }
}

function assignProps(element, props) {
  if (props.style) Object.assign(element.style, props.style);
  if (props.onClick) element.onclick = function (e) {
    return props.onClick(e);
  };
  if (props.onMouseDown) element.onmousedown = function (e) {
    return props.onMouseDown(e);
  };
  if (props.onMouseUp) element.onmouseup = function (e) {
    return props.onMouseUp(e);
  };
  if (props.onTouchStart) element.ontouchstart = function (e) {
    return props.onTouchStart(e);
  };
  if (props.onTouchEnd) element.ontouchend = function (e) {
    return props.onTouchEnd(e);
  };
  if (props.onChange) element.oninput = function (e) {
    return props.onChange(e);
  };
  var rawAttributes = new Set(['width', 'height', 'href', 'id', 'value']);
  Object.keys(props).forEach(function (k) {
    if (rawAttributes.has(k)) {
      element[k] = props[k];
    }
  });
}

function objectsShallowEqual(obj1, obj2) {
  var obj1Keys = Object.keys(obj1);
  var obj2Keys = new Set(Object.keys(obj2));
  if (obj1Keys.length !== obj2Keys.size) return false;

  for (var _i = 0, obj1Keys_1 = obj1Keys; _i < obj1Keys_1.length; _i++) {
    var key = obj1Keys_1[_i];
    if (!obj2Keys.has(key)) return false;
    var v1 = obj1[key];
    var v2 = obj2[key];
    if (v1 !== v2) return false;
  }

  return true;
}

function Init(node, domParent) {
  node.isRoot = true;
  modifyTree(node);
  domParent.appendChild(node._elem);
  node._dom = domParent;
}

exports.Init = Init;
},{}],"pacman/pt.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pt = exports.Radians2Degrees = void 0;
exports.Radians2Degrees = 180 / Math.PI;

var Pt =
/** @class */
function () {
  function Pt(x, y) {
    if (x === void 0) {
      x = 0;
    }

    if (y === void 0) {
      y = 0;
    }

    this.x = x;
    this.y = y;
  }

  Pt.prototype.copy = function () {
    return new Pt(this.x, this.y);
  };

  Pt.prototype.toString = function () {
    return "<" + this.x + ", " + this.y + ">";
  };

  Pt.prototype.floor = function () {
    return new Pt(Math.floor(this.x), Math.floor(this.y));
  };

  Pt.prototype.ceil = function () {
    return new Pt(Math.ceil(this.x), Math.ceil(this.y));
  };

  Pt.prototype.round = function () {
    return new Pt(Math.round(this.x), Math.round(this.y));
  };

  Pt.prototype.scale = function (v) {
    return new Pt(this.x * v, this.y * v);
  };

  Pt.prototype.addY = function (yv) {
    return new Pt(this.x, this.y + yv);
  };

  Pt.prototype.add = function (x, y) {
    return new Pt(this.x + x, this.y + y);
  };

  Pt.prototype.addP = function (_a) {
    var x = _a.x,
        y = _a.y;
    return new Pt(this.x + x, this.y + y);
  };

  Pt.prototype.eq = function (p) {
    return this.x === p.x && this.y === p.y;
  };

  Pt.prototype.dist = function (p) {
    var diff = this.addP(p.scale(-1));
    return diff.mag();
  };

  Pt.fromAngle = function (angle) {
    var rv = new Pt(0, 0);
    angle /= exports.Radians2Degrees;
    rv.x = Math.cos(angle);
    rv.y = Math.sin(angle);
    return rv;
  };

  Pt.prototype.getAngle = function () {
    var angle = exports.Radians2Degrees * Math.atan(this.y / this.x);
    if (this.x < 0.0) angle += 180.0;else if (this.y < 0.0) angle += 360.0;
    return angle;
  };

  Pt.prototype.mag = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  Pt.prototype.unit = function () {
    return this.scale(1 / this.mag());
  };

  return Pt;
}();

exports.Pt = Pt;
},{}],"pacman/game.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Game = exports.Ghost = exports.Pacman = exports.Agent = exports.Level = exports.DIRECTIONS = exports.level1 = void 0;

var pt_1 = require("./pt");

var halfLevel1 = "# level 1\n+-------+---------   \n|       |        |   \n|       |        |   \n|       |        |   \n|       |        |   \n+-----------+----+---\n|       |   |        \n|       |   |        \n|       |   |        \n|       |   +---+    \n|       |       |    \n|       |       |    \n|       |       |    \n+-------+   +---+---+\n        |   |       g\n        |   |       g\n        |   |       g\n        |   |       g\n        |   |       g\nt---p-------+   ggggg\n        |   |        \n        |   |        \n        |   |        \n        |   +--------\n        |   |        \n        |   |        \n+-----------+-------+\n|       |           |\n|       |           |\n|       |           |\n|       |           |\n+---+   +----+------+\n    |   |    |       \n    |   |    |       \n    |   |    |       \n+---+---+    +--+    \n|               |    \n|               |    \n|               |    \n+---------------+----\n";
exports.level1 = halfLevel1.split('\n').map(function (line) {
  if (line.startsWith('#')) return line;
  var secondHalf = line.substring(0, line.length - 1).split('').reverse().map(function (v) {
    if (v === 'p' || v === 't') return '+';
    return v;
  }).join('');
  return line + secondHalf;
}).join('\n');
exports.DIRECTIONS = ['up', 'down', 'left', 'right'];

function ptToDir(p) {
  if (p.x) {
    if (p.x < 0) return 'left';
    return 'right';
  } else {
    if (p.y < 0) return 'up';
    return 'down';
  }
}

function dirToPt(v) {
  switch (v) {
    case 'up':
      return new pt_1.Pt(0, -1);

    case 'down':
      return new pt_1.Pt(0, 1);

    case 'left':
      return new pt_1.Pt(-1, 0);

    case 'right':
      return new pt_1.Pt(1, 0);
  }
}

var Level =
/** @class */
function () {
  function Level(levelString) {
    this.level = levelString.split('\n').slice(1).map(function (s) {
      return s.split('');
    });
    this.w = this.level[0].length;
    this.h = this.level.length;
  }

  Level.createLevel1 = function () {
    return new Level(exports.level1);
  };

  Level.prototype.isPath = function (x, y) {
    var v = this.getV(x, y);
    return v && v !== ' ';
  };

  Level.prototype.isPathP = function (p) {
    return this.isPath(p.x, p.y);
  };

  Level.prototype.getV = function (x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return undefined;
    var v = this.level[y][x];
    return v;
  };

  Level.prototype.getLocationsOfChar = function (ch) {
    var out = [];
    this.forEach(function (v, x, y) {
      if (v === ch) {
        out.push(new pt_1.Pt(x, y));
      }
    });
    return out;
  };

  Level.prototype.forEach = function (f) {
    for (var y = 0; y < this.h; y++) {
      for (var x = 0; x < this.w; x++) {
        f(this.getV(x, y), x, y);
      }
    }
  };

  Level.prototype.getClosestRailPoint = function (p) {
    return p.round();
  };

  Level.prototype.nearARailPoint = function (p, maxD) {
    if (maxD === void 0) {
      maxD = 0.08;
    }

    var xD = Math.abs(p.x - Math.round(p.x));
    var yD = Math.abs(p.y - Math.round(p.y));
    if (xD > maxD || yD > maxD) return false;
    return true;
  };

  Level.prototype.isRailPoint = function (p) {
    return p.x % 1 === 0 && p.y % 1 === 0;
  };

  Level.prototype.isSafePosition = function (p) {
    return this.onRail(p);
  };

  Level.prototype.onRail = function (p) {
    if (this.isRailPoint(p) && this.isPathP(p)) return true;

    if (p.y % 1 === 0) {
      // left/right
      var fx = Math.floor(p.x);
      var cx = Math.ceil(p.x);
      if (this.isPath(fx, p.y) && this.isPath(cx, p.y)) return true;
      return false;
    }

    var fy = Math.floor(p.y);
    var cy = Math.ceil(p.y);
    if (this.isPath(p.x, fy) && this.isPath(p.x, cy)) return true;
    return false;
  };

  Level.prototype.onALinearPath = function (pIn) {
    var p = this.getClosestRailPoint(pIn);
    var st = new Map();
    this.forSurroundingPoints(p, function (d, x, v) {
      if (v && v !== ' ') st.set(d, true);
    });
    return st.get('up') && st.get('down') && !st.get('left') && !st.get('right') || !st.get('up') && !st.get('down') && st.get('left') && st.get('right');
  };

  Level.prototype.forSurroundingPoints = function (p, f) {
    var _this = this;

    exports.DIRECTIONS.forEach(function (dir) {
      var x = p.addP(dirToPt(dir));
      f(dir, x, _this.getV(x.x, x.y));
    });
  };

  Level.prototype.getDirectionOptions = function (p) {
    var _this = this;

    var rp = this.getClosestRailPoint(p);
    return exports.DIRECTIONS.filter(function (d) {
      var v = dirToPt(d);
      var x = rp.addP(v);
      if (_this.isPathP(x)) return true;
      return false;
    });
  };

  Level.prototype.getSafeMove = function (p, moveVec) {
    var to = p.addP(moveVec);
    if (this.onRail(to)) return {
      safe: true,
      newPos: to
    };
    var cp = p.copy();

    switch (ptToDir(moveVec)) {
      case 'left':
        cp.y = Math.round(cp.y);
        cp.x += moveVec.x;
        break;

      case 'right':
        cp.y = Math.round(cp.y);
        cp.x += moveVec.x;
        break;

      case 'up':
        cp.x = Math.round(cp.x);
        cp.y += moveVec.y;
        break;

      case 'down':
        cp.x = Math.round(cp.x);
        cp.y += moveVec.y;
        break;
    }

    if (this.onRail(cp)) return {
      safe: true,
      newPos: cp
    };
    return {
      safe: false
    };
  };

  return Level;
}();

exports.Level = Level;

var Agent =
/** @class */
function () {
  function Agent(pos, dir, level) {
    this.pos = pos;
    this.dir = dir;
    this.level = level;
    this.minMoveDist = 0.1;
    this.maxMoveDist = 0.1;
  }

  Agent.prototype.getClosestRailPoint = function () {
    return this.level.getClosestRailPoint(this.pos);
  };

  Agent.prototype.nearARailPoint = function () {
    return this.level.nearARailPoint(this.pos);
  };

  Object.defineProperty(Agent.prototype, "dirV", {
    get: function get() {
      return dirToPt(this.dir);
    },
    enumerable: false,
    configurable: true
  });

  Agent.prototype.getMoveVec = function (dt) {
    var dirV = this.dirV.scale(dt * 0.005);

    if (this.dir === 'right' || this.dir === 'left') {
      return new pt_1.Pt(signedClamp(dirV.x, this.minMoveDist, this.maxMoveDist), dirV.y);
    }

    return new pt_1.Pt(dirV.x, signedClamp(dirV.y, this.minMoveDist, this.maxMoveDist));
  };

  Agent.prototype.railGuide = function () {
    switch (this.dir) {
      case 'left':
      case 'right':
        this.pos.y = Math.round(this.pos.y);
        break;

      case 'down':
      case 'up':
        this.pos.x = Math.round(this.pos.x);
    }
  };

  return Agent;
}();

exports.Agent = Agent;

var Pacman =
/** @class */
function (_super) {
  __extends(Pacman, _super);

  function Pacman(pos, dir, level) {
    var _this = _super.call(this, pos, dir, level) || this;

    _this.mouthOpenPerc = 0;
    _this.internalTick = 0;
    return _this;
  }

  Pacman.create = function (lvl) {
    return new Pacman(lvl.getLocationsOfChar('p').pop(), 'right', lvl);
  };

  Pacman.prototype.tick = function (dt, playerInput) {
    this.internalTick += dt;
    this.mouthOpenPerc = Math.abs(Math.sin(this.internalTick * 0.01)) * 0.1;
    this.railGuide();

    if (playerInput) {
      this.dir = playerInput;
      var vel = this.getMoveVec(dt);
      var outcome = this.level.getSafeMove(this.pos, vel);

      if (outcome.safe) {
        this.pos = outcome.newPos;
      }
    }
  };

  return Pacman;
}(Agent);

exports.Pacman = Pacman;

var Ghost =
/** @class */
function (_super) {
  __extends(Ghost, _super);

  function Ghost(pos, dir, level, color, scared) {
    var _this = _super.call(this, pos, dir, level) || this;

    _this.color = color;
    _this.scared = scared;
    return _this;
  }

  Ghost.create = function (lvl, color) {
    return new Ghost(new pt_1.Pt(22, 19), 'right', lvl, color, false);
  };

  Ghost.prototype.lastMovedFromHere = function () {
    if (!this.lastGate) return false;
    var closestRailPoint = this.getClosestRailPoint();
    return closestRailPoint.eq(this.lastGate);
  };

  Ghost.prototype.canSeePacman = function (pmp) {
    var pos = this.pos;
    var canCheckY = !inRange(pos.y % 1, 0.1, 0.9);
    var canCheckX = !inRange(pos.x % 1, 0.1, 0.9);
    var py = Math.round(pos.y);
    var px = Math.round(pos.x);

    if (canCheckY && py === Math.round(py) && py === pmp.y) {
      var _a = minMax(pmp.x, pos.x),
          mn = _a[0],
          mx = _a[1];

      for (var i = Math.ceil(mn); i <= Math.floor(mx); i++) {
        if (!this.level.isPath(i, py)) return;
      }

      return pmp.x === mn ? 'left' : 'right';
    } else if (canCheckX && px === Math.round(px) && px === pmp.x) {
      var _b = minMax(pmp.y, pos.y),
          mn = _b[0],
          mx = _b[1];

      for (var i = Math.ceil(mn); i <= Math.floor(mx); i++) {
        if (!this.level.isPath(px, i)) return;
      }

      return pmp.y === mn ? 'up' : 'down';
    }

    return;
  };

  Ghost.prototype.tick = function (dt, pacmanPos) {
    this.railGuide();
    var seePacman = this.canSeePacman(pacmanPos);
    var speed = 1;

    if (seePacman) {
      this.dir = seePacman;
      this.railGuide();
      speed = 1.2;
    } else {
      var nearRailPoint = this.nearARailPoint();
      if (nearRailPoint) this.pos = this.getClosestRailPoint();

      if (nearRailPoint && !this.lastMovedFromHere() && !this.level.onALinearPath(this.pos)) {
        var randomDir = pickRandom(this.level.getDirectionOptions(this.pos));

        if (randomDir) {
          this.dir = randomDir;
          this.railGuide();
          this.lastGate = this.pos.round();
        }
      }
    }

    var vel = this.dirV.scale(dt * 0.005 * speed);
    var outcome = this.level.getSafeMove(this.pos, vel);

    if (outcome.safe) {
      this.pos = outcome.newPos;
    } else {
      this.pos = this.pos.round();
    }
  };

  return Ghost;
}(Agent);

exports.Ghost = Ghost;

var Game =
/** @class */
function () {
  function Game(level) {
    var _this = this;

    this.level = level;
    this.candy = [];
    this.pacman = Pacman.create(level);
    this.ghosts = [Ghost.create(level, 'red'), Ghost.create(level, 'blue'), Ghost.create(level, 'yellow'), Ghost.create(level, 'purple')];
    this.level.forEach(function (v, x, y) {
      if (v && v !== ' ') {
        _this.candy.push(new pt_1.Pt(x, y));
      }
    });
  }

  Game.prototype.tick = function (dt, playerInput) {
    var _this = this;

    this.pacman.tick(dt, playerInput);
    this.ghosts.forEach(function (g) {
      return g.tick(dt, _this.pacman.pos);
    });
    this.candy = this.candy.filter(function (c) {
      return c.dist(_this.pacman.pos) > 1;
    });
  };

  return Game;
}();

exports.Game = Game;

function signedClamp(x, min, max) {
  var neg = x < 0;
  var v = x;
  if (neg) v = -x;
  var out = Math.max(Math.min(v, max), min);
  return neg ? -out : out;
}

function pickRandom(arr) {
  if (arr.length === 0) return;
  return arr[Math.floor(Math.random() * arr.length)];
}

function inRange(x, mn, mx) {
  return mn <= x && x <= mx;
}

function minMax(a, b) {
  return [Math.min(a, b), Math.max(a, b)];
}
},{"./pt":"pacman/pt.ts"}],"pacman/render.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawArc = exports.drawEllipse = exports.drawEye = exports.drawGhost = exports.drawPacMan = void 0;

var drawPacMan = function drawPacMan(ctx, pacman, N) {
  var size = N * 8 / 10;
  var pos = pacman.pos.add(1.5, 1.4).scale(N);
  var mouthOpenPerc = pacman.mouthOpenPerc;
  var angle = pacman.dirV.getAngle();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(angle / (180 / Math.PI));
  var bx = mouthOpenPerc * Math.PI * 2;
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(0, 0, size, bx, bx + Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, size, Math.PI * 2 - bx - Math.PI, Math.PI * 2 - bx);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, size, 0.25 * Math.PI * 2, 0.75 * Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.resetTransform();
};

exports.drawPacMan = drawPacMan;

var drawGhost = function drawGhost(ctx, ghost, N) {
  var size = N * 16 / 10;
  var pos = ghost.pos.add(0.8, 0.6).scale(N);
  ctx.translate(pos.x, pos.y);
  ctx.fillStyle = ghost.scared ? 'black' : ghost.color;
  exports.drawArc(ctx, 0, 0, size * 0.5, 180, 360);
  ctx.beginPath();
  ctx.rect(-size * 0.5, -1, size, size * 0.5 + 1);
  ctx.closePath();
  ctx.fill();

  for (var i = 0; i < 3; i++) {
    exports.drawArc(ctx, -size * 0.5 + size / 6 + size / 3 * i, size * 0.4, size / 6, 0, 180);
  } // eyes


  var eyeSize = size * 0.15;
  ctx.fillStyle = 'white';
  exports.drawEye(ctx, -0.2 * size, -0.15 * size, eyeSize, ghost.dirV);
  ctx.fillStyle = 'white';
  exports.drawEye(ctx, 0.2 * size, -0.15 * size, eyeSize, ghost.dirV);
  ctx.resetTransform();
};

exports.drawGhost = drawGhost;

var drawEye = function drawEye(ctx, x, y, size, dir) {
  ctx.fillStyle = 'white';
  exports.drawEllipse(ctx, x, y, size, size);
  ctx.fillStyle = 'black';
  var pupilSize = size * 0.5;
  exports.drawEllipse(ctx, x + dir.x * pupilSize, y + dir.y * pupilSize, pupilSize, pupilSize);
};

exports.drawEye = drawEye;

var drawEllipse = function drawEllipse(ctx, x, y, xRad, yRad) {
  ctx.beginPath();
  ctx.ellipse(x, y, xRad, yRad, 0, 0, 360);
  ctx.closePath();
  ctx.fill();
};

exports.drawEllipse = drawEllipse;

var drawArc = function drawArc(ctx, x, y, radius, startAngle, endAngle) {
  var scalar = Math.PI * 2 * (1 / 360);
  ctx.beginPath();
  ctx.arc(x, y, radius, scalar * startAngle, scalar * endAngle);
  ctx.closePath();
  ctx.fill();
};

exports.drawArc = drawArc;
},{}],"pacman/game_controls.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ButtonControls = exports.setupKeyboardControls = exports.Controller = void 0;

var LReact = __importStar(require("../l_react"));

var Controller =
/** @class */
function () {
  function Controller() {
    this.buttons = new Map();
  }

  Controller.prototype.isPressed = function (d) {
    return !!this.buttons.get(d);
  };

  Controller.prototype.reset = function () {
    this.buttons.clear();
  };

  Controller.prototype.setFromKeyboard = function (key, on) {
    var d = Controller.keyboardKeyToDir(key);

    if (d) {
      this.setV(d, on);
    }
  };

  Controller.prototype.setV = function (d, on) {
    this.buttons.set(d, on);
  };

  Controller.keyboardKeyToDir = function (key) {
    switch (key) {
      case 'ArrowUp':
        return 'up';

      case 'ArrowRight':
        return 'right';

      case 'ArrowLeft':
        return 'left';

      case 'ArrowDown':
        return 'down';
    }

    return undefined;
  };

  return Controller;
}();

exports.Controller = Controller;

var setupKeyboardControls = function setupKeyboardControls(controller) {
  var keyDownListener = function keyDownListener(e) {
    controller.setFromKeyboard(e.key, true);
  };

  document.body.addEventListener('keydown', keyDownListener);

  var keyUpListener = function keyUpListener(e) {
    controller.setFromKeyboard(e.key, false);
  };

  document.body.addEventListener('keyup', keyUpListener);
  return function () {
    document.body.removeEventListener('keydown', keyDownListener);
    document.body.removeEventListener('keyup', keyUpListener);
  };
};

exports.setupKeyboardControls = setupKeyboardControls;
var BUTTON_SIZE = 70;

var BlankDiv = function BlankDiv() {
  return LReact.Node('div');
};

var ButtonControls =
/** @class */
function (_super) {
  __extends(ButtonControls, _super);

  function ButtonControls() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.dirToEmoji = new Map([['up', '⬆️'], ['left', '⬅️'], ['right', '➡️'], ['down', '⬇️']]);
    return _this;
  }

  ButtonControls.prototype.render = function () {
    var _this = this;

    var controller = this.props.controller;
    var directionsList = Array.from(this.dirToEmoji.keys());
    var buttons = directionsList.map(function (d) {
      var _a;

      return LReact.Node('button', {
        onTouchStart: function onTouchStart(e) {
          controller.setV(d, true);
          e.preventDefault();
          e.stopPropagation();
          console.log(controller.isPressed(d));
        },
        onTouchEnd: function onTouchEnd(e) {
          controller.setV(d, false);
          e.preventDefault();
          e.stopPropagation();
        },
        style: {
          width: BUTTON_SIZE + "px",
          height: BUTTON_SIZE + "px",
          fontSize: '50px',
          userSelect: 'none',
          borderRadius: '0px',
          border: '0px solid black',
          padding: '0',
          margin: '0',
          overflow: 'hidden'
        }
      }, [LReact.Text((_a = _this.dirToEmoji.get(d)) !== null && _a !== void 0 ? _a : d)]);
    });
    return LReact.Node('div', {
      style: {
        width: "100%",
        height: BUTTON_SIZE * 3 + "px",
        border: '1px solid red',
        display: 'grid',
        justifyContent: 'center',
        gridAutoFlow: 'row',
        gridTemplateRows: "repeat(3, " + BUTTON_SIZE + "px)",
        gridTemplateColumns: "repeat(3, " + BUTTON_SIZE + "px)"
      }
    }, [LReact.Node(BlankDiv), buttons[0], LReact.Node(BlankDiv), buttons[1], LReact.Node(BlankDiv), buttons[2], LReact.Node(BlankDiv), buttons[3], LReact.Node(BlankDiv)]);
  };

  return ButtonControls;
}(LReact.Component);

exports.ButtonControls = ButtonControls;
},{"../l_react":"l_react.ts"}],"pacman/index.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

var __spreadArrays = this && this.__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) {
    s += arguments[i].length;
  }

  for (var r = Array(s), k = 0, i = 0; i < il; i++) {
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {
      r[k] = a[j];
    }
  }

  return r;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GameComponent = void 0;

var LReact = __importStar(require("../l_react"));

var game_1 = require("./game");

var pt_1 = require("./pt");

var render_1 = require("./render");

var Node = LReact.Node,
    Text = LReact.Text;

var game_controls_1 = require("./game_controls");

var GameComponent =
/** @class */
function (_super) {
  __extends(GameComponent, _super);

  function GameComponent(props) {
    var _this = _super.call(this, props) || this;

    _this.controller = new game_controls_1.Controller();
    _this.level = game_1.Level.createLevel1();
    _this.game = new game_1.Game(_this.level);
    _this.state = {
      state: 'not-started',
      windowSize: {
        w: window.innerWidth,
        h: window.innerHeight
      }
    };
    return _this;
  }

  GameComponent.prototype.render = function () {
    var _this = this;

    var windowSize = this.state.windowSize;
    var s = Math.min(windowSize.w - 16, 600);
    var useMobileControls = windowSize.w < 400;
    var size = {
      w: s,
      h: s + 10
    };
    var gameRenderScale = size.w / (this.level.w + 2);
    return Node('div', {}, [Text(this.state.state), Node(LevelGameContainer, size, [Node(RenderedLevel, {
      level: this.level,
      N: gameRenderScale
    }), this.state.state === 'not-started' ? Node(AnimatedGame, {
      game: this.game,
      gameRenderScale: gameRenderScale,
      controller: this.controller
    }, []) : Text('no game')]), Node('button', {
      onClick: function onClick() {
        if (_this.state.state === 'not-started') {
          _this.setState({
            state: 'paused'
          });
        } else {
          _this.setState({
            state: 'not-started'
          });
        }
      }
    }, [Text('stop')]), useMobileControls ? Node(game_controls_1.ButtonControls, {
      controller: this.controller
    }) : null]);
  };

  return GameComponent;
}(LReact.Component);

exports.GameComponent = GameComponent;

var AnimatedGame =
/** @class */
function (_super) {
  __extends(AnimatedGame, _super);

  function AnimatedGame(props) {
    var _this = _super.call(this, props) || this;

    _this.componentDidMount = function () {
      console.log('ANIMATED GAME MOUNT');
    };

    _this.componentDidUnmount = function () {
      var _a;

      (_a = _this.killEventListeners) === null || _a === void 0 ? void 0 : _a.call(_this);

      _this.props.controller.reset();

      if (_this.animId) {
        cancelAnimationFrame(_this.animId.id);
      }
    };

    _this.canvasSet = function (canvas) {
      var ctx = canvas.getContext('2d');
      _this.ctx = ctx;

      _this.gameLoop();

      _this.setupEventListeners();
    };

    _this.canvasPixels = new pt_1.Pt(props.game.level.w, props.game.level.h);
    return _this;
  }

  Object.defineProperty(AnimatedGame.prototype, "canvasSize", {
    get: function get() {
      var gameRenderScale = this.props.gameRenderScale;
      var level = this.props.game.level;
      var w = (level.w + 1) * gameRenderScale;
      var h = (level.h + 1) * gameRenderScale;
      return {
        w: w,
        h: h
      };
    },
    enumerable: false,
    configurable: true
  });

  AnimatedGame.prototype.render = function () {
    var gameRenderScale = this.props.gameRenderScale;
    var canvasSize = this.canvasSize;
    return Node('canvas', {
      ref: this.canvasSet,
      width: canvasSize.w,
      height: canvasSize.h,
      style: {
        width: canvasSize.w + "px",
        height: canvasSize.h + "px",
        position: 'absolute',
        zIndex: 2,
        top: gameRenderScale * 0.5 + 'px',
        left: gameRenderScale * 0.5 + 'px'
      }
    });
  };

  AnimatedGame.prototype.setupEventListeners = function () {
    var _a;

    (_a = this.killEventListeners) === null || _a === void 0 ? void 0 : _a.call(this);
    var controller = this.props.controller;
    controller.reset();
    this.killEventListeners = game_controls_1.setupKeyboardControls(this.props.controller);
  };

  AnimatedGame.prototype.getPlayerInputDir = function () {
    for (var _i = 0, DIRECTIONS_1 = game_1.DIRECTIONS; _i < DIRECTIONS_1.length; _i++) {
      var d = DIRECTIONS_1[_i];
      if (this.props.controller.isPressed(d)) return d;
    }
  };

  AnimatedGame.prototype.gameLoop = function () {
    var _this = this;

    var prevDelta = 0;
    var N = this.props.gameRenderScale;

    var loop = function loop(delta) {
      var ctx = _this.ctx;
      var game = _this.props.game;
      if (!ctx) return;
      var dt = delta - prevDelta;
      prevDelta = delta;
      game.tick(dt, _this.getPlayerInputDir());
      var canvasSize = _this.canvasSize;
      ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
      ctx.translate(-N * 0.6, -N * 0.6);
      game.candy.forEach(function (c) {
        var p = c.add(1.5, 1.5).scale(N);
        ctx.fillStyle = 'pink';
        render_1.drawEllipse(ctx, p.x, p.y, 2, 2);
      });
      render_1.drawPacMan(ctx, game.pacman, N);
      game.ghosts.forEach(function (g) {
        return render_1.drawGhost(ctx, g, N);
      });
      ctx.resetTransform();
      _this.animId = {
        id: requestAnimationFrame(loop)
      };
    };

    this.animId = {
      id: requestAnimationFrame(loop)
    };
  };

  return AnimatedGame;
}(LReact.Component);

var LevelGameContainer = function LevelGameContainer(_a) {
  var w = _a.w,
      h = _a.h,
      children = _a.children;
  return Node('div', {
    style: {
      backgroundColor: 'lightblue',
      display: 'grid',
      placeItems: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }
  }, [Node('div', {
    style: {
      width: w + "px",
      height: h + "px",
      position: 'relative'
    }
  }, children)]);
};

function RenderedLevel(_a) {
  var level = _a.level,
      N = _a.N;
  var thick = 2;
  var halfThick = thick * 0.5;
  var offset = new pt_1.Pt(N, N);
  var blocks = [];

  for (var y = 0; y < level.h; y++) {
    for (var x = 0; x < level.w; x++) {
      if (level.isPath(x, y)) {
        var center = new pt_1.Pt(x + 0.5, y + 0.5);
        var topLeft = center.add(-halfThick, -halfThick);
        blocks.push(Node(Block, {
          top: topLeft.y * N + offset.y,
          left: topLeft.x * N + offset.x,
          width: N * thick,
          height: N * thick,
          color: 'black'
        }));
      }
    }
  }

  return Node('div', {}, __spreadArrays(blocks));
}

var Block = function Block(_a) {
  var top = _a.top,
      left = _a.left,
      width = _a.width,
      height = _a.height,
      _b = _a.color,
      color = _b === void 0 ? 'blue' : _b;
  return Node('div', {
    style: {
      width: width + "px",
      height: (height !== null && height !== void 0 ? height : width) + "px",
      position: 'absolute',
      top: top + "px",
      left: left + "px",
      backgroundColor: color
    }
  });
};
},{"../l_react":"l_react.ts","./game":"pacman/game.ts","./pt":"pacman/pt.ts","./render":"pacman/render.ts","./game_controls":"pacman/game_controls.ts"}],"index.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var LReact = __importStar(require("./l_react"));

var index_1 = require("./pacman/index");

var Peanut =
/** @class */
function (_super) {
  __extends(Peanut, _super);

  function Peanut() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  Peanut.prototype.render = function () {
    return LReact.Node('div', {}, [LReact.Node(index_1.GameComponent, {}, [])]);
  };

  return Peanut;
}(LReact.Component);

function Cool() {
  return LReact.Node('div', {}, [LReact.Node(Peanut)]);
}

;
LReact.Init(LReact.Node(Cool), document.body);
},{"./l_react":"l_react.ts","./pacman/index":"pacman/index.ts"}],"../../../.nvm/versions/node/v12.13.1/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "62437" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../.nvm/versions/node/v12.13.1/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/game-land.77de5100.js.map