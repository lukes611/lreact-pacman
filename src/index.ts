import * as LReact from './l_react';
import { GameComponent } from './pacman/index';
const Element = LReact.Element;

class Thao extends LReact.Component {
    render() {
        return Element('div', {}, [
            'Thao',
        ]);
    }
}

function Luke({}: {}) {

    const [lukeColor, setLukeColor] = LReact.useState('red');
    const [lincolnColor, setLincolnColor] = LReact.useState('orange');

    return Element('div', {}, [
        Element('div', { style: { color: lukeColor } }, ['Luke']),
        Element('div', { style: { color: lincolnColor } }, ['Lincoln']),
        Element('button', {
            onClick: () => {
                const newColor = lukeColor === 'red' ? 'blue' : 'red';
                setLukeColor(newColor);
            },
        }, ['change luke']),
        Element('button', {
            onClick: () => {
                const newColor = lincolnColor === 'orange' ? 'purple' : 'orange';
                setLincolnColor(newColor);
            },
        }, ['change lincoln']),
    ]);
}


function App({}: {}) {
    return Element('div', {}, [
        Element(GameComponent),
        Element(Luke),
        Element(Thao),
    ]);
};

LReact.RenderDom(Element(App), document.body);
