/****************************************************************************
    fcoo-maps-collection.js,

    (c) 2025, FCOO

    https://github.com/FCOO/fcoo-maps-time-collection
    https://github.com/FCOO

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
        }
    }



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
        let name     = options.name || options.text || this.parameter.name,
            nameList = [];
        if (options.prefix) nameList.push(options.prefix);
        nameList.push(name);
        if (options.postfix) nameList.push(options.postfix);
        options.text = ns.combineLang(nameList);

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
        //this.zIndex = zIndex || 0;
        options.zIndex = zIndex || 0;


        options = $.extend(options, {
            onAdd        : this.onAdd.bind(this),
            layerOptions : this._getLayerOptions(options),
            legendOptions: this._getLegendOptions(options),
        });

        nsMap.MapLayer.call(this, options);
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

        getDefaultLayerOptions: function(){
            return nsMap.wmsDynamic.options;
        },

        createLayer: 'method to create the layer',

        /**********************************************************
        _createLayer
        Overwrite _createLayer to set url to collection
        **********************************************************/
        _createLayer: function(layerOptions, map){
            let url = this.collection ? this.collection.fullPath + '/' + this.subDir : undefined;
            return this.createLayer.call(this, layerOptions, map, this.getDefaultLayerOptions(), url);
        },



        /**********************************************************
        adjustOptions
        **********************************************************/
        adjustOptions: function( options ){
            return options;
        },

        /**********************************************************
        _getLayerOptions
        getLayerOptions
        **********************************************************/
        _getLayerOptions: function(options){



            return $.extend(true, {},{
                            dataset: this.collection.id,
                            layers : this.parameter.id,
                            //zIndex : this.zIndex,
                            styles : {}
                        },
                        this.getLayerOptions(options) || {}
                   );
        },

        getLayerOptions: function(options){
            //Overwriten by decending classes
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
                    }
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
Contains info about the application time-range
"current" mean for the current selected time mode
    {
        currentMin      : NUMBER = The current relative min time-stamp
        currentMax      : NUMBER = The current relative max time-stamp
        currentMinMoment: MOMENT = The current min time-stamp (Moment)
        currentMaxMoment: MOMENT = The current max time-stamp (Moment)

        min      : NUMBER = The posible relative min time-stamp
        max
    }
*/
//console.log(nsTime);

                modalOptions.header = {icon: options.icon, text: options.text};

                this.collection.asModal(modalOptions);

            }.bind(this);

            return  $.extend(true, {}, {
                            onInfo   : collectionAsModal,
                            onWarning: collectionAsModal,
                            onAlert  : collectionAsModal,
                            onError  : collectionAsModal,
                            content  : this.createLegendContent.bind(this)
                        },
                        this.getLegendOptions(options) || {}
                    );
        },

        getLegendOptions: function(options){
            return options;
            //Overwriten by decending classes
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
                        legend.toggleIcon('info',    true);//state == nsCollection.stateOk  );
                        legend.toggleIcon('warning', true);//state == nsCollection.stateWarn);
                        legend.toggleIcon('alert',   true);//state == nsCollection.stateAlert);
                        legend.toggleIcon('error',   true);//state == nsCollection.stateFail);
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
(function ($, L, window, document, undefined) {
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
                zIndex      : 'DYNAMIC_AIR' ,
                defaultStyle: {},

                desc        : '',

            },
            'VECTOR' : {
                plot_method : 'color_quiver1',  //Wind
                plot_method2: 'color_quiver2',  //Current
                zIndex      : '',
                defaultStyle: {
                    //vector_spacing: 80;
                    //vector_offset : 20;
                },

                desc        : 'Colored vectors'
            },
            'DIRECTION_VECTOR' : {
                plot_method : 'black_vector',
                zIndex      : '',
                defaultStyle: {},

                desc        : 'Black vectors'

            },
            'ISOLINE' : {
                plot_method : '',
                zIndex      : '',
                defaultStyle: {},

                desc        : ''
            }
        }


















    /**********************************************************************************************************************
    ***********************************************************************************************************************
    MapLayer_Collection_wms
    A MapLayer that displays wms layers from a collection
    ***********************************************************************************************************************
    ***********************************************************************************************************************/
    function MapLayer_Collection_wms(options){


        this.colorScale = options.cmap || options.scale || options.colorScale;

        this.method = options.method ? wmsPlotMethod[options.method] || {} : {};


        nsMap.MapLayer_Collection.call(this, options);
    };

    nsMap.MapLayer_Collection_wms = MapLayer_Collection_wms;
    MapLayer_Collection_wms.prototype = Object.create(nsMap.MapLayer_Collection.prototype);

    $.extend( MapLayer_Collection_wms.prototype, {
        subDir: 'wms',
        getDefaultLayerOptions: function(){ return nsMap.wmsDynamic.options; },
        createLayer: nsMap.layer_wms_dynamic,

        defaultOptions: {
            method: 'SCALE'
        },

        adjustOptions: function(options){
            if (this.method){
                options.zIndex = options.zIndex || this.method.zIndex;
            }
            return options;
        },

        getLayerOptions: function( options ){
            return options;


        },





    });









}(jQuery, L, this, document));




;
/****************************************************************************
maplayer-collection-mvt.js,
****************************************************************************/
(function ($, L, window, document, undefined) {
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
    };

    nsMap.MapLayer_Collection_mvt = MapLayer_Collection_mvt;
    MapLayer_Collection_mvt.prototype = Object.create(nsMap.MapLayer_Collection.prototype);

    $.extend( MapLayer_Collection_mvt.prototype, {
        subDir: 'mvt',
        getDefaultLayerOptions: function(){ return 'TODO'; /*nsMap.wmsDynamic.options;*/ },
        createLayer: 'TODO', //nsMap.layer_mvt_dynamic or similar

        defaultOptions: {

        },




    });



}(jQuery, L, this, document));




;
/****************************************************************************
    fcoo-maps-time-collection.js,

    (c) 2025, FCOO

    https://github.com/FCOO/fcoo-maps-time-collection
    https://github.com/FCOO

****************************************************************************/
(function ($, L, window, document, undefined) {
    "use strict";

    //Create namespaces
    let ns           = window.fcoo = window.fcoo || {},
        nsMap        = ns.map  = ns.map || {},
        nsTime       = nsMap.time = nsMap.time || {},
        nsParameter  = ns.parameter = ns.parameter || {},
        nsModel      = ns.model = ns.model || {},
        nsCollection = ns.collection = ns.collection || {},

        defaultOptions = {


        };








    /***********************************************************
    MapLayer_Collection
    A extention of MapLayer_time_wms_dynamic to add layers from Collecctions
    ***********************************************************/
    function MapLayer_Collection(options){
        let o = this.options = options;
        this.id         = o.id;
        this.parameter  = nsParameter.getParameter(o.parameter || o.parameterId || o.id);
        this.collection = this.parameter ? this.parameter.collection : null;



        if (this.collection)
            this.collection.addOnUpdate( this.update.bind(this) );



        nsMap.MapLayer_time_wms_dynamic.call(this, options);
    }

    nsMap.MapLayer_Collection = MapLayer_Collection;

    MapLayer_Collection.prototype = Object.create(nsMap.MapLayer_time_wms_dynamic.prototype);
    $.extend(MapLayer_Collection.prototype, {

        /**********************************************************
        getLayerOptions
        **********************************************************/
        getLayerOptions: function(){
            let o = this.options;

            let method = nsMap.wmsPlotMethod[o.method];

            const defaultOptions = {
                    zIndex : method.zIndex,
                    dataset: this.collection.id,
                    layers : this.parameter.id,
                    cmap   : this.colorScale,

                    styles : $.extend(
                        { plot_method : method.method },
                        method.defaultStyle || {}
                    )
                  };

            let result = $.extend(true, {}, defaultOptions, {
                    zIndex : o.zIndex,
                    dataset: o.dataset,
                    layers : o.layers,
                    cmap   : o.cmap,
                    styles : o.styles || {}
                });


            //Adjist zIndex with delta-z-index (if any)
            result.zIndex = result.zIndex + (o.deltaZIndex || 0);

            return result;
        //
            //demo_wind_options, //TEST
/*
                layerOptions: {
                    zIndex  : 1999,
                    dataset : 'weather-combined',

                    layers  : 'wind_speed',
                    styles  : {
                        plot_method : 'contourf',
                        legend      : 'Wind_ms_BGYRP_11colors_1.1'
                    },
                    cmap    : 'Wind_ms_BGYRP_11colors_1.1',
                },


*/




        },

        /**********************************************************
        getLegendOptions
        **********************************************************/
        getLegendOptions: function(){
            let collectionAsModal = this.parameter.collectionAsModal.bind(this.parameter);

            //Create color-bar as legend
            let legend = '';


/*
        getLegendUrl: function() {
            var params = {
                request: this.legendParams.request,
                styles: this.legendParams.styles,
                cmap: this.legendParams.cmap
            };
            var url = L.Util.getParamString(params);
            return url;
        },

'<img width="100%" src="https://wms01.fcoo.dk/webmap/v3/data/VNETCDF/DMI/HARMONIE/DMI_NEA_MAPS_v005C.ncv.wms?request=GetColorbar&amp;styles=horizontal%2Cnolabel&amp;cmap=Wind_ms_BGYRP_11colors">'
https://staging.fcooapp.com/webmap/v3/collections/weather-combined/wms?request=GetColorbar&styles=horizontal,nolabel&cmap=Wind_ms_BGYRP_11colors
*/

        }
    });


    //createMapLayer = {MAPLAYER_ID: CREATE_MAPLAYER_AND_MENU_FUNCTION} See fcoo-maps/src/map-layer_00.js for description
    nsMap.createMapLayer = nsMap.createMapLayer || {};

    /***********************************************************
    add_MapLayer_Collection

    ***********************************************************/
    nsMap.add_MapLayer_Collection = function( mapLayerOptions ){
        nsMap.createMapLayer[mapLayerOptions.id] = function(options, addMenu){
            let mapLayer = nsMap._addMapLayer(mapLayerOptions.id, MapLayer_Collection, mapLayerOptions );
            addMenu( mapLayer.menuItemOptions() );
        }
    }




    /***********************************************************
    MapLayer_time_wms_metoc

    ***********************************************************/
/*
    function MapLayer_time_wms_metoc(options) {
        //Adjust options

console.log(this);

        nsMap.MapLayer_time_wms_dynamic.call(this, options);

    }
    nsMap.MapLayer_time_wms_metoc = MapLayer_time_wms_metoc;

    MapLayer_time_wms_metoc.prototype = Object.create(nsMap.MapLayer_time_wms_dynamic.prototype);

    $.extend( MapLayer_time_wms_metoc.prototype, {

        //Extend addTo
        addTo: function (_addTo) {
            return function () {

                //New extended code
                //......extra code

                //Original function/method
                _addTo.apply(this, arguments);

                console.log('>>>>>>>>>>>', this);
            }
        } (nsMap.MapLayer_time_wms_dynamic.prototype.addTo),


        //Extend METHOD
        METHOD: function (METHOD) {
            return function () {

                //New extended code
                //......extra code

                //Original function/method
                METHOD.apply(this, arguments);
            }
        } (nsMap.MapLayer.prototype.METHOD),


        //Overwrite METHOD2
        METHOD2: function(){

        },

    });
*/

    /***********************************************************
    Add MapLayer_time_wms_metoc to createMapLayer
    ***********************************************************/
    /*
    nsMap.createMapLayer["METOC"] = function(options, addMenu){

        //adjust default options with options into mapLayerOptions
        let mapLayerOptions = {
                icon: 'fa-map',
                text: {da: 'DMI Vindhastighed (0 til +12)', en: 'DMI Wind speed (0 to +12)'},

                timeRange: {
                    min: 0, max:12
                },
                legendOptions: {
                    onInfo   : () => console.log(arguments),
                    onWarning: () => console.log(arguments),
                    content  : '<img width="100%" src="https://wms01.fcoo.dk/webmap/v3/data/VNETCDF/DMI/HARMONIE/DMI_NEA_MAPS_v005C.ncv.wms?request=GetColorbar&amp;styles=horizontal%2Cnolabel&amp;cmap=Wind_ms_BGYRP_11colors">'
                },
                layerOptions: {
                    dataset : 'VNETCDF/DMI/HARMONIE/DMI_NEA_MAPS_v005C.ncv',
                    layers  : 'windspeed',
                    styles  : {
                        plot_method : 'contourf',
                        legend      : 'Wind_ms_BGYRP_11colors_1.1'
                    },
                    cmap    : 'Wind_ms_BGYRP_11colors_1.1',
                },
            };

        let mapLayer = nsMap._addMapLayer('METOC', nsMap.MapLayer_time_wms_metoc, mapLayerOptions )

        addMenu( mapLayer.menuItemOptions() );
    };
*/





         var demo_wind_options = {
                icon: 'fa-map',
                text: {da: 'DMI Vind', en: 'DMI Wind'},


                _legendOptions: {
                    content: 'Her kommer der vektorer og farveskala',
                    buttons:[{text: 'Button', onClick: function(){console.log(arguments)}}]
                },

                __legendOptions: {
                    onInfo   : () => console.log(arguments),
                    onWarning: () => console.log(arguments),
                    content  : '<img width="100%" src="https://staging.fcooapp.com/webmap/v3/collections/weather-combined/wms?request=GetColorbar&styles=horizontal,nolabel&cmap=Wind_ms_BGYRP_11colors">'
                },

                layerOptions: {
                    zIndex  : 1999,
                    dataset : 'weather-combined',

                    /*
https://staging.fcooapp.com/webmap/v3/collections/weather-combined/wms?
    SERVICE=WMS&
    VERSION=1.3.0&
    REQUEST=GetMap&
    BBOX=-836401.6218197519192%2C4940873.248994147405%2C468245.4488037974807%2C7733217.361884856597&
    CRS=EPSG%3A3857&
    WIDTH=392&
    HEIGHT=839&
    LAYERS=wind_speed&
    STYLES=&
    FORMAT=image%2Fpng&
    DPI=96&
    MAP_RESOLUTION=96&
    FORMAT_OPTIONS=dpi%3A96&
    TRANSPARENT=TRUE

https://wms03.fcoo.dk/webmap/v3/data/VNETCDF/ECMWF/DYSD/ECMWF_DYSD_MAPS_GLOBAL.ncv.wms?
    service=WMS&
    request=GetMap&
    layers=windspeed&
    styles=plot_method%3Dcontourf%3Blegend%3DWind_ms_BGYRP_11colors_1.1&
    format=image%2Fpng&
    transparent=TRUE&
    version=1.3.0&
    edgeBufferTiles=0&
    _dataset=VNETCDF%2FDMI%2FHARMONIE%2FDMI_NEA_MAPS_v005C.ncv&
    cmap=Wind_ms_BGYRP_11colors_1.1&
    time=2025-08-24T01%3A00%3A00.000Z&
    width=512&
    height=512&
    crs=EPSG%3A3857&
    bbox=-10018754.171394622,0,0,10018754.171394628
*/


                    layers  : 'wind_speed',
                    styles  : {
                        plot_method : 'contourf',
                        legend      : 'Wind_ms_BGYRP_11colors_1.1'
                    },
                    cmap    : 'Wind_ms_BGYRP_11colors_1.1',
                },


                _layerOptions: {
                    zIndex: 2001,

                    //maxZoom: 6,

                    //maxZoom: 6,
                    dataset : 'VNETCDF/DMI/HARMONIE/DMI_NEA_MAPS_v005C.ncv',
                    layers  : 'UGRD:VGRD',
                    styles  : {
                        plot_method     : 'color_quiver1',
                        vector_spacing  : 80,
                        vector_offset   : 20,
                        legend          : 'Wind_ms_BGYRP_11colors'
                    },
                    //cmap    : 'Wind_ms_BGYRP_11colors_1.1',
                },
            };
















} (jQuery, L, this, document));



