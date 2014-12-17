// AjaxWebGrid 1.1.0
// (c) Sébastien Ollivier - http://sebastienollivier.fr/blog/asp-net-mvc/plugin-jquery-ajaxwebgrid-1-1-0
(function ($) {
    var ajaxWebGrid = function (element, options) {
        this.settings = $.extend({}, {
            gridActionUrl: "",
            noResultContainerSelector: null,
            sortFieldNameProperty: "sortFieldName",
            sortDirectionProperty: "sortDirection",
            pageIndexProperty: "page",
            addCustomParameters: null,
            refreshGridSuccess: function (data, grid, options) {
                $(grid).replaceWith(data);
                if (options.noResultContainerSelector) {
                    $(options.noResultContainerSelector).replaceWith(data);
                }
            },
            refreshGridFailed: null
        }, options);

        this.grid = element;
        var self = this;

        $($(this.grid).parent()).on("click", this.grid.selector + ' thead a, ' + this.grid.selector + ' tfoot a', function (e) {
            e.preventDefault();
            var queryString = $(this).attr("href").substr($(this).attr("href").indexOf("?") + 1);

            self.refreshGrid(queryString);
        });
    };

    ajaxWebGrid.prototype = function () {
        var getQueryStringValues = function (queryString) {
            var result = {};
            if (!queryString) {
                return result;
            }

            var queryStringSplitted = queryString.split('&');

            for (var i = 0; i < queryStringSplitted.length; i++) {
                var elements = queryStringSplitted[i].split('=');
                var parameterKey = elements[0];
                var parameterValue = elements[1];

                if (!result[parameterKey]) {
                    result[parameterKey] = parameterValue;
                }
            }

            return result;
        };

        var getParameters = function (queryStringValues) {
            var parameters = {};

            parameters[this.settings.sortFieldNameProperty] = queryStringValues[this.settings.sortFieldNameProperty];
            parameters[this.settings.sortDirectionProperty] = queryStringValues[this.settings.sortDirectionProperty];
            parameters[this.settings.pageIndexProperty] = queryStringValues[this.settings.pageIndexProperty];

            if (this.settings.addCustomParameters) {
                var customParameters = this.settings.addCustomParameters();

                for (var parameterName in customParameters) {
                    if (customParameters.hasOwnProperty(parameterName)) {
                        parameters[parameterName] = customParameters[parameterName];
                    }
                }
            }

            return parameters;
        };

        var makeAjaxCall = function (parameters) {
            var self = this;
            $.ajax({
                url: self.settings.gridActionUrl,
                type: "GET",
                data: parameters,
                dataType: "html",
                success: function (data) {
                    if (self.settings.refreshGridSuccess) {
                        self.settings.refreshGridSuccess(data, $(self.grid.selector), self.settings);
                    }

                    $(self.grid.selector).data('ajaxWebGrid', self);

                    if (self.settings.noResultContainerSelector) {
                        $(self.settings.noResultContainerSelector).data('ajaxWebGrid', self);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (self.settings.refreshGridFailed) {
                        self.settings.refreshGridFailed(XMLHttpRequest, textStatus, errorThrown, $(self.grid.selector), self.settings);
                    }
                }
            });
        };

        var refreshGrid = function (queryString) {
            var queryStringValues = getQueryStringValues.call(this, queryString);
            var parameters = getParameters.call(this, queryStringValues);

            makeAjaxCall.call(this, parameters);
        };

        return {
            refreshGrid: refreshGrid
        };
    }();
           
    $.fn.asAjaxWebGrid = function (options) {
        var newAjaxWebGrid = new ajaxWebGrid(this, options);
        $(this).data('ajaxWebGrid', newAjaxWebGrid);

        return this;
    };
} (jQuery));