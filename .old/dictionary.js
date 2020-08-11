///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
var Dictionary;
(function (Dictionary) {
    var DictController = (function () {
        function DictController() {
            this.application = null;
            this.companyForms = null;
            this.transportTypes = null;
            this.cargoTypes = null;
            this.packingTypes = null;
            this.cargoADRTypes = null;
            this.bodyTypes = null;
            this.loadingTypes = null;
        }
        DictController.prototype.init = function (application, component) {
            Dictionary.__currDictionary.application = application;
            Dictionary.__currDictionary.component = component;
        };

        DictController.prototype.queryDictData = function (name) {
            if ("companyforms" == name) {
                if (null == Dictionary.__currDictionary.companyForms)
                    Dictionary.__currDictionary.getData(name);
else
                    Dictionary.__currDictionary.component.dictDataReady(name);
            } else if ("transporttype" == name) {
                if (null == Dictionary.__currDictionary.transportTypes)
                    Dictionary.__currDictionary.getData(name);
else
                    Dictionary.__currDictionary.component.dictDataReady(name);
            } else if ("cargotype" == name) {
                if (null == Dictionary.__currDictionary.cargoTypes)
                    Dictionary.__currDictionary.getData(name);
else
                    Dictionary.__currDictionary.component.dictDataReady(name);
            } else if ("packingtype" == name) {
                if (null == Dictionary.__currDictionary.packingTypes)
                    Dictionary.__currDictionary.getData(name);
else
                    Dictionary.__currDictionary.component.dictDataReady(name);
            } else if ("cargoadrtype" == name) {
                if (null == Dictionary.__currDictionary.cargoADRTypes)
                    Dictionary.__currDictionary.getData(name);
else
                    Dictionary.__currDictionary.component.dictDataReady(name);
            } else if ("bodytype" == name) {
                if (null == Dictionary.__currDictionary.bodyTypes)
                    Dictionary.__currDictionary.getData(name);
else
                    Dictionary.__currDictionary.component.dictDataReady(name);
            } else if ("loadingtype" == name) {
                if (null == Dictionary.__currDictionary.loadingTypes)
                    Dictionary.__currDictionary.getData(name);
else
                    Dictionary.__currDictionary.component.dictDataReady(name);
            }
        };

        DictController.prototype.getData = function (name) {
            $.ajax({
                type: "GET",
                url: Dictionary.__currDictionary.application.getFullUri("api/dict/" + name),
                success: Dictionary.__currDictionary.onAjaxGetDataSuccess,
                error: Dictionary.__currDictionary.onAjaxGetDataError,
                async: false
            });
        };

        DictController.prototype.onAjaxGetDataError = function (jqXHR, status, message) {
            //window.console.log("_onAjaxError");
        };

        DictController.prototype.onAjaxGetDataSuccess = function (data, status, jqXHR) {
            //window.console.log("_onAjaxGetDataSuccess");
            // загрузка компонента произведена успешно
            var dictData = data.data;

            if (null != dictData.data) {
                if ("companyforms" == dictData.name)
                    Dictionary.__currDictionary.companyForms = dictData.data;
else if ("transporttype" == dictData.name)
                    Dictionary.__currDictionary.transportTypes = dictData.data;
else if ("cargotype" == dictData.name)
                    Dictionary.__currDictionary.cargoTypes = dictData.data;
else if ("packingtype" == dictData.name)
                    Dictionary.__currDictionary.packingTypes = dictData.data;
else if ("cargoadrtype" == dictData.name)
                    Dictionary.__currDictionary.cargoADRTypes = dictData.data;
else if ("bodytype" == dictData.name)
                    Dictionary.__currDictionary.bodyTypes = dictData.data;
else if ("loadingtype" == dictData.name)
                    Dictionary.__currDictionary.loadingTypes = dictData.data;

                Dictionary.__currDictionary.component.dictDataReady(dictData.name);
            }
        };

        DictController.prototype.getNameById = function (dictName, id) {
            var dict = null;

            if ("companyforms" == dictName)
                dict = Dictionary.__currDictionary.companyForms;
else if ("transporttype" == dictName)
                dict = Dictionary.__currDictionary.transportTypes;
else if ("cargotype" == dictName)
                dict = Dictionary.__currDictionary.cargoTypes;
else if ("packingtype" == dictName)
                dict = Dictionary.__currDictionary.packingTypes;
else if ("cargoadrtype" == dictName)
                dict = Dictionary.__currDictionary.cargoADRTypes;
else if ("bodytype" == dictName)
                dict = Dictionary.__currDictionary.bodyTypes;
else if ("loadingtype" == dictName)
                dict = Dictionary.__currDictionary.loadingTypes;

            if (null != dict) {
                for (var i = 0; i < dict.length; i++) {
                    var entry = dict[i];

                    if (id == entry.id)
                        return entry.name;
                }
            }

            return null;
        };
        return DictController;
    })();
    Dictionary.DictController = DictController;

    Dictionary.__currDictionary = new DictController();
})(Dictionary || (Dictionary = {}));
