// const font = "12pt Courier";
const font = "8pt Courier";
const fontMed = "10pt Courier";
const fontLg = "12pt Courier";
var windTextColor = "#000000";
function drawCloudLayer(canvas, cloud, segSize, iteration) {
    var context = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;

    context.fillStyle = "lightblue";
    context.fillRect(0, segSize*iteration, w, segSize);

    if(cloud.code == "OVC") {
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, (segSize*iteration), w, segSize);
        // context.strokeStyle	= "#000000";
        // context.strokeRect(0, (segSize*iteration), w, segSize);
    }
    if(cloud.code == "BKN") {
        let cloudCount=12;
        let cloudSpacing = w/cloudCount;
        let drawCloud = true;	

        for(let i=(cloudSpacing*0.50);i<w;i+=cloudSpacing) {

            if(drawCloud) {
                context.fillStyle = "#FFFFFF";
                context.fillRect(i, segSize*iteration+(segSize*0.20), cloudSpacing, segSize*0.6);
            }
            drawCloud = !drawCloud;

        }
    }

    if(cloud.code == "SCT") {
        let cloudCount=6;
        let cloudSpacing = w/cloudCount;
        let drawCloud = true;	
        for(let i=(cloudSpacing*0.50);i<w;i+=cloudSpacing) {
            if(drawCloud) {
                context.fillStyle = "#FFFFFF";
                context.fillRect(i, segSize*iteration+(segSize*0.20), cloudSpacing, segSize*0.6);
            }
            drawCloud = !drawCloud;

        }
    }


    if(cloud.code == "FEW") {
        let cloudCount=4;
        let cloudSpacing = w/cloudCount;
        let drawCloud = true;	
        for(let i=(cloudSpacing*0.50);i<w;i+=cloudSpacing) {
            if(drawCloud) {
                context.fillStyle = "#FFFFFF";
                context.fillRect(i, segSize*iteration+(segSize*0.20), cloudSpacing, segSize*0.6);
            }
            drawCloud = !drawCloud;

        }
    }

    context.strokeStyle	= "#000000";
    context.strokeRect(0, (segSize*iteration), w, segSize);

    context.font = font;
    if(cloud.code == "CLR") {
        context.strokeText(cloud.code, w*0.25, segSize*(iteration+1)-(segSize*0.3));
    } else {
        context.strokeText(cloud.feet + " " + cloud.code, w*0.25, segSize*(iteration+1)-(segSize*0.3));

    }
    return canvas;
}

function drawClouds(canvas, clouds) {
    var context = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var wmid = canvas.width/2; //centered horizontally
    var hmid = canvas.height/2; //centered vertically

    if(!clouds.ceiling && !clouds.clouds) {
        context.fillStyle = "lightblue";
        context.fillRect(0, 0, w, hmid-1);

        // context.font = "14pt Courier New";
        context.font = fontMed;
        context.strokeStyle = windTextColor;
        context.strokeText("CLEAR",w*0.30, hmid*0.50);
        return;
    }

    if(clouds.ceiling) {
        context.strokeStyle = "#000000";
        context.moveTo(0,hmid);
        context.lineTo(w,hmid);
        context.stroke();
        // context.font = "14pt Courier New";
        context.font = fontMed;        
        context.strokeStyle = windTextColor;
        context.strokeText(clouds.ceiling.feet,0,hmid+14);
        context.strokeText(clouds.ceiling.code,0,hmid+28);

    }

    let segments = clouds.clouds.length;
    let segSize = hmid/segments
    var iteration = 0;
    clouds.clouds.reverse().forEach((cloud) => {
        canvas = drawCloudLayer(canvas, cloud, segSize, iteration++);
    })
    return canvas;
}

function drawVisibility(canvas, visibility) {
    var context = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    // context.font = "14pt Courier New";
    context.font = fontMed;
    context.strokeStyle = windTextColor;
    context.strokeText(visibility,0,h-4);
    return canvas;

}

function drawTemperature(canvas, tempF) {
    var context = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    // context.font = "14pt Courier New";
    context.font = fontMed;
    context.strokeStyle = windTextColor;
    context.strokeText(tempF,w-25,h-4);
    return canvas;
}


function drawFlightConditions(canvas, flightConditions) {
    console.log("in 'drawFlighrConditions'");
    var context = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var color;
    switch(flightConditions) {
        case "LIFR":
            windTextColor = "#000000";
            color = "#ff00ff";
            break;
        case "MVFR":
            windTextColor = "#FFFFFF";
            color = "#0000ff";
            break;
        case "IFR":
            windTextColor = "#000000";
            color = "#ff0000";
            break;
        case "VFR":
            windTextColor = "#000000";
            color = "#00ff00";
            break;
    }
    context.clearRect(0,0,w,h);
    context.fillStyle = color;
    context.fillRect(0,0,w,h);
    console.log("returning canvas:");
    console.log(canvas);
    return canvas;
}

function normalize(val, max, min, scale) { 
    let ratio = (val - min) / (max - min); 
    ratio = ratio > 1 ? 1 : ratio;
    return  ratio*scale;
}

function drawPieSlice(ctx,centerX, centerY, radius, startAngle, endAngle, color ){
    //convert degrees into radians
    startAngle = startAngle*Math.PI/180;
    endAngle = endAngle*Math.PI/180;
    // console.log("drawing pie slice");
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX,centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = color;

    ctx.fill();
}

function drawWind(canvas, origAngle, speed) {
    console.log("in 'drawWind'");
    console.log("cavas: ", canvas);
    console.log("origAngle: ", origAngle);
    console.log("speed: ", speed);
    var context = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var wmid = canvas.width/2; //centered horizontally
    var hmid = canvas.height*0.75; //bottom 3/4th


    if(speed == 0) {
        // context.font = "18pt Courier New";
        context.font = fontMed;
        context.strokeText("CALM",wmid-30,hmid+20);
        return canvas;

    }

    var maxRadius = h*0.23;	
    // var maxRadius = w<=h ? wmid : hmid;	
    // console.log("max radius: " + maxRadius);

    var actualRadius = normalize(speed, 20, 0, maxRadius);
    actualRadius = maxRadius;

    // console.log("normalized radius from " + speed + " :	" + actualRadius);

    var angle
    if(origAngle >= 90) {
        angle = origAngle-90;
    } else {
        angle = 360-(90-origAngle);
    }
    // console.log("shifted angle (-90): " + angle);

    //these are degrees
    var arcLeft = angle-10;
    var arcRight = angle+10;
    var angleAdjust = 2.5;
    if(speed >= 5) { angleAdjust = 8;}
    if(speed >= 10) { angleAdjust = 10;}
    if(speed >= 15) { angleAdjust = 12.5;}
    if(speed > 20) { angleAdjust = 15;}


    arcLeft = angle-angleAdjust;
    arcRight = angle+angleAdjust;
    // arcLeft = normalize(angle, 15, 0, spee)*-1;
    // arcRight = normalize(angle, 15, 0, 15);

    let flagColor = "#00ff00";
    if(speed>10) flagColor = "#ffff00";
    if(speed>20) flagColor = "#ff0000";
    drawPieSlice(context, wmid, hmid,actualRadius, arcLeft, arcRight, flagColor);


    context.font = font;
    oppositeAngle = origAngle > 180 ? origAngle - 180 : 360-(180-origAngle);
    let info = origAngle + "@" + speed;
    let textOffset = 0.10;
    context.strokeStyle = windTextColor;
    if(oppositeAngle >= 0 && oppositeAngle < 90) {
        context.strokeText(info, wmid+(wmid*textOffset), hmid-(hmid*textOffset));
    }
    if(oppositeAngle >= 90 && oppositeAngle < 180) {
        context.strokeText(info, wmid+(wmid*textOffset), hmid+(hmid*textOffset));
    }
    if(oppositeAngle >= 180 && oppositeAngle < 270) {
        context.strokeText(info, wmid-(wmid*textOffset), hmid+(hmid*textOffset)+5);
    }
    if(oppositeAngle >= 270 && oppositeAngle <= 360) {
        context.strokeText(info, wmid-(wmid*textOffset), hmid-(hmid*textOffset));
    }
    console.log("returning canvas after adding wind");
    console.log(canvas);
    return canvas;
}


function metarData(canvas, windAngle, windSpeed, flightConditions, cloudData, visibility, tempF) {
    console.log("processing metar data and drawing canvas");
    canvas = drawFlightConditions(canvas, flightConditions);
    console.log("in metardata, after flight conditions.  canvas: ", canvas);
    canvas = drawWind(canvas, windAngle, windSpeed);
    canvas = drawTemperature(canvas, tempF);
    canvas = drawClouds(canvas, cloudData);
    canvas = drawVisibility(canvas, visibility);
    return canvas;
}


function fetchAndPublishMetar(context, icao, apiKey, callback) {

    if(icao == undefined || apiKey == undefined) {
        console.log("trying to fetch metar but icao or key is missing");
        return;
    }
 
    const fetchPromise = fetch("https://api.checkwx.com/metar/" + icao + "/decoded", 
        {method: 'GET', headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json'}});

    fetchPromise
        .then( response => {
            if(response.ok) {
                return response.json();
            } else {
                throw new Error({error:{message:"Request Error"}})
            }
        })
        .then( json => {
            console.log("request data as follows json/context:", json, context)
            return json
        })
        .then (response => {
            callback(context, response);
        })
        .catch (error => {
            console.log(error)
        });


}