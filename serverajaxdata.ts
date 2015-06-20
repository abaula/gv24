

module ServerData
{
    export class AjaxVehicle
    {
        id: number;
        typeId: number;
        name: string;
        maxValue: number;
        maxWeight: number;
        expences: number;
        taxWeight: number;
        taxValue: number;
    }

    export class AjaxVehicleList
    {
        vehicles: AjaxVehicle[] = [];
    }

    export class AjaxServerResponse
    {
        code: string;
        userMessage: string;
        moreInfoUri: string;
        data: any;
    }

    export class AjaxCityShortInfo
    {
        public id: number;
        public name: string;
    }


    export class AjaxCityList
    {
        public cities: AjaxCityShortInfo[];
    }

    export class AjaxTask
    {
        public id: number;
        public selectedId: number;
        public city1Id: number;
        public city1: string;
        public city2: string;
        public type: string;
        public weight: number;
        public value: number;
        public distance: number;
        public cost: number;
        public readyDate: string;
        public selected: boolean;
    }

    export class AjaxTaskList
    {
        public offset: number;
        public limit: number;
        public allRowCount: number;
        public page: number;
        public tasks: AjaxTask[];
    }

    export class AjaxTaskInfo
    {
        public taskId: number;
    }

    export class AjaxTaskInfoList
    {
        public tasks: AjaxTaskInfo[];
    }

    export class AjaxIdsList
    {
        public ids: number[];
    }

    export class AjaxRoutePoint
    {
        public routePointId: number;
        public isFirstPoint: boolean;
        public routePointDistance: number;
        public cityId: number;
        public cityName: string;
        public weight: number;
        public value: number;
        public cost: number;
        public readyDate: string;

        public cargoId: number;
        public cargoIsDeleted: boolean;
        public cargoDistance: boolean;
        public cargoWeight: boolean;
        public cargoValue: boolean;
        public cargoCost: boolean;
    }

    export class AjaxVirtualRoutePoint
    {
        public startCityId: number;
        public addBackWayEntry: boolean;
    }



    export class AjaxRoutePointList
    {
        public routePoints: AjaxRoutePoint[];
    }


    export class AjaxIdsListAndRoutePointList
    {
        public idsList: AjaxIdsList;
        public routePointList: AjaxRoutePointList;
        public routeStartCitiesList: AjaxCityList;
    }

    export class AjaxRoutePointPlace
    {
        public routePointId: number;
        public afterRoutePointId: number;
    }


    export class AjaxRoutePointListAndCitiesList
    {
        public routePointList: AjaxRoutePointList;
        public routeStartCitiesList: AjaxCityList;
    }

    export class AjaxRoutePointPlaceAndRoutePointList
    {
        public routePointPlace: AjaxRoutePointPlace;
        public routePointList: AjaxRoutePointList;
        public routeStartCitiesList: AjaxCityList;
    }

    export class AjaxRoutePointListAndAjaxTaskList
    {
        public ajaxTaskList: AjaxTaskList;
        public routePointList: AjaxRoutePointList;
        public startCitiesList: AjaxCityList;
        public routeStartCitiesList: AjaxCityList;
    }

    export class AjaxVehicleParams
    {
        public maxValue: number;
        public maxWeight: number;
        public expences: number;
        public tax: number;

        constructor(maxValue: number, maxWeight: number, expences: number, tax: number)
        {
            this.expences = expences;
            this.maxValue = maxValue;
            this.maxWeight = maxWeight;
            this.tax = tax;
        }
    }


    export class AjaxCalculateOptions
    {
        public startCityId: number;
        public conflictResolveCriteria: string;
        public loadingStrategy: string;
        public useCargoFromRoute: boolean;
        public buildWayBack: boolean;
        public vehicleParams: AjaxVehicleParams;

        /*
        constructor(startCityId: number, conflictResolveCriteria: string, loadingStrategy: string, useCargoFromRoute: boolean, vehicleOptions: AjaxVehicleParams, buildWayBack: boolean)
        {
            this.buildWayBack = buildWayBack;
            this.conflictResolveCriteria = conflictResolveCriteria;
            this.loadingStrategy = loadingStrategy;
            this.startCityId = startCityId;
            this.useCargoFromRoute = useCargoFromRoute;
            this.vehicleParams = vehicleOptions;
        }
        */

    }

}