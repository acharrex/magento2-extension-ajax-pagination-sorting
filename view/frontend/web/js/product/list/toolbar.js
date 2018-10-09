/**
 * Copyright © Shopigo. All rights reserved.
 * See LICENSE.txt for license details (http://opensource.org/licenses/osl-3.0.php).
 */

define([
    'jquery',
    'Magento_Ui/js/modal/alert',
    'mage/translate',
    'jquery/ui'
], function ($, alert) {
    /**
     * ProductListToolbarForm Widget
     *
     * This widget is submitting form in AJAX according to toolbar controls
     */
    $.widget('mage.productListToolbarForm', {
        /**
         * Widget options
         */
        options:
        {
            modeControl: '[data-role="mode-switcher"]',
            directionControl: '[data-role="direction-switcher"]',
            orderControl: '[data-role="sorter"]',
            limitControl: '[data-role="limiter"]',
            pagerControl: '[data-role="pager"]',
            mode: 'product_list_mode',
            direction: 'product_list_dir',
            order: 'product_list_order',
            limit: 'product_list_limit',
            pager: 'p',
            modeDefault: 'grid',
            directionDefault: 'asc',
            orderDefault: 'position',
            limitDefault: '9',
            pagerDefault: '1',
            contentContainer: '.column.main',
            sidebarMainContainer: '.sidebar-main',
            url: '',
            ajaxRequestTimeout: 10000, // in milliseconds
            scrollToTopEnabled: 1,
            scrollToTopEasing: 'swing',
            scrollToTopDuration: 1200, // in milliseconds
            scrollToTopOffset: 20 // in pixels
        },

        /**
         * Bind elements when the class is instantiated
         *
         * @return void
         */
        _create: function () {
            this._bind($(this.element).find(this.options.modeControl), this.options.mode, this.options.modeDefault);
            this._bind($(this.element).find(this.options.directionControl), this.options.direction, this.options.directionDefault);
            this._bind($(this.element).find(this.options.orderControl), this.options.order, this.options.orderDefault);
            this._bind($(this.element).find(this.options.limitControl), this.options.limit, this.options.limitDefault);
            this._bind($(this.element).find(this.options.pagerControl), this.options.pager, this.options.pagerDefault);
        },

        /**
         * Bind an element
         *
         * @param object element
         * @param string paramName
         * @param string defaultValue
         * @return void
         */
        _bind: function (element, paramName, defaultValue) {
            if (element.is('select')) {
                element.on('change', { paramName: paramName, default: defaultValue }, $.proxy(this.processSelect, this));
            } else {
                element.on('click', { paramName: paramName, default: defaultValue }, $.proxy(this.processLink, this));
            }
        },

        /**
         * Process event on link
         *
         * @param event event
         * @return void
         */
        processLink: function (event) {
            event.preventDefault();
            if (this.options.ajaxLoadingEnabled) {
                this.ajaxSubmit(
                    event.data.paramName,
                    $(event.currentTarget).data('value'),
                    event.data.default
                );
            } else {
                this.changeUrl(
                    event.data.paramName,
                    $(event.currentTarget).data('value'),
                    event.data.default
                );
            }
        },

        /**
         * Process event on select
         *
         * @param event event
         * @return void
         */
        processSelect: function (event) {
            event.preventDefault();
            if (this.options.ajaxLoadingEnabled) {
                this.ajaxSubmit(
                    event.data.paramName,
                    event.currentTarget.options[event.currentTarget.selectedIndex].value,
                    event.data.default
                );
            } else {
                this.changeUrl(
                    event.data.paramName,
                    event.currentTarget.options[event.currentTarget.selectedIndex].value,
                    event.data.default
                );
            }
        },
        
        /**
         * Prepare URL parameters
         *
         * @param array urlParams
         * @param string paramName
         * @param string paramValue
         * @param string defaultValue
         * @return void
         */
        prepareParams: function (urlParams, paramName, paramValue, defaultValue) {
            var paramData = {},
                parameters;

            for (var i = 0; i < urlParams.length; i++) {
                parameters = urlParams[i].split('=');
                if (parameters[1] !== undefined) {
                    paramData[parameters[0]] = parameters[1];
                } else {
                    paramData[parameters[0]] = '';
                }
            }
            
            paramData[paramName] = paramValue;
            if (paramValue == defaultValue) {
                delete paramData[paramName];
            }

            return window.decodeURIComponent($.param(paramData).replace(/\+/g, '%20'));
        },
        
        /**
         * Update content and init all components defined via the data-mage-init
         * attribute
         *
         * @param array html HTML content
         * @return void
         */
        updateContent: function (html) {
            if (html.content) {
                // Remove all products wrappers except the first one
                $(this.options.contentContainer).slice(1).remove();
            
                // Update content
                $(this.options.contentContainer)
                    .html(html.content)
                    .trigger('contentUpdated');
            }
            
            if (html.sidebar_main) {
                $(this.options.sidebarMainContainer)
                    .empty()
                    .html(html.sidebar_main)
                    .trigger('contentUpdated');
            }
        },
        
        /**
         * Replace the browser URL
         *
         * @param string url
         * @param object paramData
         * @return void
         */
        replaceBrowserUrl: function (url, paramData) {
            if (!url) {
                return;
            }
            if (paramData.length > 0) {
                url += '?' + paramData;
            }

            if (typeof history.replaceState === 'function') {
                history.replaceState(null, null, url);
            }
        },
        
        /**
         * Scroll to the top of the content container and update content
         *
         * @param array html HTML content
         * @return void
         */
        scrollAndUpdateContent: function (html) {
            if (this.options.scrollToTopEnabled) {
                $('html, body').animate(
                    {
                        scrollTop: $(this.options.contentContainer).offset().top - this.options.scrollToTopOffset
                    },
                    this.options.scrollToTopDuration,
                    this.options.scrollToTopEasing,
                    this.updateContent(html)
                );
            } else {
                this.updateContent(html);
            }
        },

        /**
         * Submit AJAX request
         *
         * @param string paramName
         * @param string paramValue
         * @param string defaultValue
         * @return void
         */
        ajaxSubmit: function (paramName, paramValue, defaultValue) {
            var urlPaths = this.options.url.split('?'),
                baseUrl = urlPaths[0],
                urlParams = urlPaths[1] ? urlPaths[1].split('&') : [],
                paramData = this.prepareParams(urlParams, paramName, paramValue, defaultValue);
            
            var self = this;
            
            $.ajax({
                url: baseUrl,
                data: (paramData.length > 0 ? paramData + '&ajax=1' : 'ajax=1'),
                type: 'get',
                dataType: 'json',
                cache: true,
                showLoader: true,
                timeout: this.options.ajaxRequestTimeout
            }).done(function (response) {
                if (response.success) {
                    self.replaceBrowserUrl(baseUrl, paramData);
                    self.scrollAndUpdateContent(response.html);
                } else {
                    var msg = response.error_message;
                    if (msg) {
                        alert({
                            content: $.mage.__(msg)
                        });
                    }
                }
            }).fail(function (error) {
                alert({
                    content: $.mage.__('Sorry, something went wrong. Please try again later.')
                });
                console.log(JSON.stringify(error));
            });
        },

        /**
         * Change the current URL
         *
         * @param string paramName
         * @param string paramValue
         * @param string defaultValue
         * @return void
         */
        changeUrl: function (paramName, paramValue, defaultValue) {
            var urlPaths = this.options.url.split('?'),
                baseUrl = urlPaths[0],
                urlParams = urlPaths[1] ? urlPaths[1].split('&') : [],
                paramData = this.prepareParams(urlParams, paramName, paramValue, defaultValue);

            location.href = baseUrl + (paramData.length ? '?' + paramData : '');
        }
    });

    return $.mage.productListToolbarForm;
});
