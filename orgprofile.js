///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>
var OrgProfile;
(function (OrgProfile) {
    var OrgContactsData = (function () {
        function OrgContactsData() {
            this.id = 0;
            this.email = null;
            this.emailNote = null;
            this.phone1 = null;
            this.phone1Note = null;
            this.phone2 = null;
            this.phone2Note = null;
            this.skype = null;
            this.skypeNote = null;
            this.icq = null;
            this.icqNote = null;
        }
        return OrgContactsData;
    })();
    OrgProfile.OrgContactsData = OrgContactsData;

    var OrgInfoData = (function () {
        function OrgInfoData() {
            this.id = 0;
            this.shortName = null;
            this.fullName = null;
            this.ogrn = null;
            this.inn = null;
            this.formId = null;
        }
        return OrgInfoData;
    })();
    OrgProfile.OrgInfoData = OrgInfoData;

    var OrgAddressData = (function () {
        function OrgAddressData() {
        }
        return OrgAddressData;
    })();
    OrgProfile.OrgAddressData = OrgAddressData;

    var AjaxOrgData = (function () {
        function AjaxOrgData() {
            this.id = 0;
            this.info = null;
            this.contacts = null;
            this.address = null;
        }
        return AjaxOrgData;
    })();
    OrgProfile.AjaxOrgData = AjaxOrgData;

    var OrgProfileController = (function () {
        function OrgProfileController() {
            this.isComponentLoaded = false;
            this.application = null;
            this.parent = null;
            this.orgData = null;
            this.errorData = null;
            this.cityTmpData = null;
        }
        // вызовы от IApplication
        OrgProfileController.prototype.onLoad = function (app, parent, state) {
            OrgProfile.__currentOrgProfile.application = app;
            OrgProfile.__currentOrgProfile.parent = parent;
            Dictionary.__currDictionary.init(app, OrgProfile.__currentOrgProfile);

            OrgProfile.__currentOrgProfile.bindCitySelector();

            // события отправки изменённых данных на сервер
            $("#i-ctrl-org-info-submit-btn").click(OrgProfile.__currentOrgProfile.onInfoSubmitClick);
            $("#i-ctrl-org-contacts-submit-btn").click(OrgProfile.__currentOrgProfile.onContactsSubmitClick);
            $("#i-ctrl-org-address-submit-btn").click(OrgProfile.__currentOrgProfile.onAddressSubmitClick);

            // события отмены редактирования данных
            $("#i-ctrl-org-info-cancel-btn").click(OrgProfile.__currentOrgProfile.onInfoCancelClick);
            $("#i-ctrl-org-contacts-cancel-btn").click(OrgProfile.__currentOrgProfile.onContactsCancelClick);
            $("#i-ctrl-org-address-cancel-btn").click(OrgProfile.__currentOrgProfile.onAddressCancelClick);

            // получаем данные с сервера
            OrgProfile.__currentOrgProfile.queryData();

            // получаем данные справочников
            Dictionary.__currDictionary.queryDictData("companyforms");
        };

        OrgProfileController.prototype.onUpdate = function (state) {
            OrgProfile.__currentOrgProfile.uploadData();
        };

        OrgProfileController.prototype.onShow = function (state) {
            OrgProfile.__currentOrgProfile.bindCitySelector();

            // запрашиваем данные у модели
            OrgProfile.__currentOrgProfile.queryData();
        };

        OrgProfileController.prototype.onHide = function (state) {
            // ничего не делаем
        };

        // вызовы от child IComponent
        OrgProfileController.prototype.dataLoaded = function (sender) {
            // Not Implemented
        };

        OrgProfileController.prototype.dataReady = function (sender) {
            // Not Implemented
        };

        OrgProfileController.prototype.dataError = function (sender, error) {
            // Not Implemented
        };

        OrgProfileController.prototype.dictDataReady = function (name) {
            if ("companyforms" == name) {
                OrgProfile.__currentOrgProfile.drawCompanyForms(Dictionary.__currDictionary.companyForms);
            }
        };

        OrgProfileController.prototype.bindCitySelector = function () {
            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-org-address-city-txt"), OrgProfile.__currentOrgProfile);
        };

        OrgProfileController.prototype.drawCompanyForms = function (data) {
            var select = $("#i-ctrl-org-form-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name + " (" + entry.description + ")");
                select.append(opt);
            }

            if (null != OrgProfile.__currentOrgProfile.orgData) {
                select.val(OrgProfile.__currentOrgProfile.orgData.info.formId.toString());
            }
        };

        OrgProfileController.prototype.checkInfoData = function (data) {
            var result = true;

            if (1 > data.shortName.length) {
                result = false;
                OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-shortName-error-message", "Необходимо указать краткое название.", true);
            }

            if (isNaN(data.formId)) {
                result = false;
                OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-form-error-message", "Необходимо указать форму организации.", true);
            }

            if (0 < data.ogrn.length) {
                if (false == Validators.Validator.prototype.validateOGRN(data.ogrn)) {
                    result = false;
                    OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-ogrn-error-message", Validators.ogrnNotValidMessage, true);
                }
            }

            if (0 < data.inn.length) {
                if (false == Validators.Validator.prototype.validateINN(data.inn)) {
                    result = false;
                    OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-inn-error-message", Validators.innNotValidMessage, true);
                }
            }

            return result;
        };

        OrgProfileController.prototype.onInfoSubmitClick = function (event) {
            // пряем все сообщения
            OrgProfile.__currentOrgProfile.clearAllInfoMessages();

            // упаковываем данные в объект
            var data = new OrgInfoData();
            data.id = OrgProfile.__currentOrgProfile.orgData.info.id;

            data.shortName = $("#i-ctrl-org-shortName-txt").val().trim();
            data.fullName = $("#i-ctrl-org-fullName-txt").val().trim();
            data.formId = parseInt($("#i-ctrl-org-form-select").val());
            data.ogrn = $("#i-ctrl-org-ogrn-txt").val().trim();
            data.inn = $("#i-ctrl-org-inn-txt").val().trim();

            if (OrgProfile.__currentOrgProfile.checkInfoData(data)) {
                // блокируем и отображаем картинку загрузки
                OrgProfile.__currentOrgProfile.application.showOverlay("#i-ctrl-org-info-overlay", "#i-ctrl-org-info");

                // обновляем данные
                OrgProfile.__currentOrgProfile.updateOrgInfoData(data);
            }
        };

        OrgProfileController.prototype.clearAllInfoMessages = function () {
            // прячем сообщение
            OrgProfile.__currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-info-info-message", "", false);

            // прячем ошибки
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-shortName-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-fullName-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-form-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-ogrn-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-inn-error-message", "", false);
        };

        OrgProfileController.prototype.updateOrgInfoData = function (infoData) {
            var data = new AjaxOrgData();
            data.id = OrgProfile.__currentOrgProfile.orgData.id;
            data.info = infoData;

            $.ajax({
                type: "PUT",
                url: OrgProfile.__currentOrgProfile.application.getFullUri("api/org"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: OrgProfile.__currentOrgProfile.onAjaxUpdateOrgInfoDataSuccess,
                error: OrgProfile.__currentOrgProfile.onAjaxUpdateOrgInfoDataError
            });
        };

        OrgProfileController.prototype.onAjaxUpdateOrgInfoDataError = function (jqXHR, status, message) {
            OrgProfile.__currentOrgProfile.application.hideOverlay("#i-ctrl-org-info-overlay");

            var response = JSON.parse(jqXHR.responseText);
            var data = response.data;

            var errCode = response.code.split(";");
            var errMsg = response.userMessage.split(";");

            for (var i = 0; i < errCode.length; i++) {
                var code = parseInt(errCode[i]);

                if (2 == code)
                    OrgProfile.__currentOrgProfile.application.checkAuthStatus();
                if (1011 == code)
                    OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-form-error-message", errMsg[i], true);
else
                    OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-shortName-error-message", errMsg[i], true);
            }
        };

        OrgProfileController.prototype.onAjaxUpdateOrgInfoDataSuccess = function (data, status, jqXHR) {
            OrgProfile.__currentOrgProfile.application.hideOverlay("#i-ctrl-org-info-overlay");

            var orgData = data.data;

            // сохраняем обновлённую информацию об организации
            OrgProfile.__currentOrgProfile.orgData.info = orgData.info;

            // сообщение об успешном обновлении данных
            OrgProfile.__currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-info-info-message", "Данные обновлены.", true);
        };

        OrgProfileController.prototype.onInfoCancelClick = function (event) {
            // прячем все сообщения
            OrgProfile.__currentOrgProfile.clearAllInfoMessages();

            // сбрасываем значения в текстовых контролах
            $("#i-ctrl-org-info :text").val("");

            // восстанавливаем прежние значения
            OrgProfile.__currentOrgProfile.drawInfoData();
        };

        OrgProfileController.prototype.checkContactsData = function (data) {
            var result = true;

            if (null != data.email && 0 < data.email.length) {
                if (false == Validators.Validator.prototype.validateEmail(data.email)) {
                    result = false;
                    OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-email-error-message", Validators.emailNotValidMessage, true);
                }
            }
            if (null != data.phone1 && 0 < data.phone1.length) {
                if (false == Validators.Validator.prototype.validatePhone(data.phone1)) {
                    result = false;
                    OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-phone1-error-message", Validators.phoneNotValidMessage, true);
                }
            }
            if (null != data.phone2 && 0 < data.phone2.length) {
                if (false == Validators.Validator.prototype.validatePhone(data.phone2)) {
                    result = false;
                    OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-phone2-error-message", Validators.phoneNotValidMessage, true);
                }
            }

            return result;
        };

        OrgProfileController.prototype.onContactsSubmitClick = function (event) {
            // пряем все сообщения
            OrgProfile.__currentOrgProfile.clearAllContactsMessages();

            // упаковываем данные в объект
            var data = new OrgContactsData();
            data.id = OrgProfile.__currentOrgProfile.orgData.contacts.id;

            data.email = $("#i-ctrl-org-email-txt").val().trim();
            data.phone1 = $("#i-ctrl-org-phone1-txt").val().trim();
            data.phone2 = $("#i-ctrl-org-phone2-txt").val().trim();
            data.skype = $("#i-ctrl-org-skype-txt").val().trim();
            data.icq = $("#i-ctrl-org-icq-txt").val().trim();

            data.emailNote = null;
            data.phone1Note = null;
            data.phone2Note = null;
            data.skypeNote = null;
            data.icqNote = null;

            if (OrgProfile.__currentOrgProfile.checkContactsData(data)) {
                // блокируем и отображаем картинку загрузки
                OrgProfile.__currentOrgProfile.application.showOverlay("#i-ctrl-org-contacts-overlay", "#i-ctrl-org-contacts");

                // обновляем данные
                OrgProfile.__currentOrgProfile.updateOrgContactsData(data);
            }
        };

        OrgProfileController.prototype.clearAllContactsMessages = function () {
            // прячем сообщение
            OrgProfile.__currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-contacts-info-message", "", false);

            // прячем ошибки
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-email-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-phone1-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-phone2-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-skype-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-icq-error-message", "", false);
        };

        OrgProfileController.prototype.updateOrgContactsData = function (contactsData) {
            var data = new AjaxOrgData();
            data.id = OrgProfile.__currentOrgProfile.orgData.id;
            data.contacts = contactsData;

            $.ajax({
                type: "PUT",
                url: OrgProfile.__currentOrgProfile.application.getFullUri("api/org"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: OrgProfile.__currentOrgProfile.onAjaxUpdateOrgContactsDataSuccess,
                error: OrgProfile.__currentOrgProfile.onAjaxUpdateOrgContactsDataError
            });
        };

        OrgProfileController.prototype.onAjaxUpdateOrgContactsDataError = function (jqXHR, status, message) {
            OrgProfile.__currentOrgProfile.application.hideOverlay("#i-ctrl-org-contacts-overlay");

            var response = JSON.parse(jqXHR.responseText);
            var data = response.data;

            var errCode = response.code.split(";");
            var errMsg = response.userMessage.split(";");

            for (var i = 0; i < errCode.length; i++) {
                var code = parseInt(errCode[i]);

                if (2 == code)
                    OrgProfile.__currentOrgProfile.application.checkAuthStatus();
                if (1001 == code)
                    OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-email-error-message", errMsg[i], true);
else
                    OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-email-error-message", errMsg[i], true);
            }
        };

        OrgProfileController.prototype.onAjaxUpdateOrgContactsDataSuccess = function (data, status, jqXHR) {
            OrgProfile.__currentOrgProfile.application.hideOverlay("#i-ctrl-org-contacts-overlay");

            var orgData = data.data;

            // сохраняем обновлённую информацию об организации
            OrgProfile.__currentOrgProfile.orgData.contacts = orgData.contacts;

            // сообщение об успешном обновлении данных
            OrgProfile.__currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-contacts-info-message", "Данные обновлены.", true);
        };

        OrgProfileController.prototype.onContactsCancelClick = function (event) {
            // прячем все сообщения
            OrgProfile.__currentOrgProfile.clearAllContactsMessages();

            // сбрасываем значения в текстовых контролах
            $("#i-ctrl-org-contacts :text").val("");

            // восстанавливаем прежние значения
            OrgProfile.__currentOrgProfile.drawContactsData();
        };

        OrgProfileController.prototype.onAddressCancelClick = function (event) {
            // прячем все сообщения
            OrgProfile.__currentOrgProfile.clearAllAddressMessages();

            // сбрасываем временные данные о выбранном городе
            OrgProfile.__currentOrgProfile.cityTmpData = null;

            // сбрасываем значения в текстовых контролах
            $("#i-ctrl-org-address :text").val("");

            // восстанавливаем прежние значения
            OrgProfile.__currentOrgProfile.drawAddressData();
        };

        OrgProfileController.prototype.clearAllAddressMessages = function () {
            // прячем сообщение
            OrgProfile.__currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-address-info-message", "", false);

            // прячем ошибки
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-region-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-district-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-city-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-index-error-message", "", false);
            OrgProfile.__currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-address-error-message", "", false);
        };

        OrgProfileController.prototype.onAddressSubmitClick = function (event) {
        };

        OrgProfileController.prototype.onCitySelected = function (city) {
            OrgProfile.__currentOrgProfile.cityTmpData = city;
            OrgProfile.__currentOrgProfile.applyCityData();
        };

        OrgProfileController.prototype.onCitySelectedAbort = function () {
            if (null == OrgProfile.__currentOrgProfile.cityTmpData)
                OrgProfile.__currentOrgProfile.drawAddressData();
else
                OrgProfile.__currentOrgProfile.applyCityData();
        };

        OrgProfileController.prototype.applyCityData = function () {
            var city = OrgProfile.__currentOrgProfile.cityTmpData;
            $("#i-ctrl-org-address-region-txt").val(city.region);
            $("#i-ctrl-org-address-district-txt").val(city.district);
            $("#i-ctrl-org-address-city-txt").val(city.name);
            $("#i-ctrl-org-address-index-txt").val(city.postCode);
        };

        // обновление данных с сервера
        OrgProfileController.prototype.uploadData = function () {
            OrgProfile.__currentOrgProfile.orgData = null;
            OrgProfile.__currentOrgProfile.errorData = null;
            OrgProfile.__currentOrgProfile.getData();
        };

        // Запрос данных
        // Выполняется только если нет загруженных данных или сообщения об ошибке
        OrgProfileController.prototype.queryData = function () {
            if (null == OrgProfile.__currentOrgProfile.orgData && null == OrgProfile.__currentOrgProfile.errorData) {
                OrgProfile.__currentOrgProfile.getData();
            } else if (null != OrgProfile.__currentOrgProfile.errorData) {
                OrgProfile.__currentOrgProfile.parent.dataError(OrgProfile.__currentOrgProfile, OrgProfile.__currentOrgProfile.errorData);
            } else {
                OrgProfile.__currentOrgProfile.parent.dataReady(OrgProfile.__currentOrgProfile);
            }
        };

        OrgProfileController.prototype.getData = function () {
            $.ajax({
                type: "GET",
                url: OrgProfile.__currentOrgProfile.application.getFullUri("api/org"),
                success: OrgProfile.__currentOrgProfile.onAjaxGetOrgDataSuccess,
                error: OrgProfile.__currentOrgProfile.onAjaxGetOrgDataError
            });
        };

        OrgProfileController.prototype.onAjaxGetOrgDataError = function (jqXHR, status, message) {
            //window.console.log("_onAjaxError");
            OrgProfile.__currentOrgProfile.errorData = JSON.parse(jqXHR.responseText);
            OrgProfile.__currentOrgProfile.parent.dataError(OrgProfile.__currentOrgProfile, OrgProfile.__currentOrgProfile.errorData);

            if (2 == parseInt(OrgProfile.__currentOrgProfile.errorData.code))
                OrgProfile.__currentOrgProfile.application.checkAuthStatus();
        };

        OrgProfileController.prototype.onAjaxGetOrgDataSuccess = function (data, status, jqXHR) {
            //window.console.log("_onAjaxGetAccountDataSuccess");
            // загрузка компонента произведена успешно
            OrgProfile.__currentOrgProfile.orgData = data.data;

            // помещаем данные в контролы
            OrgProfile.__currentOrgProfile.drawData();

            if (false == OrgProfile.__currentOrgProfile.isComponentLoaded) {
                OrgProfile.__currentOrgProfile.isComponentLoaded = true;
                OrgProfile.__currentOrgProfile.parent.dataLoaded(OrgProfile.__currentOrgProfile);
            } else {
                OrgProfile.__currentOrgProfile.parent.dataReady(OrgProfile.__currentOrgProfile);
            }
        };

        // помещаем данные в контролы
        OrgProfileController.prototype.drawData = function () {
            OrgProfile.__currentOrgProfile.drawInfoData();
            OrgProfile.__currentOrgProfile.drawContactsData();
            OrgProfile.__currentOrgProfile.drawAddressData();
        };

        OrgProfileController.prototype.drawInfoData = function () {
            // shortcut
            var data = OrgProfile.__currentOrgProfile.orgData.info;

            if (null == data)
                return;

            // обновляем контролы
            $("#i-ctrl-org-shortName-txt").val(data.shortName);
            $("#i-ctrl-org-fullName-txt").val(data.fullName);
            $("#i-ctrl-org-ogrn-txt").val(data.ogrn);
            $("#i-ctrl-org-inn-txt").val(data.inn);

            // организационная форма
            $("#i-ctrl-org-form-select").val(data.formId.toString());
        };

        OrgProfileController.prototype.drawContactsData = function () {
            // shortcut
            var data = OrgProfile.__currentOrgProfile.orgData.contacts;

            if (null == data)
                return;

            // обновляем контролы
            $("#i-ctrl-org-email-txt").val(data.email);
            $("#i-ctrl-org-phone1-txt").val(data.phone1);
            $("#i-ctrl-org-phone2-txt").val(data.phone2);
            $("#i-ctrl-org-skype-txt").val(data.skype);
            $("#i-ctrl-org-icq-txt").val(data.icq);
        };

        OrgProfileController.prototype.drawAddressData = function () {
            // чистим контролы
            $("#i-ctrl-org-address input").val("");

            // shortcut
            var data = OrgProfile.__currentOrgProfile.orgData.address;

            if (null == data || null == data.cityId)
                return;

            // обновляем контролы
            $("#i-ctrl-org-address-region-txt").val(data.region);
            $("#i-ctrl-org-address-district-txt").val(data.district);
            $("#i-ctrl-org-address-city-txt").val(data.city);
            $("#i-ctrl-org-address-index-txt").val(data.postcode);
            $("#i-ctrl-org-address-address-txt").val(data.address);
        };
        return OrgProfileController;
    })();
    OrgProfile.OrgProfileController = OrgProfileController;

    OrgProfile.__currentOrgProfile = new OrgProfileController();
})(OrgProfile || (OrgProfile = {}));
