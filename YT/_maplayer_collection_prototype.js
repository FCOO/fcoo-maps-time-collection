

        /**********************************************************
        getLayerOptions
        **********************************************************/
        getLayerOptions: function(options){

            return {};


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


                    content  : '<img width="100%" src="https://staging.fcooapp.com/webmap/v3/collections/weather-combined/wms?request=GetColorbar&styles=horizontal,nolabel&cmap=Wind_ms_BGYRP_11colors">'


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



