import * as LReact from '../l_react';
import { Dir } from './game';

type ControllerKey = Dir | 'escape';

export class Controller {
    buttons: Map<ControllerKey, boolean> = new Map();
    
    isPressed(d: ControllerKey): boolean {
        return !!this.buttons.get(d);
    }

    reset() {
        this.buttons.clear();
    }

    setFromKeyboard(key: string, on: boolean) {
        console.log(key)
        const d = Controller.keyToFn(key);
        if (d) {
            this.setV(d, on);
        }
    }

    setV(d: ControllerKey, on: boolean) {
        this.buttons.set(d, on);
    }

    static keyToFn(key: string): ControllerKey | undefined {
        switch (key) {
            case 'ArrowUp': return 'up';
            case 'ArrowRight': return 'right';
            case 'ArrowLeft': return 'left';
            case 'ArrowDown': return 'down';
            case 'Escape': return 'escape';
        }
        return undefined;
    }
}

export const setupKeyboardControls = (controller: Controller) => {
    const keyDownListener = (e: KeyboardEvent) => {
        controller.setFromKeyboard(e.key, true);
    };
    document.body.addEventListener('keydown', keyDownListener);
    const keyUpListener = (e: KeyboardEvent) => {
        controller.setFromKeyboard(e.key, false);
    };
    document.body.addEventListener('keyup', keyUpListener);
    return () => {
        document.body.removeEventListener('keydown', keyDownListener);
        document.body.removeEventListener('keyup', keyUpListener);
    };
};

export const KeyboardInstructions = () => {
    return LReact.Element('div', {
        style: {
            fontSize: '24px',
            display: 'grid',
            justifyContent: 'center',
            gridTemplateColumns: 'minmax(auto, 400px)',
            textAlign: 'center',
        },
    }, [
        `
            You can use the up, down, left and right arrow keys to move pacman.
        `,
    ]);
};

type ButtonControlsProps = {
    controller: Controller,
    enabled: boolean,
};

const BUTTON_SIZE = 70;

const BlankDiv = () => LReact.Element('div');

export class ButtonControls extends LReact.Component<ButtonControlsProps, {}> {
    dirToEmoji = new Map<Dir, string>([
        ['up', '⬆️'],
        ['left', '⬅️'],
        ['right', '➡️'],
        ['down', '⬇️'],
    ]);

    render() {
        const controller = this.props.controller;
        const directionsList = Array.from(this.dirToEmoji.keys());
        const buttons = directionsList.map((d: Dir): LReact.LReactElement => {
            return LReact.Element('button', {
                onTouchStart: (e) => {
                    controller.setV(d, true);
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(controller.isPressed(d))
                },
                onTouchEnd: (e) => {
                    controller.setV(d, false);
                    e.preventDefault();
                    e.stopPropagation();
                },
                style: {
                    width: `${BUTTON_SIZE}px`,
                    height: `${BUTTON_SIZE}px`,
                    fontSize: '50px',
                    userSelect: 'none',
                    borderRadius: '0px',
                    border: '0px solid black',
                    padding: '0',
                    margin: '0',
                    overflow: 'hidden',
                    opacity: this.props.enabled ? 1 : 0.2,
                },
            }, [this.dirToEmoji.get(d) ?? d]);
        });

        return LReact.Element('div', {
            style: {
                width: `100%`,
                height: `${BUTTON_SIZE * 3}px`,
                display: 'grid',
                justifyContent: 'center',
                gridAutoFlow: 'row',
                gridTemplateRows: `repeat(3, ${BUTTON_SIZE}px)`,
                gridTemplateColumns: `repeat(3, ${BUTTON_SIZE}px)`,
            },
        }, [
            LReact.Element(BlankDiv),
            buttons[0],
            LReact.Element(BlankDiv),

            buttons[1],
            LReact.Element(BlankDiv),
            buttons[2],

            LReact.Element(BlankDiv),
            buttons[3],
            LReact.Element(BlankDiv),
        ]);
    }
}
