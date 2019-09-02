"use strict";
function start() {
    let S = [];
    for (let i = 0; i < 440; i++)
        S.push(new Geometry.Point(Math.random() * width, Math.random() * height));
    makeVoronoi(document.getElementById("cnv"), document.getElementById("cnv2"), S);
}
//# sourceMappingURL=n.js.map