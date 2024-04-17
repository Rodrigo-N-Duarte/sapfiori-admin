sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/odata/ODataModel",
    "sap/m/MessageToast",

    "br/com/fioriappadmin356/util/Formatter",
    "br/com/fioriappadmin356/util/Validator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, Fragment, ValueState, JSONModel, MessageBox, BusyDialog, ODataModel, MessageToast, Formatter, Validator) {
        "use strict";

        return Controller.extend("br.com.fioriappadmin356.controller.Lista", {
            objFormatter: Formatter,
            objValidator: Validator,

            onInit: function () {
                sap.ushell.Container.getServiceAsync("UserInfo").then((UserInfo) => {
                    console.log(UserInfo)
                })
                var oCoreConfiguration = sap.ui.getCore().getConfiguration()
                oCoreConfiguration.setFormatLocale("pt-BR")

                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error)
                })
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Success)
                })
            },

            criarModel: function () {
                var oModel = new JSONModel()
                this.getView().setModel(oModel, "MDL_Produto")
            },

            onSearch: function (oEvt) {
                var productIdInput = this.getView().byId("iptProductId")
                var productNameInput = this.getView().byId("iptProductName")
                var categoryInput = this.getView().byId(this.oInputFilterCategoria)

                var tableProdutos = this.getView().byId("tableProdutos")
                var binding = tableProdutos.getBinding("items")

                var oFilter = new Filter({
                    filters: [
                        new Filter("Productid", FilterOperator.Contains, productIdInput.getValue()),
                        new Filter("Name", FilterOperator.Contains, productNameInput.getValue()),
                        new Filter("to_category/Category", FilterOperator.Contains, categoryInput.getValue()),
                    ],
                    and: true
                })

                binding.filter(oFilter)

                productIdInput.setValue("")
                productNameInput.setValue("")
                categoryInput.setValue("")
            },

            onSelectProduct: function (oEvent) {
                var oSelectedProduct = oEvent.getSource().getBindingContext().getObject()

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this)
                oRouter.navTo("Detalhes", {
                    Productid: oSelectedProduct.Productid
                })

            },

            onClickValueHelpCategoria: function (oEvent) {
                this.oInputFilterCategoria = oEvent.getSource().getId()
                var oView = this.getView()
                if (!this.oCategoriaValueHelp) {
                    this.oCategoriaValueHelp = Fragment.load({
                        id: oView.getId(),
                        name: "br.com.fioriappadmin356.frags.SH_Categorias",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog)
                        return oDialog
                    })
                }
                this.oCategoriaValueHelp.then(function (oDialog) {
                    oDialog.getBinding("items").filter([])
                    oDialog.open()
                })
            },

            onClickInserirProduto: function (oEvent) {
                this.criarModel()
                var oButton = oEvent.getSource()
                var oView = this.getView()

                var t = this

                if (!this.oNovoProdutoDialog) {
                    this.oNovoProdutoDialog = Fragment.load({
                        id: oView.getId(),
                        name: "br.com.fioriappadmin356.frags.Insert",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog)
                        return oDialog
                    })
                }
                this.oNovoProdutoDialog.then(function (oDialog) {
                    oDialog.open();
                    t.onGetUsuarios()
                })
            },

            onGetUsuarios: function () {
                var t = this
                var stringEntity = "/sap/opu/odata/sap/ZSB_USERS_356"
                var oModelSend = new ODataModel(stringEntity, true)
                oModelSend.read("/Usuarios", {
                    success: function (oData, results) {
                        if (results.statusCode == 200) {
                            var oModelUsers = new JSONModel()
                            oModelUsers.setData(oData.results)
                            t.getView().setModel(oModelUsers, "MDL_Users")
                        }
                    },
                    error: function (oError) {
                        var oRet = JSON.parse(oError.response.body)
                        MessageToast.show(oRet.error.message.value, { duration: 5000 })
                    }
                })
            },

            onValueHelpSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value")
                var oFilter = new Filter("Category", FilterOperator.Contains, sValue)
                oEvent.getSource().getBinding("items").filter([oFilter])
            },

            onValueHelpConfirm: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem")
                var oInput = null
                if (this.byId(this.oInputFilterCategoria)) {
                    oInput = this.byId(this.oInputFilterCategoria)
                } else {
                    oInput = sap.ui.getCore().byId(this.oInputFilterCategoria)
                }

                if (!oSelectedItem) {
                    oInput.resetProperty("value")
                    return
                }
                oInput.setValue(oSelectedItem.getTitle())
            },

            onValida: function () {
                var validator = new Validator()
                if (validator.validate(this.byId("dialogInsertProduct"))) {
                    this.handleInsertProduct()
                }
            },

            handleInsertProduct: function () {
                var oModel = this.getView().getModel("MDL_Produto")
                var objNovo = oModel.getData()

                objNovo.Productid = this.geraID()
                objNovo.Price = objNovo.Price[0].toString()
                objNovo.Weightmeasure = objNovo.Weightmeasure.toString()
                objNovo.Width = objNovo.Width.toString()
                objNovo.Depth = objNovo.Depth.toString()
                objNovo.Height = objNovo.Height.toString()
                objNovo.Createdat = this.objFormatter.dateSAP(objNovo.Createdat)
                objNovo.Currencycode = "BRL"
                objNovo.Userupdate = ""

                var bundle = this.getView().getModel("i18n").getResourceBundle()
                var t = this
                var oModelProduto = this.getView().getModel()
                MessageBox.confirm(
                    bundle.getText("msgInsertDialogMsg"),
                    function (oAction) {
                        if (MessageBox.Action.OK == oAction) {
                            t._busyDialog = new BusyDialog({ text: bundle.getText("msgSending") })
                            t._busyDialog.open()
                            setTimeout(function () {
                                var oModelSend = new ODataModel(oModelProduto.sServiceUrl, true)
                                oModelSend.create("Produtos", objNovo, null,
                                    function (oData, oReturn) {
                                        if (oReturn.statusCode == 201) {
                                            MessageToast.show(bundle.getText("msgInsertDialogSuccess", [objNovo.Productid]), { duration: 5000 })
                                            t.onCloseInsertFragment()
                                            t.getView().getModel().refresh()
                                            t._busyDialog.close()
                                        }
                                    },
                                    function (oError) {
                                        t._busyDialog.close()
                                        var oRet = JSON.parse(oError.response.body)
                                        MessageToast.show(oRet.error.message.value, { duration: 5000 })
                                    }
                                )
                            }, 2000)
                            return
                        }
                    },
                    bundle.getText("msgInsertDialogTitle")
                );
            },

            onCloseInsertFragment: function () {
                this.oNovoProdutoDialog.then(function (oDialog) {
                    oDialog.close();
                })
            },

            geraID: function () {
                return 'xxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0,
                        v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16).toUpperCase();
                });
            },

            getSupplier: function (oEvent) {
                this._oInput = oEvent.getSource().getId()
                var oValue = oEvent.getSource().getValue()
                var sElement = `/Fornecedores('${oValue}')`
                var oModelProduto = this.getView().getModel("MDL_Produto")
                var oModelDefault = this.getView().getModel()
                var oModelSend = new ODataModel(oModelDefault.sServiceUrl, true)
                // Chamada de fornecedor
                oModelSend.read(sElement, {
                    success: function (oData, results) {
                        if (results.statusCode == 200) {
                            oModelProduto.setProperty("/Supplierid", oData.Lifnr)
                            oModelProduto.setProperty("/Suppliername", oData.Name1)
                        }
                    },
                    error: function (oError) {
                        oModelProduto.setProperty("/Supplierid", null)
                        oModelProduto.setProperty("/Suppliername", null)
                        
                        var oRet = JSON.parse(oError.response.body)
                        MessageToast.show(oRet.error.message.value, { duration: 5000 })
                    }
                })
            },
            
            // Suggestion pode causar lentidão dependendo da aplicação, por ser em tempo real com o input do usuário
            onSuggestSupplier: function (oEvent) {
                var sText = oEvent.getParameter("suggestValue")
                var aFilters = []
                if (sText) {
                    aFilters.push(new Filter("Lifnr", FilterOperator.Contains, sText))
                }
                oEvent.getSource().getBinding("suggestionItems").filter(aFilters)
            }
        });
    });
