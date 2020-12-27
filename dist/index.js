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
    this.children = children;
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

  Pt.prototype.scale = function (v) {
    return new Pt(this.x * v, this.y * v);
  };

  Pt.prototype.addY = function (yv) {
    return new Pt(this.x, this.y + yv);
  };

  Pt.prototype.add = function (x, y) {
    return new Pt(this.x + x, this.y + y);
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
exports.Game = exports.Ghost = exports.Pacman = exports.Agent = exports.Level = exports.level1 = void 0;

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

  Level.prototype.isPath = function (r, c) {
    var v = this.getV(r, c);
    return v && v !== ' ';
  };

  Level.prototype.getV = function (r, c) {
    var v = this.level[r][c];
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

  Level.prototype.getRandomLocationOfChar = function (ch) {
    var locations = this.getLocationsOfChar(ch);
    var index = Math.floor(Math.random() * locations.length);
    return locations[index];
  };

  Level.prototype.forEach = function (f) {
    for (var y = 0; y < this.h; y++) {
      for (var x = 0; x < this.w; x++) {
        f(this.getV(y, x), x, y);
      }
    }
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
  }

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
    return _this;
  }

  Pacman.create = function (lvl) {
    return new Pacman(lvl.getLocationsOfChar('p').pop(), new pt_1.Pt(1, 0), lvl);
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
    return new Ghost(lvl.getRandomLocationOfChar('g'), new pt_1.Pt(1, 0), lvl, color, false);
  };

  return Ghost;
}(Agent);

exports.Ghost = Ghost;

var Game =
/** @class */
function () {
  function Game() {}

  return Game;
}();

exports.Game = Game;
},{"./pt":"pacman/pt.ts"}],"pacman/index.ts":[function(require,module,exports) {
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

var Node = LReact.Node,
    Text = LReact.Text;

var GameComponent =
/** @class */
function (_super) {
  __extends(GameComponent, _super);

  function GameComponent(props) {
    var _this = _super.call(this, props) || this;

    _this.level = game_1.Level.createLevel1();
    return _this;
  }

  GameComponent.prototype.render = function () {
    var N = 10;
    return Node('div', {}, [Text('pacman'), Node(LevelGameContainer, {
      N: 10,
      w: this.level.w,
      h: this.level.h
    }, [Node(RenderedLevel, {
      level: this.level
    }), Node(AnimatedGame, {
      level: this.level
    }, [])])]);
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

    _this.canvasSet = function (canvas) {
      var ctx = canvas.getContext('2d');
      _this.ctx = ctx; // ctx.fillStyle = 'yellow';
      // ctx.arc(30, 30, 20, 0, Math.PI * 2 * 0.25);
      // ctx.fill();
      // ctx.closePath();

      console.log(_this.pacman.pos);

      _this.drawPacMan(_this.pacman.dir.getAngle(), _this.pacman.pos.scale(10).addY(4), 0.05);

      _this.ghosts.forEach(function (g) {
        return _this.drawGhost(g);
      });
    };

    _this.pacman = game_1.Pacman.create(props.level);
    _this.ghosts = [game_1.Ghost.create(props.level, 'red'), game_1.Ghost.create(props.level, 'blue'), game_1.Ghost.create(props.level, 'yellow'), game_1.Ghost.create(props.level, 'purple')];
    return _this;
  }

  AnimatedGame.prototype.render = function () {
    var level = this.props.level;
    return Node('canvas', {
      ref: this.canvasSet,
      width: (level.w + 1) * 10,
      height: level.h * 10,
      style: {
        width: (level.w + 1) * 10 + "px",
        height: level.h * 10 + "px",
        border: '1px dashed white',
        position: 'absolute',
        zIndex: 2
      }
    });
  };

  AnimatedGame.prototype.drawPacMan = function (angle, pos, mouthOpenPerc) {
    var ctx = this.ctx;
    if (!ctx) return;
    var size = 4;
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

  AnimatedGame.prototype.drawGhost = function (ghost) {
    var ctx = this.ctx;
    if (!ctx) return;
    var size = 16;
    var pos = ghost.pos.add(0.45 + 1, 0.15 + 1).scale(10);
    ctx.translate(pos.x, pos.y);
    ctx.fillStyle = ghost.color;
    this.drawArc(0, 0, size * 0.5, 180, 360);
    ctx.beginPath();
    ctx.rect(-size * 0.5, 0, size, size * 0.5);
    ctx.closePath();
    ctx.fill();

    for (var i = 0; i < 3; i++) {
      this.drawArc(-size * 0.5 + size / 6 + size / 3 * i, size * 0.4, size / 6, 0, 180);
    } // eyes


    var eyeSize = size * 0.15;
    var eyeSizeS = eyeSize * 0.5;
    ctx.fillStyle = 'white';
    this.drawEye(-0.2 * size, -0.15 * size, eyeSize, ghost.dir);
    ctx.fillStyle = 'white';
    this.drawEye(0.2 * size, -0.15 * size, eyeSize, ghost.dir); // this.drawEllipse(0.2 * size, -0.15 * size, eyeSize, eyeSize);

    ctx.resetTransform();
  };

  AnimatedGame.prototype.drawArc = function (x, y, radius, startAngle, endAngle) {
    var ctx = this.ctx;
    if (!ctx) return;
    var scalar = Math.PI * 2 * (1 / 360);
    ctx.beginPath();
    ctx.arc(x, y, radius, scalar * startAngle, scalar * endAngle);
    ctx.closePath();
    ctx.fill();
  };

  AnimatedGame.prototype.drawEye = function (x, y, size, dir) {
    var ctx = this.ctx;
    if (!ctx) return;
    ctx.fillStyle = 'white';
    this.drawEllipse(x, y, size, size);
    ctx.fillStyle = 'black';
    var pupilSize = size * 0.5;
    this.drawEllipse(x + dir.x * pupilSize, y + dir.y * pupilSize, pupilSize, pupilSize);
  };

  AnimatedGame.prototype.drawEllipse = function (x, y, xRad, yRad) {
    var ctx = this.ctx;
    if (!ctx) return;
    ctx.beginPath();
    ctx.ellipse(x, y, xRad, yRad, 0, 0, 360);
    ctx.closePath();
    ctx.fill();
  };

  return AnimatedGame;
}(LReact.Component);

var LevelGameContainer = function LevelGameContainer(_a) {
  var w = _a.w,
      h = _a.h,
      N = _a.N,
      children = _a.children;
  return Node('div', {
    style: {
      backgroundColor: 'lightblue',
      padding: '16px'
    }
  }, [Node('div', {
    style: {
      width: (w + 2) * N + "px",
      height: (h + 2) * N + "px",
      position: 'relative',
      backgroundColor: 'green'
    }
  }, children)]);
};

function RenderedLevel(_a) {
  var level = _a.level;
  var N = 10;
  var thick = 2;
  var halfThick = thick * 0.5;
  var offset = new pt_1.Pt(N, N);
  var blocks = [];

  for (var y = 0; y < level.h; y++) {
    for (var x = 0; x < level.w; x++) {
      if (level.isPath(y, x)) {
        var center = new pt_1.Pt(x + 0.5, y + 0.5);
        var topLeft = center.add(-thick * 0.5, -thick * 0.5);
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
},{"../l_react":"l_react.ts","./game":"pacman/game.ts","./pt":"pacman/pt.ts"}],"index.ts":[function(require,module,exports) {
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

console.log('hi i am in game land 🍒', LReact);

var Peanut =
/** @class */
function (_super) {
  __extends(Peanut, _super);

  function Peanut() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  Peanut.prototype.render = function () {
    return LReact.Node('div', {}, [LReact.Text('wow - peanuts'), LReact.Node(index_1.GameComponent, {}, [])]);
  };

  return Peanut;
}(LReact.Component);

function Cool() {
  return LReact.Node('div', {}, [LReact.Text('hello there, my name is luke'), LReact.Node(Peanut)]);
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "54135" + '/');

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
//# sourceMappingURL=/index.js.map