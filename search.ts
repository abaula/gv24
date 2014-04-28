///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>

module Search
{

    export class SearchController implements Application.IComponent
    {
        public isComponentLoaded: boolean = false;
        public application: Application.IApplication = null;
        public state: Application.IState = null;

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

        drawCargoType(data: Dictionary.DictionaryEntry[]): void
        {
            var container: JQuery = $("#i-ctrl-search-form-cargo-type");
            var tmp: JQuery = $("#i-ctrl-search-form-cargo-type-template");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        }

        drawCargoADRType(data: Dictionary.DictionaryEntry[]): void
        {
            var container: JQuery = $("#i-ctrl-search-form-cargo-adr-type");
            var tmp: JQuery = $("#i-ctrl-search-form-cargo-adr-type-template");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];

                if ("нет" == entry.name)
                    continue;

                var opt: JQuery = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        }

        drawLoadingType(data: Dictionary.DictionaryEntry[]): void
        {
            var container: JQuery = $("#i-ctrl-search-form-loading-type");
            var tmp: JQuery = $("#i-ctrl-search-form-loading-type-template");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id);
                $("label", opt).text(entry.name);

                container.append(opt);
            }
        }

        drawUnloadingType(data: Dictionary.DictionaryEntry[]): void
        {
            var container: JQuery = $("#i-ctrl-search-form-unloading-type");
            var tmp: JQuery = $("#i-ctrl-search-form-unloading-type-template");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = tmp.clone();
                opt.removeAttr("id").removeClass("hidden").addClass("c-ctrl-search-form-checkbox-element");
                $(":checkbox", opt).attr("data-id", entry.id);
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