type ComponentMakerKind =
    | { kind: 'f', f: (p?: object) => _Element }
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
    _useStateSysList?: UseStateSystem<any>[];

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
                useStateController.reset();
                this._velem = this.maker.f(this.props);
                this._useStateSysList = useStateController.maybeGetList(() => repaint2(this));
                useStateController.reset();
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
        if (e.maker.kind === 'string') return true;
        if (this.getMakerValue() !== e.getMakerValue()) return false;
        if (this.children.length !== e.children.length) return false;
        return true;
    }
}

export { _Element as LReactElement };

type ComponentConstructor<P extends {} = {}, S extends {} = {}> = new(p: P) => Component<P, S>;

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

export abstract class Component<Props extends {} = {}, State extends {} | void = void> {
    props: Props;
    state: State;

    _vnode?: _Element;
    paint?: (x: Component<Props, State>) => void;
    componentDidMount() {}
    componentDidUnmount() {}

    constructor(props: Props) {
        this.props = props;
    }

    public setState(s: Partial<State>) {
        if (this.state) {
            this.state = {
                ...this.state,
                ...s,
            };
            this.paint?.(this);
        }
    }

    public abstract render(): _Element;
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
        this.v = v;
        this.repaint?.();
    }
}
class UseStateController {
    private mode: 'push' | 'pop' = 'push';
    private list: UseStateSystem<any>[];
    private index: number = 0;

    reset() {
        this.mode = 'push';
        this.list = [];
        this.index = 0;
    }

    getSys<T>(s: T): UseStateSystem<T> {
        if (this.mode === 'push') {
            const sys = new UseStateSystem(s);
            this.list.push(sys);
            return sys;
        } else { // pop mode
            return this.list[this.index++];
        }
    }

    setupForConsumer(list: UseStateSystem<any>[]) {
        this.list = list;
        this.index = 0;
        this.mode = 'pop';
    }

    maybeGetList(repaint: () => void): UseStateSystem<any>[] | undefined {
        if (this.mode === 'push' && this.list.length) {
            return [...this.list].map(sys => {
                sys.repaint = repaint;
                return sys;
            });
        }
        return;
    }
} 

const useStateController = new UseStateController();

export const useState = <T>(state: T): UseStateConfig<T> => {
    const sys = useStateController.getSys(state);
    
    return [
        sys.v,
        (v: T) => sys.set(v),
    ];
};


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

export function RenderDom(e: _Element, domParent: HTMLElement) {
    modifyTree(e, undefined, domParent, undefined);
}

function repaint2<P extends object, S extends object>(e: _Element) {
    const oldTree = e._velem!;
    let newTree: _Element;
    if (e.maker.kind === 'c') {
        newTree = e._c.render();
    } else if (e.maker.kind === 'f') {
        if (e._useStateSysList) {
            useStateController.setupForConsumer(e._useStateSysList);
        }
        newTree = e.maker.f(e.props);
        useStateController.reset();
    }
    
    const parent = oldTree?._parent;
    
    modifyTree(newTree, parent, oldTree._dom, oldTree);
    e._velem = newTree;
}

export function modifyTree(tree: _Element, parent?: _Element, parentDOM?: HTMLElement, prevTree?: _Element) {
    const { props, maker } = tree;
    tree._dom = parentDOM;
    
    if (prevTree && prevTree.similar(tree)) {
        if (tree.maker.kind === 'string' && prevTree.maker.kind == 'string') {
            tree._elem = prevTree._elem;
            const elem = tree._elem as Text;
            elem.data = tree.maker.value;
        } else if (prevTree._elem && tree.maker.kind === 'html') {
            tree._elem = prevTree._elem;
            if (!objectsShallowEqual(tree.props, prevTree.props)) {
                assignProps(tree._elem as HTMLElement, props);
            }
            loopThroughChildren(tree, prevTree, (ch, pc, i) => {
                modifyTree(ch, tree, tree._elem as HTMLElement, pc);
            }, (pc, i) => {
                if (prevTree._elem && pc._elem) {
                    prevTree._elem.removeChild(pc._elem)
                }
                unmountAll(pc);
            });
            return;
        } else if (prevTree._velem) {
            tree._c = prevTree._c;
            if (tree._c) {
                tree._c.props = props;
            }
            tree._useStateSysList = prevTree._useStateSysList;
            tree.createElement();
            // removeElements(prevTree);
            // unmountAll(prevTree._velem);
            modifyTree(tree._velem, tree, parentDOM, prevTree._velem);
            return;
        } else return;
    }

    // new elements / overwrite prevTree
    tree.createElement();
    if (prevTree) {
        unmountAll(prevTree);
    }
    if (parentDOM && tree._elem) {
        if (prevTree && prevTree._elem) {
            parentDOM.replaceChild(tree._elem, prevTree._elem);
        } else {
            parentDOM.appendChild(tree._elem);
        }
        if (tree.props.ref) {
            tree.props.ref(tree._elem);
        }
        if (maker.kind === 'html') {
            assignProps(tree._elem as HTMLElement, props);
        }
        loopThroughChildren(tree, prevTree, (ch, pch, i) => {
            modifyTree(ch, tree, tree._elem as HTMLElement, undefined);
        }, (pc, i) => {
            removeElements(pc);
        });
    } else if (tree._velem) {
        if (prevTree) {
            removeElements(prevTree);
        }
        tree._c?.componentDidMount();
        modifyTree(tree._velem, tree, parentDOM, undefined);
    }
}

function unmountAll(t: _Element) {
    t._c?.componentDidUnmount();
    t.children.forEach(unmountAll);
    if (t._velem) unmountAll(t._velem);
}

function removeElements(t: _Element) {
    if (t._dom && t._elem) {
        t._dom.removeChild(t._elem);
        t._elem = undefined;
    }
    if (t._velem) {
        removeElements(t._velem);
    }
}
