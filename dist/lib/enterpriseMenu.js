// ag-grid-enterprise v6.1.0
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var columnSelectPanel_1 = require("./toolPanel/columnsSelect/columnSelectPanel");
var aggFuncService_1 = require("./aggregation/aggFuncService");
var svgFactory = main_1.SvgFactory.getInstance();
var EnterpriseMenuFactory = (function () {
    function EnterpriseMenuFactory() {
    }
    EnterpriseMenuFactory.prototype.showMenuAfterMouseEvent = function (column, mouseEvent) {
        var _this = this;
        this.showMenu(column, function (menu) {
            _this.popupService.positionPopupUnderMouseEvent({
                mouseEvent: mouseEvent,
                ePopup: menu.getGui()
            });
        });
    };
    EnterpriseMenuFactory.prototype.showMenuAfterButtonClick = function (column, eventSource) {
        var _this = this;
        this.showMenu(column, function (menu) {
            _this.popupService.positionPopupUnderComponent({ eventSource: eventSource,
                ePopup: menu.getGui(),
                nudgeX: -9,
                nudgeY: -26,
                minWidth: menu.getMinWidth(),
                keepWithinBounds: true
            });
        });
    };
    EnterpriseMenuFactory.prototype.showMenu = function (column, positionCallback) {
        var _this = this;
        var menu = new EnterpriseMenu(column, this.lastSelectedTab);
        this.context.wireBean(menu);
        var eMenuGui = menu.getGui();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(eMenuGui, true, function () { return menu.destroy(); });
        positionCallback(menu);
        menu.afterGuiAttached({
            hidePopup: hidePopup
        });
        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, function (event) {
            _this.lastSelectedTab = event.key;
        });
    };
    EnterpriseMenuFactory.prototype.isMenuEnabled = function (column) {
        var showColumnPanel = !this.gridOptionsWrapper.isSuppressMenuColumnPanel();
        var showMainPanel = !this.gridOptionsWrapper.isSuppressMenuMainPanel();
        var showFilterPanel = !this.gridOptionsWrapper.isSuppressMenuFilterPanel() && column.isFilterAllowed();
        return showColumnPanel || showMainPanel || showFilterPanel;
    };
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], EnterpriseMenuFactory.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('popupService'), 
        __metadata('design:type', main_1.PopupService)
    ], EnterpriseMenuFactory.prototype, "popupService", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], EnterpriseMenuFactory.prototype, "gridOptionsWrapper", void 0);
    EnterpriseMenuFactory = __decorate([
        main_1.Bean('menuFactory'), 
        __metadata('design:paramtypes', [])
    ], EnterpriseMenuFactory);
    return EnterpriseMenuFactory;
})();
exports.EnterpriseMenuFactory = EnterpriseMenuFactory;
var EnterpriseMenu = (function () {
    function EnterpriseMenu(column, initialSelection) {
        this.eventService = new main_1.EventService();
        this.column = column;
        this.initialSelection = initialSelection;
    }
    EnterpriseMenu.prototype.addEventListener = function (event, listener) {
        this.eventService.addEventListener(event, listener);
    };
    EnterpriseMenu.prototype.getMinWidth = function () {
        return this.tabbedLayout.getMinWidth();
    };
    EnterpriseMenu.prototype.init = function () {
        var tabItems = [];
        if (!this.gridOptionsWrapper.isSuppressMenuMainPanel()) {
            this.createMainPanel();
            tabItems.push(this.tabItemGeneral);
        }
        if (!this.gridOptionsWrapper.isSuppressMenuFilterPanel() && this.column.isFilterAllowed()) {
            this.createFilterPanel();
            tabItems.push(this.tabItemFilter);
        }
        if (!this.gridOptionsWrapper.isSuppressMenuColumnPanel()) {
            this.createColumnsPanel();
            tabItems.push(this.tabItemColumns);
        }
        this.tabbedLayout = new main_1.TabbedLayout({
            items: tabItems,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
    };
    EnterpriseMenu.prototype.showTabBasedOnPreviousSelection = function () {
        // show the tab the user was on last time they had a menu open
        if (this.tabItemColumns && this.initialSelection === EnterpriseMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        }
        else if (this.tabItemFilter && this.initialSelection === EnterpriseMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        }
        else if (this.tabItemGeneral && this.initialSelection === EnterpriseMenu.TAB_GENERAL) {
            this.tabbedLayout.showItem(this.tabItemGeneral);
        }
        else {
            this.tabbedLayout.showFirstItem();
        }
    };
    EnterpriseMenu.prototype.onTabItemClicked = function (event) {
        var key;
        switch (event.item) {
            case this.tabItemColumns:
                key = EnterpriseMenu.TAB_COLUMNS;
                break;
            case this.tabItemFilter:
                key = EnterpriseMenu.TAB_FILTER;
                break;
            case this.tabItemGeneral:
                key = EnterpriseMenu.TAB_GENERAL;
                break;
        }
        if (key) {
            this.eventService.dispatchEvent(EnterpriseMenu.EVENT_TAB_SELECTED, { key: key });
        }
    };
    EnterpriseMenu.prototype.destroy = function () {
        if (this.columnSelectPanel) {
            this.columnSelectPanel.destroy();
        }
        if (this.mainMenuList) {
            this.mainMenuList.destroy();
        }
    };
    EnterpriseMenu.prototype.createPinnedSubMenu = function () {
        var _this = this;
        var cMenuList = new main_1.MenuList();
        this.context.wireBean(cMenuList);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        cMenuList.addItem({
            name: localeTextFunc('pinLeft', 'Pin Left'),
            action: function () { return _this.columnController.setColumnPinned(_this.column, main_1.Column.PINNED_LEFT); },
            checked: this.column.isPinnedLeft()
        });
        cMenuList.addItem({
            name: localeTextFunc('pinRight', 'Pin Right'),
            action: function () { return _this.columnController.setColumnPinned(_this.column, main_1.Column.PINNED_RIGHT); },
            checked: this.column.isPinnedRight()
        });
        cMenuList.addItem({
            name: localeTextFunc('noPin', 'No Pin'),
            action: function () { return _this.columnController.setColumnPinned(_this.column, null); },
            checked: !this.column.isPinned()
        });
        return cMenuList;
    };
    EnterpriseMenu.prototype.createAggregationSubMenu = function () {
        var _this = this;
        var cMenuList = new main_1.MenuList();
        this.context.wireBean(cMenuList);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnIsAlreadyAggValue = this.column.isValueActive();
        var funcNames = this.aggFuncService.getFuncNames();
        var columnToUse;
        if (this.column.isPrimary()) {
            columnToUse = this.column;
        }
        else {
            columnToUse = this.column.getColDef().pivotValueColumn;
        }
        funcNames.forEach(function (funcName) {
            cMenuList.addItem({
                name: localeTextFunc(funcName, funcName),
                action: function () {
                    _this.columnController.setColumnAggFunc(columnToUse, funcName);
                    _this.columnController.addValueColumn(columnToUse);
                },
                checked: columnIsAlreadyAggValue && columnToUse.getAggFunc() === funcName
            });
        });
        return cMenuList;
    };
    EnterpriseMenu.prototype.createBuiltInMenuOptions = function () {
        var _this = this;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var builtInMenuOptions = {
            pinSubMenu: {
                name: localeTextFunc('pinColumn', 'Pin Column'),
                icon: svgFactory.createPinIcon(),
                childMenu: this.createPinnedSubMenu()
            },
            valueAggSubMenu: {
                name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                icon: svgFactory.createAggregationIcon(),
                childMenu: this.createAggregationSubMenu()
            },
            autoSizeThis: {
                name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                action: function () { return _this.columnController.autoSizeColumn(_this.column); }
            },
            autoSizeAll: {
                name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                action: function () { return _this.columnController.autoSizeAllColumns(); }
            },
            rowGroup: {
                name: localeTextFunc('groupBy', 'Group by') + ' ' + this.column.getColDef().headerName,
                action: function () { return _this.columnController.addRowGroupColumn(_this.column); },
                icon: svgFactory.createGroupIcon12()
            },
            rowUnGroup: {
                name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + this.column.getColDef().headerName,
                action: function () { return _this.columnController.removeRowGroupColumn(_this.column); },
                icon: svgFactory.createGroupIcon12()
            },
            resetColumns: {
                name: localeTextFunc('resetColumns', 'Reset Columns'),
                action: function () { return _this.columnController.resetColumnState(); }
            },
            expandAll: {
                name: localeTextFunc('expandAll', 'Expand All'),
                action: function () { return _this.gridApi.expandAll(); }
            },
            contractAll: {
                name: localeTextFunc('collapseAll', 'Collapse All'),
                action: function () { return _this.gridApi.collapseAll(); }
            },
            toolPanel: {
                name: localeTextFunc('toolPanel', 'Tool Panel'),
                checked: this.gridApi.isToolPanelShowing(),
                action: function () { return _this.gridApi.showToolPanel(!_this.gridApi.isToolPanelShowing()); }
            }
        };
        return builtInMenuOptions;
    };
    EnterpriseMenu.prototype.getMenuItems = function () {
        var defaultMenuOptions = this.getDefaultMenuOptions();
        var result;
        var userFunc = this.gridOptionsWrapper.getMainMenuItemsFunc();
        if (userFunc) {
            var userOptions = userFunc({
                column: this.column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                defaultItems: defaultMenuOptions
            });
            result = userOptions;
        }
        else {
            result = defaultMenuOptions;
        }
        // GUI looks weird when two separators are side by side. this can happen accidentally
        // if we remove items from the menu then two separators can edit up adjacent.
        main_1.Utils.removeRepeatsFromArray(result, EnterpriseMenu.MENU_ITEM_SEPARATOR);
        return result;
    };
    EnterpriseMenu.prototype.getDefaultMenuOptions = function () {
        var result = [];
        var rowGroupCount = this.columnController.getRowGroupColumns().length;
        var doingGrouping = rowGroupCount > 0;
        var groupedByThisColumn = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
        var allowValue = this.column.isAllowValue();
        var allowRowGroup = this.column.isAllowRowGroup();
        var isPrimary = this.column.isPrimary();
        var pivotModeOn = this.columnController.isPivotMode();
        result.push('pinSubMenu');
        var allowValueAgg = 
        // if primary, then only allow aggValue if grouping and it's a value columns
        (isPrimary && doingGrouping && allowValue)
            || !isPrimary;
        if (allowValueAgg) {
            result.push('valueAggSubMenu');
        }
        result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        result.push('autoSizeThis');
        result.push('autoSizeAll');
        result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        if (allowRowGroup && this.column.isPrimary()) {
            if (groupedByThisColumn) {
                result.push('rowUnGroup');
            }
            else {
                result.push('rowGroup');
            }
        }
        result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        result.push('resetColumns');
        result.push('toolPanel');
        // only add grouping expand/collapse if grouping
        // if pivoting, we only have expandable groups if grouping by 2 or more columns
        // as the lowest level group is not expandable while pivoting.
        // if not pivoting, then any active row group can be expanded.
        var allowExpandAndContract = pivotModeOn ? rowGroupCount > 1 : rowGroupCount > 0;
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }
        return result;
    };
    EnterpriseMenu.prototype.createMainPanel = function () {
        this.mainMenuList = new main_1.MenuList();
        this.context.wireBean(this.mainMenuList);
        var menuItems = this.getMenuItems();
        var builtInOptions = this.createBuiltInMenuOptions();
        this.mainMenuList.addMenuItems(menuItems, builtInOptions);
        this.mainMenuList.addEventListener(main_1.MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: svgFactory.createMenuSvg(),
            body: this.mainMenuList.getGui()
        };
    };
    EnterpriseMenu.prototype.onHidePopup = function () {
        this.hidePopupFunc();
    };
    EnterpriseMenu.prototype.createFilterPanel = function () {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column);
        var afterFilterAttachedCallback;
        if (filterWrapper.filter.afterGuiAttached) {
            afterFilterAttachedCallback = filterWrapper.filter.afterGuiAttached.bind(filterWrapper.filter);
        }
        this.tabItemFilter = {
            title: svgFactory.createFilterSvg12(),
            body: filterWrapper.gui,
            afterAttachedCallback: afterFilterAttachedCallback
        };
    };
    EnterpriseMenu.prototype.createColumnsPanel = function () {
        var eWrapperDiv = document.createElement('div');
        main_1.Utils.addCssClass(eWrapperDiv, 'ag-menu-column-select-wrapper');
        this.columnSelectPanel = new columnSelectPanel_1.ColumnSelectPanel(false);
        this.context.wireBean(this.columnSelectPanel);
        eWrapperDiv.appendChild(this.columnSelectPanel.getGui());
        this.tabItemColumns = {
            title: svgFactory.createColumnsSvg12(),
            body: eWrapperDiv
        };
    };
    EnterpriseMenu.prototype.afterGuiAttached = function (params) {
        this.tabbedLayout.setAfterAttachedParams({ hidePopup: params.hidePopup });
        this.showTabBasedOnPreviousSelection();
        this.hidePopupFunc = params.hidePopup;
    };
    EnterpriseMenu.prototype.getGui = function () {
        return this.tabbedLayout.getGui();
    };
    EnterpriseMenu.EVENT_TAB_SELECTED = 'tabSelected';
    EnterpriseMenu.TAB_FILTER = 'filter';
    EnterpriseMenu.TAB_GENERAL = 'general';
    EnterpriseMenu.TAB_COLUMNS = 'columns';
    EnterpriseMenu.MENU_ITEM_SEPARATOR = 'separator';
    __decorate([
        main_1.Autowired('columnController'), 
        __metadata('design:type', main_1.ColumnController)
    ], EnterpriseMenu.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('filterManager'), 
        __metadata('design:type', main_1.FilterManager)
    ], EnterpriseMenu.prototype, "filterManager", void 0);
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], EnterpriseMenu.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('gridApi'), 
        __metadata('design:type', main_1.GridApi)
    ], EnterpriseMenu.prototype, "gridApi", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], EnterpriseMenu.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('aggFuncService'), 
        __metadata('design:type', aggFuncService_1.AggFuncService)
    ], EnterpriseMenu.prototype, "aggFuncService", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], EnterpriseMenu.prototype, "init", null);
    return EnterpriseMenu;
})();
exports.EnterpriseMenu = EnterpriseMenu;
