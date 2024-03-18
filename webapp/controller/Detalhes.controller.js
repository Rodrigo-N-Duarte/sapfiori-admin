sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/NumberFormat"
  ],
  /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
  function (BaseController, NumberFormat) {
    "use strict";

    return BaseController.extend("br.com.fioriappreport356.controller.Detalhes", {
      onInit: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this)
        oRouter.getRoute("Detalhes").attachMatched(this.onRouteMatch, this)
      },

      onRouteMatch: function (oEvent) {
        var oProductid = oEvent.getParameter("arguments").Productid

        var oView = this.getView()
        var sURL = `/Produtos('${oProductid}')`
        oView.bindElement({
          path: sURL,
          parameters: {
            expand: 'to_category'
          },
          events: {
            change: this.onBindingChange.bind(this),
            dataRequested: function () {
              oView.setBusy(true)
            },
            dataReceived: function (oData) {
              oView.setBusy(false)
              var Product = oData
            }
          }
        })
      },

      onBindingChange: function (oEvent) {
        this.validateParameterElement(oEvent)
      },

      validateParameterElement: function () {
        var oView = this.getView()
        var oElementBinding = oView.getElementBinding()
        if (!oElementBinding.getBoundContext()) {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this)
          oRouter.getTargets().display("objectNotFound")
          return
        }
      },

      onPressBackBtn: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this)
        oRouter.navTo("Lista")
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

      formatFloatNumber: function (value) {
        var numFloat = NumberFormat.getFloatInstance({
          maxFractionDigits: 2,
          minFractionDigits: 2,
          groupingEnable: true,
          groupingSeparator: '.',
          decimalSeparator: ","
        })
        return numFloat.format(value)
      }
    });
  }
);
