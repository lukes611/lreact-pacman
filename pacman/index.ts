import * as LReact from '../l_react';
import { Level, Game, Dir, DIRECTIONS, GameState, Difficulty } from './game';
import { Pt } from './pt';
import { drawPacMan, drawGhost, drawEllipse } from './render';
const { Element } = LReact;
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
    windowResizeListener?: (e: UIEvent) => void;
    

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

    componentDidMount = () => {
        this.windowResizeListener = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (w !== this.state.windowSize.w || h !== this.state.windowSize.h) {
                this.setState({
                    windowSize: { w, h },
                });
            }
        };
        window.addEventListener('resize', this.windowResizeListener);
    };
    componentDidUnmount = () => {
        if (this.windowResizeListener) {
            window.removeEventListener('resize', this.windowResizeListener);
            this.windowResizeListener = undefined;
        }
    };

    startGame = (difficulty: Difficulty) => {
        this.game.startNewGame(difficulty);
        this.setState({ state: this.game.gameState });
    };

    render() {
        const useMobileControls = this.useMobileControls;
        const { gameRenderScale, size } = this.gameRenderScaleAndSize;

        return Element('div', {}, [
            Element('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: `${size.w}px`,
                    margin: 'auto auto',
                },
            }, [
                Element(LiveGameScore, { g: this.game }),
                Element('button', {
                    onClick: () => {
                        this.game.gameState = 'paused';
                        this.setState({ state: 'paused' });
                    },
                }, ['pause']),
            ]),
            Element(LevelGameContainer, size, [
                Element(RenderedLevel, { level: this.level, N: gameRenderScale }),
                this.renderGameState(),
            ]),
            useMobileControls ? Element(ButtonControls, { controller: this.controller }) : Element(KeyboardInstructions),
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
                return Element(AnimatedGame, { game: this.game, gameRenderScale, controller: this.controller, onGameStateChange: s => this.setState({ state: s }) }, []);
            case 'not-started':
                return Element(MenuOverlay, {}, [
                    Element(StartGameMenu, {
                        startGame: this.startGame,
                    }),
                ]);
            case 'game-over':
                return Element(MenuOverlay, {}, [Element(GameOverMenu, {
                    restart: this.restartGame,
                    message: 'Oh, sorry you lost 😭',
                    buttonText: 'Play Again',
                })]);
            case 'you-won':
                return Element(MenuOverlay, {}, [Element(GameOverMenu, {
                    restart: this.restartGame,
                    message: 'You Won!! 🎉',
                    buttonText: 'Play Again',
                })]);
            case 'paused':
                return Element(MenuOverlay, {}, [Element(GameOverMenu, {
                    restart: this.unpause,
                    message: 'paused',
                    buttonText: 'back',
                })]);
        }
    }

    pause = () => {
        this.setGameState('paused');
    };

    unpause = () => {
        this.setGameState('playing');
    };

    restartGame = () => {
        this.setGameState('not-started');
    };

    setGameState = (s: GameState) => {
        this.game.gameState = s;
        this.setState({ state: s });
    };
}

class LiveGameScore extends LReact.Component<{ g: Game }, { score: number }> {
    intervalId?: number;
    constructor(props: { g: Game }) {
        super(props);
        this.state = {
            score: props.g.getCandyRemaining(),
        };
        
    }
    componentDidMount = () => {
        this.intervalId = setInterval(this.maybeUpdateScore, 30);
    };
    componentDidUnmount = () => {
        if (this.intervalId != null) clearInterval(this.intervalId);
        this.intervalId = undefined;
    };
    maybeUpdateScore = () => {
        const newScore = this.props.g.getCandyRemaining();
        if (newScore !== this.state.score) {
            this.setState({ score: newScore });
        }
    };
    render() {
        return Element('div', {}, ['score: ' + this.state.score]);
    }
}

type AnimatedGameProps = {
    game: Game,
    gameRenderScale: number,
    controller: Controller,
    onGameStateChange: (s: GameState) => void,
};
class AnimatedGame extends LReact.Component<AnimatedGameProps, {}> {
    ctx?: CanvasRenderingContext2D;
    canvasPixels: Pt;
    animationRequest?: number;
    killEventListeners?: () => void;
    constructor(props: AnimatedGameProps) {
        super(props);
    }

    componentDidMount() {
        this.gameLoop();
        this.setupEventListeners();
    };

    get canvasPixel() {
        return new Pt(this.props.game.level.w, this.props.game.level.h);
    }

    componentDidUnmount() {
        this.killEventListeners?.();
        this.props.controller.reset();
        if (this.animationRequest !== undefined) {
            cancelAnimationFrame(this.animationRequest);
            this.animationRequest = undefined;
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
        return Element('canvas', {
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
        const loop = (delta: number) => {
            const N = this.props.gameRenderScale;
            //console.log(N, this);
            const { ctx } = this;
            const { game } = this.props;
            if (!ctx) return;
            const dt = delta - prevDelta;
            prevDelta = delta;
            game.tick(dt, this.getPlayerInputDir(), this.props.onGameStateChange);
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

            if (this.animationRequest !== undefined)
                this.animationRequest = requestAnimationFrame(loop);
        }
        this.animationRequest = requestAnimationFrame(loop);
    }
}

const MenuOverlay = ({
    children,
}: {
    children?: LReact._Element[],
}) => {
    return Element('div', {
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
        return Element('div', {
            style: {
                display: 'grid',
                gridAutoFlow: 'column',
                gridGap: '16px',
                alignItems: 'center',
                gridTemplateColumns: '200px 1fr',
            },
        }, [
            Element('label', {
                style: {
                    fontSize: '20px',
                },
            }, [d]),
            Element('input', {
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

    return Element('div', {
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
        `start game`,
        Element('div', { style: { display: 'grid', gridAutoFlow: 'row', gridGap: '8px' } }, [
            Element(CheckBox, { d: 'easy'  }),
            Element(CheckBox, { d: 'medium'  }),
            Element(CheckBox, { d: 'hard'  }),
        ]),
        Element(BigButton, {
            onClick: () => startGame(difficulty),
            label: 'Play',
        }),
    ]);
};

const GameOverMenu = ({
    restart,
    message,
    buttonText,
}: {
    restart(): void,
    message: string,
    buttonText: string,
}) => {
    return Element('div', {
        style: {
            background: 'rgba(0,0,0,0.5)',
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateRows: 'min-content min-content',
            alignContent: 'center',
            justifyContent: 'center',
            gridGap: '16px',
        },
    }, [
        Element('div', {
            style: {
                textAlign: 'center',
                color: 'orange',
                fontSize: '30px',
            },
        }, [message]),
        Element(BigButton, {
            onClick: restart,
            label: buttonText,
        }),
    ]);
};

const BigButton = ({
    label,
    onClick,
}: {
    label: string
    onClick: () => void,
}) => {
    return Element('button', {
        style: {
            fontSize: '40px',
            width: '100%',
            maxWidth: '250px',
            cursor: 'pointer',
        },
        onClick,
    }, [label]);
};

const LevelGameContainer = ({ w, h, children }: {
    w: number,
    h: number,
    children?: LReact._Element[],
}) => {
    console.log('children', children);
    return Element('div', {
        style: {
            backgroundColor: 'lightblue',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            boxSizing: 'border-box',
        },
    }, [
        Element('div', {
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
                blocks.push(Element(Block, {
                    top:  topLeft.y * N + offset.y,
                    left: topLeft.x * N + offset.x,
                    width:  N * thick,
                    height: N * thick,
                    color: 'black',
                }));
            }
        }
    }
    return Element('div', {}, [
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
    return Element('div', {
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
