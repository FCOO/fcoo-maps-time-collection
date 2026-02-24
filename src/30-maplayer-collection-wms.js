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





    /**********************************************************************************************************************
    ***********************************************************************************************************************
    MapLayer_Collection_wms
    A MapLayer that displays wms layers from a collection
    ***********************************************************************************************************************
    ***********************************************************************************************************************/
    //wmsOptionsToStyles =  global list of properrties that need to be in styles
    nsMap.wmsOptionsToStyles = ['plot_method', 'vector_spacing', 'vector_offset'];

    function MapLayer_Collection_wms(options){
        nsMap.MapLayer_Collection.call(this, options);
    }

    nsMap.MapLayer_Collection_wms = MapLayer_Collection_wms;
    MapLayer_Collection_wms.prototype = Object.create(nsMap.MapLayer_Collection.prototype);

    $.extend( MapLayer_Collection_wms.prototype, {
        subDir     : 'wms',
        createLayer: nsMap.layer_wms_dynamic,

        adjustOptions: function(options){
            let fallbackOptions = {
                plot_method: 'contourf'
            };

            //Get options if not given directly
            $.each(fallbackOptions, (id, value) => options[id] = options[id] || value );

            options.cmap = options.cmap || options.scale || options.colorScale;

            return options;
        },

        getLayerOptions: function( options ){
            let result = {
                    cmap  : options.cmap,
                    styles: {}
                };

            //"Move" values from options to styles
            nsMap.wmsOptionsToStyles.forEach( id => {
                if (options[id])
                    result.styles[id] = options[id];
            });

            //Set layers for vector-parametre
            if (this.parameter && (this.parameter.type == "vector")){
                if (options.VECTOR_OLD)
                    result.layers = this.parameter.eastward_northward_id;
                else
                    result.layers = this.parameter.speed_direction_id;
            }
            return result;
        },
    });
}(jQuery, L, this, document));



