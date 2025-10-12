//@ui5-bundle sap/uxap/designtime/library-preload.designtime.js
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/uxap/designtime/BlockBase.designtime", [],function(){"use strict";return{aggregations:{_views:{ignore:false}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/uxap/designtime/ObjectPageHeader.designtime", [],function(){"use strict";return{palette:{group:"DISPLAY",icons:{svg:"sap/uxap/designtime/ObjectPageHeader.icon.svg"}},aggregations:{actions:{domRef:":sap-domref .sapUxAPObjectPageHeaderIdentifierActions",actions:{move:{changeType:"moveControls"}},name:{singular:"OBJECT_PAGE_HEADER_NAME",plural:"OBJECT_PAGE_HEADER_NAME_PLURAL"}}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/uxap/designtime/ObjectPageHeaderActionButton.designtime", [],function(){"use strict";return{actions:{remove:{changeType:"hideControl"},rename:function(e){if(e.getIcon()){return null}return{changeType:"rename",domRef:function(e){return e.$().find(".sapMBtnContent")[0]}}},reveal:{changeType:"unhideControl"}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/uxap/designtime/ObjectPageLayout.designtime", ["sap/ui/core/Element","sap/ui/core/Lib","sap/uxap/library"],function(e,t,n){"use strict";function r(t){if(t){var n=t.getKey();return e.getElementById(n)}}function a(e){return e._shouldPreserveHeaderInTitleArea()||o(e)}function o(e){return e._bHeaderExpanded&&e._bStickyAnchorBar}return{name:{singular:function(){return t.getResourceBundleFor("sap.uxap").getText("LAYOUT_CONTROL_NAME")},plural:function(){return t.getResourceBundleFor("sap.uxap").getText("LAYOUT_CONTROL_NAME_PLURAL")}},aggregations:{sections:{domRef:function(e){return e.$("sectionsContainer").get(0)},childNames:{singular:function(){return t.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME")},plural:function(){return t.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL")}},actions:{move:"moveControls",addIFrame:{changeType:"addIFrame",text:t.getResourceBundleFor("sap.uxap").getText("ADD_IFRAME_AS_SECTION"),getCreatedContainerId:function(t){var n=e.getElementById(t);var r=n.getParent();var a=r.getAggregation("_anchorBar");var o;if(a){o=a.getItems().filter(function(e){return e.getKey()===t})[0]}if(o){return o.getId()}return t}}},beforeMove:function(e){if(e){e._suppressScroll()}},afterMove:function(e){if(e){e.attachEventOnce("onAfterRenderingDOMReady",function(){e._resumeScroll(false)})}}},_anchorBar:{ignore:false,domRef:function(e){if(e.getAggregation("_anchorBar")){return e.getAggregation("_anchorBar").getDomRef()}},propagateRelevantContainer:true,propagateMetadata:function(e){if(e.isA("sap.m.IconTabHeader")){return{aggregations:{items:{childNames:{singular:function(){return t.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME")},plural:function(){return t.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL")}},actions:{move:function(e){if(e.isA("sap.m.IconTabFilter")){return"moveControls"}}}}}}}else if(e.isA("sap.m.IconTabFilter")){return{actions:{getResponsibleElement:r,actionsFromResponsibleElement:["remove","rename","reveal","addIFrame","settings"],combine:null,split:null}}}else{return{actions:"not-adaptable"}}}},headerContent:{domRef:function(e){return e._getHeaderContentDomRef()},childNames:{singular:function(){return t.getResourceBundleFor("sap.uxap").getText("HEADER_CONTROL_NAME")}},actions:{move:function(e){var t=e&&e.getParent();if(t&&t.isA("sap.uxap.ObjectPageLayout")&&t.indexOfHeaderContent(e)>-1){return"moveControls"}},addIFrame:{text:t.getResourceBundleFor("sap.uxap").getText("ADD_IFRAME_IN_HEADER"),changeType:"addIFrame"},remove:{removeLastElement:true}}},footer:{propagateMetadata:function(e){if(e.isA("sap.m.IBar")){return{isVisible:function(e){return e.getParent().isA("sap.uxap.ObjectPageLayout")&&e.getParent().getShowFooter()}}}}}},scrollContainers:[{domRef:"> .sapUxAPObjectPageWrapper",aggregations:function(e,t){e.attachEventOnce("_snapChange",function(){t({index:0})});if(a(e)){return["sections"]}else if(e._bStickyAnchorBar){return["sections","headerContent"]}else{return["sections","_anchorBar","headerContent"]}}}],templates:{create:"sap/uxap/designtime/ObjectPageLayout.create.fragment.xml"}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/uxap/designtime/ObjectPageSection.designtime", ["sap/ui/core/Lib","sap/uxap/library","sap/ui/fl/designtime/util/editIFrame"],function(e,t,n){"use strict";function i(e){var t=e.getTitle();var n=e.getSubSections();if(n.length===1&&n[0].getTitle().trim()!==""){t=n[0].getTitle()}return t||e.getId()}return{name:{singular:function(){return e.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME")},plural:function(){return e.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL")}},select:function(e){var t=e.getParent();t.setSelectedSection(e)},palette:{group:"CONTAINER",icons:{svg:"sap/uxap/designtime/ObjectPageSection.icon.svg"}},getLabel:i,actions:{remove:{changeType:"stashControl"},reveal:{changeType:"unstashControl",getLabel:i,depthOfRelevantBindings:2},rename:function(){return{changeType:"rename",domRef:".sapUxAPObjectPageSectionTitle",isEnabled:function(e){return e._getInternalTitleVisible()},validators:["noEmptyText"]}},settings(t){const i=t.getSubSections()[0];const a=i?.getBlocks?.()[0];if(a?.getMetadata?.().getName()==="sap.ui.fl.util.IFrame"){return{icon:"sap-icon://write-new",name:()=>{const t=e.getResourceBundleFor("sap.ui.fl.designtime");return t.getText("CTX_EDIT_IFRAME")},isEnabled:true,handler:n.bind(this,a)}}return undefined}},aggregations:{subSections:{domRef:":sap-domref .sapUxAPObjectPageSectionContainer",actions:{move:{changeType:"moveControls"}}}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/uxap/designtime/ObjectPageSubSection.designtime", [],function(){"use strict";return{palette:{group:"CONTAINER",icons:{svg:"sap/uxap/designtime/ObjectPageSubSection.icon.svg"}},actions:{remove:{changeType:"hideControl",isEnabled:function(e){var n=e.getParent(),t;if(n){t=n.getSubSections().filter(function(e){return e.getVisible()});return t.length>1}return false}},reveal:{changeType:"unhideControl",depthOfRelevantBindings:1},rename:function(){return{changeType:"rename",domRef:".sapUxAPObjectPageSubSectionTitle",isEnabled:function(e){return e.$("headerTitle").get(0)!=undefined}}}},aggregations:{actions:{domRef:function(e){return e.$().find(".sapUxAPObjectPageSubSectionHeaderToolbar")[0]},actions:{move:{changeType:"moveControls"}}}}}});
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/uxap/designtime/library.designtime", [],function(){"use strict";return{}});
//# sourceMappingURL=library-preload.designtime.js.map
