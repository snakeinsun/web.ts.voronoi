"use strict";
class Site {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toPoint() {
        return new Point(this.x, this.y);
    }
}
class Edge {
    constructor(p1, p2) {
        this.p1 = new Point(p1.x, p1.y);
        this.p2 = new Point(p2.x, p2.y);
    }
    turn() {
        if (this.p1.x > this.p2.x) {
            let a = this.p1.x;
            this.p1.x = this.p2.x;
            this.p2.x = a;
        }
        if (this.p1.y > this.p2.y) {
            let a = this.p1.y;
            this.p1.y = this.p2.y;
            this.p2.y = a;
        }
    }
    isOnEdge(p) {
        this.turn();
        return p.x >= this.p1.x &&
            p.x <= this.p2.x &&
            p.y >= this.p1.y &&
            p.y <= this.p2.y;
    }
    equals(b) {
        let a = this;
        return ((a.p1.x == b.p1.x && a.p1.y == b.p1.y && a.p2.x == b.p2.x && a.p2.y == b.p2.y) ||
            (a.p2.x == b.p1.x && a.p2.y == b.p1.y && a.p1.x == b.p2.x && a.p1.y == b.p2.y));
    }
    draw(ctx, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.p1.x + shiftX, this.p1.y + shiftY);
        ctx.lineTo(this.p2.x + shiftX, this.p2.y + shiftY);
        ctx.stroke();
    }
}
class Cell {
    constructor(site, edges = []) {
        this.site = site;
        this.edges = edges.map((e) => new Edge(e.p1, e.p2));
    }
    draw(ctx, color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.site.x + shiftX, this.site.y + shiftY, 8, 8);
        this.edges.forEach((e) => e.draw(ctx, color));
    }
    movePoint(from, to) {
        this.edges.forEach((e) => {
            if (e.p1.equals(from))
                e.p1 = new Point(to.x, to.y);
            if (e.p2.equals(from))
                e.p2 = new Point(to.x, to.y);
        });
    }
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    draw(ctx, color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x + shiftX, this.y + shiftY, 8, 8);
    }
    equals(b) {
        let a = this;
        return a.x == b.x && a.y == b.y;
    }
    static getMidpoint(p1, p2) {
        return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    }
    static getLineEquation(p, slope) {
        let a = slope;
        let b;
        if (slope == 0 || p.x == 0)
            b = p.y;
        b = p.y - (slope * p.x);
        return { a: a, b: b };
    }
    static getSlope(x1, y1, x2, y2) {
        if (x1 == x2)
            x2 = x2 + 0.00001;
        if (y1 == y2)
            y2 = y2 + 0.00001;
        return (y1 - y2) / (x1 - x2);
    }
    static getIntersection2(x1, y1, x2, y2, x3, y3, x4, y4) {
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return { x: 0, y: 0, intersect: false };
        }
        let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        if (denominator === 0) {
            return { x: 0, y: 0, intersect: false };
        }
        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return { x: 0, y: 0, intersect: false };
        }
        let x = x1 + ua * (x2 - x1);
        let y = y1 + ua * (y2 - y1);
        return { x, y, intersect: true };
    }
    static getDistance(p2, p1) {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    }
}
class Helper {
    static getTheSide(xLp1, yLp1, xLp2, yLp2, x, y) {
        let vector = { x: xLp2 - xLp1, y: yLp2 - yLp1 };
        let w = { x: vector.y, y: -vector.x };
        let P = { x: xLp1, y: yLp1 };
        let B = { x: x, y: y };
        let dot = (B.x - P.x) * w.x + (B.y - P.y) * w.y;
        return Math.sign(dot);
    }
}
//# sourceMappingURL=classes.js.map