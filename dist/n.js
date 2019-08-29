"use strict";
function start() {
    let S = [];
    S.push(new Site(50, 25));
    S.push(new Site(25, 75));
    S.push(new Site(75, 75));
    S.push(new Site(7, 33));
    for (let i = 0; i < 133; i++)
        S.push(new Site(Math.random() * 100, Math.random() * 100));
    makeVoronoi(document.getElementById("cnv"), document.getElementById("cnv2"), S);
}
//# sourceMappingURL=n.js.map