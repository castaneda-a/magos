class Part{
    #type;
    #pointsIdx;   

    constructor(pointsIdx, type=""){
        this.#type = type;
        this.#pointsIdx = pointsIdx;
    }

    draw(ctx, points){
        const idx = this.#pointsIdx;

        ctx.beginPath();
        ctx.moveTo(points[idx[0]][0], points[idx[0]][1]);

        for(let i=1; i<this.#pointsIdx.length; i=i+1){
            ctx.lineTo(points[idx[i]][0], points[idx[i]][1]);
        }

        if(this.#type === "face"){
            ctx.fill();
        }
        else if(this.#type === "border"){
            ctx.closePath();
            ctx.stroke();
        }
        else if(this.#type === "line"){
            ctx.stroke();
        }
        else if(this.#type === "arrow"){
            const [x, y] = points[idx[1]];
            const [sX, sY] = points[idx[0]];
            const [vX, vY] = [sX-x, sY-y];
            
            ctx.moveTo(x+0.09*vX-0.05*vY, y+0.09*vY+0.05*vX);
            ctx.lineTo(x, y);
            ctx.moveTo(x+0.09*vX+0.05*vY, y+0.09*vY-0.05*vX);
            ctx.lineTo(x,y);

            ctx.stroke();
        }
        else {
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }

    }
}

class TransformationList{
    #position;
    #list;

    constructor(transformation){
        this.#position = 0;
        this.#list = [transformation];
    }

    push(transformation){
        if(this.#position < this.#list.length-1){
            if(this.#position > this.#list.length/2){
                while(this.#list.length-1 > this.#position){
                    this.#list.pop();
                }
            }
            else{
                const aux = [];
                for(let i=0; i<=this.#position; i=i+1){
                    aux[i] = this.#list[i];
                }

                this.#list = aux;
            }
        }

        this.#list.push(transformation);
        this.#position = this.#position + 1;
    }

    pop(){
        if(this.#position > 0){
            this.#list.pop();
            this.#position = this.#position - 1;
        }
    }

    clear(){
        const aux = this.#list[0];
        this.#list = [aux];
        this.#position = 0;
    }

    stepForward(){
        if(this.#position < this.#list.length-1){
            this.#position = this.#position + 1;
        }
    }

    stepBack(){
        if(this.#position > 0){
            this.#position = this.#position - 1;
        }
    }

    getTransform(){
        return this.#list[this.#position];
    }

    getPosition(){
        return this.#position;
    }

    getLength(){
        return this.#list.length;
    }

    setTransform(transformation){
        this.#list[this.#position] = transformation;
    }

}

class Cube{
    #prototype;
    #parts;
    #transList;
    #lineColor;
    #fillColor;
    #lineWidth;
    #vecColor;
    #vecWidth;
    #vec;
    #lines;
    #show;

    constructor(vec=true, lines=true, show=true, 
    fillColor="rgb(0 255 145 / 20%)", lineColor="rgb(218 255 247 / 50%)", lineWidth=2, 
    vecColor=["#ff0019", "#00a2ff", "#FFFF00"], vecWidth=6){

        this.#fillColor = fillColor;
        this.#lineColor = lineColor;
        this.#lineWidth = lineWidth;
        this.#vecColor = vecColor;
        this.#vecWidth = vecWidth;

        this.#show = show;

        this.#vec = vec;
        this.#lines = lines;

        this.#prototype = this.#setPoints(lines, vec);

        this.#parts = this.#setParts(lines, vec);

        this.#transList = new TransformationList(new Matrix(1, "diag", 3, 3));
    }
    #setPoints(lines, vec){
        const points=[];

        //Caras:
        for(let i=0; i<8; i=i+1){
            const aux = [];
            aux[0] = (i%8 < 4) ? 1 : -1;
            aux[1] = (i%4 < 2) ? 1 : -1;
            aux[2] = (i%2 < 1) ? 1 : -1;

            points.push(aux);
        }

        //Lineas:
        if(lines){
            for(let i=0; i<6; i=i+1){
                const aux = [];
                aux[i%3] = (i < 3) ? 1 : -1;
                aux[(i+1)%3] = 0;
                aux[(i+2)%3] = 0;

                points.push(aux);
            }

            for(let i=0; i<12; i=i+1){
                const aux = [];
                aux[i%3] = 0;
                aux[(i+1)%3] = (i%12 < 6) ? -1 : 1;
                aux[(i+2)%3] = (i%6 < 3) ? -1 : 1;

                points.push(aux);
            }
        }


        //Vectores:
        if(vec){
            if(!lines){
                for(let i=0; i<3; i=i+1){
                    const aux = [];
                    aux[i%3] = 1;
                    aux[(i+1)%3] = 0;
                    aux[(i+2)%3] = 0;

                    points.push(aux);
                }
            }

            points.push([0, 0, 0]);
        }

        return points;
    }
    #setParts(lines, vec){
        const parts = [];

        //Caras:
        parts.push(new Part([0, 4, 5, 1], ""));
        parts.push(new Part([0, 4, 6, 2], ""));
        parts.push(new Part([0, 1, 3, 2], ""));
        parts.push(new Part([7, 3, 2, 6], ""));
        parts.push(new Part([7, 3, 1, 5], ""));
        parts.push(new Part([7, 6, 4, 5], ""));

        //Lineas:
        if(lines){
            for(let i=0; i<3; i=i+1){
                parts.push(new Part([8+i, 11+i], "line"));
            }

            parts.push(new Part([18, 24, 21, 15], "border"));
            parts.push(new Part([17, 23, 20, 14], "border"));
            parts.push(new Part([16, 19, 25, 22], "border"));
        }

        //Vectores:
        if(vec){
            const i = this.#prototype.length-1;

            for(let j=0; j<3; j=j+1){
                parts.push(new Part([i, 8+j], "arrow"));
            }
        }

        return parts;
    }

    reset(){
        this.#transList.clear();
    }

    draw(ctx, screen, transformation = this.#transList.getTransform()){
        if(this.#show){
            const drawPoints = screen.projectScreenList(transformation.transformList(this.#prototype));

            ctx.save();

            ctx.fillStyle = this.#fillColor;
            ctx.strokeStyle = this.#lineColor;
            ctx.lineWidth = this.#lineWidth;

            if(this.#lines){
                for(let i=0; i<6; i=i+1){
                    this.#parts[6+i].draw(ctx, drawPoints);
                }
            }

            if(this.#vec){
                let n = 6;
                if(this.#lines){
                    n = 12
                }

                ctx.save();

                ctx.lineWidth = this.#vecWidth;

                for(let i=0; i<3; i=i+1){
                    ctx.strokeStyle = this.#vecColor[i];

                    this.#parts[n+i].draw(ctx, drawPoints);
                }

                ctx.restore();
            }

            for(let i=0; i<6; i=i+1){
                this.#parts[i].draw(ctx, drawPoints);
            }

            ctx.restore();
        }
    }

    setShow(show){
        this.#show = show;
    }

    getShow(){
        return this.#show;
    }

    getTransListPosition(){
        return this.#transList.getPosition();
    }

    getTransListLength(){
        return this.#transList.getLength();
    }

    addTransform(transformation){
        const current = this.#transList.getTransform()

        this.#transList.push(current.multiply(transformation));
    }

    transformBack(){
        this.#transList.stepBack();
    }

    transformForward(){
        this.#transList.stepForward();
    }
}

class Matrix{
    #size;
    #matrix;
    #tol;
    
    constructor(data, type="", m, n, tol=1e-14){
        this.#matrix=[];

        if(type === "byColumn"){
            m=data[0].length;
            n=data.length;

            for(let i=0; i<m; i=i+1){
                this.#matrix[i]=[];

                for(let j=0; j<n; j=j+1){
                    if(Math.abs(data[j][i])<tol){
                        data[j][i]=0;
                    }

                    this.#matrix[i][j]=data[j][i]
                }
            }
        }
        else if (type === "completeArranged"){
            m=data.length;
            n=data[0].length;

            this.#matrix = data;
        }
        else if(type === "tolArranged"){
            let k=0;

            for(let i=0; i<m; i=i+1){
                this.#matrix[i]=[];

                for(let j=0; j<n; j=j+1){
                    this.#matrix[i][j]=data[k];
                    k=k+1;
                }
            }
        }
        else if(type === "diag"){
            if(Math.abs(data) < tol){
                data = 0;
            }

            for(let i=0; i<m; i=i+1){
                this.#matrix[i]=[];

                for(let j=0; j<n; j=j+1){
                    this.#matrix[i][j] = (i === j) ? data : 0;
                }
        }
        }
        else{
            let k=0;

            for(let i=0; i<m; i=i+1){
                this.#matrix[i]=[];

                for(let j=0; j<n; j=j+1){
                    if(Math.abs(data[k])<tol){
                        data[k]=0;
                    }

                    this.#matrix[i][j]=data[k];
                    k=k+1;
                }
            }
        }

        this.#size=[m, n];
        this.#tol=tol;
    }

    getSize(){
        return this.#size;
    }

    getMatrix(){
        return this.#matrix;
    }

    getColumn(j){
        const col=[];

        for(let i=0; i<this.#size[0]; i=i+1){
            col[i]=this.#matrix[i][j];
        }

        return col;
    }

    getRow(i){
        return this.#matrix[i];
    }

    multiply(matrix){
        let resp;

        if(this.#size[1] === matrix.getSize()[0]){
            const data = [];

            let k=0;
            for(let i=0; i<this.#size[0]; i=i+1){
                for(let j=0; j<matrix.getSize()[1]; j=j+1){
                    data[k]=Vector.dotProduct(this.#matrix[i], matrix.getColumn(j));

                    k=k+1;
                }
            }

            resp = new Matrix(data, "tolArranged", this.#size[0], matrix.getSize()[1]);
        }
        else{
            resp = NaN;
        }

        return resp;
    }

    sum(matrix){
        let resp;
        const data = [];

        if(this.#size[0] === matrix.getSize()[0] && this.#size[1] === matrix.getSize()[1]){
            for(let i=0; i<this.#size[0]; i=i+1){
                data[i]=Vector.sumVector(this.getRow(i), matrix.getRow(i));
            }

            resp = new Matrix(data, "completeArranged", undefined, undefined);
        }
        else{
            resp = NaN;
        }

        return resp;
    }

    scale(lambda){
        const data = [];

        for(let i=0; i<this.#size[0]; i=i+1){
            data[i]=Vector.scaleVector(lambda, this.getRow(i));
        }

        return new Matrix(data, "completeArranged", undefined, undefined);
    }

    sumDiag(lambda){
        let resp;
        const data = [];

        if(this.#size[0] === this.#size[1]){
            for(let i=0; i<this.#size[0]; i=i+1){
                data[i]=this.getRow(i);
                data[i][i]=data[i][i]+lambda;
            }

            resp = new Matrix(data, "completeArranged", undefined, undefined);
        }
        else{
            resp = NaN;
        }

        return resp;
    }

    scaleDiag(lambda){
        let resp;
        const data = [];

        if(this.#size[0] === this.#size[1]){
            for(let i=0; i<this.#size[0]; i=i+1){
                data[i]=this.getRow(i);
                data[i][i]=data[i][i]*lambda;
            }

            resp = new Matrix(data, "completeArranged", undefined, undefined);
        }
        else{
            resp = NaN;
        }

        return resp;
    }

    transform(x){
        const y = [];

        for(let i=0; i<this.#size[0]; i=i+1){
            y[i]=Vector.dotProduct(this.#matrix[i], x, this.#tol);
        }

        return y;
    }
    transformList(list){
        const respList = [];

        for(let i=0; i<list.length; i=i+1){
            respList[i]=this.transform(list[i]);
        }

        return respList;
    }

    decomposeLU(){
        const tol = this.#tol;
        const L = [];
        const U = this.#matrix.slice();
        const n=this.#size[0];

        for(let i=0; i<n; i=i+1){
            L[i]=[];
            L[i][i]=1;

            for(let j=i+1; j<n; j=j+1){
                L[i][j]=0;
            }
        }

        for(let j=0; j<n; j=j+1){
            for(let i=j+1; i<n; i=i+1){
                if(U[j][j] <= tol){
                    const maxIdx = this.#searchMaxIdx(U, j);

                    this.#swap(j, maxIdx, n, U, j);
                    this.#swap(j, maxIdx, j, L);
                }

                let mu = U[i][j]/U[j][j]
                if(Math.abs(mu) < tol){
                    mu = 0;
                }

                L[i][j] = mu;

                U[i]=this.#minusLine(U[i], mu, U[j]);
            }
        }

        return [new LMatrix(L), new UMatrix(U)];
    }
    #searchMaxIdx(U, j){
        let maxIdx = j

        for(let i=j+1; i<U[j].length; i=i+1){
            if(U[maxIdx][j] < U[i][j]){
                maxIdx = i;
            }
        }

        return maxIdx;
    }
    #swap(i1, i2, j, M, start=0){
        const aux = M[i1].slice(start, j);

        for(let i=start; i<j; i=i+1){
            M[i1][i]=M[i2][i];
        }

        for(let i=0; i<aux.length; i=i+1){
            M[i2][start+i]=aux[i];
        }
    }
    #minusLine(l1, mu, l2){
        for(let i=0; i<l1.length; i=i+1){
            let result = l1[i]-mu*l2[i];

            if(Math.abs(result)<this.#tol){
                result = 0;
            }

            l1[i] = result;
        }

        return l1;
    }
}
class LMatrix extends Matrix{

    constructor(data, tol=1e-14){
        super(data, "completeArranged", undefined, undefined, tol);
    }

    forSubstitution(b){
        const y = [];
        const L = super.getMatrix();
        
        for(let i=0; i<b.length; i=i+1){
            let sum = b[i];

            for(let j=0; j<i; j=j+1){
                sum = sum - y[j]*L[i][j];
            }

            y[i] = sum / L[i][i];
        }

        return y;
    }
}
class UMatrix extends Matrix{

    constructor(data, tol=1e-14){
        super(data, "completeArranged", undefined, undefined, tol);
    }

    backSubstitution(y){
        const x = [];
        const U = super.getMatrix();

        for(let i=y.length-1; i>=0; i=i-1){
            let sum = y[i];

            for(let j=i+1; j<y.length; j=j+1){
                sum = sum - x[j]*U[i][j];
            }

            x[i] = sum / U[i][i];
        }

        return x;
    }
}
class Vector{
    static dotProduct(x, y, tol=1e-14){
        let sum=0;

        for(let i=0; i<x.length; i=i+1){
            sum=sum + x[i]*y[i];
        }

        if(Math.abs(sum) < tol){
            sum=0;
        }

        return sum;
    }

    static sumVector(x, y, tol=1e-14){
        const resp = [];

        for(let i=0; i<x.length; i=i+1){
            resp[i] = x[i] + y[i];

            if(Math.abs(resp[i]) < tol){
                resp[i]=0;
            }
        }

        return resp;
    }

    static scaleVector(lambda, x, tol=1e-14){
        const resp = [];

        for(let i=0; i<x.length; i=i+1){
            resp[i] = lambda * x[i];

            if(Math.abs(resp[i]) < tol){
                resp[i]=0;
            }
        }

        return resp;
    }

    static vectorNorm(x){
        return Math.sqrt(Vector.dotProduct(x, x));
    }

    static proj(a, b){
        const lambda = Vector.dotProduct(a, b)/Vector.dotProduct(b, b);

        return Vector.scaleVector(lambda, b);
    }

    static comp(a, b){
        return Vector.dotProduct(a, b)/Vector.vectorNorm(b);
    }
}

class Screen3d{
    #r;
    #theta;
    #phi;
    //#sv;
    #tv;
    #pv;

    constructor(r=100, theta=0, phi=0){
        this.#r=r;
        this.#theta=theta;
        this.#phi=phi;

        //this.#sv = this.#s(theta, phi);
        this.#tv = this.#dt(theta, phi);
        this.#pv = this.#dp(theta, phi);
    }

    setPosition(theta, phi){
        this.#theta=theta;
        this.#phi=phi;

        // this.#sv = this.#s(theta, phi);
        this.#tv = this.#dt(theta, phi);
        this.#pv = this.#dp(theta, phi);
    }

    setZoom(r){
        this.#r = r;
    }

    getPosition(){
        return [this.#theta, this.#phi];
    }

    getZoom(){
        return this.#r;
    }

    #s(theta, phi){
        return [
            Math.cos(theta)*Math.cos(phi),
            Math.sin(theta)*Math.cos(phi), 
            Math.sin(phi)
        ];
    }

    #dt(theta, phi){
        return [
            -Math.sin(theta)*Math.cos(phi),
            Math.cos(theta)*Math.cos(phi), 
            0
        ];
    }

    #dp(theta, phi){
        return [
            Math.cos(theta)*Math.sin(phi),
            Math.sin(theta)*Math.sin(phi), 
            Math.cos(phi)
        ];
    }

    projectScreen(punct){
        punct = Vector.scaleVector(this.#r, punct);

        const compT = Vector.comp(punct, this.#tv);
        const compP = Vector.comp(punct, this.#pv);
        
        return [compT, compP];
    }
    projectScreenList(list){
        const respList = [];

        for(let i=0; i<list.length; i=i+1){
            respList[i]=this.projectScreen(list[i]);
        }

        return respList;
    }
}
class Scene3d{
    #screen;
    #canvas;
    #ctx;
    #objects;
    #zoomInLimit;
    #zoomSensitivity;
    #moveSensitivity;
    #precision;
    #animationStatus;
    #windowResizable;

    constructor(canvas, ctx, size=[canvas.width, canvas.height], windowResizable=false, 
    precision=2, canvasStyle="#101010", screenZoom=200, zoomInLimit=1000, zoomSensitivity=2, 
    moveSensitivity=128, startPosition=[Math.PI/6, -Math.PI/6]){

        this.#canvas = canvas;
        this.#precision= precision;
        this.#resizeScene(size);
        canvas.style.backgroundColor = canvasStyle;

        this.#ctx = ctx;
        this.#setSceneOrigin();

        this.#screen = new Screen3d(screenZoom, startPosition[0], startPosition[1]);
        this.#zoomInLimit = zoomInLimit;
        this.#zoomSensitivity = zoomSensitivity;
        this.#moveSensitivity = moveSensitivity;

        this.#objects = [];
        this.#animationStatus = false;
        this.#windowResizable = windowResizable;

        const scene  = this;

        canvas.addEventListener("mousedown", function(e){
            if(!scene.#animationStatus){
                const mouseUpF=function(){
                    canvas.removeEventListener("mousemove", mouseMoveF);
                    canvas.removeEventListener("mouseout", mouseOutF);
                    canvas.removeEventListener("mouseup", mouseUpF);
                }
                canvas.addEventListener("mouseup", mouseUpF);

                const mouseOutF=function(){
                    canvas.removeEventListener("mousemove", mouseMoveF);
                    canvas.removeEventListener("mouseup", mouseUpF);
                    canvas.removeEventListener("mouseout", mouseOutF);
                }
                canvas.addEventListener("mouseout", mouseOutF);


                const origin = [e.clientX, e.clientY];
                const [theta, phi] = scene.getScreenPosition();

                const mouseMoveF = function(e){
                    const dt = (origin[0] - e.clientX)/scene.#moveSensitivity;
                    const dp = (origin[1] - e.clientY)/scene.#moveSensitivity;
                    
                    scene.setScreenPosition(dt, dp, theta, phi);
                    scene.draw();
                }
                canvas.addEventListener("mousemove", mouseMoveF);
            }
        });

        canvas.addEventListener("wheel", function(e){
            e.preventDefault();

            if(!scene.#animationStatus){
                const dY = e.deltaY;

                scene.setScreenZoom(dY);
                scene.draw();
            }
        });

        if(windowResizable === true){
            window.addEventListener("resize", function(){
                if(!scene.#animationStatus){
                    scene.#resizeScene([window.innerWidth, window.innerHeight]);
                    scene.#setSceneOrigin();
                    scene.draw();
                }
            });
        }
    }

    getScreenPosition(){
        return this.#screen.getPosition();
    }

    getAnimationStatus(){
        return this.#animationStatus;
    }

    setScreenPosition(dt, dp, oTheta, oPhi){
        const pi_2 = Math.PI/2;
        const pi2 = Math.PI*2;

        const moveT = (oTheta+(pi_2*dt))/pi2;
        const truncT = (Math.trunc(moveT));
        let theta = (moveT - truncT)*pi2;
        if(theta < 0){
            theta = pi2 + theta;
        }

        const moveP = (oPhi+(pi_2*dp))/pi2;
        const truncP = (Math.trunc(moveP));
        let phi = (moveP - truncP)*pi2;
        if(phi < -pi_2){
            phi = -pi_2+1e-5;
        }
        else if(phi > pi_2){
            phi = pi_2-1e-5;
        }

        this.#screen.setPosition(theta, phi);
    }

    setScreenZoom(dY){
        let r = this.#screen.getZoom();

        r = r - dY*this.#zoomSensitivity;

        if(r <= 0){
            r = 1;
        }
        else if(r > this.#zoomInLimit){
            r=this.#zoomInLimit;
        }

        this.#screen.setZoom(r);
    }

    #setSceneOrigin(){
        this.#ctx.restore();

        this.#ctx.translate(this.#canvas.width/2, this.#canvas.height/2);
        this.#ctx.transform(1, 0, 0, -1, 0, 0);
        
        this.#ctx.save();
    }

    #clearScene(){
        const ctx = this.#ctx;
        const cWidth = this.#canvas.width;
        const cHeight = this.#canvas.height;

        ctx.save();
        ctx.translate(-cWidth/2, cHeight/2);
        ctx.clearRect(0, 0, cWidth, -cHeight);
        ctx.restore();
    }

    draw(){
        this.#clearScene();

        for(let i=0; i<this.#objects.length; i=i+1){
            this.#objects[i].draw(this.#ctx, this.#screen);
        }
    }

    addObject(object){
        this.#objects.push(object);
    }

    #resizeScene(size){
        const canvas = this.#canvas;

        canvas.width = String(this.#precision*size[0]);
        canvas.height = String(this.#precision*size[1]);
        canvas.style.width = String(size[0]) + "px";
        canvas.style.height = String(size[1]) + "px";
    }

    reset(){
        for(let i=0; i<this.#objects.length; i=i+1){
            this.#objects[i].reset();
        }

        this.draw();
    }
}

class Lerp {
    #start;
    #vec;
    #type;

    constructor(type="", start, end){

        if(type === "matrix"){
            this.#type = type;

            this.#start = start;
            this.#vec = end.sum(start.scale(-1));
        }
        else{
            this.#type = "vec";

            this.#start = start;
            this.#vec = Vector.sumVector(end, Vector.scaleVector(-1, start));
        }
    }

    move(t){
        let resp;

        if(this.#type === "vec"){
            resp = Vector.sumVector(this.#start, Vector.scaleVector(t, this.#vec));
        }
        else if(this.#type === "matrix"){
            resp = this.#start.sum(this.#vec.scale(t));
        }

        return resp;
    }
    static moveList(lerpList, t){
        const resp = [];

        for(let i=0; i<lerpList.length; i=i+1){
            resp[i] = lerpList[i].move(t);
        }

        return resp;
    }

    static createList(type="", start, end){
        const lerpList = [];

        for(let i=0; i<start.length; i=i+1){
            lerpList[i]=new Lerp(type, start[i], end[i]);
        }

        return lerpList;
    }
}


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cubo = new Cube();
const cuboO = new Cube(
    true, true, false, "rgb(255 0 0 / 20%)", "rgb(200 200 200 / 50%)", 
    1, ["#9c0010", "#004b77", "#6b6b00"], 4
);

const scene = new Scene3d(canvas, ctx, [window.innerWidth, window.innerHeight], true);
scene.addObject(cubo);
scene.addObject(cuboO);
scene.draw();


const sControls = document.getElementById("showInterface");
const hControls = document.getElementById("hideInterface");
const interface = document.getElementById("interface");
const transform = document.getElementById("transform");
const reset = document.getElementById("reset");
const redo = document.getElementById("redo");
const undo = document.getElementById("undo");
const original = document.getElementById("original");
const sTransList = document.getElementById("showTransList");
const hTransList = document.getElementById("hideTransList");
const transList = document.getElementById("transList");

sControls.addEventListener("click", function(){
    sControls.style.display = "none";
    interface.style.display = "inline-block";
});

hControls.addEventListener("click", function(){
    sControls.style.display = "inline-block";
    interface.style.display = "none";
});

sTransList.addEventListener("click", function(){
    sTransList.style.display = "none";
    hTransList.style.display = "inline-block";
    transList.style.display = "inline-block";
});

hTransList.addEventListener("click", function(){
    hTransList.style.display = "none";
    sTransList.style.display = "inline-block";
    transList.style.display = "none";
});

transform.addEventListener("click", function(){
    if(!scene.getAnimationStatus()){
        const matrixData = document.getElementsByClassName("matrixInput");
        const data = [];

        for(let i=0; i<9; i=i+1){
            const value = Number(matrixData[i].value);

            if(value === 0){
                data[i] = 0;
            }
            else{
                data[i] = value;
            }
        }

        const matrix = new Matrix([
            data[0], data[1], data[2], 
            data[3], data[4], data[5], 
            data[6], data[7], data[8]
        ], "", 3, 3)

        cubo.addTransform(matrix);
        scene.draw();

        reset.style.backgroundColor = "#578e9c";
        reset.style.color = "rgb(254, 254, 254)";

        undo.style.backgroundColor = "#578e9c";
        undo.style.color = "rgb(254, 254, 254)";

        redo.style.backgroundColor = "#3b616b";
        redo.style.color = "#436e79";
    }
});

reset.addEventListener("click", function(){
    if(!scene.getAnimationStatus()){
        const matrixData = document.getElementsByClassName("matrixInput");

        for(let i=0; i<9; i=i+1){
            matrixData[i].value = "";
        }

        cuboO.setShow(false);
        original.innerHTML = "Mostrar Original";

        scene.reset();

        undo.style.backgroundColor = "#3b616b";
        undo.style.color = "#436e79";

        redo.style.backgroundColor = "#3b616b";
        redo.style.color = "#436e79";

        reset.style.backgroundColor = "#3b616b";
        reset.style.color = "#436e79";
    }
});

undo.addEventListener("click", function(){
    if(!scene.getAnimationStatus()){
        cubo.transformBack();
        scene.draw();

        const position = cubo.getTransListPosition();
        const length = cubo.getTransListLength();
        if(position === 0){
            undo.style.backgroundColor = "#3b616b";
            undo.style.color = "#436e79";
        }
        if(length != 1){
            redo.style.backgroundColor = "#578e9c";
            redo.style.color = "rgb(254, 254, 254)";
        }
    }
});

redo.addEventListener("click", function(){
    if(!scene.getAnimationStatus()){
        cubo.transformForward();
        scene.draw();

        const position = cubo.getTransListPosition();
        const length = cubo.getTransListLength();
        if(position === length-1){
            redo.style.backgroundColor = "#3b616b";
            redo.style.color = "#436e79";
        }
        if(length != 1){
            undo.style.backgroundColor = "#578e9c";
            undo.style.color = "rgb(254, 254, 254)";
        }
    }
});

original.addEventListener("click", function(){
    if(!scene.getAnimationStatus()){
        if(!cuboO.getShow()){
            cuboO.setShow(true);

            original.innerHTML = "Ocultar Original";

            scene.draw();
        }
        else{
            cuboO.setShow(false);

            original.innerHTML = "Mostrar Original";

            scene.draw();
        }
    }
});


redo.addEventListener("mouseover", function(){
    redo.style.backgroundColor = "#3b616b";
});
undo.addEventListener("mouseover", function(){
    undo.style.backgroundColor = "#3b616b";
});
reset.addEventListener("mouseover", function(){
    reset.style.backgroundColor = "#3b616b";
});
redo.addEventListener("mouseleave", function(){
    const position = cubo.getTransListPosition();
    const length = cubo.getTransListLength();
    if(position != length-1){
        redo.style.backgroundColor = "#578e9c";
    }
});
undo.addEventListener("mouseleave", function(){
    const position = cubo.getTransListPosition();
    if(position != 0){
        undo.style.backgroundColor = "#578e9c";
    }
});
reset.addEventListener("mouseleave", function(){
    const length = cubo.getTransListLength();
    if(length != 1){
        reset.style.backgroundColor = "#578e9c";
    }
});