import * as LReact from '../l_react';
import { Level, Game, Dir, DIRECTIONS, GameState, Difficulty } from './game';
import { Pt } from './pt';
import { drawPacMan, drawGhost, drawEllipse } from './render';
const { Node, Text } = LReact;
import {
    Controller,
    setupKeyboardControls,
    ButtonControls,
    KeyboardInstructions,
} from './game_controls';

type GameComponentState = {
    state: GameState,
    windowSize: { w: number, h: number },
};
export class GameComponent extends LReact.Component<{}, GameComponentState> {
    level: Level;
    game: Game;
    controller = new Controller();

    constructor(props: {}) {
        super(props);
        this.level = Level.createLevel1();
        this.game = new Game(this.level);
        this.state = {
            state: this.game.gameState,
            windowSize: {
                w: window.innerWidth,
                h: window.innerHeight,
            },
        };
    }

    startGame = (difficulty: Difficulty) => {
        this.game.startNewGame(difficulty);
        this.setState({ state: this.game.gameState });
    };

    render() {
        const useMobileControls = this.useMobileControls;
        const { gameRenderScale, size } = this.gameRenderScaleAndSize;

        return Node('div', {}, [
            Text(this.state.state),
            Node(LevelGameContainer, size, [
                Node(RenderedLevel, { level: this.level, N: gameRenderScale }),
                this.renderGameState(),
            ]),
            Node('button', {
                onClick: () => {
                    if (this.state.state === 'not-started') {
                        this.setState({ state: 'paused' });
                    } else {
                        this.setState({ state: 'not-started' });
                    }
                },
            }, [Text('stop')]),
            useMobileControls ? Node(ButtonControls, { controller: this.controller }) : Node(KeyboardInstructions),
        ]);
    }

    get useMobileControls() {
        return this.state.windowSize.w < 400;
    }

    get gameRenderScaleAndSize() {
        const { windowSize } = this.state;

        const s = Math.min(windowSize.w - 16, 600);

        const size = {
            w: s,
            h: s + 10,
        };

        return {
            gameRenderScale: size.w / (this.level.w+2),
            size,
        }; 
    }

    renderGameState() {
        const { gameRenderScale } = this.gameRenderScaleAndSize;
        switch (this.game.gameState) {
            case 'playing':
                return Node(AnimatedGame, { game: this.game, gameRenderScale, controller: this.controller }, []);
            case 'not-started':
                return Node(MenuOverlay, {}, [
                    Node(StartGameMenu, {
                        startGame: this.startGame,
                    }),
                ]);
            case 'game-over':
                return Node('div', {}, [Text('you lost')]);
            case 'you-won':
                return Node('div', {}, [Text('you won')]);
            case 'paused':
                return Node('button', {}, [Text('unpause game')]);
        }
    }
}

type AnimatedGameProps = {
    game: Game,
    gameRenderScale: number,
    controller: Controller,
};
class AnimatedGame extends LReact.Component<AnimatedGameProps, {}> {
    ctx?: CanvasRenderingContext2D;
    canvasPixels: Pt;
    animId?: { id: number };
    killEventListeners?: () => void;
    constructor(props: AnimatedGameProps) {
        super(props);
        this.canvasPixels = new Pt(props.game.level.w, props.game.level.h);
    }

    componentDidMount = () => {
        this.gameLoop();
        this.setupEventListeners();
    };

    componentDidUnmount = () => {
        this.killEventListeners?.();
        this.props.controller.reset();
        if (this.animId) {
            cancelAnimationFrame(this.animId.id);
        }
    };

    get canvasSize() {
        const gameRenderScale = this.props.gameRenderScale;
        const level = this.props.game.level;
        const w = (level.w+1) * gameRenderScale;
        const h = (level.h+1) * gameRenderScale;
        return { w, h };
    }

    render() {
        const { gameRenderScale } = this.props;
        const canvasSize = this.canvasSize;
        return Node('canvas', {
            ref: this.canvasSet,
            width: canvasSize.w,
            height: canvasSize.h,
            style: {
                width: `${canvasSize.w}px`,
                height: `${canvasSize.h}px`,
                position: 'absolute',
                zIndex: 2,
                top: (gameRenderScale*0.5) + 'px',
                left: (gameRenderScale*0.5) + 'px',
            },
        });
    }

    canvasSet = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        this.ctx = ctx;
    }

    setupEventListeners() {
        this.killEventListeners?.();
        const controller = this.props.controller;
        controller.reset();
        this.killEventListeners = setupKeyboardControls(this.props.controller);
    }

    getPlayerInputDir(): Dir | undefined {
        for (const d of DIRECTIONS) {
            if (this.props.controller.isPressed(d)) return d;
        }
    }

    gameLoop() {
        let prevDelta = 0;
        const N = this.props.gameRenderScale;
        const loop = (delta: number) => {
            const { ctx } = this;
            const { game } = this.props;
            if (!ctx) return;
            const dt = delta - prevDelta;
            prevDelta = delta;
            game.tick(dt, this.getPlayerInputDir());
            const canvasSize = this.canvasSize;
            ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
            ctx.translate(-N * 0.6, -N * 0.6);

            game.candy.forEach((c) => {
                const p = c.add(1.5, 1.5).scale(N);
                ctx.fillStyle = 'pink';
                drawEllipse(ctx, p.x, p.y, 2, 2);
            });
            
            drawPacMan(ctx, game.pacman, N);
            game.ghosts.forEach(g => drawGhost(ctx, g, N));

            ctx.resetTransform();

            this.animId = { id: requestAnimationFrame(loop) };
        }
        this.animId = { id: requestAnimationFrame(loop) };
    }
}

const MenuOverlay = ({
    children,
}: {
    children?: LReact.VElem[],
}) => {
    return Node('div', {
        style: {
            width: '100%',
            height: '100%',
            backdropFilter: 'blur(5px)',
        },
    }, children);
};


const StartGameMenu = ({
    startGame,
}: {
    startGame: (difficulty: Difficulty) => void,
}) => {

    const [difficulty, setDifficulty] = LReact.useState<Difficulty>('easy');

    const CheckBox = ({
        d,
    }: {
        d: Difficulty,
    }) => {
        return Node('div', {
            style: {
                display: 'grid',
                gridAutoFlow: 'column',
                gridGap: '16px',
                alignItems: 'center',
                gridTemplateColumns: '200px 1fr',
            },
        }, [
            Node('label', {
                style: {
                    fontSize: '20px',
                },
            }, [Text(d)]),
            Node('input', {
                type: 'checkbox',
                checked: difficulty === d,
                onChange: e => {
                    if (d === difficulty) {
                        e.target.checked = true;
                    } else {
                        console.log('set diff');
                        setDifficulty(d);
                    }
                },
            }),
        ]);
    };

    return Node('div', {
        style: {
            color: 'orange',
            fontSize: '40px',
            width: '100%',
            height: '100%',
            display: 'grid',
            gridAutoFlow: 'row',
            justifyItems: 'center',
            alignItems: 'center',
            gridGap: '24px',
            alignContent: 'center',
            gridTemplateRows: 'repeat(4, min-content)',
            background: 'rgba(0,0,0,0.5)',
        },
    }, [
        Text(`start game`),
        Node('div', { style: { display: 'grid', gridAutoFlow: 'row', gridGap: '8px' } }, [
            Node(CheckBox, { d: 'easy'  }),
            Node(CheckBox, { d: 'medium'  }),
            Node(CheckBox, { d: 'hard'  }),
        ]),
        Node('button', {
            style: {
                fontSize: '40px',
                width: '100%',
                maxWidth: '250px',
                cursor: 'pointer',
            },
            onClick: () => startGame(difficulty),
        }, [Text('Play')]),
    ]);
};

const LevelGameContainer = ({ w, h, children }: {
    w: number,
    h: number,
    children?: LReact.VElem[],
}) => {
    return Node('div', {
        style: {
            backgroundColor: 'lightblue',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            boxSizing: 'border-box',
        },
    }, [
        Node('div', {
            style: {
                width: `${w}px`,
                height: `${h}px`,
                position: 'relative',
            },
        }, children),
    ]);
};

function RenderedLevel({
    level,
    N,
}: {
    level: Level,
    N: number,
}) {
    const thick = 2;
    const halfThick = thick * 0.5;
    const offset = new Pt(N, N);
    let blocks = [];
    for (let y = 0; y < level.h; y++) {
        for (let x = 0; x < level.w; x++) {
            if (level.isPath(x, y)) {
                const center = new Pt(x + 0.5, y + 0.5);
                const topLeft = center.add(-halfThick, -halfThick);
                blocks.push(Node(Block, {
                    top:  topLeft.y * N + offset.y,
                    left: topLeft.x * N + offset.x,
                    width:  N * thick,
                    height: N * thick,
                    color: 'black',
                }));
            }
        }
    }
    return Node('div', {}, [
        ...blocks,
    ]);
}

const Block = ({
    top,
    left,
    width,
    height,
    color = 'blue',
}: {
    color?: string,
    top: number,
    left: number,
    width: number,
    height?: number,
}) => {
    return Node('div', {
        style: {
            width: `${width}px`,
            height: `${height ?? width}px`,
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            backgroundColor: color,
        },
    });
};
