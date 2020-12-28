import * as LReact from './l_react';
import { GameComponent } from './pacman/index';

class Peanut extends LReact.Component<{}, {}> {
    render() {
        return LReact.Node('div', {}, [
            LReact.Node(GameComponent, {}, []),
        ]);
    }
}

function Cool() {
    return LReact.Node('div', {}, [
        LReact.Node(Peanut),
    ]);
};



LReact.Init(LReact.Node(Cool), document.body);
