"use strict";

let cnv: HTMLCanvasElement;
let cnv2: HTMLCanvasElement;

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

    cnv = <HTMLCanvasElement>document.getElementById("cnv")
    cnv2 = <HTMLCanvasElement>document.getElementById("cnv2");
    cnv.width = window.innerWidth;
    cnv.height = window.innerHeight;
    cnv2.width = window.innerWidth;
    cnv2.height = window.innerHeight;

    for (let i = 0; i < (cnv.width * cnv.height) / (45 * 45); i++)
        S.push(new Geometry.Point(Math.random() * cnv.width, Math.random() * cnv.height));




    makeVoronoi(cnv, cnv2, S);



    /*
        let S: Array<Site> = [];
    
        S.push(new Site(50, 25));
        S.push(new Site(25, 75));
        S.push(new Site(75, 75));
        S.push(new Site(7, 33));
    
        makeVoronoi(<HTMLCanvasElement>document.getElementById("cnv"), <HTMLCanvasElement>document.getElementById("cnv2"), S);
    */


}
