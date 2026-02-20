/****************************************************************************
    fcoo-maps-time-collectionscollection.js,

    (c) 2025, FCOO

    https://github.com/FCOO/fcoo-maps-time-collection
    https://github.com/FCOO

****************************************************************************/
(function ($, L, window/*, document, undefined*/) {
    "use strict";

    //Create namespaces
    let ns           = window.fcoo = window.fcoo || {},
        nsMap        = ns.map = ns.map || {},
        //nsTime       = nsMap.time = nsMap.time || {},
        //nsParameter  = ns.parameter = ns.parameter || {},
        //nsModel      = ns.model = ns.model || {},
        nsCollection = ns.collection = ns.collection || {};

    //Include creation and loading of collections
    nsCollection.options.includeCollections = true;

    //Set events to update collection
    ns.events.on('TIMERANGECHANGED', (timeRange) => {
        nsCollection.setTimeRange(timeRange.min, timeRange.max);
    });



    //createMapLayer = {MAPLAYER_ID: CREATE_MAPLAYER_AND_MENU_FUNCTION} See fcoo-maps/src/map-layer_00.js for description
    nsMap.createMapLayer = nsMap.createMapLayer || {};

    /***********************************************************
    add_MapLayer_Collection_wms
    ***********************************************************/
    nsMap.add_MapLayer_Collection_wms = function( mapLayerOptions ){
        nsMap.createMapLayer[mapLayerOptions.id] = function(options, addMenu){
            let mapLayer = nsMap._addMapLayer(mapLayerOptions.id, nsMap.MapLayer_Collection_wms, mapLayerOptions );
            addMenu( mapLayer.menuItemOptions() );
        };
    };



}(jQuery, L, this, document));




;
/****************************************************************************
10_maplayer_collection.js
****************************************************************************/
(function ($, L, window, document, undefined) {
    "use strict";

    //Create namespaces
    let ns           = window.fcoo = window.fcoo || {},
        nsMap        = ns.map = ns.map || {},
        nsTime       = nsMap.time = nsMap.time || {},
        nsParameter  = ns.parameter = ns.parameter || {},
        //nsModel      = ns.model = ns.model || {},
        nsCollection = ns.collection = ns.collection || {};


    /**********************************************************************************************************************
    ***********************************************************************************************************************
    MapLayer_Collection
    A MapLayer that displays layers from a collection
    This is only a parent constructor.
    On top of MapLayer_Collection it is possible to create constructor a la MapLayer_Collection_XXX
    that have specific methods and properties
    ***********************************************************************************************************************
    ***********************************************************************************************************************/
    function MapLayer_Collection(options){
        this.id         = options.id;
        this.parameter  = nsParameter.getParameter(options.parameter || options.parameterId || options.id);
        this.collection = this.parameter ? this.parameter.collection : null;

        if (this.collection)
            this.collection.addOnUpdate( this.update.bind(this) );

        //Adjust icon and text. Add prefix and postfix (if any). If not name or text is given use parameters name
        let parameterName       = {da:'Ukendt', en:'Unknown'},
            parameterLegendName = parameterName;
        if (this.parameter){
            parameterName       = this.parameter.getName(false/*inclUnit*/, options.z, options.unit),
            parameterLegendName = this.parameter.getName(true/*inclUnit*/,  options.z, options.unit);
        }

        let name     = options.name || options.text || parameterName,
            nameList = [];
        if (options.prefix) nameList.push(options.prefix);
        nameList.push(name);
        if (options.postfix) nameList.push(options.postfix);
        options.text = ns.combineLang(nameList);


        let legendName = options.legendName || options.legendText || parameterLegendName;
        nameList = [];
        if (options.prefix) nameList.push(options.prefix);
        nameList.push(legendName);
        if (options.postfix) nameList.push(options.postfix);
        options.legendText = ns.combineLang(nameList);





        //Extend with default options

        //Extend with methods and options
        options = $.extend(true, {}, this.defaultOptions, options);
        options = this.adjustOptions( options );

        //Get the zIndex: Eighter as an id (STRING) or a number
        let zIndex = options.zIndex || options.z || options.zIndexId || options.zId,
            delta  = options.deltaZIndex || options.deltaZ || 0;

        if (typeof zIndex == 'string')
            zIndex = nsMap.getZIndex(zIndex, delta);
        else
            if (typeof zIndex == 'number')
                zIndex = zIndex + delta;
        options.zIndex = zIndex || 0;

        options.timeRange = {min: 0, max:12};


        options = $.extend(options, {
            onAdd        : this.onAdd.bind(this),
            layerOptions : this._getLayerOptions(options),
            legendOptions: this._getLegendOptions(options),
        });

        nsMap.MapLayer_time_wms_dynamic.call(this, options);
    }

    nsMap.MapLayer_Collection = MapLayer_Collection;
    MapLayer_Collection.prototype = Object.create(nsMap.MapLayer_time_wms_dynamic.prototype);

    $.extend( MapLayer_Collection.prototype, {

        subDir: 'the sub dir',

        /**********************************************************
        default options
        **********************************************************/
        defaultOptions: {

        },

        /**********************************************************
        createLayer = method to create the layer.
        Default = dynamic wms-layers
        **********************************************************/
        createLayer: nsMap.layer_wms_dynamic,


        /**********************************************************
        adjustOptions
        **********************************************************/
        adjustOptions: function( options ){
            return options;
        },

        /**********************************************************
        _getLayerOptions
        **********************************************************/
        _getLayerOptions: function(options){
            return $.extend(true, {},{
                            url     : this.collection ? this.collection.fullPath + '/' + this.subDir : undefined,
                            dataset : this.collection.id,
                            layers  : this.parameter.id,
                            //zIndex  : this.options.zIndex,
                            zIndex  : options.zIndex,
                            styles  : {}
                        },
                        this.getLayerOptions(options) || {}
                   );
        },

        /**********************************************************
        getLayerOptions
        Extract layerOptions from options
        Overwriten by decending classes
        **********************************************************/
        getLayerOptions: function(/* options */){
            return {};
        },

        /**********************************************************
        _getLegendOptions: Default options
        getLegendOptions : Individuel options
        **********************************************************/
        _getLegendOptions: function(options){
            let collectionAsModal = function( id, selected, $button, map ){
                let modalOptions = {};
                if (map){
                    modalOptions = {
                        bounds      : map.getBounds(),
                        backgroundId: map.backgroundLayerColor ? map.backgroundLayerColor.id : 'standard',
                        time        : map.time.relative || 0
                    };
                }

                if (nsTime.applicationTimeRange)
                    $.extend(modalOptions, {
                        timeRange: [nsTime.applicationTimeRange.currentMin, nsTime.applicationTimeRange.currentMax],
                        timeColor:  {
                            past  : nsTime.pastColorValue,
                            now   : nsTime.nowColorValue,
                            future: nsTime.futureColorValue
                        }
                    });

                /*
                Note:
                The time-range for the collection can be larger that the time-range used in the application
                There are two possible ways:
                A:  Just show the time-range for the collection "as is"
                B:  Adjust the time-range displayed in the info-modal to fit the time-range given in the application.
                    Will need to use the info about current time-range for the current selected time mode
                    nsTime.getCurrentTimeModeData() return
                    TimeModeData = object with methods and data for a specific timeMode
                    TimeModeData.data = {
                        currentMoment   : MOMENT
                        currentRelative : NUMBER
                        min             : NUMBER
                        max             : NUMBER
                        globalMin       : NUMBER
                        globalMax       : NUMBER
                        start           : NUMBER
                        end             : NUMBER
                    }

                OPTION A IS USED!
                */

                modalOptions.header = {icon: options.icon, text: options.text};
                this.collection.asModal(modalOptions);
            }.bind(this);

            return  $.extend(true, {}, {
                            text     : options.legendText,

                            onInfo   : collectionAsModal,
                            onWarning: collectionAsModal,
                            onAlert  : collectionAsModal,
                            onError  : collectionAsModal,
                            content  : this.createLegendContent.bind(this),
                        },
                        this.getLegendOptions(options) || {}
                    );
        },


        //getLegendOptions = extract legendOptions from options
        getLegendOptions: function(/*options*/){
        },

        /**********************************************************
        createLegendContent
        **********************************************************/
        createLegendContent: function( $container ){
            $container.text('Hej');
        },

        /**********************************************************
        onAdd
        **********************************************************/
        onAdd: function( map ){
            this.setCollectionState( map );
        },

        /**********************************************************
        update
        **********************************************************/
        update: function(){
            //Update the timeRange of the mapLayer from the timeRange from the collection
            this.setTimeRange( this.collection.timeRange );

            //Update the state of the collection in legend
            this.setCollectionState();
        },

        /***********************************************************
        setCollectionState
        nsCollection.stateOk   = 1,
        nsCollection.stateWarn = 2,
        nsCollection.stateFail = 3;
        ***********************************************************/
        setCollectionState: function( onlyMap ){
            if (this.info && this.collection){
                let state = nsCollection.stateOk;
                if (this.collection)
                    state = this.collection.state || nsCollection.stateOk;
                this.info.forEach( info => {
                    if (!onlyMap || (onlyMap == info.map)){
                        let legend = info.legend;
                        legend.toggleIcon('info',    state == nsCollection.stateOk  );
                        legend.toggleIcon('warning', state == nsCollection.stateWarn);
                        legend.toggleIcon('alert',   state == nsCollection.stateAlert);
                        legend.toggleIcon('error',   state == nsCollection.stateFail);
                    }
                }, this);
            }
        }
    });

}(jQuery, L, this, document));




;
    /****************************************************************************
maplayer-collection-wms.js,
****************************************************************************/
(function ($, L, window/*, document, undefined*/) {
    "use strict";

    //Create namespaces
    let ns           = window.fcoo = window.fcoo || {},
        nsMap        = ns.map = ns.map || {};
        //nsTime       = nsMap.time = nsMap.time || {},
        //nsParameter  = ns.parameter = ns.parameter || {},
        //nsCollection = ns.collection = ns.collection || {};


    /***********************************************************
    Plot methods
    The different ways to plot a wwms-layer
    ***********************************************************/
    let wmsPlotMethod = nsMap.wmsPlotMethod = {
            'SCALE' : {
                plot_method : 'contourf',
                zIndex      : 'DYNAMIC_SCALE_AIR' ,
                styles      : {},

                desc        : '',

            },
            'VECTOR' : {
                plot_method : 'color_quiver1',  //Wind
                plot_method2: 'color_quiver2',  //Current
                zIndex      : 'DYNAMIC_VECTOR_AIR',
                styles      : {
                    vector_spacing: 80,
                    vector_offset : 20
                },

                desc        : 'Colored vectors'
            },

            'VECTOR2' : {
                plot_method1: 'color_quiver1',  //Wind
                plot_method : 'color_quiver2',  //Current
                zIndex      : '',
                styles      : {
                    vector_spacing: 80,
                    vector_offset : 20
                },

                desc        : 'Colored vectors'
            },
/*
https://wms01.fcoo.dk/webmap/v3/data/VNETCDF/DMI/HARMONIE/DMI_NEA_MAPS_v005C.ncv.wms?service=WMS
request=GetMap
version=1.3.0
layers=UGRD%3AVGRD
styles=plot_method%3Dcolor_quiver1%3Bvector_spacing%3D80%3Bvector_offset%3D20%3Blegend%3DWind_ms_BGYRP_11colors
format=image%2Fpng
transparent=TRUE
cmap=Wind_ms_BGYRP_11colors
width=512
height=512
time=2026-02-19T08%3A00%3A00.000Z
crs=EPSG%3A3857
bbox=626172.1357121639,7514065.628545967,1252344.2714243277,8140237.764258131


https://staging.fcooapp.com/webmap/v3/collections/weather-combined/wms?service=WMS
request=GetMap
layers=wind_speed
styles=plot_method%3Dcontourf
format=image%2Fpng
transparent=TRUE
version=1.3.0
edgeBufferTiles=0
cmap=Wind_ms_BGYRP_11colors
time=2026-02-19T09%3A00%3A00.000Z
width=512
height=512
crs=EPSG%3A3857
bbox=0,8140237.764258131,626172.1357121639,8766409.899970293


seneste
https://staging.fcooapp.com/webmap/v3/collections/weather-combined/wms?service=WMS
request=GetMap
layers=eastward_wind%3Anorthward_wind
styles=plot_method%3Dcontourf%3Bvector_spacing%3D80%3Bvector_offset%3D20
format=image%2Fpng
transparent=TRUE
version=1.3.0
edgeBufferTiles=0
cmap=Wind_ms_BGYRP_11colors
time=2026-02-19T10%3A00%3A00.000Z
width=512
height=512
crs=EPSG%3A3857
bbox=0,7514065.628545967,1252344.2714243277,8766409.899970293


*/
/* WIND DIRECTION
https://staging.fcooapp.com/webmap/v3/collections/weather-combined/wms?SERVICE=WMS
VERSION=1.3.0
REQUEST=GetMap
BBOX=230468.7171987111215%2C6063220.470158413053%2C4518694.621792286634%2C10392531.17383791506
CRS=EPSG%3A3857
WIDTH=835
HEIGHT=843
LAYERS=eastward_wind%3Anorthward_wind
STYLES=
FORMAT=image%2Fpng
DPI=96
MAP_RESOLUTION=96
FORMAT_OPTIONS=dpi%3A96
TRANSPARENT=TRUE

*/



            'DIRECTION_VECTOR' : {
                plot_method : 'black_vector',
                zIndex      : '',
                styles      : {},

                desc        : 'Black vectors'

            },
            'ISOLINE' : {
                plot_method : '',
                zIndex      : '',
                styles      : {},

                desc        : ''
            }
        };


    /**********************************************************************************************************************
    ***********************************************************************************************************************
    MapLayer_Collection_wms
    A MapLayer that displays wms layers from a collection
    ***********************************************************************************************************************
    ***********************************************************************************************************************/
    function MapLayer_Collection_wms(options){
        nsMap.MapLayer_Collection.call(this, options);
    }

    nsMap.MapLayer_Collection_wms = MapLayer_Collection_wms;
    MapLayer_Collection_wms.prototype = Object.create(nsMap.MapLayer_Collection.prototype);

    $.extend( MapLayer_Collection_wms.prototype, {
        subDir     : 'wms',
        createLayer: nsMap.layer_wms_dynamic,

        defaultOptions: {
            method: 'SCALE',
        },

        adjustOptions: function(options){
            this.method = wmsPlotMethod[options.method] || {};

            let fallbackOptions = {
                plot_method: 'contourf'
            };

            //Get options given by method if not given directly
            ['cmap', 'scale', 'colorScale', 'zIndex', 'plot_method'].forEach( id => {
                options[id] = options[id] || this.method[id] || fallbackOptions[id];
            }, this);

            options.cmap = options.cmap || options.scale || options.colorScale;

            return options;
        },

        getLayerOptions: function( options ){
            let result = {
                    cmap: options.cmap,
                    styles: {
                        plot_method : options.plot_method
                    }
                };

            result.styles = $.extend(true, result.styles, this.method.styles || {}, options.styles || {});

            //Set layers for vector-parametre
            if (this.parameter && (this.parameter.type == "vector")){
                if (options.VECTOR_OLD)
                    result.layers = this.parameter.eastward_northward_id;
                else
                    result.layers = this.parameter.speed_direction_id;
            }
//HER   console.log('this.parameter', this.parameter);
//HER   console.log('this.collection', this.collection);
//HER   console.log('=>', result);
            return result;
        },
    });
}(jQuery, L, this, document));




;
/****************************************************************************
maplayer-collection-mvt.js,
****************************************************************************/
(function ($, L, window/*, document, undefined*/) {
    "use strict";

    //Create namespaces
    let ns           = window.fcoo = window.fcoo || {},
        nsMap        = ns.map = ns.map || {};
        //nsTime       = nsMap.time = nsMap.time || {},
        //nsParameter  = ns.parameter = ns.parameter || {},
        //nsCollection = ns.collection = ns.collection || {};


    /**********************************************************************************************************************
    ***********************************************************************************************************************
    MapLayer_Collection_mvt
    A MapLayer that displays mvt layers from a collection (mvt = Mapbox Vector Tile)
    ***********************************************************************************************************************
    ***********************************************************************************************************************/
    function MapLayer_Collection_mvt(options){
        nsMap.MapLayer_Collection.call(this, options);
    }

    nsMap.MapLayer_Collection_mvt = MapLayer_Collection_mvt;
    MapLayer_Collection_mvt.prototype = Object.create(nsMap.MapLayer_Collection.prototype);

    $.extend( MapLayer_Collection_mvt.prototype, {
        subDir: 'mvt',

        createLayer: 'TODO', //nsMap.layer_mvt_dynamic or similar

        defaultOptions: {

        },

        adjustOptions: function(options){
            return options; //TODO
        },

        getLayerOptions: function( /*options*/ ){
            return {}; //TODO

        }


    });



}(jQuery, L, this, document));



