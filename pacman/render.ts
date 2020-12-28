import { Pt } from './pt';
import {
    Ghost,
    Pacman,
} from './game';

export const drawPacMan = (ctx: CanvasRenderingContext2D, pacman: Pacman, N: number) => {
    const size = N * 8/10;
    const pos = pacman.pos.add(1.5, 1.4).scale(N);
    const { mouthOpenPerc } = pacman;
    const angle = pacman.dirV.getAngle();
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

export const drawGhost = (ctx: CanvasRenderingContext2D, ghost: Ghost, N: number) => {
    const size = N * 16/10;
    const pos = ghost.pos.add(0.8, 0.6).scale(N);
    ctx.translate(pos.x, pos.y);
    ctx.fillStyle = ghost.scared ? 'black' : ghost.color;
    drawArc(ctx, 0, 0, size * 0.5, 180, 360);
    
    ctx.beginPath();
    ctx.rect(-size * 0.5, 0, size, size * 0.5);
    ctx.closePath();
    ctx.fill();
    
    for (let i = 0; i < 3; i++) {
        drawArc(ctx, -size * 0.5 + size / 6 + (size / 3) * i, size * 0.4, size / 6, 0, 180);
    }

    
    // eyes
    const eyeSize = size * 0.15;
    ctx.fillStyle = 'white';
    drawEye(ctx, -0.2 * size, -0.15 * size, eyeSize, ghost.dirV);
    ctx.fillStyle = 'white';
    drawEye(ctx, 0.2 * size, -0.15 * size, eyeSize, ghost.dirV);
    
    ctx.resetTransform();
};

export const drawEye = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, dir: Pt) => {
    ctx.fillStyle = 'white';
    drawEllipse(ctx, x, y, size, size);
    ctx.fillStyle = 'black';
    const pupilSize = size * 0.5;
    drawEllipse(ctx, x + dir.x * pupilSize, y + dir.y * pupilSize, pupilSize, pupilSize);
};

export const drawEllipse = (ctx: CanvasRenderingContext2D, x: number, y: number, xRad: number, yRad: number) => {
    ctx.beginPath();
    ctx.ellipse(x, y, xRad, yRad, 0, 0, 360);
    ctx.closePath();
    ctx.fill();
};

export const drawArc = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const scalar = Math.PI * 2 * (1 / 360);
    
    ctx.beginPath();
    ctx.arc(x, y, radius, scalar * startAngle , scalar * endAngle);
    ctx.closePath();
    ctx.fill();
};
