import * as LReact from './l_react';


console.log('hi i am in game land 🍒', LReact);

class Peanut extends LReact.Component<{}, {}> {
    render() {
        return LReact.Node('div', {}, [
            LReact.Text('wow - peanuts'),
        ]);
    }
}

function Cool() {
    return LReact.Node('div', {}, [
        LReact.Text('hello there, my name is luke'),
        LReact.Node(Peanut),
    ]);
};



LReact.Init(LReact.Node(Cool), document.body);
