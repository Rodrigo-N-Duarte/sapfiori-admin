sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
    "use strict";

    var Formatter = {
        formatTableDate: (dateParam) => {
            if (!dateParam) return ""

            var newDate = new Date(dateParam)
            var [date, month, year] = [newDate.getDate(), newDate.getMonth() + 1, newDate.getFullYear()]

            if (year === 9999) return ""

            var pattern;
            var oLocale = sap.ui.getCore().getConfiguration().getFormatLocale()

            switch (oLocale) {
                case "en": pattern = "MM/dd/yyyy"
                    break;
                case "pt-BR": pattern = "dd/MM/yyyy"
                    break;
            }

            return sap.ui.core.format.DateFormat.getDateTimeInstance({
                style: "short",
                pattern: pattern
            }).format(newDate)
        },

        formatStatusProduto: function (status) {
            var oBundle = this.getView().getModel("i18n").getResourceBundle()
            try {
                return oBundle.getText(`status${status}`)
            } catch (oError) {
                return ""
            }
        },

        formatStateStatusProduto: function (status) {
            switch (status) {
                case "P": return "Warning"
                case "F": return "Error"
                case "E": return "Success"
                default: return "None"
            }
        },

        formatIconProduct: function (status) {
            switch (status) {
                case "P": return "sap-icon://alert"
                case "F": return "sap-icon://message-error"
                case "E": return "sap-icon://accept"
                default: return ""
            }
        },

        formatFloatNumber: function (value) {
            var numFloat = NumberFormat.getFloatInstance({
                maxFractionDigits: 2,
                minFractionDigits: 2,
                groupingEnable: true,
                groupingSeparator: '.',
                decimalSeparator: ","
            })
            return numFloat.format(value)
        },

        dateSAP: function (value) {
            if (value) {
                var dateParts = value.split("/");
                var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "yyyy-MM-ddTHH:mm:ss"
                });
                return oDateFormat.format(new Date(dateObject));
            } else {
                return value;
            }
        },
    };

    return Formatter;

}, true);

