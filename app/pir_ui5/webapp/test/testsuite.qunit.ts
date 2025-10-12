export default {
	name: "QUnit test suite for the UI5 Application: pir_ui5",
	defaults: {
		page: "ui5://test-resources/pir_ui5/Test.qunit.html?testsuite={suite}&test={name}",
		qunit: {
			version: 2
		},
		sinon: {
			version: 4
		},
		ui5: {
			language: "EN",
			theme: "sap_horizon"
		},
		coverage: {
			only: "pir_ui5/",
			never: "test-resources/pir_ui5/"
		},
		loader: {
			paths: {
				"pir_ui5": "../"
			}
		}
	},
	tests: {
		"unit/unitTests": {
			title: "Unit tests for pir_ui5"
		},
		"integration/opaTests": {
			title: "Integration tests for pir_ui5"
		}
	}
};
