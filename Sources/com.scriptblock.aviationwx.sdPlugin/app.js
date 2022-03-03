/* global $CC, Utils, $SD */

var uuid;

var canvassi = {};
var timers = {};
var settings = {};

/**
 * Here are a couple of wrappers we created to help you quickly setup
 * your plugin and subscribe to events sent by Stream Deck to your plugin.
 */

/**
 * The 'connected' event is sent to your plugin, after the plugin's instance
 * is registered with Stream Deck software. It carries the current websocket
 * and other information about the current environmet in a JSON object
 * You can use it to subscribe to events you want to use in your plugin.
 */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    // Subscribe to the willAppear and other events
    //com.scriptblock.aviationwx.action.taf
    //com.scriptblock.aviationwx.action.metar


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
    let thisCanvas = canvassi[context];
    let scene = metarData(thisCanvas, wxJson.data[0].wind.degrees, wxJson.data[0].wind.speed_kts, wxJson.data[0].flight_category, wxJson.data[0], wxJson.data[0].visibility.miles, wxJson.data[0].temperature.fahrenheit)

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
        // console.log('%c%s', 'color: white; background: red; font-size: 15px;', '[app.js]onDidReceiveSettings:');
        console.log("NZ: received settings from PI");
        this.settings = Utils.getProp(jsn, 'payload.settings', {});
        settings[jsn.context] = jsn.payload.settings;
        var c = canvassi[jsn.context];
        var _drawingCtx = c.getContext("2d");
        _drawingCtx.fillStyle = "#FFFFFF";
        _drawingCtx.fillRect(0,0,c.width, c.height);
    //    $SD.api.setImage(jsn.context, c.toDataURL());

       fetchAndPublishMetar(jsn.context, jsn.payload.settings.icao_code, jsn.payload.settings.api_key, drawImageOnDeck);

        //this.doSomeThing(this.settings, 'onDidReceiveSettings', 'orange');

        /**
         * In this example we put a HTML-input element with id='mynameinput'
         * into the Property Inspector's DOM. If you enter some data into that
         * input-field it get's saved to Stream Deck persistently and the plugin
         * will receive the updated 'didReceiveSettings' event.
         * Here we look for this setting and use it to change the title of
         * the key.
         */

        //  this.setTitle(jsn);
    },

    onWillDisappear: function(jsn) {
        console.log("NZ: on will disappear");
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

    /** 
     * The 'willAppear' event is the first event a key will receive, right before it gets
     * shown on your Stream Deck and/or in Stream Deck software.
     * This event is a good place to setup your plugin and look at current settings (if any),
     * which are embedded in the events payload.
     */

    onWillAppear: function (jsn) {
        console.log("NZ: You can cache your settings in 'onWillAppear'", jsn.payload.settings);
        /**
         * The willAppear event carries your saved settings (if any). You can use these settings
         * to setup your plugin or save the settings for later use. 
         * If you want to request settings at a later time, you can do so using the
         * 'getSettings' event, which will tell Stream Deck to send your data 
         * (in the 'didReceiveSettings above)
         * 
         * $SD.api.getSettings(jsn.context);
        */
        settings[jsn.context] = jsn.payload.settings;
        this.settings = jsn.payload.settings;

        // Nothing in the settings pre-fill, just something for demonstration purposes
        if (!this.settings || Object.keys(this.settings).length === 0) {
            this.settings.mynameinput = 'TEMPLATE';
        }
        //this.setTitle(jsn);
        //NZ: probably do the initial call to the api here
        var _canvas = document.createElement("canvas");
        // _canvas.height = 144;
        // _canvas.width = 144;
        _canvas.height = 98;
        _canvas.width = 98;

        var _drawingCtx = _canvas.getContext("2d");
        _drawingCtx.fillStyle = "#FFFFFF";
        _drawingCtx.fillRect(0,0,_canvas.width, _canvas.height);

        canvassi[jsn.context] = _canvas;

        console.log(this.settings)
        fetchAndPublishMetar(jsn.context, jsn.payload.settings.icao_code, jsn.payload.settings.api_key, drawImageOnDeck);

        // $SD.api.setImage(jsn.context, _canvas.toDataURL());

    },

    onKeyUp: function (jsn) {
        //this.doSomeThing(jsn, 'onKeyUp', 'green');
    },

    onKeyDown: function (jsn) {
        console.log("got key down event from: " + jsn.context);



        fetchAndPublishMetar(jsn.context, jsn.payload.settings.icao_code, jsn.payload.settings.api_key, drawImageOnDeck);

            
    },

    onSendToPlugin: function (jsn) {
        /**
         * This is a message sent directly from the Property Inspector 
         * (e.g. some value, which is not saved to settings) 
         * You can send this event from Property Inspector (see there for an example)
         */ 
        // console.log("NZ: onSendToPlugin");
        // const sdpi_collection = Utils.getProp(jsn, 'payload.sdpi_collection', {});
        // if (sdpi_collection.value && sdpi_collection.value !== undefined) {
        //     //this.doSomeThing({ [sdpi_collection.key] : sdpi_collection.value }, 'onSendToPlugin', 'fuchsia');            
        // }
    },

    /**
     * This snippet shows how you could save settings persistantly to Stream Deck software.
     * It is not used in this example plugin.
     */

    saveSettings: function (jsn, sdpi_collection) {
        console.log('saveSettings:', jsn);
        if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
            if (sdpi_collection.value && sdpi_collection.value !== undefined) {
                this.settings[sdpi_collection.key] = sdpi_collection.value;
                // console.log('NZ: setSettings....', this.settings);
                $SD.api.setSettings(jsn.context, this.settings);
            }
        }
    },

    /**
     * Here's a quick demo-wrapper to show how you could change a key's title based on what you
     * stored in settings.
     * If you enter something into Property Inspector's name field (in this demo),
     * it will get the title of your key.
     * 
     * @param {JSON} jsn // The JSON object passed from Stream Deck to the plugin, which contains the plugin's context
     * 
     */

    // setTitle: function(jsn) {
    //     if (this.settings && this.settings.hasOwnProperty('mynameinput')) {
    //         console.log("watch the key on your StreamDeck - it got a new title...", this.settings.mynameinput);
    //         $SD.api.setTitle(jsn.context, this.settings.mynameinput);
    //     }
    // },

    /**
     * Finally here's a method which gets called from various events above.
     * This is just an idea on how you can act on receiving some interesting message
     * from Stream Deck.
     */

    // doSomeThing: function(inJsonData, caller, tagColor) {
    //     console.log('%c%s', `color: white; background: ${tagColor || 'grey'}; font-size: 15px;`, `[app.js]doSomeThing from: ${caller}`);
    //     // console.log(inJsonData);
    // }, 


};

