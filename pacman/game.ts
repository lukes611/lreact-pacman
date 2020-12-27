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

type Dir = 'up' | 'down' | 'left' | 'right';
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

    nearARailPoint(p: Pt): boolean {
        const xD = Math.abs(p.x - Math.round(p.x));
        const yD = Math.abs(p.y - Math.round(p.y));
        const maxD = 0.08;
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
        return this.isLegalPosition(p) && this.isPathP(p.floor()) && this.isPathP(p.ceil());
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
        
        const vel = ptToVel(moveVec);
        const straddlePos = this.getStraddlePositions(p, vel.dir);
        if (straddlePos.isRail) {
            const safeMove = dirToPt(vel.dir);
            if (this.isSafePosition(p.addP(safeMove))) return safeMove;
            return undefined;
        } else {
            // else -> fix vec so movemag is equal to dist to next straddle of p
            const newSafePos = straddlePos.to;
            if (this.isSafePosition(newSafePos)) {
                return newSafePos.subP(p);
            }
            return undefined;
        }
    }

    getSafeMove(p: Pt, moveVec: Pt): { safe: false } | { safe: true, newPos: Pt } {
        const to = p.addP(moveVec);
        if (this.isSafePosition(to)) return { safe: true, newPos: to };
        const modifiedMove = this.getRailMoveVec(p, moveVec);
        if (modifiedMove) {
            return { safe: true, newPos: p.addP(modifiedMove) };
        }
        return { safe: false };
    }

}

export class Agent {
    constructor(public pos: Pt, public dir: Pt, public level: Level) {
    }

    getClosestRailPoint() {
        return this.level.getClosestRailPoint(this.pos);
    }

    nearARailPoint(): boolean {
        return this.level.nearARailPoint(this.pos);
    }
}

export class Pacman extends Agent {
    mouthOpenPerc: number = 0;

    constructor(pos: Pt, dir: Pt, level: Level) {
        super(pos, dir, level);
    }

    static create(lvl: Level) {
        return new Pacman(
            lvl.getLocationsOfChar('p').pop(),
            new Pt(1, 0),
            lvl,
        );
    }
}

export class Ghost extends Agent {
    lastGate?: Pt; // the last rail point the ghost made a decision to move from
    constructor(pos: Pt, dir: Pt, level: Level, public color: string, public scared: boolean) {
        super(pos, dir, level);
    }

    static create(lvl: Level, color: string) {
        return new Ghost(
            // lvl.getRandomLocationOfChar('g'),
            new Pt(22, 19),
            new Pt(1, 0),
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
        if (this.level.nearARailPoint(this.pos)) this.pos = this.level.getClosestRailPoint(this.pos);
        if (((this.level.nearARailPoint(this.pos) && !this.lastMovedFromHere()) && (!this.level.onALinearPath(this.pos)))) {
            // const shouldChange = Math.random() < 0.6;
            if (true) {
                this.pos = this.level.getClosestRailPoint(this.pos);
                const options = this.level.getDirectionOptions(this.pos);
                if (options.length) {
                    const randomDir = options[Math.floor(Math.random() * options.length)];
                    this.dir = dirToPt(randomDir);
                    this.lastGate = this.level.getClosestRailPoint(this.pos).round();
                }
            }

        }
        const vel = this.dir.scale(dt * 0.005);
        const outcome = this.level.getSafeMove(this.pos, vel)
        if (outcome.safe) {
            this.pos = outcome.newPos;
        } else {
            this.pos = this.pos.round();
        }
    }


}

export class Game {}
