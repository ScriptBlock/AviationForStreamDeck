/* global $CC, Utils, $SD */

var uuid;

var canvassi = {};
var timers = {};
var settings = {};


$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {


    $SD.on('com.scriptblock.aviationwx.action.metar.willDisappear', (jsonObj) => action.onWillDisappear(jsonObj));
    $SD.on('com.scriptblock.aviationwx.action.metar.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('com.scriptblock.aviationwx.action.metar.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
    $SD.on('com.scriptblock.aviationwx.action.metar.keyDown', (jsonObj) => action.onKeyDown(jsonObj));
    $SD.on('com.scriptblock.aviationwx.action.metar.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
    $SD.on('com.scriptblock.aviationwx.action.metar.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('com.scriptblock.aviationwx.action.metar.propertyInspectorDidAppear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
    });
    $SD.on('com.scriptblock.aviationwx.action.metar.propertyInspectorDidDisappear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: red; font-size: 13px;', '[app.js]propertyInspectorDidDisappear:');
    });
};


function drawImageOnDeck(context, wxJson) {
    if(timers[context]) {
        console.log("found timer context for : " + context)
        clearTimeout(timers[context]);
        delete timers[context];
    }

    console.log("in drawImageOnDeck callback");
    console.log("with context: ", context);
    let thisCanvas = canvassi[context];
    let windDegrees = 0;
    let windSpeed = 0;
    if(wxJson.data[0].wind != undefined) {
        windDegrees = wxJson.data[0].wind.degrees;
        windSpeed = wxJson.data[0].wind.speed_kts;
    }
    let scene = metarData(thisCanvas, windDegrees, windSpeed, wxJson.data[0].flight_category, wxJson.data[0], wxJson.data[0].visibility.miles, wxJson.data[0].temperature.fahrenheit)

    $SD.api.setImage(context, scene.toDataURL());

    timers[context] = setTimeout(() => {
        console.log("settimeout executing for : " + context)
        fetchAndPublishMetar(context, settings[context].icao_code, settings[context].api_key, drawImageOnDeck)
    }, 600000);

}

// ACTIONS

const action = {
    settings:{},
    onDidReceiveSettings: function(jsn) {
        this.settings = Utils.getProp(jsn, 'payload.settings', {});
        settings[jsn.context] = jsn.payload.settings;
        var c = canvassi[jsn.context];
        var _drawingCtx = c.getContext("2d");
        _drawingCtx.fillStyle = "#FFFFFF";
        _drawingCtx.fillRect(0,0,c.width, c.height);

       fetchAndPublishMetar(jsn.context, jsn.payload.settings.icao_code, jsn.payload.settings.api_key, drawImageOnDeck);

    },

    onWillDisappear: function(jsn) {
        try {
            delete settings[jsn.context];
        } catch {
            console.log("no settings context to delete");
        }

        try {
            if(timers[jsn.context]) {
                console.log("clearing active timer for : " + jsn.context);
                clearTimeout(timers[jsn.context]);
            } else {
                console.log("there is no timer for the disappearing context");
            }
        } catch {
            console.log("error during timer logic");
        }
    },


    onWillAppear: function (jsn) {
        settings[jsn.context] = jsn.payload.settings;
        this.settings = jsn.payload.settings;

        // Nothing in the settings pre-fill, just something for demonstration purposes
        if (!this.settings || Object.keys(this.settings).length === 0) {
            this.settings.mynameinput = 'TEMPLATE';
        }
        var _canvas = document.createElement("canvas");
        _canvas.height = 98;
        _canvas.width = 98;

        var _drawingCtx = _canvas.getContext("2d");
        _drawingCtx.fillStyle = "#FFFFFF";
        _drawingCtx.fillRect(0,0,_canvas.width, _canvas.height);

        canvassi[jsn.context] = _canvas;

        console.log(this.settings)
        fetchAndPublishMetar(jsn.context, jsn.payload.settings.icao_code, jsn.payload.settings.api_key, drawImageOnDeck);

    },

    onKeyUp: function (jsn) {
        //this.doSomeThing(jsn, 'onKeyUp', 'green');
    },

    onKeyDown: function (jsn) {
        fetchAndPublishMetar(jsn.context, jsn.payload.settings.icao_code, jsn.payload.settings.api_key, drawImageOnDeck);
    },

    onSendToPlugin: function (jsn) {
    },


    saveSettings: function (jsn, sdpi_collection) {
        console.log('saveSettings:', jsn);
        if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
            if (sdpi_collection.value && sdpi_collection.value !== undefined) {
                this.settings[sdpi_collection.key] = sdpi_collection.value;
                $SD.api.setSettings(jsn.context, this.settings);
            }
        }
    },



};

