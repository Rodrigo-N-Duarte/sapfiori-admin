sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",

    "br/com/fioriappadmin356/util/Formatter"
  ],
  /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
  function (BaseController, Formatter) {
    "use strict";

    return BaseController.extend("br.com.fioriappadmin356.controller.Detalhes", {
      objFormatter: Formatter,
      
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
    });
  }
);
