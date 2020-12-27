import { Pt } from './pt';

const halfLevel1 = `# level 1
+-------+---------   
|       |        |   
|       |        |   
|       |        |   
|       |        |   
+-----------+----+---
|       |   |        
|       |   |        
|       |   |        
|       |   +---+    
|       |       |    
|       |       |    
|       |       |    
+-------+   +---+---+
        |   |       g
        |   |       g
        |   |       g
        |   |       g
        |   |       g
t---p-------+   ggggg
        |   |        
        |   |        
        |   |        
        |   +--------
        |   |        
        |   |        
+-----------+-------+
|       |           |
|       |           |
|       |           |
|       |           |
+---+   +----+------+
    |   |    |       
    |   |    |       
    |   |    |       
+---+---+    +--+    
|               |    
|               |    
|               |    
+---------------+----
`;
export const level1 = halfLevel1
    .split('\n')
    .map(line => {
        if (line.startsWith('#')) return line;
        const secondHalf = line
            .substring(0, line.length - 1)
            .split('')
            .reverse()
            .map((v: string) => {
                if (v === 'p' || v === 't') return '+';
                return v;
            })
            .join('');
        return line + secondHalf;
    })
    .join('\n');

export type Dir = 'up' | 'down' | 'left' | 'right';
type Vel =  { dir: Dir, amount: number };
type Straddle =
    | { isRail: true, from?: never, to?: never }
    | { isRail: false, from: Pt, to: Pt };

function ptToVel(p: Pt): Vel {
    const amount = p.mag();
    if (p.x) {
        if (p.x < 0) return { dir: 'left', amount };
        return { dir: 'right', amount };
    } else {
        if (p.y < 0) return { dir: 'up', amount };
        return { dir: 'down', amount };
    }
}

function dirToPt(v: Dir): Pt {
    switch (v) {
        case 'up': return new Pt(0, -1);
        case 'down': return new Pt(0, 1);
        case 'left': return new Pt(-1, 0);
        case 'right': return new Pt(1, 0);
    }
}

function oppositeDir(v: Dir): Dir {
    switch (v) {
        case 'up': return 'down';
        case 'down': return 'up';
        case 'left': return 'right';
        case 'right': return 'left';
    }
}

function velToPt(v: Vel): Pt {
    return dirToPt(v.dir).scale(v.amount);
}

export class Level {
    level: string[][];
    w: number;
    h: number;

    constructor(levelString: string) {
        this.level = levelString
            .split('\n')
            .slice(1)
            .map((s: string) => s.split(''));
        this.w = this.level[0].length;
        this.h = this.level.length;
    }

    static createLevel1() {
        return new Level(level1);
    }

    isPath(x: number, y: number) {
        const v = this.getV(x, y);
        return v && v !== ' ';
    }

    isPathP(p: Pt) {
        return this.isPath(p.x, p.y);
    }

    getV(x: number, y: number): string | undefined {
        if (x < 0 || x >= this.w || y < 0 || y >= this.h) return undefined;
        const v = this.level[y][x];
        return v;
    }

    getLocationsOfChar(ch: string): Pt[] {
        const out: Pt[] = [];
        this.forEach((v: string | undefined, x: number, y: number) => {
            if (v === ch) {
                out.push(new Pt(x, y));
            }
        });
        return out;
    }

    getRandomLocationOfChar(ch: string): Pt {
        const locations = this.getLocationsOfChar(ch);
        const index = Math.floor(Math.random() * locations.length);
        return locations[index];
    }

    forEach(f: (v: string | undefined, x: number, y: number) => void) {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                f(this.getV(x, y), x, y);
            }
        }
    }

    getClosestRailPoint(p: Pt) {
        return p.round();
    }

    nearARailPoint(p: Pt, maxD: number = 0.08): boolean {
        const xD = Math.abs(p.x - Math.round(p.x));
        const yD = Math.abs(p.y - Math.round(p.y));
        if (xD > maxD || yD > maxD) return false;
        return true;
    }

    isLegalPosition(p: Pt) {
        return p.x % 1 === 0 || p.y % 1 === 0;
    }

    isRailPoint(p: Pt) {
        return p.x % 1 === 0 && p.y % 1 === 0;
    }

    isSafePosition(p: Pt) {
        return this.onRail(p);
        // return this.isLegalPosition(p) && this.isPathP(p.floor()) && this.isPathP(p.ceil());
    }

    onRail(p: Pt) {
        if (this.isRailPoint(p) && this.isPathP(p)) return true; 
        if (p.y % 1 === 0) { // left/right
            const fx = Math.floor(p.x);
            const cx = Math.ceil(p.x);
            if (this.isPath(fx, p.y) && this.isPath(cx, p.y)) return true;
            return false;
        }
        const fy = Math.floor(p.y);
        const cy = Math.ceil(p.y);
        if (this.isPath(p.x, fy) && this.isPath(p.x, cy)) return true;
        return false;
    }

    surroundingPaths(pIn: Pt) {
        const p = this.getClosestRailPoint(pIn);
        let count = 0;
        this.forSurroundingPoints(p, (_, __, v) => {
            count += v && v !== ' ' ? 1 : 0;
        });
        return count;
    }

    onALinearPath(pIn: Pt) {
        const p = this.getClosestRailPoint(pIn);
        const st = new Map<Dir, boolean>();
        this.forSurroundingPoints(p, (d, x, v) => {
            if (v && v !== ' ') st.set(d, true);
        });
        return (st.get('up') && st.get('down') && !st.get('left') && !st.get('right'))
            || (!st.get('up') && !st.get('down') && st.get('left') && st.get('right'));
    }

    deadEnd(p: Pt) {
        return this.surroundingPaths(p) === 1;
    }

    forSurroundingPoints(p: Pt, f: (dir: Dir, p: Pt, v: string | undefined) => void) {
        const dirArr: Dir[] = ['up', 'down', 'left', 'right'];
        dirArr
            .forEach((dir: Dir) => {
                const x = p.addP(dirToPt(dir));
                f(dir, x, this.getV(x.x, x.y));
            });
    }

    getDirectionOptions(p: Pt): Dir[] {
        const rp = this.getClosestRailPoint(p);
        const possibles: Dir[] = ['up', 'down', 'left', 'right'];
        return possibles.filter(d => {
            const v = dirToPt(d);
            const x = rp.addP(v);
            if (this.isPathP(x)) return true;
            return false;
        });
    }

    getStraddlePositions(p: Pt, dir: Dir): Straddle {
        if (this.isRailPoint(p)) return { isRail: true };
        switch (dir) {
            case 'up':
                return {
                    isRail: false,
                    from: p.ceil(),
                    to: p.floor(),
                };
            case 'down':
                return {
                    isRail: false,
                    from: p.floor(),
                    to: p.ceil(),
                };
            case 'left':
                return {
                    isRail: false,
                    from: p.ceil(),
                    to: p.floor(),
                };
            case 'right':
                return {
                    isRail: false,
                    from: p.floor(),
                    to: p.ceil(),
                };
        }
    }

    getRailMoveVec(p: Pt, moveVec: Pt): Pt | undefined {
        // if moving is safe -> return vec
        if (this.isSafePosition(p.addP(moveVec))) return moveVec;

        console.log('more checking2');
        
        const vel = ptToVel(moveVec);
        const straddlePos = this.getStraddlePositions(p, vel.dir);
        if (straddlePos.isRail) {
            const safeMove = dirToPt(vel.dir);
            if (this.isSafePosition(p.addP(safeMove))) return safeMove;
            return undefined;
        } else {
            // else -> fix vec so movemag is equal to dist to next straddle of p
            console.log('fix', ptToVel(moveVec).dir, moveVec);
            const newSafePos = straddlePos.to;
            if (this.isSafePosition(newSafePos)) {
                return newSafePos.subP(p);
            }
            return undefined;
        }
    }

    getSafeMove(p: Pt, moveVec: Pt): { safe: false } | { safe: true, newPos: Pt } {
        const to = p.addP(moveVec);
        if (this.onRail(to)) return { safe: true, newPos: to };

        const cp = p.copy();

        let modTo: Pt;
        switch (ptToVel(moveVec).dir) {
            case 'left':
                cp.y = Math.round(cp.y);
                cp.x += moveVec.x;
                break;
            case 'right':
                cp.y = Math.round(cp.y);
                cp.x += moveVec.x;
                break;
            case 'up':
                cp.x = Math.round(cp.x);
                cp.y += moveVec.y;
                break;
            case 'down':
                cp.x = Math.round(cp.x);
                cp.y += moveVec.y;
                break;
        }

        if (this.onRail(cp)) return { safe: true, newPos: cp };

        return { safe: false };
    }

}

export class Agent {
    minMoveDist = 0.1;
    maxMoveDist = 0.1;
    constructor(public pos: Pt, public dir: Dir, public level: Level) {
    }

    getClosestRailPoint() {
        return this.level.getClosestRailPoint(this.pos);
    }

    nearARailPoint(): boolean {
        return this.level.nearARailPoint(this.pos);
    }

    get dirV() {
        return dirToPt(this.dir);
    }

    getMoveVec(dt: number) {
        const dirV = this.dirV.scale(dt * 0.005);
        if (this.dir === 'right' || this.dir === 'left') {
            return new Pt(
                signedClamp(dirV.x, this.minMoveDist, this.maxMoveDist),
                dirV.y,
            );
        }
        return new Pt(
            dirV.x,
            signedClamp(dirV.y, this.minMoveDist, this.maxMoveDist),
        );
    }

    railGuide() {
        switch (this.dir) {
            case 'left':
            case 'right':
                this.pos.y = Math.round(this.pos.y);
                break;
            case 'down':
            case 'up':
                this.pos.x = Math.round(this.pos.x);
        }
    }
}

export class Pacman extends Agent {
    mouthOpenPerc: number = 0;
    internalTick: number = 0;

    constructor(pos: Pt, dir: Dir, level: Level) {
        super(pos, dir, level);
    }

    static create(lvl: Level) {
        return new Pacman(
            lvl.getLocationsOfChar('p').pop(),
            'right',
            lvl,
        );
    }

    tick(dt: number, playerInput?: Dir) {
        this.internalTick += dt;
        this.mouthOpenPerc = Math.abs(Math.sin(this.internalTick * 0.005)) * 0.1;
        this.railGuide();
        
        if (playerInput) {
            // this.pos = this.level.getClosestRailPoint(this.pos);
            // const options = this.level.getDirectionOptions(this.pos);
            // console.log(options)
            // if (!options.includes(playerInput)) return;
            // this.pos = this.pos.round();
            this.dir = playerInput;
            // const vel = this.dir.scale(dt * 0.005);
            const vel = this.getMoveVec(dt);
            console.log({ vel, dir: this.dir })
            const outcome = this.level.getSafeMove(this.pos, vel)
            if (outcome.safe) {
                // this.pos = this.pos.addP(vel);
                this.pos = outcome.newPos;
            } else {
                // this.pos = this.pos.round();
            }
        }

    }
}

export class Ghost extends Agent {
    lastGate?: Pt; // the last rail point the ghost made a decision to move from
    constructor(pos: Pt, dir: Dir, level: Level, public color: string, public scared: boolean) {
        super(pos, dir, level);
    }

    static create(lvl: Level, color: string) {
        return new Ghost(
            new Pt(22, 19),
            'right',
            lvl,
            color,
            false,
        );
    }

    lastMovedFromHere() {
        if (!this.lastGate) return false;
        const closestRailPoint = this.level.getClosestRailPoint(this.pos);
        return closestRailPoint.eq(this.lastGate);
    }

    tick(dt: number) {
        this.railGuide();
        if (this.level.nearARailPoint(this.pos)) this.pos = this.level.getClosestRailPoint(this.pos);
        if (((this.level.nearARailPoint(this.pos) && !this.lastMovedFromHere()) && (!this.level.onALinearPath(this.pos)))) {
            // const shouldChange = Math.random() < 0.6;
            if (true) {
                this.pos = this.level.getClosestRailPoint(this.pos);
                const options = this.level.getDirectionOptions(this.pos);
                if (options.length) {
                    const randomDir = options[Math.floor(Math.random() * options.length)];
                    this.dir = randomDir;
                    this.lastGate = this.level.getClosestRailPoint(this.pos).round();
                }
            }

        }

        const vel = this.dirV.scale(dt * 0.005);
        const outcome = this.level.getSafeMove(this.pos, vel)
        if (outcome.safe) {
            this.pos = outcome.newPos;
        } else {
            this.pos = this.pos.round();
        }
    }


}

export class Game {
    pacman: Pacman;
    ghosts: Ghost[];
    constructor(public level: Level) {
        this.pacman = Pacman.create(level);
        this.ghosts = [
            Ghost.create(level, 'red'),
            Ghost.create(level, 'blue'),
            Ghost.create(level, 'yellow'),
            Ghost.create(level, 'purple'),
        ];
    }

    tick(dt, playerInput?: Dir) {
        this.pacman.tick(dt, playerInput);
        this.ghosts.forEach(g => g.tick(dt));
    }
}

function signedClamp(x: number, min: number, max: number): number {
    const neg = x < 0;
    let v = x;
    if (neg) v = -x;
    const out = Math.max(Math.min(v, max), min);
    return neg ? -out : out;
}
