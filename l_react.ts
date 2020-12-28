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

export abstract class Component<Props extends object, State extends object> {
    props: Props;
    state?: State;

    _vnode?: VElem;
    paint?: (x: Component<Props, State>) => void;
    componentDidMount?: () => void;
    componentDidUnmount?: () => void;

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

    abstract render(): VElem;
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
        this.v = v;
        this.repaint?.();
    }
}

let currentUseStateSystem: UseStateSystem<any> | undefined = undefined;

export const useState = <T>(state: T): UseStateConfig<T> => {

    const sys = currentUseStateSystem
        ? currentUseStateSystem
        : new UseStateSystem(state);

    currentUseStateSystem = sys;

    return [
        sys.v,
        (v: T) => sys.set(v),
    ];
};

type ComponentConstructor<P extends object, S extends object> = new(p: P) => Component<P, S>;

type ComponentType<P extends object, S extends object> =
    | string // eg. div, img, href
    | ComponentConstructor<P, S>
    | ((props: P | undefined) => VElem);

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
        c._vnode._name = c.constructor.name
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
       const vnode = F(p);
        if (currentUseStateSystem) {
            const sys = currentUseStateSystem;
            currentUseStateSystem.repaint = () => repaintFunctionComponent(F, sys, vnode, p);
            currentUseStateSystem = undefined;
        }
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

function repaintFunctionComponent<P extends object, S extends object>(c: (props: P) => VElem, useStateSystem: UseStateSystem<any>, oldTree: VElem, props: P) {
    currentUseStateSystem = useStateSystem;
    const newTree = c(props);
    currentUseStateSystem = undefined;
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

export function Node<P extends object, S extends object>(type: ComponentType<P, S>, props: P = {} as P, children: VElem[] = []) {
    return createVElement(type, props, children);
}

export function modifyTree(tree: VElem, parent?: VElem, prevTree?: VElem) {
    const { props, children, type } = tree;
    if (prevTree && prevTree.type === type && children.length === prevTree.children.length) {
        // replace attributes
        const pte = prevTree.getElem()!;
        if(!objectsShallowEqual(props, prevTree.props) && pte.type === 'elem') assignProps(pte.e, props);
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
    child: VElem,
    prevChild: VElem | undefined,
    index: number,
) => void;

type PrevFn = (
    prevChild: VElem,
    index: number,
) => void;

function loopThroughChildren(tree: VElem, prevTree: VElem | undefined, both: BothFn, prevOnly: PrevFn) {
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

    const rawAttributes = new Set(['width', 'height', 'href', 'id', 'value']);
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
