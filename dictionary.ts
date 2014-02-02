///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>

module Dictionary
{
    export interface DictionaryEntry
    {
        id: number;
        name: string;
        description: string;
    }

    export interface DictData
    {
        name: string;
        data: DictionaryEntry[];
    }

    export class DictController
    {
        public application: Application.IApplication = null;
        public component: Application.IComponent;
        public companyForms: DictionaryEntry[] = null;
        public transportTypes: DictionaryEntry[] = null;

        init(application: Application.IApplication, component: Application.IComponent): void
        {
            __currDictionary.application = application; 
            __currDictionary.component = component;
        }

        queryDictData(name: string): void
        {
            if ("companyforms" == name)
            {
                if (null == __currDictionary.companyForms)
                    __currDictionary.getData(name);
                else
                    __currDictionary.component.dictDataReady(name);
            }
            else if ("transporttype" == name)
            {
                if (null == __currDictionary.transportTypes)
                    __currDictionary.getData(name);
                else
                    __currDictionary.component.dictDataReady(name);
            }
        }

        getData(name: string): void
        {
            $.ajax({
                type: "GET",
                url: __currDictionary.application.getFullUri("api/dict/" + name),
                success: __currDictionary.onAjaxGetDataSuccess,
                error: __currDictionary.onAjaxGetDataError
            });
        }



        onAjaxGetDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            //window.console.log("_onAjaxError");
        }

        onAjaxGetDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("_onAjaxGetDataSuccess");

            // загрузка компонента произведена успешно
            var dictData: DictData = <DictData>data.data;

            if (null != dictData.data)
            {
                if ("companyforms" == dictData.name)
                    __currDictionary.companyForms = <DictionaryEntry[]>dictData.data;
                else if ("transporttype" == dictData.name)
                    __currDictionary.transportTypes = <DictionaryEntry[]>dictData.data;

                __currDictionary.component.dictDataReady(dictData.name);
            }            
        }

        getNameById(dictName: string, id: number): string
        {
            var dict: DictionaryEntry[] = null;

            if ("companyforms" == dictName)
                dict = __currDictionary.companyForms;
            else if ("transporttype" == dictName)
                dict = __currDictionary.transportTypes;

            if (null != dict)
            {

                for (var i: number = 0; i < dict.length; i++)
                {
                    var entry: DictionaryEntry = dict[i];

                    if (id == entry.id)
                        return entry.name;
                }
            }

            return null;
        }

    }

    export var __currDictionary: DictController = new DictController(); 
}