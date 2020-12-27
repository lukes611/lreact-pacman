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

    isPath(r: number, c: number) {
        const v = this.getV(r, c);
        return v && v !== ' ';
    }

    getV(r: number, c: number): string | undefined {
        const v = this.level[r][c];
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
                f(this.getV(y, x), x, y);
            }
        }
    }

}

export class Agent {
    constructor(public pos: Pt, public dir: Pt, public level: Level) {
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
    constructor(pos: Pt, dir: Pt, level: Level, public color: string, public scared: boolean) {
        super(pos, dir, level);
    }

    static create(lvl: Level, color: string) {
        return new Ghost(
            lvl.getRandomLocationOfChar('g'),
            new Pt(1, 0),
            lvl,
            color,
            false,
        );
    }
}

export class Game {}
