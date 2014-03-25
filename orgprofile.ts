///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>

module OrgProfile
{
    


    export class OrgContactsData
    {
        id: number = 0;
        email: string = null;
        emailNote: string = null;
        phone1: string = null;
        phone1Note: string = null;
        phone2: string = null;
        phone2Note: string = null;
        skype: string = null;
        skypeNote: string = null;
        icq: string = null;
        icqNote: string = null;
    }

    export class OrgInfoData
    {
        id: number = 0;
        shortName: string = null;
        fullName: string = null;
        ogrn: string = null;
        inn: string = null;
        formId: number = null;
    }

    export class OrgAddressData
    {
        public id: number;
        public cityId: number;
        public address: string;
        public city: string;
        public district: string;
        public region: string;
        public postcode: string;
        public longitude: number;
        public latitude: number;
    }

    export class AjaxOrgData
    {        
        id: number = 0;
        info: OrgInfoData = null;
        contacts: OrgContactsData = null;
        address: OrgAddressData = null;
    }


    export class OrgProfileController implements Application.IComponent, Application.ICitySelector
    {
        public isComponentLoaded: boolean = false;
        public application: Application.IApplication = null;
        public parent: Application.IComponent = null

        public orgData: AjaxOrgData = null;
        public errorData: ServerData.AjaxServerResponse = null;
        public cityTmpData: Application.CityData = null;

        // вызовы от IApplication
        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentOrgProfile.application = app;
            __currentOrgProfile.parent = parent;
            Dictionary.__currDictionary.init(app, __currentOrgProfile);

            __currentOrgProfile.bindCitySelector();

            // события отправки изменённых данных на сервер
            $("#i-ctrl-org-info-submit-btn").click(__currentOrgProfile.onInfoSubmitClick);
            $("#i-ctrl-org-contacts-submit-btn").click(__currentOrgProfile.onContactsSubmitClick);
            $("#i-ctrl-org-address-submit-btn").click(__currentOrgProfile.onAddressSubmitClick);
            $("#i-ctrl-org-address-delete-btn").click(__currentOrgProfile.onAddressDeleteClick);

            // события отмены редактирования данных
            $("#i-ctrl-org-info-cancel-btn").click(__currentOrgProfile.onInfoCancelClick);
            $("#i-ctrl-org-contacts-cancel-btn").click(__currentOrgProfile.onContactsCancelClick);
            $("#i-ctrl-org-address-cancel-btn").click(__currentOrgProfile.onAddressCancelClick);

            // получаем данные с сервера
            __currentOrgProfile.queryData();
            // получаем данные справочников
            Dictionary.__currDictionary.queryDictData("companyforms");

        }

        onUpdate(state: Application.IState): void
        {
            __currentOrgProfile.uploadData();
        }

        onShow(state: Application.IState): void
        {
            __currentOrgProfile.bindCitySelector();
            Dictionary.__currDictionary.init(__currentOrgProfile.application, __currentOrgProfile);

            // запрашиваем данные у модели
            __currentOrgProfile.queryData();
        }

        onHide(state: Application.IState): void
        {
            // ничего не делаем
        }

        // вызовы от child IComponent
        dataLoaded(sender: Application.IComponent): void
        {
            // Not Implemented
        }

        dataReady(sender: Application.IComponent): void
        {
            // Not Implemented
        }

        dataError(sender: Application.IComponent, error: ServerData.AjaxServerResponse): void
        {
            // Not Implemented
        }

        dictDataReady(name: string): void
        {
            if ("companyforms" == name)
            {
                __currentOrgProfile.drawCompanyForms(Dictionary.__currDictionary.companyForms);
            }
        }

        bindCitySelector(): void
        {
            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-org-address-city-txt"), __currentOrgProfile);
        }

        drawCompanyForms(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-org-form-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name + " (" + entry.description + ")");
                select.append(opt);
            }

            if (null != __currentOrgProfile.orgData)
            {
                select.val(__currentOrgProfile.orgData.info.formId.toString());
            }

        }

        checkInfoData(data: OrgInfoData): boolean
        {
            var result: boolean = true;

            // проверяем обязательные поля
            if (1 > data.shortName.length)
            {
                result = false;
                __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-shortName-error-message", "Необходимо указать краткое название.", true);
            }

            if (isNaN(data.formId))
            {
                result = false;
                __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-form-error-message", "Необходимо указать форму организации.", true);
            }

            // проверяем форматы значений
            if (0 < data.ogrn.length)
            {
                if (false == Validators.Validator.prototype.validateOGRN(data.ogrn))
                {
                    result = false;
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-ogrn-error-message", Validators.ogrnNotValidMessage, true);
                }
            }

            if (0 < data.inn.length)
            {
                if (false == Validators.Validator.prototype.validateINN(data.inn))
                {
                    result = false;
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-inn-error-message", Validators.innNotValidMessage, true);
                }
            }

            return result;
        }



        onInfoSubmitClick(event: JQueryEventObject): void
        {
            // пряем все сообщения
            __currentOrgProfile.clearAllInfoMessages();

            // упаковываем данные в объект
            var data: OrgInfoData = new OrgInfoData();
            data.id = __currentOrgProfile.orgData.info.id;

            data.shortName = $("#i-ctrl-org-shortName-txt").val().trim();
            data.fullName = $("#i-ctrl-org-fullName-txt").val().trim();
            data.formId = parseInt($("#i-ctrl-org-form-select").val());
            data.ogrn = $("#i-ctrl-org-ogrn-txt").val().trim();
            data.inn = $("#i-ctrl-org-inn-txt").val().trim();

            // проверка данных
            if (__currentOrgProfile.checkInfoData(data))
            {
                // блокируем и отображаем картинку загрузки
                __currentOrgProfile.application.showOverlay("#i-ctrl-org-info-overlay", "#i-ctrl-org-info");
                // обновляем данные
                __currentOrgProfile.updateOrgInfoData(data);
            }

        }

        clearAllInfoMessages(): void
        {
            // прячем сообщение
            __currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-info-info-message", "", false);
            // прячем ошибки
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-shortName-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-fullName-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-form-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-ogrn-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-inn-error-message", "", false);
        }

        updateOrgInfoData(infoData: OrgInfoData): void
        {
            var data: AjaxOrgData = new AjaxOrgData();
            data.id = __currentOrgProfile.orgData.id;
            data.info = infoData;

            $.ajax({
                type: "PUT",
                url: __currentOrgProfile.application.getFullUri("api/org"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: __currentOrgProfile.onAjaxUpdateOrgInfoDataSuccess,
                error: __currentOrgProfile.onAjaxUpdateOrgInfoDataError
            });
        }

               
        onAjaxUpdateOrgInfoDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            __currentOrgProfile.application.hideOverlay("#i-ctrl-org-info-overlay");

            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var data: AjaxOrgData = <AjaxOrgData>response.data;

            var errCode: string[] = response.code.split(";");
            var errMsg: string[] = response.userMessage.split(";");

            for (var i: number = 0; i < errCode.length; i++)
            {
                var code: number = parseInt(errCode[i]);

                if (2 == code)
                    __currentOrgProfile.application.checkAuthStatus();
                if (1011 == code)
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-form-error-message", errMsg[i], true);
                else 
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-shortName-error-message", errMsg[i], true);
            }
        }

        onAjaxUpdateOrgInfoDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentOrgProfile.application.hideOverlay("#i-ctrl-org-info-overlay");

            var orgData: AjaxOrgData = <AjaxOrgData>data.data;

            // сохраняем обновлённую информацию об организации
            __currentOrgProfile.orgData.info = orgData.info;

            // сообщение об успешном обновлении данных
            __currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-info-info-message", "Данные обновлены.", true);
        }

        onInfoCancelClick(event: JQueryEventObject): void
        {
            // прячем все сообщения
            __currentOrgProfile.clearAllInfoMessages();

            // сбрасываем значения в текстовых контролах
            $("#i-ctrl-org-info :text").val("");

            // восстанавливаем прежние значения
            __currentOrgProfile.drawInfoData();
        }

        checkContactsData(data: OrgContactsData): boolean
        {
            var result: boolean = true;

            if (null != data.email && 0 < data.email.length)
            {
                if (false == Validators.Validator.prototype.validateEmail(data.email))
                {
                    result = false;
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-email-error-message", Validators.emailNotValidMessage, true);
                }
            }
            if (null != data.phone1 && 0 < data.phone1.length)
            {
                if (false == Validators.Validator.prototype.validatePhone(data.phone1))
                {
                    result = false;
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-phone1-error-message", Validators.phoneNotValidMessage, true);
                }
            }
            if (null != data.phone2 && 0 < data.phone2.length)
            {
                if (false == Validators.Validator.prototype.validatePhone(data.phone2))
                {
                    result = false;
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-phone2-error-message", Validators.phoneNotValidMessage, true);
                }
            }

            return result;
        }

        onContactsSubmitClick(event: JQueryEventObject): void
        {
            // пряем все сообщения
            __currentOrgProfile.clearAllContactsMessages();

            // упаковываем данные в объект
            var data: OrgContactsData = new OrgContactsData();
            data.id = __currentOrgProfile.orgData.contacts.id;

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


            // проверка данных
            if (__currentOrgProfile.checkContactsData(data))
            {
                // блокируем и отображаем картинку загрузки
                __currentOrgProfile.application.showOverlay("#i-ctrl-org-contacts-overlay", "#i-ctrl-org-contacts");
                // обновляем данные
                __currentOrgProfile.updateOrgContactsData(data);
            }

        }

        clearAllContactsMessages(): void
        {
            // прячем сообщение
            __currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-contacts-info-message", "", false);
            // прячем ошибки
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-email-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-phone1-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-phone2-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-skype-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-icq-error-message", "", false);
        }

        updateOrgContactsData(contactsData: OrgContactsData): void
        {
            var data: AjaxOrgData = new AjaxOrgData();
            data.id = __currentOrgProfile.orgData.id;
            data.contacts = contactsData;
            
            $.ajax({
                type: "PUT",
                url: __currentOrgProfile.application.getFullUri("api/org"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: __currentOrgProfile.onAjaxUpdateOrgContactsDataSuccess,
                error: __currentOrgProfile.onAjaxUpdateOrgContactsDataError
            });
        }


        onAjaxUpdateOrgContactsDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            __currentOrgProfile.application.hideOverlay("#i-ctrl-org-contacts-overlay");

            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var data: AjaxOrgData = <AjaxOrgData>response.data;

            var errCode: string[] = response.code.split(";");
            var errMsg: string[] = response.userMessage.split(";");

            for (var i: number = 0; i < errCode.length; i++)
            {
                var code: number = parseInt(errCode[i]);

                if (2 == code)
                    __currentOrgProfile.application.checkAuthStatus();
                if (1001 == code)
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-email-error-message", errMsg[i], true);
                else
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-email-error-message", errMsg[i], true);
            }


        }

        onAjaxUpdateOrgContactsDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentOrgProfile.application.hideOverlay("#i-ctrl-org-contacts-overlay");

            var orgData: AjaxOrgData = <AjaxOrgData>data.data;

            // сохраняем обновлённую информацию об организации
            __currentOrgProfile.orgData.contacts = orgData.contacts;

            // сообщение об успешном обновлении данных
            __currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-contacts-info-message", "Данные обновлены.", true);
        }

        onContactsCancelClick(event: JQueryEventObject): void
        {
            // прячем все сообщения
            __currentOrgProfile.clearAllContactsMessages();

            // сбрасываем значения в текстовых контролах
            $("#i-ctrl-org-contacts :text").val("");

            // восстанавливаем прежние значения
            __currentOrgProfile.drawContactsData();
        }

        clearAllAddressMessages(): void
        {
            // прячем сообщение
            __currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-address-info-message", "", false);
            // прячем ошибки
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-region-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-district-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-city-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-index-error-message", "", false);
            __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-address-error-message", "", false);
        }

        onAddressCancelClick(event: JQueryEventObject): void
        {
            // прячем все сообщения
            __currentOrgProfile.clearAllAddressMessages();
            // сбрасываем временные данные о выбранном городе
            __currentOrgProfile.cityTmpData = null;
            // сбрасываем значения в текстовых контролах
            $("#i-ctrl-org-address :text").val("");

            // восстанавливаем прежние значения
            __currentOrgProfile.drawAddressData();
        }

        onAddressSubmitClick(event: JQueryEventObject): void
        {
            // очищаем сообщения об ошибках
            __currentOrgProfile.clearAllAddressMessages();

            var errors: boolean = false;

            // проверка города
            if (null == __currentOrgProfile.cityTmpData)
            {
                __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-city-error-message", "Не указан город", true);
                errors = true;
            }

            // проверка адреса
            var addr: string = $("#i-ctrl-org-address-address-txt").val().trim();

            if (1 > addr.length)
            {
                __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-address-error-message", "Не указан адрес", true);
                errors = true;
            }


            if (false == errors)
            {
                var address: OrgAddressData = new OrgAddressData();
                address.id = __currentOrgProfile.orgData.address.id;
                address.city = __currentOrgProfile.cityTmpData.name;
                address.cityId = __currentOrgProfile.cityTmpData.id;
                address.district = __currentOrgProfile.cityTmpData.district;
                address.region = __currentOrgProfile.cityTmpData.region;
                address.postcode = __currentOrgProfile.cityTmpData.postCode;
                address.latitude = __currentOrgProfile.cityTmpData.latitude;
                address.longitude = __currentOrgProfile.cityTmpData.longitude;
                address.address = addr;
                __currentOrgProfile.updateAddressData(address);
            }
        }

        updateAddressData(address: OrgAddressData): void
        {
            // блокируем и отображаем картинку загрузки
            __currentOrgProfile.application.showOverlay("#i-ctrl-org-address-info-overlay", "#i-ctrl-org-address");

            var data: AjaxOrgData = new AjaxOrgData();
            data.id = __currentOrgProfile.orgData.id;
            data.address = address;

            $.ajax({
                type: "PUT",
                url: __currentOrgProfile.application.getFullUri("api/org"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: __currentOrgProfile.onAjaxUpdateAddressSuccess,
                error: __currentOrgProfile.onAjaxUpdateAddressError
            });

        }

        onAjaxUpdateAddressError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            // прячем overlay
            __currentOrgProfile.application.hideOverlay("#i-ctrl-org-address-info-overlay");
            //window.console.log("_onAjaxSaveAddressError");

            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var data: AjaxOrgData = <AjaxOrgData>response.data;

            var errCode: string[] = response.code.split(";");
            var errMsg: string[] = response.userMessage.split(";");

            for (var i: number = 0; i < errCode.length; i++)
            {
                var code: number = parseInt(errCode[i]);

                if (2 == code)
                    __currentOrgProfile.application.checkAuthStatus();
                if (1013 == code)
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-city-error-message", errMsg[i], true);
                else
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-address-error-message", errMsg[i], true);
            }

        }

        onAjaxUpdateAddressSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            // прячем overlay
            __currentOrgProfile.application.hideOverlay("#i-ctrl-org-address-info-overlay");
            //window.console.log("_onAjaxGetAccountDataSuccess");

            var orgData: AjaxOrgData = <AjaxOrgData>data.data;

            // сохраняем обновлённую информацию об организации
            __currentOrgProfile.orgData.address = orgData.address;

            // сообщение об успешном обновлении данных
            __currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-address-info-message", "Данные обновлены.", true);
        }

        onAddressDeleteClick(event: JQueryEventObject): void
        {
            // очищаем сообщения об ошибках
            __currentOrgProfile.clearAllAddressMessages();

            // блокируем и отображаем картинку загрузки
            __currentOrgProfile.application.showOverlay("#i-ctrl-org-address-info-overlay", "#i-ctrl-org-address");

            var data: AjaxOrgData = new AjaxOrgData();
            data.id = __currentOrgProfile.orgData.id;

            $.ajax({
                type: "DELETE",
                url: __currentOrgProfile.application.getFullUri("api/org"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: __currentOrgProfile.onAjaxDeleteAddressSuccess,
                error: __currentOrgProfile.onAjaxDeleteAddressError
            });
        }

        onAjaxDeleteAddressError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            // прячем overlay
            __currentOrgProfile.application.hideOverlay("#i-ctrl-org-address-info-overlay");
            //window.console.log("_onAjaxSaveAddressError");

            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var data: AjaxOrgData = <AjaxOrgData>response.data;

            var errCode: string[] = response.code.split(";");
            var errMsg: string[] = response.userMessage.split(";");

            for (var i: number = 0; i < errCode.length; i++)
            {
                var code: number = parseInt(errCode[i]);

                if (2 == code)
                    __currentOrgProfile.application.checkAuthStatus();
                else
                    __currentOrgProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-org-address-address-error-message", errMsg[i], true);
            }

        }

        onAjaxDeleteAddressSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            // прячем overlay
            __currentOrgProfile.application.hideOverlay("#i-ctrl-org-address-info-overlay");
            //window.console.log("_onAjaxGetAccountDataSuccess");

            // сохраняем обновлённую информацию об организации
            var address: OrgAddressData = new OrgAddressData();
            address.id = __currentOrgProfile.orgData.address.id;
            __currentOrgProfile.orgData.address = address;
            __currentOrgProfile.cityTmpData = null;
            __currentOrgProfile.drawAddressData();

            // сообщение об успешном обновлении данных
            __currentOrgProfile.application.switchFormInfoMessageVisibility("#i-ctrl-org-address-info-message", "Адрес удалён", true);
        }


        onCitySelected(city: Application.CityData): void
        {
            // очищаем сообщения об ошибках
            __currentOrgProfile.clearAllAddressMessages();

            __currentOrgProfile.cityTmpData = city;
            __currentOrgProfile.applyCityData();
        }

        onCitySelectedAbort(): void
        {
            if (null == __currentOrgProfile.cityTmpData)
                __currentOrgProfile.drawAddressData();
            else
                __currentOrgProfile.applyCityData(); 
        }

        applyCityData(): void
        {
            var city: Application.CityData = __currentOrgProfile.cityTmpData;
            $("#i-ctrl-org-address-region-txt").val(city.region);
            $("#i-ctrl-org-address-district-txt").val(city.district);
            $("#i-ctrl-org-address-city-txt").val(city.name);
            $("#i-ctrl-org-address-index-txt").val(city.postCode);
        }

        // обновление данных с сервера
        uploadData()
        {
            __currentOrgProfile.orgData = null;
            __currentOrgProfile.errorData = null;
            __currentOrgProfile.getData();
        }

        // Запрос данных
        // Выполняется только если нет загруженных данных или сообщения об ошибке
        queryData(): void
        {
            if (null == __currentOrgProfile.orgData && null == __currentOrgProfile.errorData)
            {
                __currentOrgProfile.getData();
            }
            else if (null != __currentOrgProfile.errorData)
            {
                __currentOrgProfile.parent.dataError(__currentOrgProfile, __currentOrgProfile.errorData);
            }
            else
            {
                __currentOrgProfile.parent.dataReady(__currentOrgProfile);
            }
        }


        getData(): void
        {
            $.ajax({
                type: "GET",
                url: __currentOrgProfile.application.getFullUri("api/org"),
                success: __currentOrgProfile.onAjaxGetOrgDataSuccess,
                error: __currentOrgProfile.onAjaxGetOrgDataError
            });
        }



        onAjaxGetOrgDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            //window.console.log("_onAjaxError");

            __currentOrgProfile.errorData = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            __currentOrgProfile.parent.dataError(__currentOrgProfile, __currentOrgProfile.errorData);

            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            if (2 == parseInt(__currentOrgProfile.errorData.code))
                __currentOrgProfile.application.checkAuthStatus();
        }

        onAjaxGetOrgDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("_onAjaxGetAccountDataSuccess");

            // загрузка компонента произведена успешно
            __currentOrgProfile.orgData = <AjaxOrgData>data.data;
            __currentOrgProfile.setTmpCityData(__currentOrgProfile.orgData.address);
            
            // помещаем данные в контролы
            __currentOrgProfile.drawData();

            if (false == __currentOrgProfile.isComponentLoaded)
            {
                __currentOrgProfile.isComponentLoaded = true;
                __currentOrgProfile.parent.dataLoaded(__currentOrgProfile);
            }
            else
            {
                __currentOrgProfile.parent.dataReady(__currentOrgProfile);
            }
        }

        setTmpCityData(address: OrgAddressData): void
        {
            __currentOrgProfile.cityTmpData = new Application.CityData();
            __currentOrgProfile.cityTmpData.id = address.cityId;
            __currentOrgProfile.cityTmpData.name = address.city;
            __currentOrgProfile.cityTmpData.district = address.district;
            __currentOrgProfile.cityTmpData.region = address.region;
            __currentOrgProfile.cityTmpData.postCode = address.postcode;
            __currentOrgProfile.cityTmpData.latitude = address.latitude;
            __currentOrgProfile.cityTmpData.longitude = address.longitude;
        }


        // помещаем данные в контролы
        drawData(): void
        {
            __currentOrgProfile.drawInfoData();
            __currentOrgProfile.drawContactsData();
            __currentOrgProfile.drawAddressData();
        }

        
        drawInfoData(): void
        {
            // shortcut
            var data: OrgInfoData = __currentOrgProfile.orgData.info;

            if (null == data)
                return;

            // обновляем контролы
            $("#i-ctrl-org-shortName-txt").val(data.shortName);
            $("#i-ctrl-org-fullName-txt").val(data.fullName);
            $("#i-ctrl-org-ogrn-txt").val(data.ogrn);
            $("#i-ctrl-org-inn-txt").val(data.inn);

            // организационная форма
            $("#i-ctrl-org-form-select").val(data.formId.toString());
        }

        drawContactsData(): void
        {
            // shortcut
            var data: OrgContactsData = __currentOrgProfile.orgData.contacts;

            if (null == data)
                return;

            // обновляем контролы
            $("#i-ctrl-org-email-txt").val(data.email);
            $("#i-ctrl-org-phone1-txt").val(data.phone1);
            $("#i-ctrl-org-phone2-txt").val(data.phone2);
            $("#i-ctrl-org-skype-txt").val(data.skype);
            $("#i-ctrl-org-icq-txt").val(data.icq);
        }

        drawAddressData(): void
        {
            // чистим контролы
            $("#i-ctrl-org-address input").val("");

            // shortcut
            var data: OrgAddressData = __currentOrgProfile.orgData.address;

            if (null == data || null == data.cityId)
                return;

            // обновляем контролы
            $("#i-ctrl-org-address-region-txt").val(data.region);
            $("#i-ctrl-org-address-district-txt").val(data.district);
            $("#i-ctrl-org-address-city-txt").val(data.city);
            $("#i-ctrl-org-address-index-txt").val(data.postcode);
            $("#i-ctrl-org-address-address-txt").val(data.address);

        }






    }

    export var __currentOrgProfile = new OrgProfileController();
}