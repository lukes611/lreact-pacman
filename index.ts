import * as LReact from './l_react2';
import { GameComponent } from './pacman/index';
const Element = LReact.Element;



function ListElem({ v }: { v: number }) {

    const [bigFont, setBigFont] = LReact.useState(false);

    console.log('render ListElem');

    return Element('li', {
        style: {
            fontSize: bigFont ? '20px' : '10px',
        },
    }, [
        `val=${v}`,
        Element('button', {
            onClick: () => {
                console.log('big font for ', v);
                setBigFont(true);
            },
        }, ['use big font size?'])
    ]);
}

class Lister extends LReact.Component<{}, { len: number }> {
    constructor(props) {
        super(props);
        this.state = {
            len: 0,
        };
    }
    componentDidMount() {
        console.log('luke mounted');
    }
    componentDidUnmount() {
        console.log('luke unmounted');
    }

    push = () => {
        this.setState({ len: this.state.len + 1 });
    };

    pop = () => {
        this.setState({ len: Math.max(this.state.len - 1, 0) });
    };

    render() {
        return Element('div', {
            style: {
                color: 'firebrick',
                border: '1px dashed green',
                // backgroundColor: 'lightblue',
                // padding: '20px',
            }
        }, [
            Element('h4', {}, ['MY LIST:']),
            ...Array.from({ length: this.state.len }, (_, i) => {
                return Element(ListElem, { v: i });
            }),
            Element('button', {
                onClick: this.push,
            }, ['add']),
            Element('button', {
                onClick: this.pop,
            }, ['remove']),
           
        ]);
    }
}


class Luke extends LReact.Component {
    componentDidMount() {
        console.log('luke mounted');
    }
    componentDidUnmount() {
        console.log('luke unmounted');
    }
    render() {
        return Element('div', {
            style: {
                color: 'firebrick',
                backgroundColor: 'lightblue',
                padding: '20px',
            }
        }, [
           'luke here' 
        ]);
    }
}
class Peanut extends LReact.Component<{}, { color: string }> {

    constructor(props: {}) {
        super(props);
        this.state = {
            color: 'green',
        };
    }

    componentDidMount = () => {
        console.log('Peanut mounted!')
    };

    componentDidUnmount = () => {
        console.log('Peanut unmounted!')
    };

    changeToBlue = () => {
        this.setState({
            color: 'blue',
        })
    };

    changeToGreen = () => {
        this.setState({
            color: 'green',
        });
    };

    render() {
        const color = this.state.color;
        return Element('div', {
            style: { color }
        }, [
            'START',
            Element(Lister),
            color === 'green' ? Element('button', {
                onClick: () => this.changeToBlue(),
            }, ['to blue']) : null,
            color === 'blue' ? Element('button', {
                onClick: () => this.changeToGreen(),
            }, ['to green']) : null,
            color === 'green' ? Element(Luke) : null,
            'END',
            Element(GameComponent),
        ]);
    }
}

// function Cool() {
//     return LReact.Node('div', {}, [
//         Element(Peanut),
//     ]);
// };
function Cool2({}: {}) {
    return Element('div', {}, [
        'Cool2',
        Element(Peanut)
    ]);
};

const A = Element('div', {}, [
    Element('h1', {}, ['hello world']),
    Element('div', {}, [
        Element('p', {}, ['what would you like?']),
        Element(Cool2, {}),
    ]),
    Element('footer', {}, ['I am footer']),
]);
console.log(A);

LReact.RenderDom(Element(Peanut), document.body);
// LReact.Init(LReact.Node(Cool), document.body);
