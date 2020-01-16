"use strict";
let cnv;
let cnv2;
function start() {
    let S = [];
    cnv = document.getElementById("cnv");
    cnv2 = document.getElementById("cnv2");
    cnv.width = window.innerWidth;
    cnv.height = window.innerHeight;
    cnv2.width = window.innerWidth;
    cnv2.height = window.innerHeight;
    for (let i = 0; i < (cnv.width * cnv.height) / (45 * 45); i++)
        S.push(new Geometry.Point(Math.random() * cnv.width, Math.random() * cnv.height));
    makeVoronoi(cnv, cnv2, S);
}
//# sourceMappingURL=n.js.map