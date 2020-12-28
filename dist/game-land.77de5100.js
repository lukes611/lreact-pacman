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
exports.modifyTree2 = exports.RenderDom = exports.Init = exports.modifyTree = exports.Node = exports.useState = exports.Component = exports.Text = exports.VElem = exports.Element = exports._Element = void 0;

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

    var _a, _b;

    switch (this.maker.kind) {
      case 'c':
        {
          this._c = (_a = this._c) !== null && _a !== void 0 ? _a : new this.maker.c(this.props);

          this._c.paint = function () {
            return repaint2(_this);
          };

          this._velem = (_b = this._c) === null || _b === void 0 ? void 0 : _b.render();
        }
        ;
        break;

      case 'f':
        {
          currentUseStateSystem.takeout();
          this._velem = this.maker.f(this.props);
          var useStateSys = currentUseStateSystem.get();

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

exports._Element = _Element;

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

  var fixedProps = __assign(__assign({}, props), {
    children: properChildren
  });

  if (typeof type === 'function') {
    if (isAComponentClass(type)) {
      return new _Element({
        kind: 'c',
        c: type
      }, fixedProps, properChildren);
    }

    return new _Element({
      kind: 'f',
      f: type
    }, fixedProps, properChildren);
  } else if (typeof type === 'string') {
    return new _Element({
      kind: 'html',
      type: type
    }, fixedProps, properChildren);
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
  tree._dom = parentDOM; // debugger;
  // console.log('f');

  if (prevTree && prevTree.similar(tree)) {
    if (prevTree._elem && tree.maker.kind === 'html') {
      tree._elem = prevTree._elem;

      if (!objectsShallowEqual(tree.props, prevTree.props)) {
        assignProps(tree._elem, props);
      }

      loopThroughChildren(tree, prevTree, function (ch, pc, i) {
        modifyTree2(ch, tree, tree._elem, pc);
      }, function (pc, i) {
        console.log('remove');

        if (prevTree._elem && pc._elem) {
          prevTree._elem.removeChild(pc._elem);
        }

        unmountAll(pc);
      }); // tree.children.forEach((ch, i) => {
      //     modifyTree2(ch, tree, tree._elem as HTMLElement, prevTree.children[i]);
      // });

      return;
    } else if (prevTree._velem) {
      // console.log('just replace attrbutes?', tree.maker);
      // tree._velem = prevTree._velem;
      tree._c = prevTree._c;

      if (tree._c) {
        tree._c.props = props;
      }

      tree._useStateSys = prevTree._useStateSys;
      tree.createElement(); // prevTree._elem

      removeElements(prevTree);
      modifyTree2(tree._velem, tree, parentDOM, undefined); // tree.children.forEach((ch, i) => {
      //     modifyTree2(ch, tree, parentDOM, prevTree.children[i]);
      // });

      return;
    } else return;
  } // must re-write


  tree.createElement();

  if (parentDOM && tree._elem) {
    if (prevTree && prevTree._elem) {
      parentDOM.replaceChild(tree._elem, prevTree._elem);
      unmountAll(prevTree);
    } else {
      parentDOM.appendChild(tree._elem);
    }

    if (tree.props.ref) {
      tree.props.ref(tree._elem);
    }

    if (maker.kind === 'html') {
      assignProps(tree._elem, props);
      loopThroughChildren(tree, prevTree, function (ch, pch, i) {
        modifyTree2(ch, tree, tree._elem, undefined);
      }, function (pc, i) {
        if (prevTree._elem && pc._elem) {
          prevTree._elem.removeChild(pc._elem);
        }

        unmountAll(pc);
        removeElements(pc);
      }); // children.forEach(ch => {
      // });
    }
  } else if (tree._velem) {
    if (prevTree) {
      console.log('kill?', prevTree);
      unmountAll(prevTree);
      removeElements(prevTree);
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

function removeElements(t) {
  if (t._dom && t._elem) {
    t._dom.removeChild(t._elem);
  }

  if (t._velem) {
    removeElements(t._velem);
  }
}
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
var GHOST_COLORS = ['red', 'blue', 'yellow', 'purple', 'orange', 'firebrick'];
var difficultyToGhostCount = {
  easy: 4,
  medium: 5,
  hard: 6
};

var Game =
/** @class */
function () {
  function Game(level) {
    this.level = level;
    this.candy = [];
    this.gameState = 'not-started';
    this.pacman = Pacman.create(level);
    this.ghosts = [];
  }

  Game.prototype.startNewGame = function (difficulty) {
    var _this = this; // reset pacman


    this.pacman = Pacman.create(this.level); // reset ghosts

    var ghostCount = difficultyToGhostCount[difficulty];
    this.ghosts = GHOST_COLORS.slice(0, ghostCount).map(function (color) {
      return Ghost.create(_this.level, color);
    }); // reset candy

    this.level.forEach(function (v, x, y) {
      if (v && v !== ' ') {
        _this.candy.push(new pt_1.Pt(x, y));
      }
    });
    this.gameState = 'playing';
  };

  Game.prototype.tick = function (dt, playerInput, onGameStateChange) {
    var _this = this;

    if (this.gameState !== 'playing') return;
    this.pacman.tick(dt, playerInput);
    this.ghosts.forEach(function (g) {
      return g.tick(dt, _this.pacman.pos);
    });
    this.candy = this.candy.filter(function (c) {
      return c.dist(_this.pacman.pos) > 1;
    });

    if (this.pacmanIsNearGhosts()) {
      this.gameState = 'game-over';
      onGameStateChange === null || onGameStateChange === void 0 ? void 0 : onGameStateChange(this.gameState);
    }

    if (this.getCandyRemaining() <= 0) {
      this.gameState = 'you-won';
      onGameStateChange === null || onGameStateChange === void 0 ? void 0 : onGameStateChange(this.gameState);
    }
  };

  Game.prototype.pacmanIsNearGhosts = function () {
    var pacmanPos = this.pacman.pos;
    return this.ghosts.some(function (g) {
      return g.pos.dist(pacmanPos) < 1;
    });
  };

  Game.prototype.getCandyRemaining = function () {
    return this.candy.length;
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
exports.ButtonControls = exports.KeyboardInstructions = exports.setupKeyboardControls = exports.Controller = void 0;

var LReact = __importStar(require("../l_react2"));

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

var KeyboardInstructions = function KeyboardInstructions() {
  return LReact.Element('div', {
    style: {
      fontSize: '24px',
      display: 'grid',
      justifyContent: 'center',
      gridTemplateColumns: 'minmax(auto, 400px)',
      textAlign: 'center'
    }
  }, ["\n            You can use the up, down, left and right arrow keys to move pacman.\n        "]);
};

exports.KeyboardInstructions = KeyboardInstructions;
var BUTTON_SIZE = 70;

var BlankDiv = function BlankDiv() {
  return LReact.Element('div');
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

      return LReact.Element('button', {
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
      }, [(_a = _this.dirToEmoji.get(d)) !== null && _a !== void 0 ? _a : d]);
    });
    return LReact.Element('div', {
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
    }, [LReact.Element(BlankDiv), buttons[0], LReact.Element(BlankDiv), buttons[1], LReact.Element(BlankDiv), buttons[2], LReact.Element(BlankDiv), buttons[3], LReact.Element(BlankDiv)]);
  };

  return ButtonControls;
}(LReact.Component);

exports.ButtonControls = ButtonControls;
},{"../l_react2":"l_react2.ts"}],"pacman/index.ts":[function(require,module,exports) {
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

var LReact = __importStar(require("../l_react2"));

var game_1 = require("./game");

var pt_1 = require("./pt");

var render_1 = require("./render");

var Element = LReact.Element;

var game_controls_1 = require("./game_controls");

var GameComponent =
/** @class */
function (_super) {
  __extends(GameComponent, _super);

  function GameComponent(props) {
    var _this = _super.call(this, props) || this;

    _this.controller = new game_controls_1.Controller();

    _this.componentDidMount = function () {
      _this.windowResizeListener = function () {
        var w = window.innerWidth;
        var h = window.innerHeight;

        if (w !== _this.state.windowSize.w || h !== _this.state.windowSize.h) {
          _this.setState({
            windowSize: {
              w: w,
              h: h
            }
          });
        }
      };

      window.addEventListener('resize', _this.windowResizeListener);
    };

    _this.componentDidUnmount = function () {
      if (_this.windowResizeListener) {
        window.removeEventListener('resize', _this.windowResizeListener);
        _this.windowResizeListener = undefined;
      }
    };

    _this.startGame = function (difficulty) {
      _this.game.startNewGame(difficulty);

      _this.setState({
        state: _this.game.gameState
      });
    };

    _this.pause = function () {
      _this.setGameState('paused');
    };

    _this.unpause = function () {
      _this.setGameState('playing');
    };

    _this.restartGame = function () {
      _this.setGameState('not-started');
    };

    _this.setGameState = function (s) {
      _this.game.gameState = s;

      _this.setState({
        state: s
      });
    };

    _this.level = game_1.Level.createLevel1();
    _this.game = new game_1.Game(_this.level);
    _this.state = {
      state: _this.game.gameState,
      windowSize: {
        w: window.innerWidth,
        h: window.innerHeight
      }
    };
    return _this;
  }

  GameComponent.prototype.render = function () {
    var _this = this;

    var useMobileControls = this.useMobileControls;
    var _a = this.gameRenderScaleAndSize,
        gameRenderScale = _a.gameRenderScale,
        size = _a.size;
    console.log(gameRenderScale);
    return Element('div', {}, [Element('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        width: size.w + "px",
        margin: 'auto auto'
      }
    }, [Element(LiveGameScore, {
      g: this.game
    }), Element('button', {
      onClick: function onClick() {
        _this.game.gameState = 'paused';

        _this.setState({
          state: 'paused'
        });
      }
    }, ['pause'])]), Element(LevelGameContainer, size, [Element(RenderedLevel, {
      level: this.level,
      N: gameRenderScale
    }), this.renderGameState()]), useMobileControls ? Element(game_controls_1.ButtonControls, {
      controller: this.controller
    }) : Element(game_controls_1.KeyboardInstructions)]);
  };

  Object.defineProperty(GameComponent.prototype, "useMobileControls", {
    get: function get() {
      return this.state.windowSize.w < 400;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(GameComponent.prototype, "gameRenderScaleAndSize", {
    get: function get() {
      var windowSize = this.state.windowSize;
      var s = Math.min(windowSize.w - 16, 600);
      var size = {
        w: s,
        h: s + 10
      };
      return {
        gameRenderScale: size.w / (this.level.w + 2),
        size: size
      };
    },
    enumerable: false,
    configurable: true
  });

  GameComponent.prototype.renderGameState = function () {
    var _this = this;

    var gameRenderScale = this.gameRenderScaleAndSize.gameRenderScale;

    switch (this.game.gameState) {
      case 'playing':
        return Element(AnimatedGame, {
          game: this.game,
          gameRenderScale: gameRenderScale,
          controller: this.controller,
          onGameStateChange: function onGameStateChange(s) {
            return _this.setState({
              state: s
            });
          }
        }, []);

      case 'not-started':
        return Element(MenuOverlay, {}, [Element(StartGameMenu, {
          startGame: this.startGame
        })]);

      case 'game-over':
        return Element(MenuOverlay, {}, [Element(GameOverMenu, {
          restart: this.restartGame,
          message: 'Oh, sorry you lost 😭',
          buttonText: 'Play Again'
        })]);

      case 'you-won':
        return Element(MenuOverlay, {}, [Element(GameOverMenu, {
          restart: this.restartGame,
          message: 'You Won!! 🎉',
          buttonText: 'Play Again'
        })]);

      case 'paused':
        return Element(MenuOverlay, {}, [Element(GameOverMenu, {
          restart: this.unpause,
          message: 'paused',
          buttonText: 'back'
        })]);
    }
  };

  return GameComponent;
}(LReact.Component);

exports.GameComponent = GameComponent;

var LiveGameScore =
/** @class */
function (_super) {
  __extends(LiveGameScore, _super);

  function LiveGameScore(props) {
    var _this = _super.call(this, props) || this;

    _this.componentDidMount = function () {
      _this.intervalId = setInterval(_this.maybeUpdateScore, 30);
    };

    _this.componentDidUnmount = function () {
      if (_this.intervalId != null) clearInterval(_this.intervalId);
      _this.intervalId = undefined;
    };

    _this.maybeUpdateScore = function () {
      var newScore = _this.props.g.getCandyRemaining();

      if (newScore !== _this.state.score) {
        _this.setState({
          score: newScore
        });
      }
    };

    _this.state = {
      score: props.g.getCandyRemaining()
    };
    return _this;
  }

  LiveGameScore.prototype.render = function () {
    return Element('div', {}, ['score: ' + this.state.score]);
  };

  return LiveGameScore;
}(LReact.Component);

var AnimatedGame =
/** @class */
function (_super) {
  __extends(AnimatedGame, _super);

  function AnimatedGame(props) {
    var _this = _super.call(this, props) || this;

    _this.componentDidMount = function () {
      _this.gameLoop();

      _this.setupEventListeners();
    };

    _this.componentDidUnmount = function () {
      var _a;

      (_a = _this.killEventListeners) === null || _a === void 0 ? void 0 : _a.call(_this);

      _this.props.controller.reset();

      if (_this.animationRequest !== undefined) {
        cancelAnimationFrame(_this.animationRequest);
        _this.animationRequest = undefined;
      }
    };

    _this.canvasSet = function (canvas) {
      var ctx = canvas.getContext('2d');
      _this.ctx = ctx;
    };

    console.log('new AnimatedGame');
    return _this;
  }

  Object.defineProperty(AnimatedGame.prototype, "canvasPixel", {
    get: function get() {
      return new pt_1.Pt(this.props.game.level.w, this.props.game.level.h);
    },
    enumerable: false,
    configurable: true
  });
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
    return Element('canvas', {
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

    var loop = function loop(delta) {
      var N = _this.props.gameRenderScale; //console.log(N, this);

      var ctx = _this.ctx;
      var game = _this.props.game;
      if (!ctx) return;
      var dt = delta - prevDelta;
      prevDelta = delta;
      game.tick(dt, _this.getPlayerInputDir(), _this.props.onGameStateChange);
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
      if (_this.animationRequest !== undefined) _this.animationRequest = requestAnimationFrame(loop);
    };

    this.animationRequest = requestAnimationFrame(loop);
  };

  return AnimatedGame;
}(LReact.Component);

var MenuOverlay = function MenuOverlay(_a) {
  var children = _a.children;
  return Element('div', {
    style: {
      width: '100%',
      height: '100%',
      backdropFilter: 'blur(5px)'
    }
  }, children);
};

var StartGameMenu = function StartGameMenu(_a) {
  var startGame = _a.startGame;

  var _b = LReact.useState('easy'),
      difficulty = _b[0],
      setDifficulty = _b[1];

  var CheckBox = function CheckBox(_a) {
    var d = _a.d;
    return Element('div', {
      style: {
        display: 'grid',
        gridAutoFlow: 'column',
        gridGap: '16px',
        alignItems: 'center',
        gridTemplateColumns: '200px 1fr'
      }
    }, [Element('label', {
      style: {
        fontSize: '20px'
      }
    }, [d]), Element('input', {
      type: 'checkbox',
      checked: difficulty === d,
      onChange: function onChange(e) {
        if (d === difficulty) {
          e.target.checked = true;
        } else {
          console.log('set diff');
          setDifficulty(d);
        }
      }
    })]);
  };

  return Element('div', {
    style: {
      color: 'orange',
      fontSize: '40px',
      width: '100%',
      height: '100%',
      display: 'grid',
      gridAutoFlow: 'row',
      justifyItems: 'center',
      alignItems: 'center',
      gridGap: '24px',
      alignContent: 'center',
      gridTemplateRows: 'repeat(4, min-content)',
      background: 'rgba(0,0,0,0.5)'
    }
  }, ["start game", Element('div', {
    style: {
      display: 'grid',
      gridAutoFlow: 'row',
      gridGap: '8px'
    }
  }, [Element(CheckBox, {
    d: 'easy'
  }), Element(CheckBox, {
    d: 'medium'
  }), Element(CheckBox, {
    d: 'hard'
  })]), Element(BigButton, {
    onClick: function onClick() {
      return startGame(difficulty);
    },
    label: 'Play'
  })]);
};

var GameOverMenu = function GameOverMenu(_a) {
  var restart = _a.restart,
      message = _a.message,
      buttonText = _a.buttonText;
  return Element('div', {
    style: {
      background: 'rgba(0,0,0,0.5)',
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateRows: 'min-content min-content',
      alignContent: 'center',
      justifyContent: 'center',
      gridGap: '16px'
    }
  }, [Element('div', {
    style: {
      textAlign: 'center',
      color: 'orange',
      fontSize: '30px'
    }
  }, [message]), Element(BigButton, {
    onClick: restart,
    label: buttonText
  })]);
};

var BigButton = function BigButton(_a) {
  var label = _a.label,
      onClick = _a.onClick;
  return Element('button', {
    style: {
      fontSize: '40px',
      width: '100%',
      maxWidth: '250px',
      cursor: 'pointer'
    },
    onClick: onClick
  }, [label]);
};

var LevelGameContainer = function LevelGameContainer(_a) {
  var w = _a.w,
      h = _a.h,
      children = _a.children;
  console.log('children', children);
  return Element('div', {
    style: {
      backgroundColor: 'lightblue',
      display: 'grid',
      placeItems: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }
  }, [Element('div', {
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
        blocks.push(Element(Block, {
          top: topLeft.y * N + offset.y,
          left: topLeft.x * N + offset.x,
          width: N * thick,
          height: N * thick,
          color: 'black'
        }));
      }
    }
  }

  return Element('div', {}, __spreadArrays(blocks));
}

var Block = function Block(_a) {
  var top = _a.top,
      left = _a.left,
      width = _a.width,
      height = _a.height,
      _b = _a.color,
      color = _b === void 0 ? 'blue' : _b;
  return Element('div', {
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
},{"../l_react2":"l_react2.ts","./game":"pacman/game.ts","./pt":"pacman/pt.ts","./render":"pacman/render.ts","./game_controls":"pacman/game_controls.ts"}],"index.ts":[function(require,module,exports) {
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

var LReact = __importStar(require("./l_react2"));

var index_1 = require("./pacman/index");

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
    }, ['to green']) : null, color === 'green' ? Element(Luke) : null, 'END', Element(index_1.GameComponent)]);
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
},{"./l_react2":"l_react2.ts","./pacman/index":"pacman/index.ts"}],"../../../.nvm/versions/node/v12.13.1/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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