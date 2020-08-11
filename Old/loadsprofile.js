///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>
var LoadsProfile;
(function (LoadsProfile) {
    var AjaxLoadsData = (function () {
        function AjaxLoadsData() {
        }
        return AjaxLoadsData;
    })();
    LoadsProfile.AjaxLoadsData = AjaxLoadsData;

    var LoadsProfileController = (function () {
        function LoadsProfileController() {
            this.application = null;
            this.parent = null;
            this.loadsData = null;
            this.errorData = null;
        }
        // вызовы от IApplication
        LoadsProfileController.prototype.onLoad = function (app, parent, state) {
            LoadsProfile.__currentLoadsProfile.application = app;
            LoadsProfile.__currentLoadsProfile.parent = parent;

            LoadsProfile.__currentLoadsProfile.queryData();
        };

        LoadsProfileController.prototype.onUpdate = function (state) {
        };

        LoadsProfileController.prototype.onShow = function (state) {
            LoadsProfile.__currentLoadsProfile.queryData();
        };

        LoadsProfileController.prototype.onHide = function (state) {
        };

        // вызовы от child IComponent
        LoadsProfileController.prototype.dataLoaded = function (sender) {
        };

        LoadsProfileController.prototype.dataReady = function (sender) {
        };

        LoadsProfileController.prototype.dataError = function (sender, error) {
        };

        // вызовы от DictController
        LoadsProfileController.prototype.dictDataReady = function (name) {
        };

        LoadsProfileController.prototype.onCitySelected = function (city) {
        };

        LoadsProfileController.prototype.onCitySelectedAbort = function () {
        };

        // обновление данных с сервера
        LoadsProfileController.prototype.uploadData = function () {
            LoadsProfile.__currentLoadsProfile.loadsData = null;
            LoadsProfile.__currentLoadsProfile.errorData = null;

            //__currentLoadsProfile.getData();
            LoadsProfile.__currentLoadsProfile.queryData();
        };

        LoadsProfileController.prototype.queryData = function () {
            if (false == LoadsProfile.__currentLoadsProfile.isComponentLoaded) {
                LoadsProfile.__currentLoadsProfile.isComponentLoaded = true;
                LoadsProfile.__currentLoadsProfile.parent.dataLoaded(LoadsProfile.__currentLoadsProfile);
            } else {
                LoadsProfile.__currentLoadsProfile.parent.dataReady(LoadsProfile.__currentLoadsProfile);
            }
        };

        LoadsProfileController.prototype.getData = function () {
            /*$.ajax({
            type: "GET",
            url: __currentOrgProfile.application.getFullUri("api/org"),
            success: __currentOrgProfile.onAjaxGetOrgDataSuccess,
            error: __currentOrgProfile.onAjaxGetOrgDataError
            });*/
        };
        return LoadsProfileController;
    })();
    LoadsProfile.LoadsProfileController = LoadsProfileController;

    LoadsProfile.__currentLoadsProfile = new LoadsProfileController();
})(LoadsProfile || (LoadsProfile = {}));
