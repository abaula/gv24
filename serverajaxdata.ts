

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

    export class AjaxTask
    {
        public id: number;
        public selectedId: number;
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
        public cargoId: number;
        public cargoIsDeleted: boolean;
        public routePointDistance: number;
        public cityId: number;
        public cityName: string;
        public weight: number;
        public value: number;
        public cost: number;
        public readyDate: string;
    }

    export class AjaxRoutePointList
    {
        public routePoints: AjaxRoutePoint[];
    }


    export class AjaxIdsListAndRoutePointList
    {
        public idsList: AjaxIdsList;
        public routePointList: AjaxRoutePointList;
    }

    export class AjaxRoutePointPlace
    {
        public routePointId: number;
        public afterRoutePointId: number;
    }


    export class AjaxRoutePointPlaceAndRoutePointList
    {
        public routePointPlace: AjaxRoutePointPlace;
        public routePointList: AjaxRoutePointList;
    }

    export class AjaxRoutePointListAndAjaxTaskList
    {
        public ajaxTaskList: AjaxTaskList;
        public routePointList: AjaxRoutePointList;
    }



}