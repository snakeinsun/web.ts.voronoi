"use strict";
var Geometry;
(function (Geometry) {
    class Segment {
        constructor(p1, p2) {
            this.p1 = p1.clone();
            this.p2 = p2.clone();
        }
        clone() {
            return new Segment(this.p1, this.p2);
        }
        equals(b) {
            let a = this;
            return ((a.p1.equals(b.p1) && a.p2.equals(b.p2)) ||
                (a.p2.equals(b.p1) && a.p1.equals(b.p2)));
        }
        draw(ctx, color) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.p1.x + shiftX, this.p1.y + shiftY);
            ctx.lineTo(this.p2.x + shiftX, this.p2.y + shiftY);
            ctx.stroke();
        }
        getTheSide(p) {
            return Helper.getTheSide(this.p1.x, this.p1.y, this.p2.x, this.p2.y, p.x, p.y);
        }
        get length() {
            return Helper.getDistance(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
        }
    }
    Geometry.Segment = Segment;
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        get x() { return this._x; }
        set x(value) { this._x = value; }
        get y() { return this._y; }
        set y(value) { this._y = value; }
        clone() {
            return new Point(this.x, this.y);
        }
        equals(b) {
            let a = this;
            return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001;
        }
        draw(ctx, color) {
            ctx.fillStyle = color;
            ctx.fillRect(this.x + shiftX, this.y + shiftY, 2, 2);
        }
    }
    Geometry.Point = Point;
    class Polygon {
        constructor(lines) {
            this.segments = lines.map((l) => l);
        }
        arrangeSegments() {
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
                        ix++;
                        break;
                    }
                    if (s.p2.equals(this.segments[ix].p2)) {
                        let t = s.p1;
                        s.p1 = s.p2;
                        s.p2 = t;
                        this.segments.push(s);
                        segments.splice(i, 1);
                        ix++;
                        break;
                    }
                }
            }
        }
        getCentroid() {
            if (this.segments.length == 0)
                return new Point(0, 0);
            this.arrangeSegments();
            let points = [];
            this.segments.forEach((s) => {
                if (points.filter((p) => s.p1.equals(p)).length == 0)
                    points.push(s.p1);
                if (points.filter((p) => s.p2.equals(p)).length == 0)
                    points.push(s.p2);
            });
            let first = points[0];
            let last = points[points.length - 1];
            if (first.x != last.x || first.y != last.y)
                points.push(new Point(first.x, first.y));
            let twicearea = 0, x = 0, y = 0, p1, p2, f;
            for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
                p1 = points[i];
                p2 = points[j];
                f = p1.x * p2.y - p2.x * p1.y;
                twicearea += f;
                x += (p1.x + p2.x) * f;
                y += (p1.y + p2.y) * f;
            }
            f = twicearea * 3;
            return new Point(x / f + 5, y / f + 5);
        }
        draw(ctx, color) {
            this.segments.forEach((s) => s.draw(ctx, color));
        }
        clone() {
            return new Polygon(this.segments.map(s => s));
        }
        mergeWith(pol) {
            let all = this.segments.filter(s => s).concat(pol.segments);
            this.segments = [];
            all.forEach((seg) => {
                if (all.filter((x) => x.equals(seg)).length == 1)
                    this.segments.push(seg);
            });
        }
        cutIn2(line) {
            let result = [
                { side: -1, polygon: new Polygon([]) },
                { side: 1, polygon: new Polygon([]) }
            ];
            let intersections = [];
            this.segments.forEach((seg) => {
                let intersection = Helper.getIntersection(seg.p1.x, seg.p1.y, seg.p2.x, seg.p2.y, line.p1.x, line.p1.y, line.p2.x, line.p2.y);
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
                        let currentIntersection = null;
                        intersections.forEach(i => {
                            if (i.s.equals(seg))
                                currentIntersection = i;
                        });
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
    Geometry.Polygon = Polygon;
})(Geometry || (Geometry = {}));
class Helper {
    static getMidpoint(x1, y1, x2, y2) {
        return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    }
    static getLineEquation(px, py, slope) {
        let a = slope;
        let b;
        if (slope == 0 || px == 0)
            b = py;
        b = py - (slope * px);
        return { a: a, b: b };
    }
    static getSlope(x1, y1, x2, y2) {
        if (x1 == x2)
            x2 = x2 + 0.00001;
        if (y1 == y2)
            y2 = y2 + 0.00001;
        return (y1 - y2) / (x1 - x2);
    }
    static getIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
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
    static getTheSide(xLp1, yLp1, xLp2, yLp2, x, y) {
        let vector = { x: xLp2 - xLp1, y: yLp2 - yLp1 };
        let w = { x: vector.y, y: -vector.x };
        let P = { x: xLp1, y: yLp1 };
        let B = { x: x, y: y };
        let dot = (B.x - P.x) * w.x + (B.y - P.y) * w.y;
        let side = Math.sign(dot);
        if (side == 0)
            side = 1;
        return side;
    }
    static getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }
}
class VoronoiCell {
    constructor(mid, segments) {
        this.polygon = new Geometry.Polygon(segments);
        this.middle = mid.clone();
        this.temporary = false;
    }
    draw(ctx, color) {
        this.polygon.draw(ctx, color);
        this.middle.draw(ctx, color);
    }
    clone() {
        return new VoronoiCell(this.middle.clone(), this.polygon.segments);
    }
}
//# sourceMappingURL=classes.js.map