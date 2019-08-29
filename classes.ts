"use strict";

class Site {

    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public toPoint(): Point {
        return new Point(this.x, this.y);
    }

}


class Edge {

    public p1: Point;
    public p2: Point;

    constructor(p1: Point, p2: Point) {
        this.p1 = new Point(p1.x, p1.y);
        this.p2 = new Point(p2.x, p2.y);
    }

    /** make p1 less than p2 */
    public turn() {
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

    public isOnEdge(p: Point): boolean {
        this.turn();
        return p.x >= this.p1.x &&
            p.x <= this.p2.x &&
            p.y >= this.p1.y &&
            p.y <= this.p2.y;
    }

    public equals(b: Edge): boolean {
        let a = this;
        return (
            (a.p1.x == b.p1.x && a.p1.y == b.p1.y && a.p2.x == b.p2.x && a.p2.y == b.p2.y) ||
            (a.p2.x == b.p1.x && a.p2.y == b.p1.y && a.p1.x == b.p2.x && a.p1.y == b.p2.y)
        );
    }

    public draw(ctx: CanvasRenderingContext2D, color: string) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.p1.x + shiftX, this.p1.y + shiftY);
        ctx.lineTo(this.p2.x + shiftX, this.p2.y + shiftY);
        ctx.stroke();
    }

}


class Cell {

    public site: Site;
    public edges: Array<Edge>;

    constructor(site: Site, edges: Array<Edge> = []) {
        this.site = site;
        this.edges = edges.map((e) => new Edge(e.p1, e.p2));
    }

    public draw(ctx: CanvasRenderingContext2D, color: string) {
        ctx.fillStyle = color;
        ctx.fillRect(this.site.x + shiftX, this.site.y + shiftY, 8, 8);
        this.edges.forEach((e) => e.draw(ctx, color));
    }

    public movePoint(from: Point, to: Point) {
        this.edges.forEach((e) => {
            if (e.p1.equals(from))
                e.p1 = new Point(to.x, to.y);
            if (e.p2.equals(from))
                e.p2 = new Point(to.x, to.y);
        });
    }
}

class Point {

    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public draw(ctx: CanvasRenderingContext2D, color: string) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x + shiftX, this.y + shiftY, 8, 8);
    }

    public equals(b: Point): boolean {
        let a = this;
        return a.x == b.x && a.y == b.y;
    }

    public static getMidpoint(p1: Point, p2: Point): Point {
        return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    }

    /** y=ax+b */
    public static getLineEquation(p: Point, slope: number): { a: number, b: number } {
        let a = slope;
        let b: number;
        if (slope == 0 || p.x == 0)
            b = p.y;

        b = p.y - (slope * p.x);

        return { a: a, b: b };
    }

    public static getSlope(x1: number, y1: number, x2: number, y2: number): number {
        if (x1 == x2) x2 = x2 + 0.00001;
        if (y1 == y2) y2 = y2 + 0.00001;
        return (y1 - y2) / (x1 - x2);
    }


    public static getIntersection2(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {

        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return { x: 0, y: 0, intersect: false };
        }

        let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        // Lines are parallel
        if (denominator === 0) {
            return { x: 0, y: 0, intersect: false };
        }

        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return { x: 0, y: 0, intersect: false };
        }

        // Return a object with the x and y coordinates of the intersection
        let x = x1 + ua * (x2 - x1)
        let y = y1 + ua * (y2 - y1)

        return { x, y, intersect: true }
    }

    public static getDistance(p2: Point, p1: Point): number {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    }

}


class Helper {

    public static getTheSide(xLp1: number, yLp1: number, xLp2: number, yLp2: number, x: number, y: number) {
        //https://stackoverflow.com/questions/5973372/determine-if-two-points-are-on-the-same-side-of-a-line-in-javascript
        let vector = { x: xLp2 - xLp1, y: yLp2 - yLp1 };
        let w = { x: vector.y, y: -vector.x };

        let P = { x: xLp1, y: yLp1 };
        let B = { x: x, y: y };

        let dot = (B.x - P.x) * w.x + (B.y - P.y) * w.y;

        return Math.sign(dot);
    }
}