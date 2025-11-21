/****************************************************************************
    fcoo-maps-time-collection.js,

    (c) 2025, FCOO

    https://github.com/FCOO/fcoo-maps-time-collection
    https://github.com/FCOO

****************************************************************************/
(function ($, L, window/*, document, undefined*/) {
    "use strict";

    //Create namespaces
    let ns           = window.fcoo = window.fcoo || {},
        nsMap        = ns.map  = ns.map || {},
        //nsTime       = nsMap.time = nsMap.time || {},
        nsParameter  = ns.parameter = ns.parameter || {};
        //nsModel      = ns.model = ns.model || {};
        //nsCollection = ns.collection = ns.collection || {},

        //defaultOptions = {
        //};








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
            //let collectionAsModal = this.parameter.collectionAsModal.bind(this.parameter);

            //Create color-bar as legend
            //let legend = '';


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
        };
    };




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




/*
         var demo_wind_options = {
                icon: 'fa-map',
                text: {da: 'DMI Vind', en: 'DMI Wind'},


                _legendOptions: {
                    content: 'Her kommer der vektorer og farveskala',
                    //buttons:[{text: 'Button', onClick: function(){console.log(arguments);}}]
                },

                __legendOptions: {
                    content  : '<img width="100%" src="https://staging.fcooapp.com/webmap/v3/collections/weather-combined/wms?request=GetColorbar&styles=horizontal,nolabel&cmap=Wind_ms_BGYRP_11colors">'
                },

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
*/

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














} (jQuery, L, this, document));



