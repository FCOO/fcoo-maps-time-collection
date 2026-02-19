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



