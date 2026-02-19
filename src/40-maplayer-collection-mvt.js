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



