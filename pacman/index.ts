import * as LReact from '../l_react';
import { level1, Level, Pt } from './game';
const { Node, Text } = LReact;

export class Game extends LReact.Component<{}, {}> {
    level: Level;

    constructor(props: {}) {
        super(props);
        this.level = Level.createLevel1();
    }
    render() {
        const N = 10;
        return Node('div', {}, [
            Text('pacman'),
            Node('pre', {}, [
                Text(level1),
                Text('cool'),
            ]),
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
    constructor(props) {
        super(props);
    }

    render() {
        const { level } = this.props;
        return Node('canvas', {
            ref: this.canvasSet,
            width: (level.w+1) * 10,
            height: level.h * 10,
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

        // ctx.fillStyle = 'yellow';
        // ctx.arc(30, 30, 20, 0, Math.PI * 2 * 0.25);
        // ctx.fill();
        // ctx.closePath();

        this.drawPacMan(90, { x: 100, y: 100 }, 0.05);
    }

    drawPacMan(angle: number, pos: Pt, mouthOpenPerc: number) {
        const { ctx } = this;
        if (!ctx) return;
        const size = 6;
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle / (180 / Math.PI));
        const bx = mouthOpenPerc * Math.PI * 2;
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(0, 0, size, bx, bx + Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, size, Math.PI * 2 - bx - Math.PI, Math.PI * 2 - bx);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, size, 0.25 * Math.PI * 2, 0.75 * Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.resetTransform();
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
            // maxWidth: `${w * N * 0.55 + 32}px`,
        },
    }, [
        Node('div', {
            style: {
                width: `${(w+1) * N}px`,
                height: `${h * N}px`,
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
    let blocks = [];
    for (let y = 0; y < level.h; y++) {
        for (let x = 0; x < level.w; x++) {
            if (level.isPath(y, x))
            blocks.push(Node(Block, {
                top: y * N,
                left: x * N,
                width: N,
                height: N,
                color: 'black',
            }));
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
