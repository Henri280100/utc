/*!
	* OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
	*/
sap.ui.define(["sap/ui/core/util/reflection/JsControlTreeModifier","sap/ui/fl/changeHandler/UnstashControl"],function(e,t){"use strict";var r=Object.assign({},t);r.getChangeVisualizationInfo=function(t,r){var n=t.getSelector();var a=e.bySelector(n,r);var o=a.getParent().getAggregation("_anchorBar");var i=[n];var g=[n];o.getAggregation("items").forEach(function(e){if(a.getId()===e.getKey()){g.push(e.getId())}});return{affectedControls:i,displayControls:g}};return r},true);
//# sourceMappingURL=UnstashObjectPageSection.js.map