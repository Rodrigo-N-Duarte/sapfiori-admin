sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("br.com.fioriappreport356.controller.Lista", {

            onInit: function () {
                var oCoreConfiguration = sap.ui.getCore().getConfiguration()
                oCoreConfiguration.setFormatLocale("pt-BR")
            },

            onSearch: function (oEvt) {
                var productIdInput = this.getView().byId("iptProductId")
                var productNameInput = this.getView().byId("iptProductName")

                var tableProdutos = this.getView().byId("tableProdutos")
                var binding = tableProdutos.getBinding("items")

                var oFilter = new Filter({
                    filters: [
                        new Filter("Productid", FilterOperator.Contains, productIdInput.getValue()),
                        new Filter("Name", FilterOperator.Contains, productNameInput.getValue()),
                    ],
                    and: true
                })

                binding.filter(oFilter)

                productIdInput.setValue("")
                productNameInput.setValue("")
            },

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

            onSelectProduct: function (oEvent) {
                var oSelectedProduct = oEvent.getSource().getBindingContext().getObject()

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this)
                oRouter.navTo("Detalhes", {
                    Productid: oSelectedProduct.Productid
                })

            }
        });
    });
