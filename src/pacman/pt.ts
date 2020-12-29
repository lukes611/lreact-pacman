export const Radians2Degrees = 180 / Math.PI;

export class Pt {
    constructor(public x: number = 0, public y: number = 0) {
    }

    copy() {
        return new Pt(this.x, this.y);
    }

    toString() {
        return `<${this.x}, ${this.y}>`
    }

    floor() {
        return new Pt(Math.floor(this.x), Math.floor(this.y));
    }

    ceil() {
        return new Pt(Math.ceil(this.x), Math.ceil(this.y));
    }

    round() {
        return new Pt(Math.round(this.x), Math.round(this.y));
    }

    scale(v: number): Pt {
        return new Pt(this.x * v, this.y * v);
    }

    addY(yv: number): Pt {
        return new Pt(this.x, this.y + yv);
    }

    add(x: number, y: number): Pt {
        return new Pt(this.x + x, this.y + y);
    }

    addP({ x, y }: Pt): Pt {
        return new Pt(this.x + x, this.y + y);
    }

    eq(p: Pt) {
        return this.x === p.x && this.y === p.y;
    }

    dist(p: Pt) {
        const diff = this.addP(p.scale(-1));
        return diff.mag();
    }
    

    static fromAngle(angle: number) {
        const rv = new Pt(0, 0);
        angle /= Radians2Degrees;
        rv.x = Math.cos(angle);
        rv.y = Math.sin(angle);
        return rv;
    }

    getAngle() {
        let angle: number = Radians2Degrees * Math.atan(this.y / this.x);
        if (this.x < 0.0)
            angle += 180.0;
        else if (this.y < 0.0)
            angle += 360.0;
        return angle;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    unit() {
        return this.scale(1 / this.mag());
    }
}
