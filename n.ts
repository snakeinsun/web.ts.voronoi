"use strict";

function start() {


    let S: Array<Site> = [];

    S.push(new Site(50, 25));
    S.push(new Site(25, 75));
    S.push(new Site(75, 75));
    S.push(new Site(7, 33));


    for (let i = 0; i < 133; i++)
        S.push(new Site(Math.random() * 100, Math.random() * 100));


    makeVoronoi(<HTMLCanvasElement>document.getElementById("cnv"), <HTMLCanvasElement>document.getElementById("cnv2"), S);



}
