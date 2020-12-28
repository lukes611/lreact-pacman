import * as LReact from './l_react';
import { GameComponent } from './pacman/index';
const Element = LReact.Element;


function App({}: {}) {
    return Element('div', {}, [
        Element(GameComponent),
    ]);
};

LReact.RenderDom(Element(App), document.body);
