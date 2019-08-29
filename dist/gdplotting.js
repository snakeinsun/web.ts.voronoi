"use strict";
class GDChatContainer {
    constructor() {
        this.width = 300;
        this.height = 200;
        this.element = document.createElement("div");
        this.element.id = "id_" + String(Math.random()) + String(Math.random());
        this.containerId = "id_" + String(Math.random()) + String(Math.random());
        this.element.style.position = "absolute";
        this.element.style.zIndex = "20";
        this.element.style.width = String(this.width) + "px";
        this.element.style.height = String(this.height) + "px";
        this.element.style.top = "3px";
        this.element.style.right = "3px";
        this.element.style.border = "1px solid black";
        this.element.style.fontFamily = "\"Trebuchet MS\", Helvetica, sans-serif";
        this.element.innerHTML = `
            <div style="text-align: right; height: 20px; font-size: 9px;">
                <input type="button" style="font-size: 9px;" value="close" onClick=" document.getElementById('` + this.element.id + `').style.display = 'none'; ">
            </div>
            <div style="background-color: red; height: ` + String(this.height - 20) + `px;" id="` + this.containerId + `">
            ...
            </div>
            </div>
            `;
        document.body.appendChild(this.element);
    }
}
var GDChartType;
(function (GDChartType) {
    GDChartType[GDChartType["line"] = 0] = "line";
    GDChartType[GDChartType["dot"] = 1] = "dot";
    GDChartType[GDChartType["bar"] = 2] = "bar";
})(GDChartType || (GDChartType = {}));
class GDChart {
    constructor(container, chartType = GDChartType.dot) {
        this.margin = 20;
        this.chartType = chartType;
        this.seriesList = [];
        if (!container) {
            let c = new GDChatContainer();
            this.container = document.getElementById(c.containerId);
        }
        else
            this.container = container;
        this.container.innerHTML = '';
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.container.appendChild(this.canvas);
        this.width = this.canvas.width - this.margin * 2;
        this.height = this.canvas.height - this.margin * 2;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.font = '22pt Calibri';
        this.ctx.fillStyle = 'blue';
        this.ctx.fillText('{}', 2, 33);
    }
    addPoint(p, xname = "", yname = "", seriesName = "", color = "") {
        let series = this.ensureSeries(seriesName, xname, yname);
        let pt = series.addPoint(p, color);
        let points = [];
        this.seriesList.forEach(s => points = points.concat(s.points));
        this.xAxis = new GDChartAxis(this, GDChartAxisType.x);
        this.yAxis = new GDChartAxis(this, GDChartAxisType.y);
        this.xAxis.updateAxis(points);
        this.yAxis.updateAxis(points);
        this.redraw();
        return pt;
    }
    redraw() {
        let ctx = this.ctx;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.margin, this.canvas.height - this.margin);
        ctx.lineTo(this.width, this.canvas.height - this.margin);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.margin, this.margin);
        ctx.lineTo(this.margin, this.canvas.height - this.margin);
        ctx.stroke();
        ctx.font = "11px Georgia";
        ctx.fillStyle = "#000000";
        this.xAxis.axisPoints.forEach((p) => {
            ctx.beginPath();
            ctx.moveTo(this.margin + p.position, this.canvas.height - this.margin);
            ctx.lineTo(this.margin + p.position, this.canvas.height - this.margin + 3);
            if (p.label) {
                ctx.fillText(p.label, this.margin + p.position, this.canvas.height - this.margin + 13);
            }
            ctx.stroke();
        });
        this.yAxis.axisPoints.forEach((p) => {
            ctx.beginPath();
            ctx.moveTo(this.margin, this.canvas.height - this.margin - p.position);
            ctx.lineTo(this.margin - 3, this.canvas.height - this.margin - p.position);
            if (p.label) {
                ctx.fillText(p.label, 0, this.canvas.height - this.margin - p.position);
            }
            ctx.stroke();
        });
        switch (this.chartType) {
            case GDChartType.line:
                this.seriesList.forEach((s) => {
                    s.points.sort((pt1, pt2) => pt1.x - pt2.x);
                    if (s.points.length > 0) {
                        ctx.beginPath();
                        ctx.strokeStyle = s.points[0].color;
                        let x = this.xAxis.valueToAxisPosition(s.points[0].x);
                        let y = this.yAxis.valueToAxisPosition(s.points[0].y);
                        ctx.moveTo(this.margin + x, this.canvas.height - this.margin - y);
                        s.points.forEach((p) => {
                            ctx.strokeStyle = p.color;
                            let x = this.xAxis.valueToAxisPosition(p.x);
                            let y = this.yAxis.valueToAxisPosition(p.y);
                            ctx.lineTo(this.margin + x, this.canvas.height - this.margin - y);
                        });
                        ctx.stroke();
                    }
                });
                break;
            case GDChartType.dot:
                this.seriesList.forEach((s) => {
                    s.points.forEach((p) => {
                        ctx.fillStyle = p.color;
                        let x = this.xAxis.valueToAxisPosition(p.x);
                        let y = this.yAxis.valueToAxisPosition(p.y);
                        ctx.fillRect(this.margin + x, this.canvas.height - this.margin - y, 2, 2);
                    });
                });
                break;
            case GDChartType.bar:
                this.seriesList.forEach((s) => {
                    let w = Math.min(Math.max(Math.floor(this.width / s.points.length), 2), 10);
                    s.points.forEach((p) => {
                        ctx.fillStyle = p.color;
                        let x = this.xAxis.valueToAxisPosition(p.x);
                        let y = this.yAxis.valueToAxisPosition(p.y);
                        ctx.fillRect(this.margin + x, this.canvas.height - this.margin - y, w, y);
                    });
                });
                break;
        }
    }
    ensureSeries(seriesName, xname, yname) {
        let series = null;
        let t = this.seriesList.filter(s => s.name == seriesName);
        if (t.length > 0)
            series = t[0];
        if (series == null && seriesName) {
            series = new GDChartSeries(seriesName, xname, yname);
            this.seriesList.push(series);
        }
        if (series == null && this.seriesList.length > 0)
            series = this.seriesList[0];
        if (series == null) {
            series = new GDChartSeries("", xname, yname);
            this.seriesList.push(series);
        }
        return series;
    }
}
class GDChartPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
var GDChartAxisType;
(function (GDChartAxisType) {
    GDChartAxisType[GDChartAxisType["x"] = 0] = "x";
    GDChartAxisType[GDChartAxisType["y"] = 1] = "y";
})(GDChartAxisType || (GDChartAxisType = {}));
class GDAxisPoint {
    constructor() {
        this.label = "";
        this.value = 0;
        this.position = 0;
    }
}
class GDChartAxis {
    constructor(ownerChart, type) {
        this.min = 0;
        this.max = 1;
        this.type = type;
        this.axisPoints = [];
        this.ownerChart = ownerChart;
    }
    callSeriesUpdate() {
        if (this.onSeriesUpdated)
            this.onSeriesUpdated();
    }
    getNumericValues(points) {
        return points.map((p) => {
            if (this.type == GDChartAxisType.x)
                return p.x;
            else
                return p.y;
        });
    }
    updateAxis(points) {
        let min = this.min;
        let max = this.max;
        if (points.length == 0) {
            min = 0;
            max = 1;
            this.axisPoints = [];
            if (min != this.min || max != this.max) {
                this.min = min;
                this.max = max;
                this.callSeriesUpdate();
            }
            return;
        }
        let values = this.getNumericValues(points);
        min = values[0];
        max = values[0];
        values.forEach((v) => {
            min = Math.min(v, min);
            max = Math.max(v, max);
        });
        min = this.getLowerLimit(min);
        max = this.getUpperLimit(max);
        let sizePx;
        if (this.type == GDChartAxisType.x)
            sizePx = this.ownerChart.width;
        else
            sizePx = this.ownerChart.height;
        this.axisPoints = [];
        let ptsCount = Math.floor(sizePx / 40) * 3;
        let valueStep = ((max - min) / ptsCount);
        let posStep = (sizePx * valueStep) / (max - min);
        for (let i = 0; i < ptsCount; i++) {
            let k = new GDAxisPoint();
            k.value = min + valueStep * i;
            k.position = posStep * i;
            if (i % 3 == 0)
                k.label = String(Math.floor(k.value * 10) / 10);
            this.axisPoints.push(k);
        }
        if (min != this.min || max != this.max) {
            this.min = min;
            this.max = max;
            this.callSeriesUpdate();
        }
    }
    valueToAxisPosition(v) {
        let sizePx;
        if (this.type == GDChartAxisType.x)
            sizePx = this.ownerChart.width;
        else
            sizePx = this.ownerChart.height;
        let minPosition = (this.min * sizePx) / (this.max - this.min);
        return (sizePx * v) / (this.max - this.min) - minPosition;
    }
    getUpperLimit(num) {
        if (num < 0)
            return (-1) * this.getLowerLimit(num * (-1));
        if (num == 0)
            return 0;
        let sg = Math.sign(num);
        num = num * sg;
        let n = Math.pow(10, Math.floor(Math.log10(num)));
        return Math.ceil(num / n) * n;
    }
    getLowerLimit(num) {
        if (num < 0)
            return (-1) * this.getUpperLimit(num * (-1));
        if (num == 0)
            return 0;
        let sg = Math.sign(num);
        num = num * sg;
        let n = Math.pow(10, Math.floor(Math.log10(num)));
        return Math.floor(num / n) * n;
    }
}
class GDChartSeries {
    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    constructor(name, xprop, yprop) {
        this.points = [];
        this.name = name;
        this.color = this.getRandomColor();
        this.xProperty = xprop;
        this.yProperty = yprop;
    }
    addPoint(obj, color) {
        let x = parseFloat(obj[this.xProperty]);
        let y = parseFloat(obj[this.yProperty]);
        let yl = null;
        let xl = null;
        if (this.yLabelProperty != null) {
            yl = String(obj[this.yLabelProperty]);
        }
        if (isNaN(x)) {
            x = this.points.length;
            if (obj[this.xProperty])
                xl = String(obj[this.xProperty]);
        }
        if (isNaN(y))
            y = parseFloat(obj);
        if (isNaN(y))
            y = parseInt(obj);
        let p = new GDChartPoint(x, y);
        p.xLabel = xl;
        p.yLabel = yl;
        p.color = color;
        if (!p.color)
            p.color = this.color;
        this.points.push(p);
        return p;
    }
}
//# sourceMappingURL=gdplotting.js.map