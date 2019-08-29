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
}
class Cell {
    constructor(site, edges = []) {
        this.site = site;
        this.edges = edges.map((e) => new Edge(e.p1, e.p2));
    }
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static getMidpoint(p1, p2) {
        return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    }
    static getSlope(p1, p2) {
        if (p1.x == p2.x)
            return 1000000000000;
        return (p2.y - p1.y) / (p2.x - p1.x);
    }
    static getLineEquation(p, slope) {
        let a = slope;
        let b;
        if (slope == 0 || p.x == 0)
            b = p.y;
        b = p.y / (slope * p.x);
        return { a: a, b: b };
    }
}
let width = 1000;
let height = 1000;
let S = [];
function makeVoronoi() {
    let C = [];
    let p1 = new Site(-width, -height);
    let p2 = new Site(2 * width, -height);
    let p3 = new Site(-width, 2 * height);
    let p4 = new Site(2 * width, 2 * height);
    let a0 = new Point(width / 2, height / 2);
    let a1 = new Point(-10 * width, height / 2);
    let a2 = new Point(width / 2, -10 * height);
    let a3 = new Point(width / 2, 10 * height);
    let a4 = new Point(width * 10, height / 2);
    C.push(new Cell(p1, [new Edge(a1, a2), new Edge(a2, a0), new Edge(a0, a1)]));
    C.push(new Cell(p2, [new Edge(a0, a2), new Edge(a2, a4), new Edge(a0, a4)]));
    C.push(new Cell(p3, [new Edge(a0, a1), new Edge(a1, a3), new Edge(a3, a0)]));
    C.push(new Cell(p4, [new Edge(a0, a3), new Edge(a4, a3), new Edge(a4, a0)]));
    S.forEach((site) => {
        let cell = new Cell(site, []);
        C.forEach((c) => {
            let midpoint = Point.getMidpoint(site.toPoint(), c.site.toPoint());
            let pb = Point.getLineEquation();
        });
    });
}
//# sourceMappingURL=vornoi.js.map