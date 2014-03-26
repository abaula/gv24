///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>

module TasksProfile
{

    export class AjaxTasksData
    {
    }



    export class TasksProfileController implements Application.IComponent, Application.ICitySelector
    {
        isComponentLoaded: boolean;
        application: Application.IApplication = null;
        parent: Application.IComponent = null

        loadsData: AjaxTasksData = null;
        errorData: ServerData.AjaxServerResponse = null;

        public cityTmpData1: Application.CityData = null;
        public cityTmpData2: Application.CityData = null;
        public cityBound1: boolean = false;
        public cityBound2: boolean = false;

        // вызовы от IApplication
        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentTasksProfile.application = app;
            __currentTasksProfile.parent = parent;
            Dictionary.__currDictionary.init(app, __currentTasksProfile);

            // цепляем обработчики событий
            $("#i-ctrl-tasks-form-submit-btn").click(__currentTasksProfile.onSubmitButtonClick);
            $("#i-ctrl-tasks-form-cancel-btn").click(__currentTasksProfile.onCancelButtonClick);

            $("#i-ctrl-tasks-form-from-city-txt").focus(__currentTasksProfile.onCity1Focus);
            $("#i-ctrl-tasks-form-to-city-txt").focus(__currentTasksProfile.onCity2Focus);

            $("#i-ctrl-tasks-form-from-city-delete-btn").click(__currentTasksProfile.onCity1Delete);
            $("#i-ctrl-tasks-form-to-city-delete-btn").click(__currentTasksProfile.onCity2Delete);

            // получаем данные справочников
            Dictionary.__currDictionary.queryDictData("cargotype");
            Dictionary.__currDictionary.queryDictData("packingtype");
            Dictionary.__currDictionary.queryDictData("cargoadrtype");
            Dictionary.__currDictionary.queryDictData("bodytype");
            Dictionary.__currDictionary.queryDictData("loadingtype");

            // получаем данные
            __currentTasksProfile.queryData();
        }

        onUpdate(state: Application.IState): void
        { }

        onShow(state: Application.IState): void
        {
            Dictionary.__currDictionary.init(__currentTasksProfile.application, __currentTasksProfile);
            __currentTasksProfile.queryData();
        }

        onHide(state: Application.IState): void
        { }

        // вызовы от child IComponent
        dataLoaded(sender: Application.IComponent): void
        { }

        dataReady(sender: Application.IComponent): void
        { }

        dataError(sender: Application.IComponent, error: ServerData.AjaxServerResponse): void
        { }

        // вызовы от DictController
        dictDataReady(name: string): void
        {
            if ("cargotype" == name)
            {
                __currentTasksProfile.drawCargoType(Dictionary.__currDictionary.cargoTypes);
            }
            else if ("packingtype" == name)
            {
                __currentTasksProfile.drawPackingType(Dictionary.__currDictionary.packingTypes);
            }
            else if ("cargoadrtype" == name)
            {
                __currentTasksProfile.drawCargoADRType(Dictionary.__currDictionary.cargoADRTypes);
            }
            else if ("bodytype" == name)
            {
                __currentTasksProfile.drawBodyType(Dictionary.__currDictionary.bodyTypes);
            }
            else if ("loadingtype" == name)
            {
                __currentTasksProfile.drawLoadingType(Dictionary.__currDictionary.loadingTypes);
                __currentTasksProfile.drawUnloadingType(Dictionary.__currDictionary.loadingTypes);
            }

        }


        onCitySelected(city: Application.CityData): void
        {
            if (true == __currentTasksProfile.cityBound1)
            {
                __currentTasksProfile.cityTmpData1 = city;
            }
            else
            {
                __currentTasksProfile.cityTmpData2 = city;
            }

            __currentTasksProfile.applyCityData();
        }

        onCitySelectedAbort(): void
        {
            __currentTasksProfile.applyCityData();
        }


        applyCityData(): void
        {
            var city: Application.CityData = null;
            var fullName: string = "";

            if (null != __currentTasksProfile.cityTmpData1)
            {
                city = __currentTasksProfile.cityTmpData1;
                fullName = city.fullname;
            }

            $("#i-ctrl-tasks-form-from-city-txt").val(fullName);

            fullName = "";

            if (null != __currentTasksProfile.cityTmpData2)
            {
                city = __currentTasksProfile.cityTmpData2;
                fullName = city.fullname;
            }

            $("#i-ctrl-tasks-form-to-city-txt").val(fullName);
        }

        // обновление данных с сервера
        uploadData()
        {
            __currentTasksProfile.loadsData = null;
            __currentTasksProfile.errorData = null;
            //__currentLoadsProfile.getData();
            __currentTasksProfile.queryData();
        }

        queryData(): void
        {
            if (false == __currentTasksProfile.isComponentLoaded)
            {
                __currentTasksProfile.isComponentLoaded = true;
                __currentTasksProfile.parent.dataLoaded(__currentTasksProfile);
            }
            else
            {
                __currentTasksProfile.parent.dataReady(__currentTasksProfile);
            }
        }


        getData(): void
        {
            /*$.ajax({
                type: "GET",
                url: __currentOrgProfile.application.getFullUri("api/org"),
                success: __currentOrgProfile.onAjaxGetOrgDataSuccess,
                error: __currentOrgProfile.onAjaxGetOrgDataError
            });*/
        }


        drawCargoType(data: Dictionary.DictionaryEntry[]): void
        {

            var select: JQuery = $("#i-ctrl-tasks-form-cargo-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        }

        drawCargoADRType(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-tasks-form-cargo-adr-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        }

        drawBodyType(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-tasks-form-body-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        }

        drawPackingType(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-tasks-form-packing-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        }

        drawLoadingType(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-tasks-form-loading-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        }

        drawUnloadingType(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-tasks-form-unloading-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        }

        onSubmitButtonClick(event: JQueryEventObject): void
        {
            // проверка данных

            // отправка данных на сервер

        }

        onCancelButtonClick(event: JQueryEventObject): void
        {
            // очистка формы

            // закрытие формы
        }

        onCity1Focus(event: JQueryEventObject): void
        {
            __currentTasksProfile.cityBound1 = true;
            __currentTasksProfile.cityBound2 = false;

            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-tasks-form-from-city-txt"), __currentTasksProfile);
        }


        onCity2Focus(event: JQueryEventObject): void
        {
            __currentTasksProfile.cityBound1 = false;
            __currentTasksProfile.cityBound2 = true;

            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-tasks-form-to-city-txt"), __currentTasksProfile);
        }

        onCity1Delete(event: JQueryEventObject): void
        {
            __currentTasksProfile.cityTmpData1 = null;
            __currentTasksProfile.applyCityData();
        }

        onCity2Delete(event: JQueryEventObject): void
        {
            __currentTasksProfile.cityTmpData2 = null;
            __currentTasksProfile.applyCityData();
        }
    }

    export var __currentTasksProfile = new TasksProfileController();
}