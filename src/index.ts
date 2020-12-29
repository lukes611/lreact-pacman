import * as LReact from './l_react';
import { GameComponent } from './pacman/index';

function App() {
    return LReact.Element(GameComponent);
};

LReact.RenderDom(LReact.Element(App), document.body);
