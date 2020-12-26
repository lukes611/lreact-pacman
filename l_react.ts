export class VElem {
    type: string;
    props: { [k: string]: any };
    children: VElem[];
    isTextNode: boolean;
    value?: string;
    _name?: string;
    _parent?: VElem;
    _elem?: HTMLElement;
    _dom?: HTMLElement;
    isRoot: boolean = false;
    componentDidMount?: () => void;
    componentDidUnmount?: () => void;

    constructor(type: string, props: object = {}, children: VElem[] = [], value?: string) {
        this.type = type;
        this.props = props;
        this.children = children;
        this.isTextNode = this.type === 'text-node';
        this.value = value;
    }

    toString() {
        if (this.isTextNode) {
            return JSON.stringify(this.value);
        }
        const { props, type, children } = this;
        return `<${type} props="${JSON.stringify(props)}">
                        ${children.map(c => c.toString()).join('\n')}
                </${type}>
        `;
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
       return F({
           ...props,
           children,
       });
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

export function Node<P extends object, S extends object>(type: ComponentType<P, S>, props: P = {} as P, children: VElem[] = []) {
    return createVElement(type, props, children);
}

export function modifyTree(tree: VElem, parent?: VElem, prevTree?: VElem) {
    const { props, children, type } = tree;
    if (prevTree && prevTree.type === type && children.length === prevTree.children.length) {
        // replace attributes
        const element = prevTree._elem;
        if(!objectsShallowEqual(props, prevTree.props)) assignProps(element, props);
        tree._elem = element;
        tree._parent = prevTree._parent;

        if (tree.isTextNode) {
            element.innerHTML = tree.toString();
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
        const element = document.createElement(type);
        tree._elem = element;
        tree._parent = parent;
        if (prevTree) {
            prevTree._parent._elem.replaceChild(element, prevTree._elem);
            prevTree.componentDidUnmount?.();
        } else if (parent) {
            parent._elem.appendChild(element);
        }
        tree.componentDidMount?.();
        assignProps(element, props);

        if (props.ref) {
            props.ref(tree._elem);
        }

        if (tree.isTextNode) {
            tree._elem.appendChild(document.createTextNode(tree.toString()));
        } else {
            loopThroughChildren(tree, prevTree, (c, pc, i) => {
                modifyTree(c, tree, undefined);
            }, (pc, i) => {
                prevTree._elem.removeChild(pc._elem);
                prevTree.componentDidUnmount?.();
            })
        }

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
