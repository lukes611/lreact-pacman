import * as LReact from '../l_react';
import { Level, Game, Pacman, Ghost, Dir } from './game';
import { Pt } from './pt';
import { drawPacMan, drawGhost, drawEllipse } from './render';
const { Node, Text } = LReact;


export class GameComponent extends LReact.Component<{}, {}> {
    level: Level;

    constructor(props: {}) {
        super(props);
        this.level = Level.createLevel1();
    }
    render() {
        const N = 10;
        return Node('div', {}, [
            Text('pacman'),
            Node(LevelGameContainer, {
                N: 10,
                w: this.level.w,
                h: this.level.h,
            }, [
                Node(RenderedLevel, { level: this.level }),
                Node(AnimatedGame, { level: this.level }, []),
            ])
        ]);
    }
}

class AnimatedGame extends LReact.Component<{ level: Level }, {}> {
    ctx?: CanvasRenderingContext2D;
    game: Game;
    canvasPixels: Pt;
    keys = new Map<string, boolean>();
    constructor(props: { level: Level }) {
        super(props);
        this.game = new Game(props.level);
        this.canvasPixels = new Pt(props.level.w + 1, props.level.h);
    }

    render() {
        const { level } = this.props;
        return Node('canvas', {
            ref: this.canvasSet,
            width: this.canvasPixels.x * 10,
            height: this.canvasPixels.y * 10,
            style: {
                width: `${(level.w+1) * 10}px`,
                height: `${level.h * 10}px`,
                border: '1px dashed white',
                position: 'absolute',
                zIndex: 2,
            },
        });
    }

    canvasSet = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        this.ctx = ctx;
        this.gameLoop();
        document.body.addEventListener('keydown', (e: KeyboardEvent) => {
            this.keys.set(e.key, true);
        });
        document.body.addEventListener('keyup', (e: KeyboardEvent) => {
            this.keys.set(e.key, false);
        })
        
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
            const { ctx, game } = this;
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

            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
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
        },
    }, [
        Node('div', {
            style: {
                width: `${(w+2) * N}px`,
                height: `${(h+2) * N}px`,
                position: 'relative',
                backgroundColor: 'green',
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
