"use strict";

function start() {


    let S: Array<Geometry.Point> = [];
    /*
        S.push(new Geometry.Point(50, 25));
        S.push(new Geometry.Point(25, 75));
        S.push(new Geometry.Point(75, 75));
        S.push(new Geometry.Point(7, 33));
        S.push(new Geometry.Point(175, 175));
        S.push(new Geometry.Point(17, 133));
        S.push(new Geometry.Point(55, 115));
        S.push(new Geometry.Point(71, 133));
        S.push(new Geometry.Point(22, 25));
        S.push(new Geometry.Point(71, 73));
    */

    for (let i = 0; i < 440; i++)
        S.push(new Geometry.Point(Math.random() * width, Math.random() * height));




    makeVoronoi(<HTMLCanvasElement>document.getElementById("cnv"), <HTMLCanvasElement>document.getElementById("cnv2"), S);



    /*
        let S: Array<Site> = [];
    
        S.push(new Site(50, 25));
        S.push(new Site(25, 75));
        S.push(new Site(75, 75));
        S.push(new Site(7, 33));
    
        makeVoronoi(<HTMLCanvasElement>document.getElementById("cnv"), <HTMLCanvasElement>document.getElementById("cnv2"), S);
    */


}
