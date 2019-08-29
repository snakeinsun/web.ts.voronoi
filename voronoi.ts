"use strict";

// https://courses.cs.washington.edu/courses/cse326/00wi/projects/voronoi.html




let shiftX = 500;
let shiftY = 500;

let width = 100;
let height = 100;

let ctx: CanvasRenderingContext2D;
let ctx2: CanvasRenderingContext2D;

function clear2() {
    ctx2.clearRect(0, 0, 333333, 333333);
}

function drawVoronoi(v: { S: Array<Site>, C: Array<Cell> }) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 88888, 88888);

    ctx.fillStyle = "#b4b4b4";
    ctx.fillRect(shiftX, shiftY, width, height);


    // axis
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(shiftX, shiftY);
    ctx.lineTo(shiftX, shiftY + 44444);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(shiftX, shiftY);
    ctx.lineTo(shiftX + 44444, shiftY);
    ctx.stroke();





    ctx.fillStyle = "#0000ff";
    v.S.forEach((s) => {
        ctx.fillRect(s.x + shiftX, s.y + shiftY, 3, 3);
    });

    ctx.lineWidth = 1;
    v.C.forEach((c) => {
        c.edges.forEach((e) => {
            e.draw(ctx, "#A9C415");
        });
    });

}


function makeVoronoi(canvas: HTMLCanvasElement, canvas2: HTMLCanvasElement, S: Array<Site>): { S: Array<Site>, C: Array<Cell> } {
    /*
                 A2

            p1         p2
    A1         [ A0 ]           A4
            p3         p4

                A3
    
    */

    ctx = canvas.getContext("2d");
    ctx2 = canvas2.getContext("2d");


    let C: Array<Cell> = [];
    let p1 = new Site(-width, -height);
    let p2 = new Site(2 * width, -height);
    let p3 = new Site(-width, 2 * height);
    let p4 = new Site(2 * width, 2 * height);

    let a0 = new Point(width / 2, height / 2);
    let a1 = new Point(-4 * width, height / 2);
    let a2 = new Point(width / 2, -4 * height);
    let a3 = new Point(width / 2, 4 * height);
    let a4 = new Point(width * 4, height / 2);

    C.push(new Cell(p1, [new Edge(a1, a2), new Edge(a2, a0), new Edge(a0, a1)]));
    C.push(new Cell(p2, [new Edge(a0, a2), new Edge(a2, a4), new Edge(a0, a4)]));
    C.push(new Cell(p3, [new Edge(a0, a1), new Edge(a1, a3), new Edge(a3, a0)]));
    C.push(new Cell(p4, [new Edge(a0, a3), new Edge(a4, a3), new Edge(a4, a0)]));

    drawVoronoi({ S: S, C: C });

    clear2();


    let E: Array<Edge> = [];

    //  [3]
    S.forEach((site) => {
        // [4]
        let cell = new Cell(site, []);
        // [5]
        for (let cx = 0; cx < C.length; cx++) {
            let c = C[cx];

            let midpoint = Point.getMidpoint(site.toPoint(), c.site.toPoint());
            let slope = Point.getSlope(site.toPoint().x, site.toPoint().y, c.site.toPoint().x, c.site.toPoint().y);
            // rotate slope
            slope = -1 / slope;

            if (!isFinite(slope)) {
                slope = slope;
            }

            // [6]
            let pbEquation = Point.getLineEquation(midpoint, slope);
            // looooong line
            let pb = new Edge(
                new Point(-20 * width, (-20 * width) * pbEquation.a + pbEquation.b),
                new Point(20 * width, (20 * width) * pbEquation.a + pbEquation.b)
            );

            cell.draw(ctx2, "#ff0000");
            c.draw(ctx2, "#9f7752");
            pb.draw(ctx2, "#543322");

            // [7]
            let X: Array<Point> = [];

            let edgesToRemove: Array<Edge> = [];
            // [8]
            for (let ex = 0; ex < c.edges.length; ex++) {
                let e = c.edges[ex];


                // [9]
                let intersection = Point.getIntersection2(
                    e.p1.x, e.p1.y, e.p2.x, e.p2.y,
                    pb.p1.x, pb.p1.y, pb.p2.x, pb.p2.y
                );


                let sideEp2 = Helper.getTheSide(pb.p1.x, pb.p1.y, pb.p2.x, pb.p2.y, e.p2.x, e.p2.y);
                let sideC = Helper.getTheSide(pb.p1.x, pb.p1.y, pb.p2.x, pb.p2.y, c.site.toPoint().x, c.site.toPoint().y);


                if (intersection.intersect) {

                    e.draw(ctx2, "#0099ff");

                    let ip = new Point(intersection.x, intersection.y);
                    ip.draw(ctx2, "#000000");

                    // [11]
                    if (sideC == sideEp2) {
                        //if (Point.getDistance(site.toPoint(), e.p1) < Point.getDistance(site.toPoint(), e.p2)) {
                        e.p1.draw(ctx2, "#0099ff");
                        e.p1 = new Point(intersection.x, intersection.y);
                        //c.movePoint(e.p1, ip);
                    }
                    else {
                        e.p2.draw(ctx2, "#0099ff");
                        e.p2 = new Point(intersection.x, intersection.y);
                        //c.movePoint(e.p2, ip);
                    }

                    if (X.filter((dx) => dx.equals(ip)).length == 0)
                        X.push(ip);

                }
                else {
                    let distanceEC = Point.getDistance(c.site.toPoint(), e.p1) + Point.getDistance(c.site.toPoint(), e.p2);
                    let distanceESite = Point.getDistance(site.toPoint(), e.p1) + Point.getDistance(site.toPoint(), e.p2);

                    // [10]
                    //if (sideC != sideEp2) {
                    if (distanceESite < distanceEC) {
                        e.draw(ctx2, "#ff0000");
                        edgesToRemove.push(e);
                    }
                }
            }

            // [13] remove edges
            if (edgesToRemove.length > 0) {
                c.edges = c.edges.filter((e) => {
                    return edgesToRemove.filter((r) => r.equals(e)).length == 0;
                });
                E = E.filter((e) => {
                    return edgesToRemove.filter((r) => r.equals(e)).length == 0;
                });
            }

            // [12]
            if (X.length == 2) {
                let eg = new Edge(X[0], X[1]);
                cell.edges.push(eg);
                eg = new Edge(X[0], X[1]);
                E.push(eg);
                eg = new Edge(X[0], X[1]);
                eg.draw(ctx2, "#000000");
                c.edges.push(eg);
            }

            clear2();
            drawVoronoi({ S: S, C: C });
        }

        clear2();
        C.push(cell);
        cell.draw(ctx2, "#3915C0");
        clear2();

        C.forEach((o) => {
            o.draw(ctx2, "#3915C0");
            clear2();
        });

        drawVoronoi({ S: S, C: C });



    });



    clear2();
    drawVoronoi({ S: S, C: C });

    return {
        S: S,
        C: C
    };
}

