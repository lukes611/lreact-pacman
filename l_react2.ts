type ComponentMakerKind =
    | { kind: 'f', f: (p: object) => _Element }
    | { kind: 'c', c: new (p: object) => Component }
    | { kind: 'html', type: string }
    | { kind: 'string', value: string };

export class _Element {
    _name?: string;
    _parent?: _Element;
    _elem?: HTMLElement | Text;
    _velem?: _Element;
    _dom?: HTMLElement;
    _c?: Component<any, any>;
    _useStateSys?: UseStateSystem<any>;

    constructor(public maker: ComponentMakerKind, public props: Record<string, any>, public children: _Element[]) {
        if (this.maker.kind === 'c') this._name = this.maker.c.constructor.name;
    }

    createElement() {
        switch (this.maker.kind) {
            case 'c': {
                this._c = this._c ?? new this.maker.c(this.props);
                this._c.paint = () => repaint2(this);
                this._velem = this._c?.render();
            }; break;
            case 'f': {
                currentUseStateSystem.takeout();
                this._velem = this.maker.f(this.props);
                const useStateSys = currentUseStateSystem.get();
                if (useStateSys) {
                    const sys = useStateSys;
                    this._useStateSys = sys;
                    sys.repaint = () => repaint2(this);
                }
                currentUseStateSystem.pop();
            }; break;
            case 'html': {
                this._elem = document.createElement(this.maker.type);
            }; break;
            case 'string': {
                this._elem = document.createTextNode(this.maker.value);
            }; break;
        }
    }

    getMakerValue() {
        switch (this.maker.kind) {
            case 'c': return this.maker.c;
            case 'f': return this.maker.f;
            case 'html': return this.maker.type;
            case 'string': return this.maker.value;
        }
    }

    similar(e: _Element): boolean {
        if (e.maker.kind !== this.maker.kind) return false;
        if (this.getMakerValue() !== e.getMakerValue()) return false;
        if (this.children.length !== e.children.length) return false;
        return true;
    }
}

type MakerType<P extends object, S extends object> =
    | string // eg. div, img, href
    | ComponentConstructor<P, S>
    | ((props: P | undefined) => _Element);

export function Element<P extends object, S extends object>(type: MakerType<P, S>, props: object = {}, children: (_Element | string | null)[] = []): _Element {
    const properChildren = children.map(ch => {
        if (typeof ch === 'string') return new _Element({ kind: 'string', value: ch }, {}, []);
        return ch;
    }).filter(x => x != null);
    const fixedProps = {
        ...props,
        children: properChildren,
    };
    if (typeof type === 'function') {
        if (isAComponentClass(type)) {
            return new _Element({ kind: 'c', c: type as any }, fixedProps, properChildren);
        }
        return new _Element({ kind: 'f', f: type as any }, fixedProps, properChildren);
    } else if (typeof type === 'string') {
        return new _Element({ kind: 'html', type }, fixedProps, properChildren);
    }
}
export class VElem {
    type: string;
    props: { [k: string]: any };
    children: VElem[];
    isTextNode: boolean;
    value?: string;
    _name?: string;
    _parent?: VElem;
    _elem?: HTMLElement | Text;
    _dom?: HTMLElement;
    _useStateSystem?: UseStateSystem<any>;
    isRoot: boolean = false;
    componentDidMount?: () => void;
    componentDidUnmount?: () => void;

    constructor(type: string, props: object = {}, children: VElem[] = [], value?: string) {
        this.type = type;
        this.props = props;
        this.children = children.filter(x => x !== null);
        this.isTextNode = this.type === 'text-node';
        this.value = value;
    }

    toString() {
        if (this.isTextNode) {
            return this.value.toString();
        }
        const { props, type, children } = this;
        return `<${type} props="${JSON.stringify(props)}">
                        ${children.map(c => c.toString()).join('\n')}
                </${type}>
        `;
    }

    getElem(): { type: 'text', e: Text } | { type: 'elem', e: HTMLElement } | undefined {
        if (!this._elem) return undefined;
        if (this.isTextNode) return { type: 'text', e: this._elem as Text };
        return { type: 'elem', e: this._elem as HTMLElement };
    }

}

export function Text(v: string) {
    return new VElem('text-node', {}, [], v);
}

export abstract class Component<Props extends object = {}, State extends object = {}> {
    props: Props;
    state?: State;

    _vnode?: _Element;
    paint?: (x: Component<Props, State>) => void;
    componentDidMount() {}
    componentDidUnmount() {}

    constructor(props: Props) {
        this.props = props;
    }

    setState(s: Partial<State>) {
        if (this.state) {
            this.state = {
                ...this.state,
                ...s,
            };
            this.paint?.(this);
        }
    }

    abstract render(): _Element;
}

function isAComponentClass(x: any) {
    if (typeof x !== 'function') return false;
    return x.prototype && x.prototype.__isComponent;
}

(Component.prototype as unknown as any).__isComponent = true;

type UseStateConfig<T> = [
    s: T,
    set: (v: T) => void,
];

class UseStateSystem<T> {
    repaint?: () => void;
    constructor(public v: T) {
    }

    set(v: T) {
        console.log('wowee')
        this.v = v;
        this.repaint?.();
    }
}

class CurrentUseStateSystem {
    _list: (UseStateSystem<any> | undefined)[] = [undefined];
    
    takeout() {
        this._list.push(undefined);
    }

    get() {
        return this._list[this.lastIndex];
    }

    get lastIndex() {
        return this._list.length - 1;
    }

    useSlot(v: any) {
        if (this._list[this.lastIndex]) {
            return this._list[this.lastIndex];
        }
        const x = new UseStateSystem(v);
        this._list[this.lastIndex] = x;
        return x;
    }

    useUseStateSys(sys: UseStateSystem<any>) {
        this.takeout();
        this._list[this.lastIndex] = sys;
    }

    pop() {
        if (this._list.length >= 1) this._list.pop();
        else this._list[0] = undefined;
    }
}

const currentUseStateSystem = new CurrentUseStateSystem();

export const useState = <T>(state: T): UseStateConfig<T> => {
    
    const sys = currentUseStateSystem.useSlot(state);
    
    return [
        sys.v,
        (v: T) => sys.set(v),
    ];
};

type ComponentConstructor<P extends object, S extends object> = new(p: P) => Component<P, S>;


function createVElement<P extends object, S extends object>(node: ComponentType<P, S>, props: P, children?: VElem[]) {
    const asAny = node as unknown as any;
    if (asAny.prototype && asAny.prototype.__isComponent) {
        const C = node as ComponentConstructor<P, S>;
        const c: Component<P, S> = new C({
            ...props,
            children,
        });
        c.paint = x => repaint(x);
        c._vnode = c.render();
        c._vnode._name = c.constructor.name;
        if (c.componentDidMount) {
            c._vnode.componentDidMount = () => c.componentDidMount();
        }
        if (c.componentDidUnmount) {
            c._vnode.componentDidUnmount = () => c.componentDidUnmount();
        }
        return c._vnode;
    } else if (typeof node === 'function') {
        const F = node as (p: P) => VElem;
        const p = {
            ...props,
            children,
        };
        // if already a currentUseStateSystem, save it
        currentUseStateSystem.takeout();
       const vnode = F(p);
       const useStateSys = currentUseStateSystem.get();
        if (useStateSys) {
            const sys = useStateSys;
            sys.repaint = () => repaintFunctionComponent(F, sys, vnode, p);
        }
        currentUseStateSystem.pop();
       return vnode;
    }
    return new VElem(node, props, children);
}

function repaint<P extends object, S extends object>(c: Component<P, S>) {
    const oldTree = c._vnode;
    const newTree = c.render();
    newTree.componentDidMount = oldTree.componentDidMount;
    newTree.componentDidUnmount = oldTree.componentDidUnmount;
    // console.log(oldTree.toString());
    // console.log(newTree.toString());
    const parent = oldTree?._parent;
    
    modifyTree(newTree, parent, oldTree);
    c._vnode = newTree;
    if (oldTree?.isRoot) {
        const domParent = oldTree._dom;
        domParent.replaceChild(newTree._elem, oldTree._elem);
        newTree.isRoot = true;
        newTree._dom = domParent;
    }
}

function repaintFunctionComponent<P extends object>(c: (props: P) => VElem, useStateSystem: UseStateSystem<any>, oldTree: VElem, props: P) {
    currentUseStateSystem.useUseStateSys(useStateSystem);
    const newTree = c(props);
    currentUseStateSystem.pop();
    newTree.componentDidMount = oldTree.componentDidMount;
    newTree.componentDidUnmount = oldTree.componentDidUnmount;
    const parent = oldTree?._parent;
    
    modifyTree(newTree, parent, oldTree);
    useStateSystem.repaint = () => repaintFunctionComponent(c, useStateSystem, newTree, props);
    if (oldTree?.isRoot) {
        const domParent = oldTree._dom;
        domParent.replaceChild(newTree._elem, oldTree._elem);
        newTree.isRoot = true;
        newTree._dom = domParent;
    }
}

type ComponentType<P extends object, S extends object> =
    | string // eg. div, img, href
    | ComponentConstructor<P, S>
    | ((props: P | undefined) => VElem);

export function Node<P extends object, S extends object>(type: ComponentType<P, S>, props: P = {} as P, children: VElem[] = []) {
    return createVElement(type, props, children);
}

export function modifyTree(tree: VElem, parent?: VElem, prevTree?: VElem, updateDomIsRemount?: boolean) {
    const { props, children, type } = tree;
    if (prevTree && prevTree.type === type && children.length === prevTree.children.length) {
        // replace attributes
        const pte = prevTree.getElem()!;
        if(!objectsShallowEqual(props, prevTree.props) && pte.type === 'elem') {
            assignProps(pte.e, props);
        }
        tree._elem = pte.e;
        tree._parent = prevTree._parent;

        if (tree.isTextNode && pte.type === 'text') {
            pte.e.data = tree.toString();
        } else {
            loopThroughChildren(tree, prevTree, (c, pc, i) => {
                modifyTree(c, tree, pc);
            }, (pc, i) => {
                prevTree._elem.removeChild(pc._elem);
                prevTree.componentDidUnmount?.();
            });
        }
    } else {
        // replace this node and all children

        const element = tree.isTextNode
            ? document.createTextNode(tree.value)
            : document.createElement(type);
        tree._elem = element;
        tree._parent = parent;
        if (prevTree) {
            prevTree._parent._elem.replaceChild(element, prevTree._elem);
            prevTree.componentDidUnmount?.();
        } else if (parent) {
            parent._elem.appendChild(element);
        }
        tree.componentDidMount?.();
        const te = tree.getElem();
        if (te && te.type === 'elem')
            assignProps(te.e, props);

        if (props.ref) {
            props.ref(tree._elem);
        }

        loopThroughChildren(tree, prevTree, (c, pc, i) => {
            modifyTree(c, tree, undefined);
        }, (pc, i) => {
            prevTree._elem.removeChild(pc._elem);
            prevTree.componentDidUnmount?.();
        });

    }
}

type BothFn = (
    child: _Element,
    prevChild: _Element | undefined,
    index: number,
) => void;

type PrevFn = (
    prevChild: _Element,
    index: number,
) => void;

function loopThroughChildren(tree: _Element, prevTree: _Element | undefined, both: BothFn, prevOnly: PrevFn) {
    const prevChildren = (prevTree ? prevTree.children : []) ?? [];
    tree.children.forEach((c, i) => {
        both(c, prevChildren[i], i);
    });
    if (!prevTree || tree.children.length > prevChildren.length) {
        return;
    }
    for (let i = tree.children.length; i < prevChildren.length; i++) {
        prevOnly(prevChildren[i], i);
    }
}

function assignProps(element: HTMLElement, props: Record<string, any>) {
    if (props.style) Object.assign(element.style, props.style);
    if (props.onClick) element.onclick = (e) => props.onClick(e);
    if (props.onMouseDown) element.onmousedown = (e) => props.onMouseDown(e);
    if (props.onMouseUp) element.onmouseup = (e) => props.onMouseUp(e);
    if (props.onTouchStart) element.ontouchstart = (e) => props.onTouchStart(e);
    if (props.onTouchEnd) element.ontouchend = (e) => props.onTouchEnd(e);
    if (props.onChange) element.oninput = (e) => props.onChange(e);

    const rawAttributes = new Set(['width', 'height', 'href', 'id', 'value', 'type', 'checked']);
    Object.keys(props).forEach(k => {
        if (rawAttributes.has(k)) {
            element[k] = props[k];
        }
    });
}

function objectsShallowEqual(obj1: Record<string, any>, obj2: Record<string, any>) {
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = new Set(Object.keys(obj2));
    if (obj1Keys.length !== obj2Keys.size) return false;
    
    for (const key of obj1Keys) {
        if (!obj2Keys.has(key)) return false;
        const v1 = obj1[key];
        const v2 = obj2[key];
        if (v1 !== v2) return false;
    }
    return true;
}

export function Init(node: VElem, domParent: HTMLElement) {
    node.isRoot = true;
    modifyTree(node);
    domParent.appendChild(node._elem);
    node._dom = domParent;
}

export function RenderDom(e: _Element, domParent: HTMLElement) {
    console.log('ok...');
    modifyTree2(e, undefined, domParent, undefined);
}

function repaint2<P extends object, S extends object>(e: _Element) {
    // maker must be component or function component, do function later
    const oldTree = e._velem!;
    let newTree: _Element;
    if (e.maker.kind === 'c') {
        newTree = e._c.render();
    } else if (e.maker.kind === 'f') {
        console.log('re-rrender F', e)
        const hasUSS = !!e._useStateSys;
        if (hasUSS) {
            currentUseStateSystem.useUseStateSys(e._useStateSys);

        }
        newTree = e.maker.f(e.props);
        if (hasUSS) {
            currentUseStateSystem.pop();
        }
    }
    
    // newTree.componentDidMount = oldTree.componentDidMount;
    // newTree.componentDidUnmount = oldTree.componentDidUnmount;
    // console.log(oldTree.toString());
    // console.log(newTree.toString());
    const parent = oldTree?._parent;
    
    modifyTree2(newTree, parent, oldTree._dom, oldTree);
    e._velem = newTree;
    // if (oldTree?.isRoot) {
    //     const domParent = oldTree._dom;
    //     domParent.replaceChild(newTree._elem, oldTree._elem);
    //     newTree.isRoot = true;
    //     newTree._dom = domParent;
    // }
}

export function modifyTree2(tree: _Element, parent?: _Element, parentDOM?: HTMLElement, prevTree?: _Element) {
    const { props, children, maker } = tree;
    tree._dom = parentDOM;
    // debugger;
    // console.log('f');

    if (prevTree && prevTree.similar(tree)) {
        if (prevTree._elem && tree.maker.kind === 'html') {
            tree._elem = prevTree._elem;
            if (!objectsShallowEqual(tree.props, prevTree.props)) {
                assignProps(tree._elem as HTMLElement, props);
            }
            loopThroughChildren(tree, prevTree, (ch, pc, i) => {
                modifyTree2(ch, tree, tree._elem as HTMLElement, pc);
            }, (pc, i) => {
                console.log('remove')
                if (prevTree._elem && pc._elem) {
                    prevTree._elem.removeChild(pc._elem)
                }
                unmountAll(pc);
            });
            // tree.children.forEach((ch, i) => {
            //     modifyTree2(ch, tree, tree._elem as HTMLElement, prevTree.children[i]);
            // });
            return;
        } 
        else if (prevTree._velem) {
            // console.log('just replace attrbutes?', tree.maker);
            // tree._velem = prevTree._velem;
            tree._c = prevTree._c;
            if (tree._c) {
                tree._c.props = props;
            }
            tree._useStateSys = prevTree._useStateSys;
            tree.createElement();
            // prevTree._elem
            removeElements(prevTree);
            modifyTree2(tree._velem, tree, parentDOM, undefined);

            // tree.children.forEach((ch, i) => {
            //     modifyTree2(ch, tree, parentDOM, prevTree.children[i]);
            // });
            return;
        } else return;
    }

    // must re-write
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
            assignProps(tree._elem as HTMLElement, props);
            loopThroughChildren(tree, prevTree, (ch, pch, i) => {
                modifyTree2(ch, tree, tree._elem as HTMLElement, undefined);
            }, (pc, i) => {
                if (prevTree._elem && pc._elem) {
                    prevTree._elem.removeChild(pc._elem)
                }
                unmountAll(pc);
                removeElements(pc);
            });
            // children.forEach(ch => {
            // });
        }
    } else if (tree._velem) {
        if (prevTree) {
            console.log('kill?', prevTree)
            unmountAll(prevTree);
            removeElements(prevTree);
        }
        tree._c?.componentDidMount();
        modifyTree2(tree._velem, tree, parentDOM, undefined);
    }

    // tree.children.forEach(ch => {

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

function unmountAll(t: _Element) {
    t._c?.componentDidUnmount();
    t.children.forEach(unmountAll);
}

function removeElements(t: _Element) {
    if (t._dom && t._elem) {
        t._dom.removeChild(t._elem);
    }
    if (t._velem) {
        removeElements(t._velem);
    }
}
