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
})({"l_react2.ts":[function(require,module,exports) {
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
exports.modifyTree2 = exports.RenderDom = exports.Init = exports.modifyTree = exports.Node = exports.useState = exports.Component = exports.Text = exports.VElem = exports.Element = void 0;

var _Element =
/** @class */
function () {
  function _Element(maker, props, children) {
    this.maker = maker;
    this.props = props;
    this.children = children;
    if (this.maker.kind === 'c') this._name = this.maker.c.constructor.name;
  }

  _Element.prototype.createElement = function () {
    var _this = this;

    var _a;

    switch (this.maker.kind) {
      case 'c':
        {
          this._c = new this.maker.c(this.props);

          this._c.paint = function () {
            return repaint2(_this);
          };

          this._velem = (_a = this._c) === null || _a === void 0 ? void 0 : _a.render();
        }
        ;
        break;

      case 'f':
        {
          currentUseStateSystem.takeout();
          this._velem = this.maker.f(this.props);
          console.log({
            currentUseStateSystem: currentUseStateSystem
          });
          var useStateSys = currentUseStateSystem.get();
          console.log({
            gotIt: useStateSys
          });

          if (useStateSys) {
            var sys = useStateSys;
            this._useStateSys = sys;

            sys.repaint = function () {
              return repaint2(_this);
            };
          }

          currentUseStateSystem.pop();
        }
        ;
        break;

      case 'html':
        {
          this._elem = document.createElement(this.maker.type);
        }
        ;
        break;

      case 'string':
        {
          this._elem = document.createTextNode(this.maker.value);
        }
        ;
        break;
    }
  };

  _Element.prototype.getMakerValue = function () {
    switch (this.maker.kind) {
      case 'c':
        return this.maker.c;

      case 'f':
        return this.maker.f;

      case 'html':
        return this.maker.type;

      case 'string':
        return this.maker.value;
    }
  };

  _Element.prototype.similar = function (e) {
    if (e.maker.kind !== this.maker.kind) return false;
    if (this.getMakerValue() !== e.getMakerValue()) return false;
    if (this.children.length !== e.children.length) return false;
    return true;
  };

  return _Element;
}();

function Element(type, props, children) {
  if (props === void 0) {
    props = {};
  }

  if (children === void 0) {
    children = [];
  }

  var properChildren = children.map(function (ch) {
    if (typeof ch === 'string') return new _Element({
      kind: 'string',
      value: ch
    }, {}, []);
    return ch;
  }).filter(function (x) {
    return x != null;
  });

  if (typeof type === 'function') {
    if (isAComponentClass(type)) {
      return new _Element({
        kind: 'c',
        c: type
      }, props, properChildren);
    }

    return new _Element({
      kind: 'f',
      f: type
    }, props, properChildren);
  } else if (typeof type === 'string') {
    return new _Element({
      kind: 'html',
      type: type
    }, props, properChildren);
  }
}

exports.Element = Element;

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

  Component.prototype.componentDidMount = function () {};

  Component.prototype.componentDidUnmount = function () {};

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

function isAComponentClass(x) {
  if (typeof x !== 'function') return false;
  return x.prototype && x.prototype.__isComponent;
}

Component.prototype.__isComponent = true;

var UseStateSystem =
/** @class */
function () {
  function UseStateSystem(v) {
    this.v = v;
  }

  UseStateSystem.prototype.set = function (v) {
    var _a;

    console.log('wowee');
    this.v = v;
    (_a = this.repaint) === null || _a === void 0 ? void 0 : _a.call(this);
  };

  return UseStateSystem;
}();

var CurrentUseStateSystem =
/** @class */
function () {
  function CurrentUseStateSystem() {
    this._list = [undefined];
  }

  CurrentUseStateSystem.prototype.takeout = function () {
    this._list.push(undefined);
  };

  CurrentUseStateSystem.prototype.get = function () {
    return this._list[this.lastIndex];
  };

  Object.defineProperty(CurrentUseStateSystem.prototype, "lastIndex", {
    get: function get() {
      return this._list.length - 1;
    },
    enumerable: false,
    configurable: true
  });

  CurrentUseStateSystem.prototype.useSlot = function (v) {
    if (this._list[this.lastIndex]) {
      return this._list[this.lastIndex];
    }

    var x = new UseStateSystem(v);
    this._list[this.lastIndex] = x;
    return x;
  };

  CurrentUseStateSystem.prototype.useUseStateSys = function (sys) {
    this.takeout();
    this._list[this.lastIndex] = sys;
  };

  CurrentUseStateSystem.prototype.pop = function () {
    if (this._list.length >= 1) this._list.pop();else this._list[0] = undefined;
  };

  return CurrentUseStateSystem;
}();

var currentUseStateSystem = new CurrentUseStateSystem();

var useState = function useState(state) {
  var sys = currentUseStateSystem.useSlot(state);
  return [sys.v, function (v) {
    return sys.set(v);
  }];
};

exports.useState = useState;

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
    var F_1 = node;

    var p_1 = __assign(__assign({}, props), {
      children: children
    }); // if already a currentUseStateSystem, save it


    currentUseStateSystem.takeout();
    var vnode_1 = F_1(p_1);
    var useStateSys = currentUseStateSystem.get();

    if (useStateSys) {
      var sys_1 = useStateSys;

      sys_1.repaint = function () {
        return repaintFunctionComponent(F_1, sys_1, vnode_1, p_1);
      };
    }

    currentUseStateSystem.pop();
    return vnode_1;
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

function repaintFunctionComponent(c, useStateSystem, oldTree, props) {
  currentUseStateSystem.useUseStateSys(useStateSystem);
  var newTree = c(props);
  currentUseStateSystem.pop();
  newTree.componentDidMount = oldTree.componentDidMount;
  newTree.componentDidUnmount = oldTree.componentDidUnmount;
  var parent = oldTree === null || oldTree === void 0 ? void 0 : oldTree._parent;
  modifyTree(newTree, parent, oldTree);

  useStateSystem.repaint = function () {
    return repaintFunctionComponent(c, useStateSystem, newTree, props);
  };

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

function modifyTree(tree, parent, prevTree, updateDomIsRemount) {
  var _a, _b;

  var props = tree.props,
      children = tree.children,
      type = tree.type;

  if (prevTree && prevTree.type === type && children.length === prevTree.children.length) {
    // replace attributes
    var pte = prevTree.getElem();

    if (!objectsShallowEqual(props, prevTree.props) && pte.type === 'elem') {
      assignProps(pte.e, props);
    }

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
  var rawAttributes = new Set(['width', 'height', 'href', 'id', 'value', 'type', 'checked']);
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

function RenderDom(e, domParent) {
  console.log('ok...');
  modifyTree2(e, undefined, domParent, undefined);
}

exports.RenderDom = RenderDom;

function repaint2(e) {
  // maker must be component or function component, do function later
  var oldTree = e._velem;
  var newTree;

  if (e.maker.kind === 'c') {
    newTree = e._c.render();
  } else if (e.maker.kind === 'f') {
    console.log('re-rrender F', e);
    var hasUSS = !!e._useStateSys;

    if (hasUSS) {
      currentUseStateSystem.useUseStateSys(e._useStateSys);
    }

    newTree = e.maker.f(e.props);

    if (hasUSS) {
      currentUseStateSystem.pop();
    }
  } // newTree.componentDidMount = oldTree.componentDidMount;
  // newTree.componentDidUnmount = oldTree.componentDidUnmount;
  // console.log(oldTree.toString());
  // console.log(newTree.toString());


  var parent = oldTree === null || oldTree === void 0 ? void 0 : oldTree._parent;
  modifyTree2(newTree, parent, oldTree._dom, oldTree);
  e._velem = newTree; // if (oldTree?.isRoot) {
  //     const domParent = oldTree._dom;
  //     domParent.replaceChild(newTree._elem, oldTree._elem);
  //     newTree.isRoot = true;
  //     newTree._dom = domParent;
  // }
}

function modifyTree2(tree, parent, parentDOM, prevTree) {
  var _a;

  var props = tree.props,
      children = tree.children,
      maker = tree.maker;
  tree._dom = parentDOM;

  if (prevTree && prevTree.similar(tree)) {
    console.log('just replace attrbutes?', tree.maker);

    if (prevTree._elem && tree.maker.kind === 'html') {
      tree._elem = prevTree._elem;
      assignProps(tree._elem, props);
      tree.children.forEach(function (ch, i) {
        modifyTree2(ch, tree, tree._elem, prevTree.children[i]);
      });
    } else if (prevTree._velem) {
      tree._velem = prevTree._velem;
    }

    return;
  } // must re-write


  tree.createElement();

  if (parentDOM && tree._elem) {
    if (prevTree && prevTree._elem) {
      parentDOM.replaceChild(tree._elem, prevTree._elem);
      unmountAll(prevTree);
    } else {
      parentDOM.appendChild(tree._elem);
    }

    if (maker.kind === 'html') {
      assignProps(tree._elem, props);
      children.forEach(function (ch) {
        modifyTree2(ch, tree, tree._elem, undefined);
      });
    }
  } else if (tree._velem) {
    if (prevTree) {
      unmountAll(prevTree);
    }

    (_a = tree._c) === null || _a === void 0 ? void 0 : _a.componentDidMount();
    modifyTree2(tree._velem, tree, parentDOM, undefined);
  } // tree.children.forEach(ch => {
  // });
  // old? :(
  // if (prevTree && prevTree.type === type && children.length === prevTree.children.length) {
  //     // replace attributes
  //     const pte = prevTree.getElem()!;
  //     if(!objectsShallowEqual(props, prevTree.props) && pte.type === 'elem') {
  //         assignProps(pte.e, props);
  //     }
  //     tree._elem = pte.e;
  //     tree._parent = prevTree._parent;
  //     if (tree.isTextNode && pte.type === 'text') {
  //         pte.e.data = tree.toString();
  //     } else {
  //         loopThroughChildren(tree, prevTree, (c, pc, i) => {
  //             modifyTree(c, tree, pc);
  //         }, (pc, i) => {
  //             prevTree._elem.removeChild(pc._elem);
  //             prevTree.componentDidUnmount?.();
  //         });
  //     }
  // } else 
  // {
  // replace this node and all children
  // const element = tree.isTextNode
  //     ? document.createTextNode(tree.value)
  //     : document.createElement(type);
  // tree._elem = element;
  //     tree._parent = parent;
  //     if (prevTree) {
  //         prevTree._parent._elem.replaceChild(element, prevTree._elem);
  //         prevTree.componentDidUnmount?.();
  //     } else if (parent) {
  //         parent._elem.appendChild(element);
  //     }
  //     tree.componentDidMount?.();
  //     const te = tree.getElem();
  //     if (te && te.type === 'elem')
  //         assignProps(te.e, props);
  //     if (props.ref) {
  //         props.ref(tree._elem);
  //     }
  //     loopThroughChildren(tree, prevTree, (c, pc, i) => {
  //         modifyTree(c, tree, undefined);
  //     }, (pc, i) => {
  //         prevTree._elem.removeChild(pc._elem);
  //         prevTree.componentDidUnmount?.();
  //     });
  // }

}

exports.modifyTree2 = modifyTree2;

function unmountAll(t) {
  var _a;

  (_a = t._c) === null || _a === void 0 ? void 0 : _a.componentDidUnmount();
  t.children.forEach(unmountAll);
}
},{}],"index.ts":[function(require,module,exports) {
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

var LReact = __importStar(require("./l_react2")); // import { GameComponent } from './pacman/index';


var Element = LReact.Element;

function ListElem(_a) {
  var v = _a.v;

  var _b = LReact.useState(false),
      bigFont = _b[0],
      setBigFont = _b[1];

  console.log('render ListElem');
  return Element('li', {
    style: {
      fontSize: bigFont ? '20px' : '10px'
    }
  }, ["val=" + v, Element('button', {
    onClick: function onClick() {
      console.log('big font for ', v);
      setBigFont(true);
    }
  }, ['use big font size?'])]);
}

var Lister =
/** @class */
function (_super) {
  __extends(Lister, _super);

  function Lister(props) {
    var _this = _super.call(this, props) || this;

    _this.push = function () {
      _this.setState({
        len: _this.state.len + 1
      });
    };

    _this.pop = function () {
      _this.setState({
        len: Math.max(_this.state.len - 1, 0)
      });
    };

    _this.state = {
      len: 0
    };
    return _this;
  }

  Lister.prototype.componentDidMount = function () {
    console.log('luke mounted');
  };

  Lister.prototype.componentDidUnmount = function () {
    console.log('luke unmounted');
  };

  Lister.prototype.render = function () {
    return Element('div', {
      style: {
        color: 'firebrick',
        border: '1px dashed green'
      }
    }, __spreadArrays([Element('h4', {}, ['MY LIST:'])], Array.from({
      length: this.state.len
    }, function (_, i) {
      return Element(ListElem, {
        v: i
      });
    }), [Element('button', {
      onClick: this.push
    }, ['add']), Element('button', {
      onClick: this.pop
    }, ['remove'])]));
  };

  return Lister;
}(LReact.Component);

var Luke =
/** @class */
function (_super) {
  __extends(Luke, _super);

  function Luke() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  Luke.prototype.componentDidMount = function () {
    console.log('luke mounted');
  };

  Luke.prototype.componentDidUnmount = function () {
    console.log('luke unmounted');
  };

  Luke.prototype.render = function () {
    return Element('div', {
      style: {
        color: 'firebrick',
        backgroundColor: 'lightblue',
        padding: '20px'
      }
    }, ['luke here']);
  };

  return Luke;
}(LReact.Component);

var Peanut =
/** @class */
function (_super) {
  __extends(Peanut, _super);

  function Peanut(props) {
    var _this = _super.call(this, props) || this;

    _this.componentDidMount = function () {
      console.log('Peanut mounted!');
    };

    _this.componentDidUnmount = function () {
      console.log('Peanut unmounted!');
    };

    _this.changeToBlue = function () {
      _this.setState({
        color: 'blue'
      });
    };

    _this.changeToGreen = function () {
      _this.setState({
        color: 'green'
      });
    };

    _this.state = {
      color: 'green'
    };
    return _this;
  }

  Peanut.prototype.render = function () {
    var _this = this;

    var color = this.state.color;
    return Element('div', {
      style: {
        color: color
      }
    }, ['START', Element(Lister), color === 'green' ? Element('button', {
      onClick: function onClick() {
        return _this.changeToBlue();
      }
    }, ['to blue']) : null, color === 'blue' ? Element('button', {
      onClick: function onClick() {
        return _this.changeToGreen();
      }
    }, ['to green']) : null, color === 'green' ? Element(Luke) : null, 'END']);
  };

  return Peanut;
}(LReact.Component); // function Cool() {
//     return LReact.Node('div', {}, [
//         Element(Peanut),
//     ]);
// };


function Cool2(_a) {
  return Element('div', {}, ['Cool2', Element(Peanut)]);
}

;
var A = Element('div', {}, [Element('h1', {}, ['hello world']), Element('div', {}, [Element('p', {}, ['what would you like?']), Element(Cool2, {})]), Element('footer', {}, ['I am footer'])]);
console.log(A);
LReact.RenderDom(Element(Peanut), document.body); // LReact.Init(LReact.Node(Cool), document.body);
},{"./l_react2":"l_react2.ts"}],"../../../.nvm/versions/node/v12.13.1/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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