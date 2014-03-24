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


        // вызовы от IApplication
        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentTasksProfile.application = app;
            __currentTasksProfile.parent = parent;
            Dictionary.__currDictionary.init(app, __currentTasksProfile);

            // получаем данные справочников
            Dictionary.__currDictionary.queryDictData("transporttype");
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
            if ("transporttype" == name)
            {

            }
            else if ("cargotype" == name)
            {
                __currentTasksProfile.drawCargoType(Dictionary.__currDictionary.cargoTypes);
            }
            else if ("packingtype" == name)
            {

            }
            else if ("cargoadrtype" == name)
            {

            }
            else if ("bodytype" == name)
            {

            }
            else if ("loadingtype" == name)
            {

            }

        }


        onCitySelected(city: Application.CityData): void
        {
        }

        onCitySelectedAbort(): void
        {
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

            /*
            TODO отрисовываем типы машин в таблице

            if (null != __currentOrgProfile.orgData)
            {
                select.val(__currentOrgProfile.orgData.info.formId.toString());
            }
            */

        }

    }

    export var __currentTasksProfile = new TasksProfileController();
}