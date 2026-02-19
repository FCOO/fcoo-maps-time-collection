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



