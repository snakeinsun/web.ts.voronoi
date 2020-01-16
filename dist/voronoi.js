"use strict";
let width;
let height;
let shiftX = 0;
let shiftY = 0;
let ctx;
let ctx2;
function clear2() {
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
}
function drawVoronoi(v) {
    ctx.fillStyle = "#ffffff";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#b4b4b4";
    ctx.fillRect(shiftX, shiftY, width, height);
    ctx.fillStyle = "#0000ff";
    v.forEach((vc) => {
        vc.draw(ctx, "#000000");
    });
}
function rp() {
    return new Geometry.Point(Math.random() * width, Math.random() * height);
}
function testCutting() {
    while (true) {
        clear2();
        let a = rp();
        let b = rp();
        let c = rp();
        let p = new Geometry.Polygon([
            new Geometry.Segment(a, b),
            new Geometry.Segment(a, c),
            new Geometry.Segment(b, c)
        ]);
        let s = new Geometry.Segment(new Geometry.Point(0, Math.random() * height), new Geometry.Point(width, Math.random() * height));
        let pair = p.cutIn2(s);
        if (pair != null) {
            pair[0].polygon.segments.forEach((s) => {
                s.p1.x = s.p1.x - 10;
                s.p2.x = s.p2.x - 10;
            });
            pair[1].polygon.segments.forEach((s) => {
                s.p1.x = s.p1.x + 10;
                s.p2.x = s.p2.x + 10;
            });
            pair[0].polygon.draw(ctx2, "#009900");
            pair[1].polygon.draw(ctx2, "#000099");
        }
        p.draw(ctx2, "#000000");
        s.draw(ctx2, "#FF0000");
    }
}
function makeVoronoi(canvas, canvas2, S) {
    width = canvas.width;
    height = canvas.height;
    ctx = canvas.getContext("2d");
    ctx2 = canvas2.getContext("2d");
    let C = [];
    let p1 = new Geometry.Point(-width, -height);
    let p2 = new Geometry.Point(2 * width, -height);
    let p3 = new Geometry.Point(-width, 2 * height);
    let p4 = new Geometry.Point(2 * width, 2 * height);
    let a0 = new Geometry.Point(width / 2, height / 2);
    let a1 = new Geometry.Point(-4 * width, height / 2);
    let a2 = new Geometry.Point(width / 2, -4 * height);
    let a3 = new Geometry.Point(width / 2, 4 * height);
    let a4 = new Geometry.Point(width * 4, height / 2);
    C.push(new VoronoiCell(p1, [new Geometry.Segment(a1, a2), new Geometry.Segment(a2, a0), new Geometry.Segment(a0, a1)]));
    C.push(new VoronoiCell(p2, [new Geometry.Segment(a0, a2), new Geometry.Segment(a2, a4), new Geometry.Segment(a0, a4)]));
    C.push(new VoronoiCell(p3, [new Geometry.Segment(a0, a1), new Geometry.Segment(a1, a3), new Geometry.Segment(a3, a0)]));
    C.push(new VoronoiCell(p4, [new Geometry.Segment(a0, a3), new Geometry.Segment(a4, a3), new Geometry.Segment(a4, a0)]));
    C.forEach((c) => c.temporary = true);
    S.forEach((point) => {
        let cell = new VoronoiCell(point, []);
        for (let cx = 0; cx < C.length; cx++) {
            let c = C[cx];
            clear2();
            let midpoint = Helper.getMidpoint(point.x, point.y, c.middle.x, c.middle.y);
            let slope = Helper.getSlope(point.x, point.y, c.middle.x, c.middle.y);
            slope = -1 / slope;
            let pbEquation = Helper.getLineEquation(midpoint.x, midpoint.y, slope);
            let pb = new Geometry.Segment(new Geometry.Point(-20 * width, (-20 * width) * pbEquation.a + pbEquation.b), new Geometry.Point(20 * width, (20 * width) * pbEquation.a + pbEquation.b));
            let cut = c.polygon.cutIn2(pb);
            if (cut != null) {
                if (pb.getTheSide(c.middle) == cut[0].side) {
                    c.polygon = cut[0].polygon;
                    cell.polygon.mergeWith(cut[1].polygon);
                }
                else {
                    c.polygon = cut[1].polygon;
                    cell.polygon.mergeWith(cut[0].polygon);
                }
            }
        }
        C.push(cell);
    });
    C = C.filter((cell) => !cell.temporary);
    let cutLines = [
        new Geometry.Segment(new Geometry.Point(-100 * width, 0), new Geometry.Point(100 * width, 0)),
        new Geometry.Segment(new Geometry.Point(-100 * width, height), new Geometry.Point(100 * width, height)),
        new Geometry.Segment(new Geometry.Point(0, -100 * height), new Geometry.Point(0, 100 * height)),
        new Geometry.Segment(new Geometry.Point(width, -100 * height), new Geometry.Point(width, 100 * height))
    ];
    C.forEach((cell) => {
        cutLines.forEach((l) => {
            let intersections = cell.polygon.cutIn2(l);
            if (intersections != null) {
                clear2();
                l.draw(ctx2, "#ff0000");
                intersections[0].polygon.draw(ctx2, "#00ff00");
                intersections[1].polygon.draw(ctx2, "#0000ff");
                if (l.getTheSide(intersections[0].polygon.getCentroid()) == l.getTheSide(cell.middle)) {
                    cell.polygon = intersections[0].polygon;
                }
                else {
                    cell.polygon = intersections[1].polygon;
                }
            }
        });
    });
    drawVoronoi(C);
}
//# sourceMappingURL=voronoi.js.map