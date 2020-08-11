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
        public cargoTypes: DictionaryEntry[] = null;
        public packingTypes: DictionaryEntry[] = null;
        public cargoADRTypes: DictionaryEntry[] = null;
        public bodyTypes: DictionaryEntry[] = null;
        public loadingTypes: DictionaryEntry[] = null;

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
            else if ("cargotype" == name)
            {
                if (null == __currDictionary.cargoTypes)
                    __currDictionary.getData(name);
                else
                    __currDictionary.component.dictDataReady(name);
            }
            else if ("packingtype" == name)
            {
                if (null == __currDictionary.packingTypes)
                    __currDictionary.getData(name);
                else
                    __currDictionary.component.dictDataReady(name);
            }
            else if ("cargoadrtype" == name)
            {
                if (null == __currDictionary.cargoADRTypes)
                    __currDictionary.getData(name);
                else
                    __currDictionary.component.dictDataReady(name);
            }
            else if ("bodytype" == name)
            {
                if (null == __currDictionary.bodyTypes)
                    __currDictionary.getData(name);
                else
                    __currDictionary.component.dictDataReady(name);
            }
            else if ("loadingtype" == name)
            {
                if (null == __currDictionary.loadingTypes)
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
                error: __currDictionary.onAjaxGetDataError,
                async: false
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
                else if ("cargotype" == dictData.name)
                    __currDictionary.cargoTypes = <DictionaryEntry[] > dictData.data;
                else if ("packingtype" == dictData.name)
                    __currDictionary.packingTypes = <DictionaryEntry[]> dictData.data;
                else if ("cargoadrtype" == dictData.name)
                    __currDictionary.cargoADRTypes = <DictionaryEntry[]> dictData.data;
                else if ("bodytype" == dictData.name)
                    __currDictionary.bodyTypes = <DictionaryEntry[]> dictData.data;
                else if ("loadingtype" == dictData.name)
                    __currDictionary.loadingTypes = <DictionaryEntry[]> dictData.data;


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
            else if ("cargotype" == dictName)
                dict = __currDictionary.cargoTypes;
            else if ("packingtype" == dictName)
                dict = __currDictionary.packingTypes;
            else if ("cargoadrtype" == dictName)
                dict = __currDictionary.cargoADRTypes;
            else if ("bodytype" == dictName)
                dict = __currDictionary.bodyTypes;
            else if ("loadingtype" == dictName)
                dict = __currDictionary.loadingTypes;


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