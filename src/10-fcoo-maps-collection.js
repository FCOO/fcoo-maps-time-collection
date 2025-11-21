/****************************************************************************
    fcoo-maps-collection.js,

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



