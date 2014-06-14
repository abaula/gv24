///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>

module Search
{

    export class SearchController implements Application.IComponent, Application.ICitySelector
    {
        public isComponentLoaded: boolean = false;
        public application: Application.IApplication = null;
        public state: Application.IState = null;

        cityTmpData1: Application.CityData = null;
        cityTmpData2: Application.CityData = null;
        cityBound1: boolean = false;
        cityBound2: boolean = false;

        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentComp.application = app;
            __currentComp.state = state;
            Dictionary.__currDictionary.init(app, __currentComp);

            // загружаем словари
            Dictionary.__currDictionary.queryDictData("cargotype");
            Dictionary.__currDictionary.queryDictData("cargoadrtype");
            Dictionary.__currDictionary.queryDictData("loadingtype");

            __currentComp.setDefaultCargoDate();

            // настраиваем обработчики событий
            $("#i-ctrl-search-form-cargo-type-up-down-button").click(__currentComp.onCargoTypeUpDownButtonClick);
            $("#i-ctrl-search-form-cargo-adr-type-up-down-button").click(__currentComp.onCargoAdrTypeUpDownButtonClick);
            $("#i-ctrl-search-form-loading-type-up-down-button").click(__currentComp.onLoadingTypeUpDownButtonClick);
            $("#i-ctrl-search-form-unloading-type-up-down-button").click(__currentComp.onUnloadingTypeUpDownButtonClick);

            $("#i-ctrl-search-form-load-city-txt").focus(__currentComp.onCity1Focus);
            $("#i-ctrl-search-form-unload-city-txt").focus(__currentComp.onCity2Focus);

            $("#i-ctrl-search-form-load-city-delete-btn").click(__currentComp.onCity1Delete);
            $("#i-ctrl-search-form-unload-city-delete-btn").click(__currentComp.onCity2Delete);

            $("#i-ctrl-search-form-cancel-btn").click(__currentComp.onClearButtonClick);
            $("#i-ctrl-search-form-submit-btn").click(__currentComp.onSubmitButtonClick);

            // проверяем авторизован ли пользователь
            var authentificated: boolean = __currentComp.application.isAuthentificated();

            if (authentificated)
                __currentComp.switchSaveQuerySectionVisible(true);                
            else
                __currentComp.switchSaveQuerySectionVisible(false);
                


            __currentComp.onComponentLoaded();
        }

        onUpdate(state: Application.IState): void
        {
            // TODO Чистим список результатов поиска


            __currentComp.onComponentLoaded();
        }

        onShow(state: Application.IState): void
        {
            // Ничего не делаем
        }

        onHide(state: Application.IState): void
        {
            // Ничего не делаем
        }

        onLogin(): void
        {
            __currentComp.switchSaveQuerySectionVisible(true);
        }

        onLogout(): void
        {
            __currentComp.switchSaveQuerySectionVisible(false);
        }

        dataLoaded(sender: Application.IComponent): void
        {
            // Дочерних компонентов нет, ничего не делаем
        }

        dataReady(sender: Application.IComponent): void
        {
            // Дочерних компонентов нет, ничего не делаем
        }

        dataError(sender: Application.IComponent, error: ServerData.AjaxServerResponse): void
        {
            // Дочерних компонентов нет, ничего не делаем
        }

        dictDataReady(name: string): void
        {
            if ("cargotype" == name)
            {
                __currentComp.drawCargoType(Dictionary.__currDictionary.cargoTypes);
            }
            else if ("cargoadrtype" == name)
            {
                __currentComp.drawCargoADRType(Dictionary.__currDictionary.cargoADRTypes);
            }
            else if ("loadingtype" == name)
            {
                __currentComp.drawLoadingType(Dictionary.__currDictionary.loadingTypes);
                __currentComp.drawUnloadingType(Dictionary.__currDictionary.loadingTypes);
            }
        }

        onComponentLoaded(): void
        {
            __currentComp.isComponentLoaded = true;
            __currentComp.application.componentReady();
        }


        onCitySelected(city: Application.CityData): void
        {
            if (true == __currentComp.cityBound1)
            {
                __currentComp.cityTmpData1 = city;
            }
            else
            {
                __currentComp.cityTmpData2 = city;
            }

            __currentComp.applyCityData();
        }

        onCitySelectedAbort(): void
        {
            __currentComp.applyCityData();
        }


        switchSaveQuerySectionVisible(visible: boolean): void
        {
            if (visible)
            {
                $("#i-ctrl-search-form-query-name-container, #i-ctrl-search-form-save-query-container").removeClass("hidden").addClass("block");
            }
            else
            {
                $("#i-ctrl-search-form-query-name-container, #i-ctrl-search-form-save-query-container").removeClass("block").addClass("hidden");
            }
        }

        drawCargoType(data: Dictionary.DictionaryEntry[]): void
        {
            var container: JQuery = $("#i-ctrl-search-form-cargo-type-checkbox-container");
            var tmp: JQuery = $("#i-ctrl-search-form-cargo-type-template");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id).change(__currentComp.onCheckboxStateChanged);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        }

        drawCargoADRType(data: Dictionary.DictionaryEntry[]): void
        {
            var container: JQuery = $("#i-ctrl-search-form-cargo-adr-type-checkbox-container");
            var tmp: JQuery = $("#i-ctrl-search-form-cargo-adr-type-template");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];

                if ("нет" == entry.name)
                    continue;

                var opt: JQuery = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id).change(__currentComp.onCheckboxStateChanged);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        }

        drawLoadingType(data: Dictionary.DictionaryEntry[]): void
        {
            var container: JQuery = $("#i-ctrl-search-form-loading-type-checkbox-container");
            var tmp: JQuery = $("#i-ctrl-search-form-loading-type-template");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id).change(__currentComp.onCheckboxStateChanged);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        }

        drawUnloadingType(data: Dictionary.DictionaryEntry[]): void
        {
            var container: JQuery = $("#i-ctrl-search-form-unloading-type-checkbox-container");
            var tmp: JQuery = $("#i-ctrl-search-form-unloading-type-template");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id).change(__currentComp.onCheckboxStateChanged);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        }


        clearCargoDate(): void
        {
            $("#i-ctrl-search-form-ready-date-day-select option").remove();
            $("#i-ctrl-search-form-ready-date-month-select option").remove();
            $("#i-ctrl-search-form-ready-date-year-select option").remove();
        }

        setDefaultCargoDate(): void
        {
            var date: Date = new Date();
            //window.console.log(date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear());
            var dateString: string = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            //__currentTasksProfile.setCargoDate("12-06-1997");
            __currentComp.setCargoDate(dateString);
        }

        getCargoDate(): string
        {
            var day: string = $("#i-ctrl-search-form-ready-date-day-select").val();
            var month: string = $("#i-ctrl-search-form-ready-date-month-select").val();
            var year: string = $("#i-ctrl-search-form-ready-date-year-select").val();

            return day + "-" + (parseInt(month) < 10 ? ("0" + month) : month) + "-" + year;
        }

        setCargoDate(date: string): void
        {
            var arr: string[] = date.split("-");
            var day: number = parseInt(arr[0]);
            var month: number = parseInt(arr[1]);
            var year: number = parseInt(arr[2]);

            var opt: JQuery = null;
            var select: JQuery = null;

            // заполняем дни
            select = $("#i-ctrl-search-form-ready-date-day-select");

            for (var i: number = 1; i <= 31; i++)
            {
                opt = $("<option></option>");
                opt.val(i).text(i);
                select.append(opt);
            }

            select.val(day);

            // заполняем месяца
            var monthArr: string[] = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
            select = $("#i-ctrl-search-form-ready-date-month-select");

            for (var i: number = 0; i < 12; i++)
            {
                opt = $("<option></option>");
                opt.val(i + 1).text(monthArr[i]);
                select.append(opt);
            }

            select.val(month);

            // заполняем года
            select = $("#i-ctrl-search-form-ready-date-year-select");

            var d: Date = new Date();
            var currentYear: number = d.getFullYear();

            if (year != currentYear)
            {
                opt = $("<option></option>");
                opt.val(year).text(year);
                select.append(opt);
            }

            for (var i: number = 0; i < 2; i++)
            {
                opt = $("<option></option>");
                opt.val(currentYear + i).text(currentYear + i);
                select.append(opt);
            }

        }

        onCheckboxStateChanged(event: JQueryEventObject): void
        {
            var chb: JQuery = $(event.delegateTarget).parent();

            if (chb.hasClass("c-ctrl-search-form-checkbox-element"))
            {
                chb.removeClass("c-ctrl-search-form-checkbox-element").addClass("c-ctrl-search-form-checkbox-element-checked");
            }
            else
            {
                chb.removeClass("c-ctrl-search-form-checkbox-element-checked").addClass("c-ctrl-search-form-checkbox-element");
            }

            __currentComp.changeCheckboxPanelText(chb);
        }

        changeCheckboxPanelText(checkbox: JQuery): void
        {
            // соберём текст
            var textArr: string[] = [];
            var text: string = "не указан";
            var checked: JQuery = $("input:checked", checkbox.parent());

            if (0 < checked.length)
            {
                for (var i: number = 0; i < checked.length; i++)
                {
                    var chk: JQuery = $(checked.get(i));
                    var label = $("label", $(chk).parent());
                    textArr.push(label.text());
                }

                text = textArr.join("; ");
            }

            var textBlock: JQuery = checkbox.parent().parent();
            $("label.c-ctrl-search-form-checked-options", textBlock).text(text);
        }


        onCargoTypeUpDownButtonClick(event: JQueryEventObject): void
        {
            var btn: JQuery = $(event.delegateTarget);

            if (btn.hasClass("fa-rotate-180"))
            {
                $("#i-ctrl-search-form-cargo-type-checkbox-container").removeClass("block").addClass("hidden");
                btn.removeClass("fa-rotate-180");
            }
            else
            {
                $("#i-ctrl-search-form-cargo-type-checkbox-container").removeClass("hidden").addClass("block");
                btn.addClass("fa-rotate-180");
            }
        }


        onCargoAdrTypeUpDownButtonClick(event: JQueryEventObject): void
        {
            var btn: JQuery = $(event.delegateTarget);

            if (btn.hasClass("fa-rotate-180"))
            {
                $("#i-ctrl-search-form-cargo-adr-type-checkbox-container").removeClass("block").addClass("hidden");
                btn.removeClass("fa-rotate-180");
            }
            else
            {
                $("#i-ctrl-search-form-cargo-adr-type-checkbox-container").removeClass("hidden").addClass("block");
                btn.addClass("fa-rotate-180");
            }
        }


        onLoadingTypeUpDownButtonClick(event: JQueryEventObject): void
        {
            var btn: JQuery = $(event.delegateTarget);

            if (btn.hasClass("fa-rotate-180"))
            {
                $("#i-ctrl-search-form-loading-type-checkbox-container").removeClass("block").addClass("hidden");
                btn.removeClass("fa-rotate-180");
            }
            else
            {
                $("#i-ctrl-search-form-loading-type-checkbox-container").removeClass("hidden").addClass("block");
                btn.addClass("fa-rotate-180");
            }
        }

        onUnloadingTypeUpDownButtonClick(event: JQueryEventObject): void
        {
            var btn: JQuery = $(event.delegateTarget);

            if (btn.hasClass("fa-rotate-180"))
            {
                $("#i-ctrl-search-form-unloading-type-checkbox-container").removeClass("block").addClass("hidden");
                btn.removeClass("fa-rotate-180");
            }
            else
            {
                $("#i-ctrl-search-form-unloading-type-checkbox-container").removeClass("hidden").addClass("block");
                btn.addClass("fa-rotate-180");
            }
        }

        onCity1Focus(event: JQueryEventObject): void
        {
            __currentComp.cityBound1 = true;
            __currentComp.cityBound2 = false;

            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-search-form-load-city-txt"), __currentComp);
        }


        onCity2Focus(event: JQueryEventObject): void
        {
            __currentComp.cityBound1 = false;
            __currentComp.cityBound2 = true;

            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-search-form-unload-city-txt"), __currentComp);
        }

        onCity1Delete(event: JQueryEventObject): void
        {
            __currentComp.cityTmpData1 = null;
            __currentComp.applyCityData();
        }

        onCity2Delete(event: JQueryEventObject): void
        {
            __currentComp.cityTmpData2 = null;
            __currentComp.applyCityData();
        }

        applyCityData(): void
        {
            var city: Application.CityData = null;
            var fullName: string = "";

            if (null != __currentComp.cityTmpData1)
            {
                city = __currentComp.cityTmpData1;
                fullName = city.fullname;
            }

            $("#i-ctrl-search-form-load-city-txt").val(fullName);

            fullName = "";

            if (null != __currentComp.cityTmpData2)
            {
                city = __currentComp.cityTmpData2;
                fullName = city.fullname;
            }

            $("#i-ctrl-search-form-unload-city-txt").val(fullName);
        }

        onClearButtonClick(event: JQueryEventObject): void
        {
            // сбрасываем значения городов
            __currentComp.setDefaultCargoDate();
            __currentComp.onCity1Delete(null);
            __currentComp.onCity2Delete(null);

            // сбрасываем отмеченные чекбоксы
            $("#i-ctrl-search-form :checkbox").attr("checked", false);
            $("#i-ctrl-search-form div.c-ctrl-search-form-checkbox-element-checked").removeClass("c-ctrl-search-form-checkbox-element-checked").addClass("c-ctrl-search-form-checkbox-element");
            $("#i-ctrl-search-form label.c-ctrl-search-form-checked-options").text("не указан");

            // сбрасываем текстовые поля
            $("#i-ctrl-search-form-max-weight-txt").val("");
            $("#i-ctrl-search-form-max-value-txt").val("");
            $("#i-ctrl-search-form-min-price-txt").val("");
            $("#i-ctrl-search-form-max-distance-txt").val("");

        }

        onSubmitButtonClick(event: JQueryEventObject): void
        {
            // проверяем значения на корректность



            // отправляем данные на сервер


            
        }




        onDocumentReady(): void
        {
            /////////////////////////////////////
            // цепляем обработчики событий
            

            // настраиваем Application
            Application.__currentApp.init(__currentComp, false);
        }





    }

    export var __currentComp: SearchController = new SearchController();
}

$(document).ready(Search.__currentComp.onDocumentReady);