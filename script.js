/* ==================================
   ELEMENT
================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cameraInput = document.getElementById("cameraInput");
const fileInput = document.getElementById("fileInput");

const pbText = document.getElementById("pb");
const bbText = document.getElementById("bb");
const ldInput = document.getElementById("ldInput");

/* ==================================
   IMAGE
================================== */

let img = new Image();
let imageLoaded = false;
let rotateImage = false;

/* ==================================
   MARKER
================================== */

/*
HVS A4 LANDSCAPE

0------1
|      |
|      |
3------2
*/

let hvsMarkers = [
    {x:200,y:150},
    {x:400,y:150},
    {x:400,y:280},
    {x:200,y:280}
];

/*
PANJANG BADAN
*/

let bodyMarkers = [
    {x:120,y:220},
    {x:620,y:220}
];

let activeMarker = null;

/* ==================================
   LOAD IMAGE
================================== */

cameraInput.addEventListener("change", loadImage);
fileInput.addEventListener("change", loadImage);

function loadImage(e){

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(evt){

        img.onload = function(){

            resizeCanvas();

            imageLoaded = true;

            resetMarkers();

            draw();

        }

        img.src = evt.target.result;
    }

    reader.readAsDataURL(file);
}

/* ==================================
   CANVAS SIZE
================================== */

function resizeCanvas(){

    const container =
    document.getElementById("canvasContainer");

    const maxWidth =
    container.parentElement.clientWidth;

    const maxHeight =
    window.innerHeight * 0.6;

    const ratio = Math.min(
        maxWidth / img.width,
        maxHeight / img.height
    );

    const w = img.width * ratio;
    const h = img.height * ratio;

    canvas.width = w;
    canvas.height = h;

    container.style.height =
    h + "px";

    draw();
}

window.addEventListener(
    "resize",
    resizeCanvas
);

/* ==================================
   RESET MARKER
================================== */

function resetMarkers(){

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    hvsMarkers = [
        {x:cx-22,y:cy-15},
        {x:cx+22,y:cy-15},
        {x:cx+22,y:cy+15},
        {x:cx-22,y:cy+15}
    ];

    const bodyHalfLength = canvas.width * 0.12;

    bodyMarkers = [
        {x:cx-bodyHalfLength,y:cy},
        {x:cx+bodyHalfLength,y:cy}
];
}

/* ==================================
   DRAW
================================== */

function draw(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if(!imageLoaded) return;

    drawImageContain();

    drawHVS();

    drawBody();

    calculate();
}

/* ==================================
   DRAW IMAGE
================================== */

function drawImageContain(){

    let ratio = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
    );

    let w = img.width * ratio;
    let h = img.height * ratio;

    let x = (canvas.width - w) / 2;
    let y = (canvas.height - h) / 2;

    ctx.drawImage(
        img,
        x,
        y,
        w,
        h
    );
}

/* ==================================
   DRAW HVS
================================== */

function drawHVS(){

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        hvsMarkers[0].x,
        hvsMarkers[0].y
    );

    hvsMarkers.forEach(p=>{
        ctx.lineTo(p.x,p.y);
    });

    ctx.closePath();

    ctx.stroke();

    hvsMarkers.forEach(p=>{
        drawPoint(
            p.x,
            p.y,
            "#22c55e"
        );
    });
}

/* ==================================
   DRAW BODY
================================== */

function drawBody(){

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(
        bodyMarkers[0].x,
        bodyMarkers[0].y
    );

    ctx.lineTo(
        bodyMarkers[1].x,
        bodyMarkers[1].y
    );

    ctx.stroke();

    bodyMarkers.forEach(p=>{
        drawPoint(
            p.x,
            p.y,
            "#ef4444"
        );
    });
}

/* ==================================
   DRAW MARKER
================================== */

function drawPoint(
    x,
    y,
    color
){

    /* Lingkaran transparan */

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        14,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = color;

    ctx.globalAlpha = 0.35;

    ctx.fill();

    /* Outline */

    ctx.globalAlpha = 1;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.stroke();

    /* Titik pusat */

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        3,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";

    ctx.fill();
}

/* ==================================
   DISTANCE
================================== */

function distance(a,b){

    return Math.sqrt(
        Math.pow(b.x-a.x,2)
        +
        Math.pow(b.y-a.y,2)
    );
}

/* ==================================
   MIDPOINT DETECTION
================================== */

/* BODY midpoint (garis panjang badan) */
function getBodyMidpoint(){
    return {
        x: (bodyMarkers[0].x + bodyMarkers[1].x) / 2,
        y: (bodyMarkers[0].y + bodyMarkers[1].y) / 2
    };
}

/* HVS center (4 titik kotak HVS) */
function getHVSCenter(){
    let cx = 0, cy = 0;

    hvsMarkers.forEach(p=>{
        cx += p.x;
        cy += p.y;
    });

    return {
        x: cx / 4,
        y: cy / 4
    };
}

/* ==================================
   CALCULATE
================================== */

function calculate(){

    const hvsPixelWidth =
    distance(
        hvsMarkers[0],
        hvsMarkers[1]
    );

    if(hvsPixelWidth < 10) return;

    /*
    HVS A4 Landscape
    29.7 cm
    */

    const cmPerPixel =
    29.7 / hvsPixelWidth;

    const pbPixel =
    distance(
        bodyMarkers[0],
        bodyMarkers[1]
    );

    const pb =
    pbPixel * cmPerPixel;

    const ld =
    parseFloat(
        ldInput.value
    ) || 0;

    const bb =
    (
        Math.pow(ld,2)
        *
        pb
    ) / 10815.15;

    pbText.innerHTML =
    pb.toFixed(1) + " cm";

    bbText.innerHTML =
    bb.toFixed(1) + " kg";
}

/* ==================================
   INPUT LINGKAR DADA
================================== */

ldInput.addEventListener(
    "input",
    calculate
);

/* ==================================
   FIND MARKER
================================== */

function getMarker(x,y){

    // 1. cek titik (POINT DRAG)
    let all = [
        ...hvsMarkers,
        ...bodyMarkers
    ];

    for(let i=0;i<all.length;i++){
        let p = all[i];

        let d = Math.hypot(x-p.x, y-p.y);

        if(d < 30){
            return {
                type: "point",
                ref: p
            };
        }
    }

    // 2. cek BODY MIDPOINT (MOVE LINE)
    let bm = getBodyMidpoint();
    if(Math.hypot(x-bm.x, y-bm.y) < 35){
        return {
            type: "move-body"
        };
    }

    // 3. cek HVS CENTER (MOVE SHAPE)
    let hc = getHVSCenter();
    if(Math.hypot(x-hc.x, y-hc.y) < 40){
        return {
            type: "move-hvs"
        };
    }

    return null;
}

/* ==================================
   POSITION
================================== */

function getPos(e){

    const rect =
    canvas.getBoundingClientRect();

    if(e.touches){

        return{
            x:e.touches[0].clientX-rect.left,
            y:e.touches[0].clientY-rect.top
        };
    }

    return{
        x:e.clientX-rect.left,
        y:e.clientY-rect.top
    };
}

/* ==================================
   DRAG
================================== */

function startDrag(e){

    e.preventDefault();

    const pos = getPos(e);

    const hit = getMarker(pos.x, pos.y);

    if(!hit) return;

    lastPos = pos;

    if(hit.type === "point"){
        dragMode = "point";
        activeMarker = hit.ref;
        activeShape = null;
    }

    else if(hit.type === "move-body"){
        dragMode = "move";
        activeShape = "body";
    }

    else if(hit.type === "move-hvs"){
        dragMode = "move";
        activeShape = "hvs";
    }
}

function drag(e){

    const pos = getPos(e);

    if(!lastPos) lastPos = pos;

    const dx = pos.x - lastPos.x;
    const dy = pos.y - lastPos.y;

    // POINT DRAG
    if(dragMode === "point" && activeMarker){
        activeMarker.x = pos.x;
        activeMarker.y = pos.y;
    }

    // MOVE BODY LINE
    if(dragMode === "move" && activeShape === "body"){
        bodyMarkers.forEach(p=>{
            p.x += dx;
            p.y += dy;
        });
    }

    // MOVE HVS SHAPE
    if(dragMode === "move" && activeShape === "hvs"){
        hvsMarkers.forEach(p=>{
            p.x += dx;
            p.y += dy;
        });
    }

    lastPos = pos;
    draw();
}

function stopDrag(){
    activeMarker = null;
    activeShape = null;
    dragMode = "point";
    lastPos = null;
}

/* ==================================
   MOUSE
================================== */

canvas.addEventListener(
    "mousedown",
    startDrag
);

canvas.addEventListener(
    "mousemove",
    drag
);

canvas.addEventListener(
    "mouseup",
    stopDrag
);

canvas.addEventListener(
    "mouseleave",
    stopDrag
);

/* ==================================
   TOUCH
================================== */

canvas.addEventListener(
    "touchstart",
    startDrag,
    {passive:false}
);

canvas.addEventListener(
    "touchmove",
    drag,
    {passive:false}
);

canvas.addEventListener(
    "touchend",
    stopDrag
);

/* ==================================
   SEND DATA
================================== */

document
.getElementById("sendBtn")
.addEventListener(
"click",
function(){

    const ld =
    parseFloat(
        ldInput.value
    ) || 0;

    alert(
        "Panjang Badan : "
        + pbText.innerText
        +
        "\nLingkar Dada : "
        + ld.toFixed(1)
        + " cm"
        +
        "\nEstimasi Bobot : "
        + bbText.innerText
    );

});