"use strict";


namespace Geometry {

    export class Segment {

        public p1: Point;
        public p2: Point;

        constructor(p1: Point, p2: Point) {
            this.p1 = p1.clone();
            this.p2 = p2.clone();
        }

        public clone(): Segment {
            return new Segment(this.p1, this.p2);
        }

        public equals(b: Segment): boolean {
            let a = this;
            return (
                (a.p1.equals(b.p1) && a.p2.equals(b.p2)) ||
                (a.p2.equals(b.p1) && a.p1.equals(b.p2))
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


        public getTheSide(p: Point): number {
            return Helper.getTheSide(this.p1.x, this.p1.y, this.p2.x, this.p2.y, p.x, p.y);
        }

        public get length() {
            return Helper.getDistance(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
        }

    }

    export class Point {

        public _x: number;
        public get x() { return this._x; }
        public set x(value: number) { this._x = value; }

        public _y: number;
        public get y() { return this._y; }
        public set y(value: number) { this._y = value; }

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        public clone(): Point {
            return new Point(this.x, this.y);
        }

        public equals(b: Point): boolean {
            let a = this;
            return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001;
        }//Number.EPSILON

        public draw(ctx: CanvasRenderingContext2D, color: string) {
            ctx.fillStyle = color;
            ctx.fillRect(this.x + shiftX, this.y + shiftY, 2, 2);
        }
    }

    export class Polygon {

        segments: Array<Segment>;

        constructor(lines: Array<Segment>) {
            this.segments = lines.map((l) => l);
        }

        private arrangeSegments() {
            if (this.segments.length == 0)
                return;

            let segments = this.segments.map((s) => s);
            this.segments = [];

            let ix = 0;
            this.segments.push(segments[0]);
            segments.shift();
            while (segments.length > 0) {

                for (let i = 0; i < segments.length; i++) {
                    let s = segments[i];

                    if (s.p1.equals(this.segments[ix].p2)) {
                        this.segments.push(s);
                        segments.splice(i, 1);
                        ix++
                        break;
                    }

                    if (s.p2.equals(this.segments[ix].p2)) {
                        let t = s.p1;
                        s.p1 = s.p2;
                        s.p2 = t;
                        this.segments.push(s);
                        segments.splice(i, 1);
                        ix++
                        break;
                    }
                }
            }
        }

        public getCentroid(): Point {

            if (this.segments.length == 0)
                return new Point(0, 0);

            this.arrangeSegments();

            let points: Array<Point> = [];
            this.segments.forEach((s) => {
                if (points.filter((p) => s.p1.equals(p)).length == 0)
                    points.push(s.p1);
                if (points.filter((p) => s.p2.equals(p)).length == 0)
                    points.push(s.p2);
            });
            let first = points[0];
            let last = points[points.length - 1];

            if (first.x != last.x || first.y != last.y) points.push(new Point(first.x, first.y));
            let twicearea = 0,
                x = 0, y = 0,
                p1: Point, p2: Point, f: number;
            for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
                p1 = points[i]; p2 = points[j];
                f = p1.x * p2.y - p2.x * p1.y;
                twicearea += f;
                x += (p1.x + p2.x) * f;
                y += (p1.y + p2.y) * f;
            }
            f = twicearea * 3;
            return new Point(x / f + 5, y / f + 5);
        }

        public draw(ctx: CanvasRenderingContext2D, color: string) {
            this.segments.forEach((s) => s.draw(ctx, color));
        }

        public clone(): Polygon {
            return new Polygon(this.segments.map(s => s));
        }


        public mergeWith(pol: Polygon) {
            let all = this.segments.filter(s => s).concat(pol.segments);

            this.segments = [];

            all.forEach((seg) => {
                if (all.filter((x) => x.equals(seg)).length == 1)
                    this.segments.push(seg);
            });
        }


        public cutIn2(line: Segment): Array<{ side: number, polygon: Polygon }> | null {

            // make a copies
            let result: Array<{ side: number, polygon: Polygon }> = [
                { side: -1, polygon: new Polygon([]) },
                { side: 1, polygon: new Polygon([]) }
            ];
            let intersections: Array<{ p: Point, s: Segment }> = [];

            this.segments.forEach((seg) => {
                let intersection = Helper.getIntersection(
                    seg.p1.x, seg.p1.y,
                    seg.p2.x, seg.p2.y,
                    line.p1.x, line.p1.y,
                    line.p2.x, line.p2.y);

                if (intersection.intersect) {
                    let p = new Point(intersection.x, intersection.y);
                    if (intersections.filter((x) => x.p.equals(p)).length == 0) {
                        intersections.push({
                            p: p,
                            s: seg
                        });
                    }
                }
            });

            if (intersections.length == 2) {

                result.forEach((r) => {

                    this.segments.forEach((seg) => {

                        let currentIntersection: { p: Point, s: Segment } = null;
                        intersections.forEach(i => {
                            if (i.s.equals(seg))
                                currentIntersection = i;
                        });



                        // both segment points on correct side
                        if (line.getTheSide(seg.p1) == r.side && line.getTheSide(seg.p2) == r.side)
                            r.polygon.segments.push(seg.clone());

                        if (line.getTheSide(seg.p1) == r.side && line.getTheSide(seg.p2) != r.side) {
                            if (currentIntersection == null) {
                                currentIntersection = currentIntersection;
                            }
                            let sn = new Segment(seg.p1, currentIntersection.p);
                            if (sn.length > 0.001)
                                r.polygon.segments.push(sn);
                        }

                        if (line.getTheSide(seg.p1) != r.side && line.getTheSide(seg.p2) == r.side) {
                            let sn = new Segment(seg.p2, currentIntersection.p);
                            if (sn.length > 0.001)
                                r.polygon.segments.push(sn);
                        }
                    });

                    r.polygon.segments.push(new Segment(intersections[0].p, intersections[1].p));
                });

                return result;
            }
            return null;
        }

    }
}


class Helper {


    public static getMidpoint(x1: number, y1: number, x2: number, y2: number): { x: number, y: number } {
        return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    }

    /** y=ax+b */
    public static getLineEquation(px: number, py: number, slope: number): { a: number, b: number } {
        let a = slope;
        let b: number;
        if (slope == 0 || px == 0)
            b = py;

        b = py - (slope * px);

        return { a: a, b: b };
    }

    public static getSlope(x1: number, y1: number, x2: number, y2: number): number {
        if (x1 == x2) x2 = x2 + 0.00001;
        if (y1 == y2) y2 = y2 + 0.00001;
        return (y1 - y2) / (x1 - x2);
    }


    public static getIntersection(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): { x: number, y: number, intersect: boolean } {

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

    public static getTheSide(xLp1: number, yLp1: number, xLp2: number, yLp2: number, x: number, y: number): number {
        //https://stackoverflow.com/questions/5973372/determine-if-two-points-are-on-the-same-side-of-a-line-in-javascript
        let vector = { x: xLp2 - xLp1, y: yLp2 - yLp1 };
        let w = { x: vector.y, y: -vector.x };

        let P = { x: xLp1, y: yLp1 };
        let B = { x: x, y: y };

        let dot = (B.x - P.x) * w.x + (B.y - P.y) * w.y;

        let side = Math.sign(dot);
        if (side == 0) side = 1;
        return side;
    }

    public static getDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }
}

class VoronoiCell {

    public middle: Geometry.Point;
    public polygon: Geometry.Polygon;
    public temporary: boolean;

    public connectedCells: Array<{ c: VoronoiCell, s: Geometry.Segment }>;


    constructor(mid: Geometry.Point, segments: Array<Geometry.Segment>) {
        this.polygon = new Geometry.Polygon(segments);
        this.middle = mid.clone();
        this.temporary = false;

        this.connectedCells = [];
    }

    public draw(ctx: CanvasRenderingContext2D, color: string) {
        this.polygon.draw(ctx, color);
        this.middle.draw(ctx, color);
    }

    public isAlreadyConnected(c: VoronoiCell): boolean {
        if (this.connectedCells.find((x) => x.c.middle.equals(c.middle)))
            return true;
        else
            return false;
    }


    public clone(): VoronoiCell {
        return new VoronoiCell(this.middle.clone(), this.polygon.segments);
    }
}

