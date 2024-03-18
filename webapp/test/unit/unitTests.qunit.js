/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"brcom/fiori_app_report_356/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
