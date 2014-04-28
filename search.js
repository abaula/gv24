///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
var Search;
(function (Search) {
    var SearchController = (function () {
        function SearchController() {
            this.isComponentLoaded = false;
            this.application = null;
            this.state = null;
        }
        SearchController.prototype.onLoad = function (app, parent, state) {
            Search.__currentComp.application = app;
            Search.__currentComp.state = state;
            Dictionary.__currDictionary.init(app, Search.__currentComp);

            // загружаем словари
            Dictionary.__currDictionary.queryDictData("cargotype");
            Dictionary.__currDictionary.queryDictData("cargoadrtype");
            Dictionary.__currDictionary.queryDictData("loadingtype");

            Search.__currentComp.setDefaultCargoDate();

            Search.__currentComp.onComponentLoaded();
        };

        SearchController.prototype.onUpdate = function (state) {
            // TODO Чистим список результатов поиска
            Search.__currentComp.onComponentLoaded();
        };

        SearchController.prototype.onShow = function (state) {
            // Ничего не делаем
        };

        SearchController.prototype.onHide = function (state) {
            // Ничего не делаем
        };

        SearchController.prototype.dataLoaded = function (sender) {
            // Дочерних компонентов нет, ничего не делаем
        };

        SearchController.prototype.dataReady = function (sender) {
            // Дочерних компонентов нет, ничего не делаем
        };

        SearchController.prototype.dataError = function (sender, error) {
            // Дочерних компонентов нет, ничего не делаем
        };

        SearchController.prototype.dictDataReady = function (name) {
            if ("cargotype" == name) {
                Search.__currentComp.drawCargoType(Dictionary.__currDictionary.cargoTypes);
            } else if ("cargoadrtype" == name) {
                Search.__currentComp.drawCargoADRType(Dictionary.__currDictionary.cargoADRTypes);
            } else if ("loadingtype" == name) {
                Search.__currentComp.drawLoadingType(Dictionary.__currDictionary.loadingTypes);
                Search.__currentComp.drawUnloadingType(Dictionary.__currDictionary.loadingTypes);
            }
        };

        SearchController.prototype.onComponentLoaded = function () {
            Search.__currentComp.isComponentLoaded = true;
            Search.__currentComp.application.componentReady();
        };

        SearchController.prototype.drawCargoType = function (data) {
            var container = $("#i-ctrl-search-form-cargo-type");
            var tmp = $("#i-ctrl-search-form-cargo-type-template");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        };

        SearchController.prototype.drawCargoADRType = function (data) {
            var container = $("#i-ctrl-search-form-cargo-adr-type");
            var tmp = $("#i-ctrl-search-form-cargo-adr-type-template");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];

                if ("нет" == entry.name)
                    continue;

                var opt = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        };

        SearchController.prototype.drawLoadingType = function (data) {
            var container = $("#i-ctrl-search-form-loading-type");
            var tmp = $("#i-ctrl-search-form-loading-type-template");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        };

        SearchController.prototype.drawUnloadingType = function (data) {
            var container = $("#i-ctrl-search-form-unloading-type");
            var tmp = $("#i-ctrl-search-form-unloading-type-template");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        };

        SearchController.prototype.clearCargoDate = function () {
            $("#i-ctrl-search-form-ready-date-day-select option").remove();
            $("#i-ctrl-search-form-ready-date-month-select option").remove();
            $("#i-ctrl-search-form-ready-date-year-select option").remove();
        };

        SearchController.prototype.setDefaultCargoDate = function () {
            var date = new Date();

            //window.console.log(date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear());
            var dateString = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

            //__currentTasksProfile.setCargoDate("12-06-1997");
            Search.__currentComp.setCargoDate(dateString);
        };

        SearchController.prototype.getCargoDate = function () {
            var day = $("#i-ctrl-search-form-ready-date-day-select").val();
            var month = $("#i-ctrl-search-form-ready-date-month-select").val();
            var year = $("#i-ctrl-search-form-ready-date-year-select").val();

            return day + "-" + (parseInt(month) < 10 ? ("0" + month) : month) + "-" + year;
        };

        SearchController.prototype.setCargoDate = function (date) {
            var arr = date.split("-");
            var day = parseInt(arr[0]);
            var month = parseInt(arr[1]);
            var year = parseInt(arr[2]);

            var opt = null;
            var select = null;

            // заполняем дни
            select = $("#i-ctrl-search-form-ready-date-day-select");

            for (var i = 1; i <= 31; i++) {
                opt = $("<option></option>");
                opt.val(i).text(i);
                select.append(opt);
            }

            select.val(day);

            // заполняем месяца
            var monthArr = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
            select = $("#i-ctrl-search-form-ready-date-month-select");

            for (var i = 0; i < 12; i++) {
                opt = $("<option></option>");
                opt.val(i + 1).text(monthArr[i]);
                select.append(opt);
            }

            select.val(month);

            // заполняем года
            select = $("#i-ctrl-search-form-ready-date-year-select");

            var d = new Date();
            var currentYear = d.getFullYear();

            if (year != currentYear) {
                opt = $("<option></option>");
                opt.val(year).text(year);
                select.append(opt);
            }

            for (var i = 0; i < 2; i++) {
                opt = $("<option></option>");
                opt.val(currentYear + i).text(currentYear + i);
                select.append(opt);
            }
        };

        SearchController.prototype.onDocumentReady = function () {
            /////////////////////////////////////
            // цепляем обработчики событий
            // настраиваем Application
            Application.__currentApp.init(Search.__currentComp, false);
        };
        return SearchController;
    })();
    Search.SearchController = SearchController;

    Search.__currentComp = new SearchController();
})(Search || (Search = {}));

$(document).ready(Search.__currentComp.onDocumentReady);
