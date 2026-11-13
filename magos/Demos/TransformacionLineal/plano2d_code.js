class Plane {
    #zoom;
    #vLines = [];
    #hLines = [];
    #canvas;
    #ctx;
    #backgroundColor;
    #lineColor;
    #axisWidth;
    #lineWidth;
    #numLines;
    #lineGap;
    #e1;
    #e2;
    #determinant;

    #animationStatus;
    #vTLines;
    #hTLines;
    #e1T;
    #e2T;

    constructor(canvas, numLine=13, bgColor="#101010", lColor="#f2ff00", 
    aWidth=2, lWidth=1, lineGap=100, e1Color="#ff0000", e2Color="#003cff"){
        this.#canvas = canvas;
        this.#canvas.style.backgroundColor = bgColor;

        this.#ctx = this.#canvas.getContext("2d");
        this.#ctx.translate(canvas.width/2, canvas.height/2);
        this.#ctx.transform(1, 0, 0, -1, 0, 0);

        this.#zoom = 0;
        this.#backgroundColor = bgColor;
        this.#lineColor = lColor;
        this.#axisWidth = aWidth;
        this.#lineWidth = lWidth;
        this.#numLines = Math.floor(numLine/2)*2+1;
        this.#lineGap = lineGap;

        this.#e1 = new Vector(canvas, [lineGap, 0], e1Color, aWidth+1);
        this.#e2 = new Vector(canvas, [0, lineGap], e2Color, aWidth+1);
        
        this.#determinant = new Determinant(
            canvas, [0, 0], [lineGap, 0], [lineGap, lineGap], [0, lineGap]
        );

        this.#animationStatus=false;

        this.#vTLines = undefined;
        this.#hTLines = undefined;
        this.#e1T = undefined;
        this.#e2T = undefined;
    }


    getZoom(){
        return this.#zoom;
    }

    getDeterminant(){
        return this.#determinant;
    }

    getAnimationStatus(){
        return this.#animationStatus;
    }


    #setPoints(){
        const lineGap = this.#lineGap;
        const vLineIter = this.#numLines;
        const hLineIter = Math.floor(vLineIter/4)*2+1;
        const vStart = (vLineIter-1)/2;
        const hStart = (hLineIter-1)/2;

        let k=0;
        for(let i=0; i<vLineIter; i=i+1){
            this.#vLines[k]=[(i-vStart)*lineGap, (hStart)*lineGap];
            this.#vLines[k+1]=[(i-vStart)*lineGap, -(hStart)*lineGap];
            k=k+2;
        }

        k=0;
        for(let i=0; i<hLineIter; i=i+1){
            this.#hLines[k]=[-(vStart)*lineGap, (hStart-i)*lineGap];
            this.#hLines[k+1]=[(vStart)*lineGap, (hStart-i)*lineGap];
            k=k+2;
        }

        this.#e1.setPunto([this.#lineGap, 0]);
        this.#e2.setPunto([0, this.#lineGap]);

        const auxE1 = this.#e1.getPunto();
        const auxE2 = this.#e2.getPunto();

        this.#determinant.setVertices(
            [[0, 0], auxE1, [auxE1[0]+auxE2[0], auxE1[1]+auxE2[1]], auxE2]
        );
    }
    drawPlane(transform=false){
        const ctx = this.#ctx;

        if(!transform){
            this.#setPoints();
        }

        this.#clearPlane();

        ctx.save();
        ctx.strokeStyle=this.#lineColor;

        ctx.save();
        for(let i=0; i<this.#vLines.length; i=i+2){

            if(i===(this.#vLines.length/2)-1){
                ctx.lineWidth=this.#axisWidth;
            }
            else{
                ctx.lineWidth=this.#lineWidth;
            }

            ctx.beginPath();
            ctx.moveTo(this.#vLines[i][0], this.#vLines[i][1]);
            ctx.lineTo(this.#vLines[i+1][0], this.#vLines[i+1][1]);
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        for(let i=0; i<this.#hLines.length; i=i+2){

            if(i===(this.#hLines.length/2)-1){
                ctx.lineWidth=this.#axisWidth;
            }
            else{
                ctx.lineWidth=this.#lineWidth;
            }

            ctx.beginPath();
            ctx.moveTo(this.#hLines[i][0], this.#hLines[i][1]);
            ctx.lineTo(this.#hLines[i+1][0], this.#hLines[i+1][1]);
            ctx.stroke();
        }
        ctx.restore();

        ctx.restore();

        this.#determinant.drawDet();

        this.#e1.drawVec();
        this.#e2.drawVec();
    }

    changeZoom(zoom=1, speed=1){
        const zMatrix = new Matrix2(zoom,0,0,zoom);

        if(zoom<1){
            this.#zoom = this.#zoom -1;
        }
        else if(zoom>1){
            this.#zoom = this.#zoom +1;
        }
        
        this.transformPlane(zMatrix, speed);
    }

    transformPlane(matrix, duration=10, speed=60){
        this.#animationStatus=true;

        const vLines = this.#vLines;
        const hLines = this.#hLines;
        const e1 = this.#e1.getPunto();
        const e2 = this.#e2.getPunto();

        this.#vTLines = matrix.transformList(vLines);
        this.#hTLines = matrix.transformList(hLines);
        this.#e1T = matrix.transform(e1);
        this.#e2T = matrix.transform(e2);

        const vLerpList = Lerp.list(vLines, this.#vTLines, speed);
        const hLerpList = Lerp.list(hLines, this.#hTLines, speed);
        const e1Lerp = new Lerp (e1, this.#e1T, speed);
        const e2Lerp = new Lerp (e2, this.#e2T, speed);

        let time = 0;
        const timeStep = speed/(60*duration);
        const plano = this;

        window.requestAnimationFrame(function(){
            plano.#animate(plano, vLerpList, hLerpList, speed, time, timeStep, e1Lerp, e2Lerp);
        });
    }
    #animate(plano, vLerpList, hLerpList, speed, time, timeStep, e1Lerp, e2Lerp){
        time = time + timeStep;

        const vLines = plano.#vLines;
        const hLines = plano.#hLines;
        const determinant = plano.#determinant;

        for(let i=0; i<vLines.length; i=i+1){
            vLines[i]=vLerpList[i].move(time);
        }

        for(let i=0; i<hLines.length; i=i+1){
            hLines[i]=hLerpList[i].move(time);
        }

        plano.#vLines = vLines;
        plano.#hLines = hLines;

        const auxE1 = e1Lerp.move(time);
        const auxE2 = e2Lerp.move(time);
        
        plano.#e1.setPunto(auxE1);
        plano.#e2.setPunto(auxE2);

        determinant.setVertices(
            [[0, 0], auxE1, [auxE1[0]+auxE2[0], auxE1[1]+auxE2[1]], auxE2]
        );

        plano.drawPlane(true);

        if(time < speed){
            window.requestAnimationFrame(function(){
                plano.#animate(plano, vLerpList, hLerpList, speed, time, timeStep, e1Lerp, e2Lerp);
            });
        }
        else{
            plano.#animateEnd();
        }

    }
    #animateEnd(){
        for(let i=0; i<this.#vLines.length; i=i+1){
            if(Math.abs(this.#vTLines[i])<1e-16){
                this.#vLines[i]=0;
            }
            else{
                this.#vLines[i]=this.#vTLines[i];
            }
        }

        for(let i=0; i<this.#hLines.length; i=i+1){
            if(Math.abs(this.#hTLines[i])<1e-16){
                this.#hLines[i]=0;
            }
            else{
                this.#hLines[i]=this.#hTLines[i];
            }
        }

        const auxE1 = this.#e1T;
        const auxE2 = this.#e2T;

        for(let i=0; i<auxE1.length; i=i+1){
            if(Math.abs(auxE1[i])<1e-16){
                auxE1[i]=0;
            }
        }

        for(let i=0; i<auxE2.length; i=i+1){
            if(Math.abs(auxE2[i])<1e-16){
                auxE2[i]=0;
            }
        }
        
        this.#e1.setPunto(auxE1);
        this.#e2.setPunto(auxE2);

        this.#determinant.setVertices(
            [[0, 0], auxE1, [auxE1[0]+auxE2[0], auxE1[1]+auxE2[1]], auxE2]
        );

        plano.drawPlane(true);

        this.#animationStatus=false;
    }

    #clearPlane(){
        const ctx = this.#ctx;
        const cHeight = this.#canvas.height;
        const cWidth = this.#canvas.width;

        ctx.save();
        ctx.translate(-cWidth/2, cHeight/2);
        ctx.clearRect(0, 0, cWidth, -cHeight);
        ctx.restore();
    }
}

class Vector {
    #canvas;
    #ctx;
    #punto;
    #color;
    #width;

    constructor(canvas, punto, color="#7F7F7F", width=1){
        this.#canvas = canvas;
        this.#ctx = canvas.getContext("2d");
        
        this.#punto = punto;
        this.#color = color;
        this.#width = width;
    }


    getPunto(){
        return this.#punto;
    }


    setPunto(punto){
        this.#punto = punto;
    }


    drawVec(){
        const ctx = this.#ctx;
        const x = this.#punto[0];
        const y = this.#punto[1];

        ctx.save();

        ctx.strokeStyle = this.#color;
        ctx.lineWidth = this.#width;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.moveTo(-(y*0.05-x*0.9), x*0.05+y*0.9);
        ctx.lineTo(x, y);
        ctx.moveTo(y*0.05+x*0.9, -x*0.05+y*0.9);
        ctx.lineTo(x,y);
        ctx.stroke();

        ctx.restore();
    }
}

class Determinant {
    #canvas;
    #ctx;
    #vertices;
    #show;
    #color1;
    #color2;

    constructor(canvas, punto1, punto2, punto3, punto4,
    color1="#76A851", color2="#50AFCD", show=false){

        this.#canvas = canvas;
        this.#ctx = canvas.getContext("2d");

        this.#vertices = [punto1, punto2, punto3, punto4];

        this.#show = show;
        this.#color1 = color1;
        this.#color2 = color2;
    }


    setShow(show){
        this.#show = show;
    }

    setVertices(vertices){
        this.#vertices = vertices;
    }


    drawDet(){
        if(this.#show){
            const ctx = this.#ctx;
            const vertices = this.#vertices;

            ctx.save();

            const gradient = ctx.createLinearGradient(
                vertices[0][0], vertices[0][1], vertices[1][0], vertices[1][1]
            );
            gradient.addColorStop(0, this.#color1);
            gradient.addColorStop(1, this.#color2);
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.moveTo(vertices[0][0], vertices[0][1]);
            ctx.lineTo(vertices[1][0], vertices[1][1]);
            ctx.lineTo(vertices[2][0], vertices[2][1]);
            ctx.lineTo(vertices[3][0], vertices[3][1]);
            ctx.fill();

            ctx.restore();
        }
    }
}

class Lerp {
    #start;
    #end;
    #dirVec;

    constructor(start, end, speed=1){
        this.#start = start;
        this.#end = end;
        this.#dirVec = [(end[0]-start[0])/speed, (end[1]-start[1])/speed];
    }

    move(t){
        return [this.#start[0]+t*this.#dirVec[0], this.#start[1]+t*this.#dirVec[1]];
    }

    static list(startPoints, endPoints, speed=1){
        const lerpList = [];

        for(let i=0; i<startPoints.length; i=i+1){
            lerpList[i]=new Lerp(startPoints[i], endPoints[i], speed);
        }
        
        return lerpList;
    }
}

class Matrix2 {
    #entries;

    constructor(a11=1, a12=0, a21=0, a22=1){
        this.#entries = [a11, a12, a21, a22];

        for(let i=0; i<this.#entries.length; i=i+1){
            if(Math.abs(this.#entries[i])<1e-16){
                this.#entries[i]=0;
            }
        }
    }

    transform(vec){
        const m = this.#entries;
        return [vec[0]*m[0]+vec[1]*m[1], vec[0]*m[2]+vec[1]*m[3]];
    }

    transformList(points){
        const tList = [];

        for(let i=0; i<points.length; i=i+1){
            tList[i]=this.transform(points[i]);
        }

        return tList;
    }
}


const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");
const determinant = document.getElementById("determinant");
const reset = document.getElementById("reset");
const rotar = document.getElementById("rotate");
const transform = document.getElementById("transform");
const revert = document.getElementById("revert");

const canvas = document.getElementById("canvas");

const plano = new Plane(canvas, 48);
plano.drawPlane();


zoomInF = function(){
    if(!plano.getAnimationStatus()){
        if(plano.getZoom()<3){
            plano.changeZoom(2);
        }
    }
}
zoomIn.addEventListener("click", zoomInF);

zoomOutF = function(){
    if(!plano.getAnimationStatus()){
        if(plano.getZoom()>=0){
            plano.changeZoom(0.5);
        }
    }
}
zoomOut.addEventListener("click", zoomOutF);

let toggleD = true;
determinantF = function(){
    if(!plano.getAnimationStatus()){
        if(toggleD){
            toggleD=false;

            determinant.innerHTML = "Ocultar determinante";

            plano.getDeterminant().setShow(true);
            plano.changeZoom();
        }
        else{
            toggleD=true;

            determinant.innerHTML = "Mostrar determinante";

            plano.getDeterminant().setShow(false);
            plano.changeZoom();
        }
    }
}
determinant.addEventListener("click", determinantF);

resetF = function(){
    if(!plano.getAnimationStatus()){
        const datos = document.getElementsByClassName("mNum");

        for(let i=0; i<4; i=i+1){
            datos[i].value = "";
        }

        plano.drawPlane();

        if(toggleD === false){
            determinantF();
        }
    }
}
reset.addEventListener("click", resetF);

let toggleR = false;
rotarF = function(){
    if(!plano.getAnimationStatus()){
        const datos = document.getElementsByClassName("mNum");

        if(toggleR){
            toggleR=false;

            for(let i=1; i<4; i=i+1){
                datos[i].style.display = "block";
                datos[i].value = "";
            }
            datos[0].value = "";
            datos[0].placeholder = "a11";
            datos[0].setAttribute("list", "valoresComunesMatriz");

            rotar.innerHTML = "Rotar por radianes";
            transform.innerHTML = "Transformar con matriz colocada";
            revert.innerHTML = "Transformar con inversa de matriz colocada";
        }
        else{
            toggleR=true;

            for(let i=1; i<4; i=i+1){
                datos[i].style.display = "none"
            }
            datos[0].value = "";
            datos[0].placeholder = "radianes";
            datos[0].setAttribute("list", "valoresComunesRadianes");

            rotar.innerHTML = "Transformar por matriz";
            transform.innerHTML = "Rotar en sentido antihorario con el radian colocado";
            revert.innerHTML = "Rotar en sentido horario con el radian colocado";
        }
    }
}
rotar.addEventListener("click", rotarF);

revertF = function(){
    if(!plano.getAnimationStatus()){
        const datos = document.getElementsByClassName("mNum");
        const values = [];
        for(let a of datos){
            num = Number(a.value);
            if(num === 0){
                a.value=0;
            }
            values.push(num);
        }

        if(toggleR){
            values[0] = -values[0];

            const matrix = new Matrix2(
                Math.cos(values[0]), -Math.sin(values[0]), Math.sin(values[0]), Math.cos(values[0])
            );
            plano.transformPlane(matrix, 5);
        }
        else{
            const det = values[0]*values[3]-values[2]*values[1];

            let aux = values[0];
            values[0] = values[3];
            values[3] = aux;
            values[1] = -values[1];
            values[2] = -values[2];

            const matrix = new Matrix2(values[0]/det, values[1]/det, values[2]/det, values[3]/det);
            plano.transformPlane(matrix, 5);
        }
    }
}
revert.addEventListener("click", revertF);

transformF = function(e){
    if(!plano.getAnimationStatus()){
        const datos = document.getElementsByClassName("mNum");
        const values = [];
        for(let a of datos){
            const num = Number(a.value);
            if(num === 0){
                a.value=0;
            }
            values.push(num);
        }

        if(toggleR){
            const matrix = new Matrix2(
                Math.cos(values[0]), -Math.sin(values[0]), Math.sin(values[0]), Math.cos(values[0])
            );
            plano.transformPlane(matrix, 5);
        }
        else{
            const matrix = new Matrix2(values[0], values[1], values[2], values[3]);
            plano.transformPlane(matrix, 5);
        }
    }
}
transform.addEventListener("click", transformF);