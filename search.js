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
            this.cityTmpData1 = null;
            this.cityTmpData2 = null;
            this.cityBound1 = false;
            this.cityBound2 = false;
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

            // настраиваем обработчики событий
            $("#i-ctrl-search-form-cargo-type-up-down-button").click(Search.__currentComp.onCargoTypeUpDownButtonClick);
            $("#i-ctrl-search-form-cargo-adr-type-up-down-button").click(Search.__currentComp.onCargoAdrTypeUpDownButtonClick);
            $("#i-ctrl-search-form-loading-type-up-down-button").click(Search.__currentComp.onLoadingTypeUpDownButtonClick);
            $("#i-ctrl-search-form-unloading-type-up-down-button").click(Search.__currentComp.onUnloadingTypeUpDownButtonClick);

            $("#i-ctrl-search-form-load-city-txt").focus(Search.__currentComp.onCity1Focus);
            $("#i-ctrl-search-form-unload-city-txt").focus(Search.__currentComp.onCity2Focus);

            $("#i-ctrl-search-form-load-city-delete-btn").click(Search.__currentComp.onCity1Delete);
            $("#i-ctrl-search-form-unload-city-delete-btn").click(Search.__currentComp.onCity2Delete);

            $("#i-ctrl-search-form-cancel-btn").click(Search.__currentComp.onClearButtonClick);
            $("#i-ctrl-search-form-submit-btn").click(Search.__currentComp.onSubmitButtonClick);

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

        SearchController.prototype.onCitySelected = function (city) {
            if (true == Search.__currentComp.cityBound1) {
                Search.__currentComp.cityTmpData1 = city;
            } else {
                Search.__currentComp.cityTmpData2 = city;
            }

            Search.__currentComp.applyCityData();
        };

        SearchController.prototype.onCitySelectedAbort = function () {
            Search.__currentComp.applyCityData();
        };

        SearchController.prototype.drawCargoType = function (data) {
            var container = $("#i-ctrl-search-form-cargo-type-checkbox-container");
            var tmp = $("#i-ctrl-search-form-cargo-type-template");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id).change(Search.__currentComp.onCheckboxStateChanged);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        };

        SearchController.prototype.drawCargoADRType = function (data) {
            var container = $("#i-ctrl-search-form-cargo-adr-type-checkbox-container");
            var tmp = $("#i-ctrl-search-form-cargo-adr-type-template");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];

                if ("нет" == entry.name)
                    continue;

                var opt = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id).change(Search.__currentComp.onCheckboxStateChanged);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        };

        SearchController.prototype.drawLoadingType = function (data) {
            var container = $("#i-ctrl-search-form-loading-type-checkbox-container");
            var tmp = $("#i-ctrl-search-form-loading-type-template");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id).change(Search.__currentComp.onCheckboxStateChanged);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        };

        SearchController.prototype.drawUnloadingType = function (data) {
            var container = $("#i-ctrl-search-form-unloading-type-checkbox-container");
            var tmp = $("#i-ctrl-search-form-unloading-type-template");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id).change(Search.__currentComp.onCheckboxStateChanged);
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

        SearchController.prototype.onCheckboxStateChanged = function (event) {
            var chb = $(event.delegateTarget).parent();

            if (chb.hasClass("c-ctrl-search-form-checkbox-element")) {
                chb.removeClass("c-ctrl-search-form-checkbox-element").addClass("c-ctrl-search-form-checkbox-element-checked");
            } else {
                chb.removeClass("c-ctrl-search-form-checkbox-element-checked").addClass("c-ctrl-search-form-checkbox-element");
            }

            Search.__currentComp.changeCheckboxPanelText(chb);
        };

        SearchController.prototype.changeCheckboxPanelText = function (checkbox) {
            // соберём текст
            var textArr = [];
            var text = "не указан";
            var checked = $("input:checked", checkbox.parent());

            if (0 < checked.length) {
                for (var i = 0; i < checked.length; i++) {
                    var chk = $(checked.get(i));
                    var label = $("label", $(chk).parent());
                    textArr.push(label.text());
                }

                text = textArr.join("; ");
            }

            var textBlock = checkbox.parent().parent();
            $("label.c-ctrl-search-form-checked-options", textBlock).text(text);
        };

        SearchController.prototype.onCargoTypeUpDownButtonClick = function (event) {
            var btn = $(event.delegateTarget);

            if (btn.hasClass("fa-rotate-180")) {
                $("#i-ctrl-search-form-cargo-type-checkbox-container").removeClass("block").addClass("hidden");
                btn.removeClass("fa-rotate-180");
            } else {
                $("#i-ctrl-search-form-cargo-type-checkbox-container").removeClass("hidden").addClass("block");
                btn.addClass("fa-rotate-180");
            }
        };

        SearchController.prototype.onCargoAdrTypeUpDownButtonClick = function (event) {
            var btn = $(event.delegateTarget);

            if (btn.hasClass("fa-rotate-180")) {
                $("#i-ctrl-search-form-cargo-adr-type-checkbox-container").removeClass("block").addClass("hidden");
                btn.removeClass("fa-rotate-180");
            } else {
                $("#i-ctrl-search-form-cargo-adr-type-checkbox-container").removeClass("hidden").addClass("block");
                btn.addClass("fa-rotate-180");
            }
        };

        SearchController.prototype.onLoadingTypeUpDownButtonClick = function (event) {
            var btn = $(event.delegateTarget);

            if (btn.hasClass("fa-rotate-180")) {
                $("#i-ctrl-search-form-loading-type-checkbox-container").removeClass("block").addClass("hidden");
                btn.removeClass("fa-rotate-180");
            } else {
                $("#i-ctrl-search-form-loading-type-checkbox-container").removeClass("hidden").addClass("block");
                btn.addClass("fa-rotate-180");
            }
        };

        SearchController.prototype.onUnloadingTypeUpDownButtonClick = function (event) {
            var btn = $(event.delegateTarget);

            if (btn.hasClass("fa-rotate-180")) {
                $("#i-ctrl-search-form-unloading-type-checkbox-container").removeClass("block").addClass("hidden");
                btn.removeClass("fa-rotate-180");
            } else {
                $("#i-ctrl-search-form-unloading-type-checkbox-container").removeClass("hidden").addClass("block");
                btn.addClass("fa-rotate-180");
            }
        };

        SearchController.prototype.onCity1Focus = function (event) {
            Search.__currentComp.cityBound1 = true;
            Search.__currentComp.cityBound2 = false;

            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-search-form-load-city-txt"), Search.__currentComp);
        };

        SearchController.prototype.onCity2Focus = function (event) {
            Search.__currentComp.cityBound1 = false;
            Search.__currentComp.cityBound2 = true;

            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-search-form-unload-city-txt"), Search.__currentComp);
        };

        SearchController.prototype.onCity1Delete = function (event) {
            Search.__currentComp.cityTmpData1 = null;
            Search.__currentComp.applyCityData();
        };

        SearchController.prototype.onCity2Delete = function (event) {
            Search.__currentComp.cityTmpData2 = null;
            Search.__currentComp.applyCityData();
        };

        SearchController.prototype.applyCityData = function () {
            var city = null;
            var fullName = "";

            if (null != Search.__currentComp.cityTmpData1) {
                city = Search.__currentComp.cityTmpData1;
                fullName = city.fullname;
            }

            $("#i-ctrl-search-form-load-city-txt").val(fullName);

            fullName = "";

            if (null != Search.__currentComp.cityTmpData2) {
                city = Search.__currentComp.cityTmpData2;
                fullName = city.fullname;
            }

            $("#i-ctrl-search-form-unload-city-txt").val(fullName);
        };

        SearchController.prototype.onClearButtonClick = function (event) {
            // сбрасываем значения городов
            Search.__currentComp.setDefaultCargoDate();
            Search.__currentComp.onCity1Delete(null);
            Search.__currentComp.onCity2Delete(null);

            // сбрасываем отмеченные чекбоксы
            $("#i-ctrl-search-form :checkbox").attr("checked", false);
            $("#i-ctrl-search-form div.c-ctrl-search-form-checkbox-element-checked").removeClass("c-ctrl-search-form-checkbox-element-checked").addClass("c-ctrl-search-form-checkbox-element");
            $("#i-ctrl-search-form label.c-ctrl-search-form-checked-options").text("не указан");

            // сбрасываем текстовые поля
            $("#i-ctrl-search-form-max-weight-txt").val("");
            $("#i-ctrl-search-form-max-value-txt").val("");
            $("#i-ctrl-search-form-min-price-txt").val("");
            $("#i-ctrl-search-form-max-distance-txt").val("");
        };

        SearchController.prototype.onSubmitButtonClick = function (event) {
            // проверяем значения на корректность
            // отправляем данные на сервер
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
