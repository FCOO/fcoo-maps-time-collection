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
        };


















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
    }

    nsMap.MapLayer_Collection_wms = MapLayer_Collection_wms;
    MapLayer_Collection_wms.prototype = Object.create(nsMap.MapLayer_Collection.prototype);

    $.extend( MapLayer_Collection_wms.prototype, {
        subDir     : 'wms',
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
console.log('wms getLayer options', options);
            return {
                cmap: "Wind_ms_BGYRP_11colors_1.1",
dataset: "VNETCDF/DMI/HARMONIE/DMI_NEA_MAPS_v005C.ncv",
                styles: {
                    legend      : "Wind_ms_BGYRP_11colors_1.1",
                    plot_method : "contourf"
                }

            };


        },





    });









}(jQuery, L, this, document));



