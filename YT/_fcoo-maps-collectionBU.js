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
        nsModel      = ns.model = ns.model || {},
        nsCollection = ns.collection = ns.collection || {},

        defaultOptions = {


        };

    //Include creation and loading of collections
    nsCollection.options.includeCollections = true;

    //Set events to update collection
    ns.events.on('TIMERANGECHANGED', (timeRange) => {
        nsCollection.setTimeRange(timeRange.min, timeRange.max);
    });




    /***********************************************************
    MapLayer_Collection_
    A MapLayer that displays layers from a collection
    This is only a parent constructor.
    On top of MapLayer_Collection it is possible to create constructor a la MapLayer_Collection_XXX
    that have specific methods
    ***********************************************************/

    nsCollection.MapLayer_Collection_prototype = {
        /**********************************************************
        construct
        **********************************************************/
        construct: function( options, MapLayer_constructor){
            let o = this.options = options;
            this.id         = o.id;
            this.parameter  = nsParameter.getParameter(o.parameter || o.parameterId || o.id);
            this.collection = this.parameter ? this.parameter.collection : null;

            //this.colorScale = o.cmap || o.scale || o.colorScale;

            if (this.collection)
                this.collection.addOnUpdate( this.update.bind(this) );

            //Extend with default options

            //Extend with methods and options
            options = $.extend(options, {
                onAdd        : this.onAdd.bind(this),
                layerOptions : this.getLayerOptions(),
                legendOptions: this.getLegendOptions(),
/*
menuOptions: {
    buttonList: [{
        icon   : 'far fa-message-middle',
        text   : {da: 'Vis', en: 'Show'},
        title  : {da: 'Vis seneste måling for alle synlige lokationer', en: 'Show latest measurement for all visible locations'},
        class  : 'min-width',
        onClick: this.test,
        context: this,
        onlyShowWhenLayer: true
    }]
}
*/


            }, this.adjustOptions( options ) || {});

            MapLayer_constructor.call(this, options);
        },

        test: function(){
            console.log('>>>', arguments);
        },


        /**********************************************************
        adjustOptions
        **********************************************************/
        adjustOptions: function( options ){
//HER               options = $.extend({
//HER                   method: 'SCALE',
//HER
//HER               }, options);

            return options;
        },

        /**********************************************************
        createLegendContent
        **********************************************************/
        createLegendContent: function( $container ){

            $container.text('Hej');
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
        },

        /**********************************************************
        getLegendOptions
        **********************************************************/
        getLegendOptions: function(){
            let collectionAsModal = function( id, selected, $button, map ){
                this.parameter.collectionAsModal({bounds: map ? map.getBounds() : null});
            }.bind(this);

            return {
                onInfo   : collectionAsModal,
                onWarning: collectionAsModal,
                onAlert  : collectionAsModal,
                onError  : collectionAsModal,
                content  : this.createLegendContent.bind(this),
buttonList: [{text:'Her', onClick: () => console.log(arguments)}]
            };
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




    }



    /***********************************************************
    MapLayer_Collection
    A MapLayer that displays layers from a collection
    This is only a parent constructor.
    On top of MapLayer_Collection it is possible to create constructor a la MapLayer_Collection_XXX
    that have specific methods
    ***********************************************************/
    function MapLayer_Collection(options, MapLayer_constructor){
        this.construct(options, nsMap.MapLayer_time_wms_dynamic);
        //nsCollection.MapLayer_Collection_prototype
    }

    nsMap.MapLayer_Collection = MapLayer_Collection;

    MapLayer_Collection.prototype = Object.create(nsMap.MapLayer_time_wms_dynamic.prototype);
    $.extend(MapLayer_Collection.prototype, nsCollection.MapLayer_Collection_prototype, {

        /**********************************************************
        getLayerOptions
        **********************************************************/
        getLayerOptions: function(){
            let o = this.options;
            //console.log(this);

            let method = 'SCALE';//nsMap.wmsPlotMethod[o.method];

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
















}(jQuery, L, this, document));



