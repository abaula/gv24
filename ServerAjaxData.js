var ServerData;
(function (ServerData) {
    var AjaxVehicle = (function () {
        function AjaxVehicle() {
        }
        return AjaxVehicle;
    })();
    ServerData.AjaxVehicle = AjaxVehicle;

    var AjaxVehicleList = (function () {
        function AjaxVehicleList() {
            this.vehicles = [];
        }
        return AjaxVehicleList;
    })();
    ServerData.AjaxVehicleList = AjaxVehicleList;

    var AjaxServerResponse = (function () {
        function AjaxServerResponse() {
        }
        return AjaxServerResponse;
    })();
    ServerData.AjaxServerResponse = AjaxServerResponse;

    var AjaxCityShortInfo = (function () {
        function AjaxCityShortInfo() {
        }
        return AjaxCityShortInfo;
    })();
    ServerData.AjaxCityShortInfo = AjaxCityShortInfo;

    var AjaxCityList = (function () {
        function AjaxCityList() {
        }
        return AjaxCityList;
    })();
    ServerData.AjaxCityList = AjaxCityList;

    var AjaxTask = (function () {
        function AjaxTask() {
        }
        return AjaxTask;
    })();
    ServerData.AjaxTask = AjaxTask;

    var AjaxTaskList = (function () {
        function AjaxTaskList() {
        }
        return AjaxTaskList;
    })();
    ServerData.AjaxTaskList = AjaxTaskList;

    var AjaxTaskInfo = (function () {
        function AjaxTaskInfo() {
        }
        return AjaxTaskInfo;
    })();
    ServerData.AjaxTaskInfo = AjaxTaskInfo;

    var AjaxTaskInfoList = (function () {
        function AjaxTaskInfoList() {
        }
        return AjaxTaskInfoList;
    })();
    ServerData.AjaxTaskInfoList = AjaxTaskInfoList;

    var AjaxIdsList = (function () {
        function AjaxIdsList() {
        }
        return AjaxIdsList;
    })();
    ServerData.AjaxIdsList = AjaxIdsList;

    var AjaxRoutePoint = (function () {
        function AjaxRoutePoint() {
        }
        return AjaxRoutePoint;
    })();
    ServerData.AjaxRoutePoint = AjaxRoutePoint;

    var AjaxVirtualRoutePoint = (function () {
        function AjaxVirtualRoutePoint() {
        }
        return AjaxVirtualRoutePoint;
    })();
    ServerData.AjaxVirtualRoutePoint = AjaxVirtualRoutePoint;

    var AjaxVirtualRoutePointAndRoutePointList = (function () {
        function AjaxVirtualRoutePointAndRoutePointList() {
        }
        return AjaxVirtualRoutePointAndRoutePointList;
    })();
    ServerData.AjaxVirtualRoutePointAndRoutePointList = AjaxVirtualRoutePointAndRoutePointList;

    var AjaxRoutePointList = (function () {
        function AjaxRoutePointList() {
        }
        return AjaxRoutePointList;
    })();
    ServerData.AjaxRoutePointList = AjaxRoutePointList;

    var AjaxIdsListAndRoutePointList = (function () {
        function AjaxIdsListAndRoutePointList() {
        }
        return AjaxIdsListAndRoutePointList;
    })();
    ServerData.AjaxIdsListAndRoutePointList = AjaxIdsListAndRoutePointList;

    var AjaxRoutePointPlace = (function () {
        function AjaxRoutePointPlace() {
        }
        return AjaxRoutePointPlace;
    })();
    ServerData.AjaxRoutePointPlace = AjaxRoutePointPlace;

    var AjaxRoutePointListAndCitiesList = (function () {
        function AjaxRoutePointListAndCitiesList() {
        }
        return AjaxRoutePointListAndCitiesList;
    })();
    ServerData.AjaxRoutePointListAndCitiesList = AjaxRoutePointListAndCitiesList;

    var AjaxRoutePointPlaceAndRoutePointList = (function () {
        function AjaxRoutePointPlaceAndRoutePointList() {
        }
        return AjaxRoutePointPlaceAndRoutePointList;
    })();
    ServerData.AjaxRoutePointPlaceAndRoutePointList = AjaxRoutePointPlaceAndRoutePointList;

    var AjaxRoutePointListAndAjaxTaskList = (function () {
        function AjaxRoutePointListAndAjaxTaskList() {
        }
        return AjaxRoutePointListAndAjaxTaskList;
    })();
    ServerData.AjaxRoutePointListAndAjaxTaskList = AjaxRoutePointListAndAjaxTaskList;

    var AjaxVehicleParams = (function () {
        function AjaxVehicleParams(maxValue, maxWeight, expences, tax) {
            this.expences = expences;
            this.maxValue = maxValue;
            this.maxWeight = maxWeight;
            this.tax = tax;
        }
        return AjaxVehicleParams;
    })();
    ServerData.AjaxVehicleParams = AjaxVehicleParams;

    var AjaxCalculateOptions = (function () {
        function AjaxCalculateOptions() {
        }
        return AjaxCalculateOptions;
    })();
    ServerData.AjaxCalculateOptions = AjaxCalculateOptions;
})(ServerData || (ServerData = {}));
