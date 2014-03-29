///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>

module TasksProfile
{

    export class AjaxCargo
    {
        id: number;
        name: string;
        description: string;

        cargoTypeId: number;
        bodyTypeId: number;
        cargoADRTypeId: number;

        weight: number;
        value: number;

        packingTypeId: number;
        numOfPackages: number;

        city1: number;
        addr1: string;
        loadingTypeId1: number;

        city2: number;
        addr2: string;
        loadingTypeId2: number;

        distance: number;

        readyDate: string;
        cost: number;

        contacts: string;


    }


    export class AjaxCargoList
    {
        cargo: AjaxCargo[]; 
    }



    export class TasksProfileController implements Application.IComponent, Application.ICitySelector
    {
        isComponentLoaded: boolean;
        application: Application.IApplication = null;
        parent: Application.IComponent = null

        loadsData: AjaxCargoList = null;
        errorData: ServerData.AjaxServerResponse = null;

        cityTmpData1: Application.CityData = null;
        cityTmpData2: Application.CityData = null;
        cityBound1: boolean = false;
        cityBound2: boolean = false;

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

            select.val(0);
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

            select.val(0);
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

            select.val(0);
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

            select.val(0);
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

            select.val(0);
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

            select.val(0);
        }

        clearFormErrors(): void
        {
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-name-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-description-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-adr-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-body-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-weight-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-value-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-packing-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-num-of-packages-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-from-city-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-from-address-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-loading-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-to-city-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-to-address-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-unloading-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-ready-date-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cost-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-contacts-error-message", "", false);
        }

        clearForm(): void
        {
            __currentTasksProfile.clearFormErrors();
            $("#i-ctrl-tasks-form-block :text").val("");
            $("#i-ctrl-tasks-form-block textarea").val("");
            $("#i-ctrl-tasks-form-cargo-type-select").val(0);
            $("#i-ctrl-tasks-form-cargo-adr-type-select").val(0);
            $("#i-ctrl-tasks-form-body-type-select").val(0);
            $("#i-ctrl-tasks-form-packing-type-select").val(0);
            $("#i-ctrl-tasks-form-loading-type-select").val(0);
            $("#i-ctrl-tasks-form-unloading-type-select").val(0);
            __currentTasksProfile.onCity1Delete(null);
            __currentTasksProfile.onCity2Delete(null);
        }

        createAjaxCargoFromForm(): AjaxCargo
        {
            var cargo: AjaxCargo = new AjaxCargo();
            var errors: boolean = false;

            // название
            cargo.name = $("#i-ctrl-tasks-form-name-txt").val().trim();

            if (1 > cargo.name.length)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-name-error-message", "Введите название груза", true);
            }


            // тип груза
            cargo.cargoTypeId = $("#i-ctrl-tasks-form-cargo-type-select").val();

            if (1 > cargo.cargoTypeId)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-type-error-message", "Укажите тип груза", true);
            }

            // подробно
            cargo.description = $("#i-ctrl-tasks-form-description-txt").val().trim();

            // опасный груз
            cargo.cargoADRTypeId = $("#i-ctrl-tasks-form-cargo-adr-type-select").val();

            if (1 > cargo.cargoADRTypeId)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-adr-type-error-message", "Укажите класс опасного груза", true);
            }
              
            // тип кузова
            cargo.bodyTypeId = $("#i-ctrl-tasks-form-body-type-select").val();

            if (1 > cargo.bodyTypeId)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-body-type-error-message", "Укажите тип кузова", true);
            }
                

            // вес
            cargo.weight = parseInt($("#i-ctrl-tasks-form-weight-txt").val().trim());

            if (isNaN(cargo.weight) || 1 > cargo.weight)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-weight-error-message", "Укажите вес груза", true);
            }

            // объём
            cargo.value = parseInt($("#i-ctrl-tasks-form-value-txt").val().trim());

            if (isNaN(cargo.value) || 1 > cargo.value)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-value-error-message", "Укажите объём груза", true);
            }

            // упаковка 
            cargo.packingTypeId = $("#i-ctrl-tasks-form-packing-type-select").val();

            if (1 > cargo.packingTypeId)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-packing-type-error-message", "Укажите тип упаковки", true);
            }


            // кол-во мест
            cargo.numOfPackages = parseInt($("#i-ctrl-tasks-form-num-of-packages-txt").val().trim());

            // откуда
            if (null == __currentTasksProfile.cityTmpData1)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-from-city-error-message", "Укажите город отправки груза", true);
            }
            else
            {
                cargo.city1 = __currentTasksProfile.cityTmpData1.id;
            }

            // адрес 1
            cargo.addr1 = $("#i-ctrl-tasks-form-from-address-txt").val().trim();

            // погрузка 1
            cargo.loadingTypeId1 = $("#i-ctrl-tasks-form-loading-type-select").val();

            if (1 > cargo.loadingTypeId1)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-loading-type-error-message", "Укажите способ погрузки", true);
            }

            // куда 
            if (null == __currentTasksProfile.cityTmpData2)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-to-city-error-message", "Укажите город прибытия груза", true);
            }
            else
            {
                cargo.city2 = __currentTasksProfile.cityTmpData2.id;
            }

            // адрес 2
            cargo.addr2 = $("#i-ctrl-tasks-form-to-address-txt").val().trim();

            // разгрузка
            cargo.loadingTypeId2 = $("#i-ctrl-tasks-form-unloading-type-select").val();

            if (1 > cargo.loadingTypeId2)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-unloading-type-error-message", "Укажите способ разгрузки", true);
            }


            // дата готовности
            cargo.readyDate = $("#i-ctrl-tasks-form-ready-date-txt").val().trim();

            if (false == Validators.Validator.prototype.validateDate(cargo.readyDate))
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-ready-date-error-message", "Укажите дату готовности груза", true);
            }

            // стоимость
            cargo.cost = parseInt($("#i-ctrl-tasks-form-cost-txt").val().trim());

            if (isNaN(cargo.cost) || 1 > cargo.cost)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cost-error-message", "Укажите стоимость за перевозку", true);
            }

            // контакты
            cargo.contacts = $("#i-ctrl-tasks-form-contacts-txt").val().trim();



            return errors ? null : cargo;
        }


        onSubmitButtonClick(event: JQueryEventObject): void
        {
            // чистим ошибки на форме
            __currentTasksProfile.clearFormErrors();

            // проверка данных
            var cargo: AjaxCargo = __currentTasksProfile.createAjaxCargoFromForm();

            if (null != cargo)
            {
                // TODO отправка данных на сервер


            }
        }

        onCancelButtonClick(event: JQueryEventObject): void
        {
            // очистка формы
            __currentTasksProfile.clearForm();


            // TODO закрытие формы
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