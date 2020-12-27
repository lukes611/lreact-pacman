import * as LReact from '../l_react';
import { Level, Game, Dir } from './game';
import { Pt } from './pt';
import { drawPacMan, drawGhost, drawEllipse } from './render';
const { Node, Text } = LReact;

type GameState =
    | 'not-started'
    | 'game-over'
    | 'you-won'
    | 'paused';

type GameComponentState = {
    state: GameState,
    windowSize: { w: number, h: number };
};
export class GameComponent extends LReact.Component<{}, GameComponentState> {
    level: Level;
    game: Game;
    constructor(props: {}) {
        super(props);
        this.level = Level.createLevel1();
        this.game = new Game(this.level);
        this.state = {
            state: 'not-started',
            windowSize: {
                w: window.innerWidth,
                h: window.innerHeight,
            },
        };
    }
    render() {
        const N = 10;
        return Node('div', {}, [
            Text(this.state.state),
            Node(LevelGameContainer, {
                N: 10,
                w: this.level.w,
                h: this.level.h,
            }, [
                Node(RenderedLevel, { level: this.level }),
                this.state.state === 'not-started'
                    ? Node(AnimatedGame, { game: this.game, paused: this.state.state === 'paused' }, [])
                    : Text('no game'),
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
        ]);
    }
}

class AnimatedGame extends LReact.Component<{ game: Game, paused: boolean }, {}> {
    ctx?: CanvasRenderingContext2D;
    canvasPixels: Pt;
    keys = new Map<string, boolean>();
    animId?: { id: number };
    killEventListeners?: () => void;
    constructor(props: { game: Game, paused: boolean }) {
        super(props);
        this.canvasPixels = new Pt(props.game.level.w + 1, props.game.level.h);
    }

    componentDidMount = () => {
        console.log('ANIMATED GAME MOUNT');
    };

    componentDidUnmount = () => {
        this.killEventListeners?.();
        if (this.animId) {
            cancelAnimationFrame(this.animId.id);
        }
        console.log('cleaned it up')
    };

    render() {
        const { game: { level } } = this.props;
        return Node('canvas', {
            ref: this.canvasSet,
            width: this.canvasPixels.x * 10,
            height: this.canvasPixels.y * 10,
            style: {
                width: `${(level.w+1) * 10}px`,
                height: `${level.h * 10}px`,
                position: 'absolute',
                zIndex: 2,
            },
        });
    }

    canvasSet = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        this.ctx = ctx;
        this.gameLoop();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.killEventListeners?.();
        const keyDownListener = (e: KeyboardEvent) => {
            if (!this.props.paused) this.keys.set(e.key, true);
        };
        document.body.addEventListener('keydown', keyDownListener);
        const keyUpListener = (e: KeyboardEvent) => {
            if (!this.props.paused) this.keys.set(e.key, false);
        };
        document.body.addEventListener('keyup', keyUpListener);
        this.killEventListeners = () => {
            document.body.removeEventListener('keydown', keyDownListener);
            document.body.removeEventListener('keyup', keyUpListener);
        };
    }



    getPlayerInputDir(): Dir | undefined {
        if (this.keys.get('ArrowUp')) return 'up';
        if (this.keys.get('ArrowRight')) return 'right';
        if (this.keys.get('ArrowLeft')) return 'left';
        if (this.keys.get('ArrowDown')) return 'down';
    }

    gameLoop() {
        let prevDelta = 0;
        const loop = (delta: number) => {
            const { ctx } = this;
            const { game } = this.props;
            if (!ctx) return;
            const dt = delta - prevDelta;
            prevDelta = delta;
            game.tick(dt, this.getPlayerInputDir());
            ctx.clearRect(0, 0, this.canvasPixels.x * 10, this.canvasPixels.y * 10);

            game.candy.forEach((c) => {
                const p = c.add(1.5, 1.5).scale(10);
                ctx.fillStyle = 'pink';
                drawEllipse(ctx, p.x, p.y, 2, 2);
            });
            
            drawPacMan(ctx, game.pacman);
            game.ghosts.forEach(g => drawGhost(ctx, g));

            this.animId = { id: requestAnimationFrame(loop) };
        }
        this.animId = { id: requestAnimationFrame(loop) };
    }
}

const LevelGameContainer = ({ w, h, N, children }: {
    w: number,
    h: number,
    N: number,
    children?: LReact.VElem[],
}) => {
    return Node('div', {
        style: {
            backgroundColor: 'lightblue',
            padding: '16px',
            display: 'grid',
            placeItems: 'center',
        },
    }, [
        Node('div', {
            style: {
                width: `${(w+2) * N}px`,
                height: `${(h+2) * N}px`,
                position: 'relative',
            },
        }, children),
    ]);
};

function RenderedLevel({
    level,
}: {
    level: Level,
}) {
    const N = 10;
    const thick = 2;
    const halfThick = thick * 0.5;
    const offset = new Pt(N, N);
    let blocks = [];
    for (let y = 0; y < level.h; y++) {
        for (let x = 0; x < level.w; x++) {
            if (level.isPath(x, y)) {
                const center = new Pt(x + 0.5, y + 0.5);
                const topLeft = center.add(-thick * 0.5, -thick * 0.5);
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
