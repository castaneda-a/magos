class Cube {
    #canvas;
    #ctx;
    #cubePoints;
    #linePoints;
    #cubeColor;
    #lineColor;
    #lineGap;
    #e1;
    #e2;
    #e3;
    #basis;
    #proyection;
    #animationStatus;
    #rotationOrder;
    #cubePointsT
    #linePointsT
    #e1T;
    #e2T;
    #e3T;

    constructor(canvas, lineGap, bgColor="#101010", cubeColor="rgb(0 255 145 / 20%)", 
    lineColor="rgb(218 255 247 / 50%)", e1Color="#ff0000", e2Color="#0000ff", 
    e3Color="#ffff00", vecWidth=4){
        
        this.#canvas=canvas;
        this.#canvas.style.backgroundColor = bgColor;

        this.#ctx=canvas.getContext("2d");
        this.#ctx.translate(canvas.width/2, canvas.height/2);
        this.#ctx.transform(1, 0, 0, -1, 0, 0);

        this.#lineGap=lineGap;
        this.#cubePoints=[];
        this.#linePoints=[];
        this.#cubeColor=cubeColor;
        this.#lineColor=lineColor;

        this.#e1 = new Vector(canvas, undefined, e1Color, vecWidth);
        this.#e2 = new Vector(canvas, undefined, e2Color, vecWidth);
        this.#e3 = new Vector(canvas, undefined, e3Color, vecWidth);

        this.#basis = undefined;
        this.#proyection = undefined;

        this.#animationStatus=false;
        this.#rotationOrder=false;

        this.#cubePointsT = undefined;
        this.#linePointsT = undefined;
        this.#e1T = undefined;
        this.#e2T = undefined;
        this.#e3T = undefined;
    }


    getAnimationSatus(){
        return this.#animationStatus;
    }

    getRotationOrder(){
        return this.#rotationOrder;
    }


    setRotationOrder(rotationOrder){
        this.#rotationOrder = rotationOrder;
    };


    #setPoints(){
        const lineGap = this.#lineGap;
        
        for(let i=0; i<8; i=i+1){
            this.#cubePoints[i]=[];
            this.#cubePoints[i][0]=(i%8 < 4) ? 1 : -1;
            this.#cubePoints[i][1]=(i%4 < 2) ? 1 : -1;
            this.#cubePoints[i][2]=(i%2 < 1) ? 1 : -1;
        }

        for(let i=0; i<12; i=i+1){
            this.#linePoints[i]=[];
            this.#linePoints[i][i%3]=0;
            this.#linePoints[i][(i+1)%3]=(i%12 < 6) ? -1 : 1;
            this.#linePoints[i][(i+2)%3]=(i%6 < 3) ? -1 : 1;
        }
        
        for(let i=12; i<18; i=i+1){
            this.#linePoints[i]=[];
            this.#linePoints[i][i%3]=((i%2)*2-1);
            this.#linePoints[i][(i+1)%3]=0;
            this.#linePoints[i][(i+2)%3]=0;
        }

        let e1 = [lineGap, 0, 0];
        let e2 = [0, lineGap, 0];
        let e3 = [0, 0, lineGap];

        this.#basis=new Matrix3("byVecColumn", e1, e2, e3);

        this.#e1.setVec([1, 0, 0]);
        this.#e2.setVec([0, 1, 0]);
        this.#e3.setVec([0, 0, 1]);

        const sqrt3 = Math.sqrt(3);
        const startPerspective = new Matrix3(undefined, 
            0.75, sqrt3/4, 0.5, 
            -0.5, sqrt3/2, 0, 
            -sqrt3/4, -0.25, sqrt3/2
        );

        e1 = this.#basis.transform(startPerspective.getColumn(0));
        e2 = this.#basis.transform(startPerspective.getColumn(1));
        e3 = this.#basis.transform(startPerspective.getColumn(2));

        this.#basis=new Matrix3("byVecColumn", e1, e2, e3);

        this.#proyection = new Matrix3("proyection", 
            e1[1], e2[1], e3[1], 
            e1[2], e2[2], e3[2]
        );
    }
    drawCube(transform=false){
        const ctx = this.#ctx;

        if(!transform){
            this.#setPoints();
        }

        const cubePoints = this.#proyection.transformList(this.#cubePoints);
        const linePoints = this.#proyection.transformList(this.#linePoints);

        this.#clearCanvas();

        ctx.save();

        ctx.fillStyle = this.#cubeColor;
        ctx.strokeStyle = this.#lineColor;

        for(let i=12; i<15; i=i+1){
            ctx.beginPath();
            ctx.moveTo(linePoints[i][0], linePoints[i][1]);
            ctx.lineTo(linePoints[i+3][0], linePoints[i+3][1]);
            ctx.closePath();
            ctx.stroke();
        }

        this.#e1.drawVec(this.#proyection);
        this.#e2.drawVec(this.#proyection);
        this.#e3.drawVec(this.#proyection);

        for(let i=0; i<3; i=i+1){
            ctx.beginPath();
            ctx.moveTo(linePoints[i][0], linePoints[i][1]);
            ctx.lineTo(linePoints[i+3][0], linePoints[i+3][1]);
            ctx.lineTo(linePoints[i+9][0], linePoints[i+9][1]);
            ctx.lineTo(linePoints[i+6][0], linePoints[i+6][1]);
            ctx.closePath();
            ctx.stroke();
        }

        for(let i=0; i<5; i=i+4){
            ctx.beginPath();
            ctx.moveTo(cubePoints[i][0], cubePoints[i][1]);
            ctx.lineTo(cubePoints[i+1][0], cubePoints[i+1][1]);
            ctx.lineTo(cubePoints[i+3][0], cubePoints[i+3][1]);
            ctx.lineTo(cubePoints[i+2][0], cubePoints[i+2][1]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        for(let i=0; i<3; i=i+2){
            ctx.beginPath();
            ctx.moveTo(cubePoints[i][0], cubePoints[i][1]);
            ctx.lineTo(cubePoints[i+1][0], cubePoints[i+1][1]);
            ctx.lineTo(cubePoints[i+5][0], cubePoints[i+5][1]);
            ctx.lineTo(cubePoints[i+4][0], cubePoints[i+4][1]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        for(let i=0; i<2; i=i+1){
            ctx.beginPath();
            ctx.moveTo(cubePoints[i][0], cubePoints[i][1]);
            ctx.lineTo(cubePoints[i+2][0], cubePoints[i+2][1]);
            ctx.lineTo(cubePoints[i+6][0], cubePoints[i+6][1]);
            ctx.lineTo(cubePoints[i+4][0], cubePoints[i+4][1]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    transformCube(matrix, duration=10, speed=60){
        this.#animationStatus=true;

        this.#cubePointsT = matrix.transformList(this.#cubePoints);
        this.#linePointsT = matrix.transformList(this.#linePoints);
        this.#e1T = matrix.transform(this.#e1.getVec());
        this.#e2T = matrix.transform(this.#e2.getVec());
        this.#e3T = matrix.transform(this.#e3.getVec());

        const cubeLerpList = Lerp.list(this.#cubePoints, this.#cubePointsT, speed);
        const lineLerpList = Lerp.list(this.#linePoints, this.#linePointsT, speed);
        const e1Lerp = new Lerp(this.#e1.getVec(), this.#e1T, speed);
        const e2Lerp = new Lerp(this.#e2.getVec(), this.#e2T, speed);
        const e3Lerp = new Lerp(this.#e3.getVec(), this.#e3T, speed);

        let time = 0;
        const timeStep = speed/(60*duration);
        const cube = this;

        window.requestAnimationFrame(function(){
            cube.#animate(cube, 
                speed, time, timeStep, 
                e1Lerp, e2Lerp, e3Lerp, 
                cubeLerpList, lineLerpList
            );
        });
    }
    #animate(cube, speed, time, timeStep, e1Lerp, e2Lerp, e3Lerp, cubeLerpList, lineLerpList){
        time=time+timeStep;

        cube.#e1.setVec(e1Lerp.move(time));
        cube.#e2.setVec(e2Lerp.move(time));
        cube.#e3.setVec(e3Lerp.move(time));

        for(let i=0; i<cubeLerpList.length; i=i+1){
            cube.#cubePoints[i]=cubeLerpList[i].move(time);
        }

        for(let i=0; i<lineLerpList.length; i=i+1){
            cube.#linePoints[i]=lineLerpList[i].move(time);
        }

        cube.drawCube(true);

        if(time <= speed){
            window.requestAnimationFrame(function(){
                cube.#animate(cube, 
                    speed, time, timeStep, 
                    e1Lerp, e2Lerp, e3Lerp, 
                    cubeLerpList, lineLerpList
                );
            });
        }
        else{
            cube.#animateEnd();
        }
    }
    #animateEnd(){
        for(let i=0; i<this.#e1T.length; i=i+1){
            if(Math.abs(this.#e1T[i])<1e-16){
                this.#e1T[i]=0;
            }
        }

        for(let i=0; i<this.#e2T.length; i=i+1){
            if(Math.abs(this.#e2T[i])<1e-16){
                this.#e2T[i]=0;
            }
        }

        for(let i=0; i<this.#e3T.length; i=i+1){
            if(Math.abs(this.#e3T[i])<1e-16){
                this.#e3T[i]=0;
            }
        }

        this.#e1.setVec(this.#e1T);
        this.#e2.setVec(this.#e2T);
        this.#e3.setVec(this.#e3T);

        for(let i=0; i<this.#cubePoints.length; i=i+1){
            if(Math.abs(this.#cubePointsT[i])<1e-16){
                this.#cubePoints[i]=0;
            }
            else {
                this.#cubePoints[i]=this.#cubePointsT[i];
            }
        }

        for(let i=0; i<this.#linePoints.length; i=i+1){
            if(Math.abs(this.#linePointsT[i])<1e-16){
                this.#linePoints[i]=0;
            }
            else {
                this.#linePoints[i]=this.#linePointsT[i];
            }
        }

        this.drawCube(true);

        this.#animationStatus=false;
    }

    rotatePerspective(radX, radY, radZ, duration=10, speed=60){
        this.#animationStatus=true;

        const cX = Math.cos(radX);
        const sX = Math.sin(radX);

        const cY = Math.cos(radY);
        const sY = Math.sin(radY);

        const cZ = Math.cos(radZ);
        const sZ = Math.sin(radZ);
        
        let rotate = undefined;
        if(!this.#rotationOrder){
            rotate = new Matrix3(undefined, 
                cZ*cY,  cZ*sY*sX-sZ*cX, cZ*sY*cX+sZ*sX, 
                sZ*cY,  sZ*sY*sX+cZ*cX, sZ*sY*cX-cZ*sX, 
                -sY,             cY*sX,          cY*cX
            );
        }
        else{
            rotate = new Matrix3(undefined, 
                cY*cZ,                  -cY*sZ,     sY, 
                cX*sZ+sX*sY*cZ, cX*cZ-sX*sY*sZ, -sX*cY, 
                sX*sZ-cX*sY*cZ, sX*cZ+cX*sY*sZ,  cX*cY
            );
        }

        this.#e1T = this.#basis.transform(rotate.getColumn(0));
        this.#e2T = this.#basis.transform(rotate.getColumn(1));
        this.#e3T = this.#basis.transform(rotate.getColumn(2));

        const e1Lerp = new Lerp(this.#basis.getColumn(0), this.#e1T, speed);
        const e2Lerp = new Lerp(this.#basis.getColumn(1), this.#e2T, speed);
        const e3Lerp = new Lerp(this.#basis.getColumn(2), this.#e3T, speed);

        let time = 0;
        const timeStep = speed/(60*duration);
        const cube = this;

        window.requestAnimationFrame(function(){
            cube.#animatePerspective(cube, time, timeStep, speed, e1Lerp, e2Lerp, e3Lerp);
        });
    }
    #animatePerspective(cube, time, timeStep, speed, e1Lerp, e2Lerp, e3Lerp){
        time=time+timeStep;

        const e1 = e1Lerp.move(time);
        const e2 = e2Lerp.move(time);
        const e3 = e3Lerp.move(time);

        cube.#basis=new Matrix3("byVecColumn", e1, e2, e3);

        cube.#proyection = new Matrix3("proyection", 
            e1[1], e2[1], e3[1], 
            e1[2], e2[2], e3[2]
        );

        cube.drawCube(true);

        if(time<speed){
            window.requestAnimationFrame(function(){
                cube.#animatePerspective(cube, time, timeStep, speed, e1Lerp, e2Lerp, e3Lerp);
            });
        }
        else{
            cube.#animatePerspectiveEnd();
        }
    }
    #animatePerspectiveEnd(){
        const e1 = this.#e1T;
        const e2 = this.#e2T;
        const e3 = this.#e3T;

        this.#basis=new Matrix3("byVecColumn", e1, e2, e3);

        this.#proyection = new Matrix3("proyection", 
            e1[1], e2[1], e3[1], 
            e1[2], e2[2], e3[2]
        );

        this.drawCube(true);

        this.#animationStatus=false;
    }

    #clearCanvas(){
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
    #ctx;
    #vec;
    #color;
    #width;

    constructor(canvas, vec, color="#7F7F7F", width=1){
        this.#ctx = canvas.getContext("2d");
        
        this.#vec = vec;
        this.#color = color;
        this.#width = width;
    }


    getVec(){
        return this.#vec;
    }

    getColor(){
        return this.#color;
    }

    getWidth(){
        return this.#width;
    }


    setVec(vec){
        this.#vec = vec;
    }


    drawVec(proyection){
        const ctx = this.#ctx;
        const [x, y] = proyection.transform(this.#vec);

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

class Matrix3 {
    #entries;

    constructor(type="", a11=1, a12=0, a13=0, a21=0, a22=1, a23=0, a31=0, a32=0, a33=1){
        if(type==="proyection"){
            this.#entries = [[a11, a12, a13], [a21, a22, a23]];
        }
        else if(type==="byVecColumn"){
            this.#entries= [[a11[0], a12[0], a13[0]], [a11[1], a12[1], a13[1]], [a11[2], a12[2], a13[2]]];
        }
        else {
            this.#entries = [[a11, a12, a13], [a21, a22, a23], [a31, a32, a33]];
        }

        for(let i=0; i<this.#entries.length; i=i+1){
            for(let j=0; j<this.#entries[i].length; j=j+1){
                if(Math.abs(this.#entries[i][j]) < 1e-16){
                    this.#entries[i][j]=0;
                }
            }
        }
    }


    getColumn(idx){
        const resp=[];
        
        for(let i=0; i<this.#entries.length; i=i+1){
            resp[i]=this.#entries[i][idx];
        }

        return resp;
    }

    transform(vec){
        const m = this.#entries;
        const result = [];

        for(let i=0; i<m.length; i=i+1){
            let sum=0;

            for(let j=0; j<3; j=j+1){
                sum = sum + m[i][j]*vec[j];
            }

            result[i]=sum;
        }

        return result;
    }

    transformList(points){
        const tList = [];

        for(let i=0; i<points.length; i=i+1){
            tList[i]=this.transform(points[i]);
        }

        return tList;
    }
}

class Lerp {
    #start;
    #dirVec;

    constructor(start, end, speed=1){
        this.#start = start;
        this.#dirVec = [];

        for(let i=0; i<start.length; i=i+1){
            this.#dirVec[i]=[(end[i]-start[i])/speed];
        }
    }

    move(t){
        const punto = [];

        for(let i=0; i<this.#dirVec.length; i=i+1){
            punto[i]=this.#start[i]+t*this.#dirVec[i];
        }

        return punto;
    }

    static list(startPoints, endPoints, speed=1){
        const lerpList = [];

        for(let i=0; i<startPoints.length; i=i+1){
            lerpList[i]=new Lerp(startPoints[i], endPoints[i], speed);
        }
        
        return lerpList;
    }
}

const canvas = document.getElementById("canvas");
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");
const reset = document.getElementById("reset");
const rotationOrder = document.getElementById("rotationOrder");
const rotate = document.getElementById("rotate");
const transform = document.getElementById("transform");

const cubo = new Cube(canvas, 100);
cubo.drawCube();

let zoom = 0;
zoomInF = function(){
    if(!cubo.getAnimationSatus()){
        if(zoom<2){
            const matrix = new Matrix3(undefined, 
                2, 0, 0, 
                0, 2, 0, 
                0, 0, 2
            );

            cubo.transformCube(matrix, 1);

            zoom=zoom+1;
        }
    }
}
zoomOutF = function(){
    if(!cubo.getAnimationSatus()){
        if(zoom>-2){
            const matrix = new Matrix3(undefined, 
                0.5, 0, 0, 
                0, 0.5, 0, 
                0, 0, 0.5
            );

            cubo.transformCube(matrix, 1);

            zoom=zoom-1;
        }
    }
}
zoomIn.addEventListener("click", zoomInF);
zoomOut.addEventListener("click", zoomOutF);

resetF = function(){
    if(!cubo.getAnimationSatus()){
        const matrixData = document.getElementsByClassName("matrixInput");
        const rotateData = document.getElementsByClassName("rotationInput");

        for(let i=0; i<9; i=i+1){
            matrixData[i].value = "";
        }

        for(let i=0; i<3; i=i+1){
            rotateData[i].value = "";
        }

        rotationOrder.innerHTML = "Actual orden de rotación: X->Y->Z";
        cubo.setRotationOrder(false);

        cubo.drawCube();
    }
}
reset.addEventListener("click", resetF);

rotationOrderF = function(){
    if(!cubo.getAnimationSatus()){
        if(!cubo.getRotationOrder()){
            rotationOrder.innerHTML = "Actual orden de rotación: Z->Y->X";
            cubo.setRotationOrder(true);
        }
        else{
            rotationOrder.innerHTML = "Actual orden de rotación: X->Y->Z";
            cubo.setRotationOrder(false);
        }
    }
}
rotationOrder.addEventListener("click", rotationOrderF);

rotateF = function(){
    if(!cubo.getAnimationSatus()){
        const rotateData = document.getElementsByClassName("rotationInput");

        for(let i=0; i<3; i=i+1){
            if(Number(rotateData[i].value)===0){
                rotateData[i].value=0;
            }
        }

        cubo.rotatePerspective(rotateData[0].value, rotateData[1].value, rotateData[2].value, 5);
    }
}
rotate.addEventListener("click", rotateF);

transformF = function(){
    if(!cubo.getAnimationSatus()){
        const matrixData = document.getElementsByClassName("matrixInput");

        for(let i=0; i<9; i=i+1){
            if(Number(matrixData[i].value)===0){
                matrixData[i].value=0;
            }
        }

        const matrix = new Matrix3(undefined, 
            matrixData[0].value, matrixData[1].value, matrixData[2].value, 
            matrixData[3].value, matrixData[4].value, matrixData[5].value, 
            matrixData[6].value, matrixData[7].value, matrixData[8].value
        );

        cubo.transformCube(matrix, 5);
    }
}
transform.addEventListener("click", transformF);