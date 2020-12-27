export const Radians2Degrees = 180 / Math.PI;

export class Pt {
    constructor(public x: number = 0, public y: number = 0) {
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
