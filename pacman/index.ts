import * as LReact from '../l_react';
import { level1, Level, Game, Pacman, Ghost } from './game';
import { Pt } from './pt';
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
    pacman: Pacman;
    ghosts: Ghost[];
    constructor(props) {
        super(props);
        this.pacman = Pacman.create(props.level);
        this.ghosts = [
            Ghost.create(props.level, 'red'),
            Ghost.create(props.level, 'blue'),
            Ghost.create(props.level, 'yellow'),
            Ghost.create(props.level, 'purple'),
        ];
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
        console.log(this.pacman.pos)
        this.drawPacMan(this.pacman.dir.getAngle(), this.pacman.pos.scale(10).addY(4), 0.05);
        this.ghosts.forEach(g => this.drawGhost(g));
    }

    drawPacMan(angle: number, pos: Pt, mouthOpenPerc: number) {
        const { ctx } = this;
        if (!ctx) return;
        const size = 4;
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

    drawGhost(ghost: Ghost) {
        const { ctx } = this;
        if (!ctx) return;
        const size = 16;
        const pos = ghost.pos.add(0.45 + 1, 0.15 + 1).scale(10);
        ctx.translate(pos.x, pos.y);
        ctx.fillStyle = ghost.color;
        this.drawArc(0, 0, size * 0.5, 180, 360);
        
        ctx.beginPath();
        ctx.rect(-size * 0.5, 0, size, size * 0.5);
        ctx.closePath();
        ctx.fill();
        
        for (let i = 0; i < 3; i++) {
            this.drawArc(-size * 0.5 + size / 6 + (size / 3) * i, size * 0.4, size / 6, 0, 180);
        }

        
        // eyes
        const eyeSize = size * 0.15;
        const eyeSizeS = eyeSize * 0.5;
        ctx.fillStyle = 'white';
        this.drawEye(-0.2 * size, -0.15 * size, eyeSize, ghost.dir);
        ctx.fillStyle = 'white';
        this.drawEye(0.2 * size, -0.15 * size, eyeSize, ghost.dir);
        // this.drawEllipse(0.2 * size, -0.15 * size, eyeSize, eyeSize);
        
        ctx.resetTransform();
    }

    drawArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
        const { ctx } = this;
        if (!ctx) return;

        const scalar = Math.PI * 2 * (1 / 360);
        
        ctx.beginPath();
        ctx.arc(x, y, radius, scalar * startAngle , scalar * endAngle);
        ctx.closePath();
        ctx.fill();
    }

    drawEye(x: number, y: number, size: number, dir: Pt) {
        const { ctx } = this;
        if (!ctx) return;

        ctx.fillStyle = 'white';
        this.drawEllipse(x, y, size, size);
        ctx.fillStyle = 'black';
        const pupilSize = size * 0.5;
        this.drawEllipse(x + dir.x * pupilSize, y + dir.y * pupilSize, pupilSize, pupilSize);
    }

    drawEllipse(x: number, y: number, xRad: number, yRad: number) {
        const { ctx } = this;
        if (!ctx) return;

        ctx.beginPath();
        ctx.ellipse(x, y, xRad, yRad, 0, 0, 360);
        ctx.closePath();
        ctx.fill();
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
            if (level.isPath(y, x)) {
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
