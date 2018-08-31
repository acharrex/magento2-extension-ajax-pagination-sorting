<?php
/**
 * Copyright © Shopigo. All rights reserved.
 * See LICENSE.txt for license details (http://opensource.org/licenses/osl-3.0.php).
 */

namespace Shopigo\CatalogAjaxToolbar\Plugin\Catalog\Product\ProductList;

use Magento\Catalog\Block\Product\ProductList\Toolbar;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;
use Shopigo\CatalogAjaxToolbar\Helper\Data as DataHelper;

class ToolbarPlugin
{
    /**
     * Config paths
     */
    const XML_PATH_AJAX_REQUEST_TIMEOUT   = 'shopigo_catalogajaxtoolbar/general/ajax_request_timeout';
    const XML_PATH_SCROLL_TO_TOP_ENABLED  = 'shopigo_catalogajaxtoolbar/general/scroll_to_top_enabled';
    const XML_PATH_SCROLL_TO_TOP_EASING   = 'shopigo_catalogajaxtoolbar/general/scroll_to_top_easing';
    const XML_PATH_SCROLL_TO_TOP_DURATION = 'shopigo_catalogajaxtoolbar/general/scroll_to_top_duration';
    const XML_PATH_SCROLL_TO_TOP_OFFSET   = 'shopigo_catalogajaxtoolbar/general/scroll_to_top_offset';

    /**
     * @var DataHelper
     */
    protected $dataHelper;

    /**
     * @var ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * Initialize dependencies
     *
     * @param DataHelper $dataHelper
     * @param ScopeConfigInterface $scopeConfig
     * @return void
     */
    public function __construct(
        DataHelper $dataHelper,
        ScopeConfigInterface $scopeConfig
    ) {
        $this->dataHelper = $dataHelper;
        $this->scopeConfig = $scopeConfig;
    }

    /**
     * Retrieve AJAX request timeout
     *
     * @return int
     */
    protected function getAjaxRequestTimeout()
    {
        return (int)$this->scopeConfig->getValue(
            self::XML_PATH_AJAX_REQUEST_TIMEOUT,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve whether the scroll-to-top is enabled
     *
     * @return int
     */
    protected function getIsScrollToTopEnabled()
    {
        return (int)$this->scopeConfig->isSetFlag(
            self::XML_PATH_SCROLL_TO_TOP_ENABLED,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll-to-top easing
     *
     * @return string
     */
    protected function getScrollToTopEasing()
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_SCROLL_TO_TOP_EASING,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll-to-top easing duration
     *
     * @return int
     */
    protected function getScrollToTopDuration()
    {
        return (int)$this->scopeConfig->getValue(
            self::XML_PATH_SCROLL_TO_TOP_DURATION,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve scroll-to-top offset
     *
     * @return int
     */
    protected function getScrollToTopOffset()
    {
        return (int)$this->scopeConfig->getValue(
            self::XML_PATH_SCROLL_TO_TOP_OFFSET,
            ScopeInterface::SCOPE_STORES
        );
    }

    /**
     * Retrieve widget options in json format
     *
     * @param Toolbar $subject
     * @param array $customOptions Optional parameter for passing custom selectors from template
     * @return string
     */
    public function beforeGetWidgetOptionsJson(
        Toolbar $subject,
        array $customOptions = []
    ) {
        if ($this->dataHelper->isEnabled()) {
            $options = [
                'ajaxLoadingEnabled'  => true,
                'ajaxRequestTimeout'  => $this->getAjaxRequestTimeout(),
                'scrollToTopEnabled'  => $this->getIsScrollToTopEnabled(),
                'scrollToTopEasing'   => $this->getScrollToTopEasing(),
                'scrollToTopDuration' => $this->getScrollToTopDuration(),
                'scrollToTopOffset'   => $this->getScrollToTopOffset()
            ];
        } else {
            $options = [
                'ajaxLoadingEnabled'  => false
            ];
        }

        $customOptions = array_replace_recursive($customOptions, $options);

        return [$customOptions];
    }
}
