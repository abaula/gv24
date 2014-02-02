///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>



module AccountProfile
{
    export class AjaxUpdateAccountRequest
    {
        public operation: string;

        public newLogin: string;
        public newEmail: string;

        public oldPass: string;
        public newPass: string;
        public newPassConf: string;
    }


    export interface AjaxAccountDataResponse
    {
        id: number;
        login: string;
        email: string;
        regDate: string;
    }

    export class AccountProfileController implements Application.IComponent
    {
        public isComponentLoaded: boolean = false;
        public application: Application.IApplication = null;
        public parent: Application.IComponent = null;

        public accountInfo: AjaxAccountDataResponse = null;
        public errorData: ServerData.AjaxServerResponse = null;

        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentAccProfile.application = app;
            __currentAccProfile.parent = parent;

            // события отправки изменённых данных на сервер
            $("#i-ctrl-account-login-submit-btn").click(__currentAccProfile.onLoginSubmitClick);
            $("#i-ctrl-account-email-submit-btn").click(__currentAccProfile.onEmailSubmitClick);
            $("#i-ctrl-account-password-submit-btn").click(__currentAccProfile.onPasswordSubmitClick);

            // события отмены редактирования данных
            $("#i-ctrl-account-login-cancel-btn").click(__currentAccProfile.onLoginCancelClick);
            $("#i-ctrl-account-email-cancel-btn").click(__currentAccProfile.onEmailCancelClick);
            $("#i-ctrl-account-password-cancel-btn").click(__currentAccProfile.onPasswordCancelClick);

            // получаем данные с сервера
            __currentAccProfile.queryData();
        }

        onUpdate(state: Application.IState): void
        {
            __currentAccProfile.updateData();
        }

        onShow(state: Application.IState): void
        {
            // запрашиваем данные у модели
            __currentAccProfile.queryData();
        }

        onHide(state: Application.IState): void
        {
            // ничего не делаем
        }

        dataLoaded(sender: Application.IComponent): void
        { // Not Implemented
        }

        dataReady(sender: Application.IComponent): void
        { // Not Implemented
        }

        dataError(sender: Application.IComponent, error: ServerData.AjaxServerResponse): void
        { // Not Implemented
        }

        dictDataReady(name: string): void
        { // Not Implemented
        }

        // Запрос данных
        // Выполняется только если нет загруженных данных или сообщения об ошибке
        queryData(): void
        {
            if (null == __currentAccProfile.accountInfo && null == __currentAccProfile.errorData)
            {
                __currentAccProfile.getAccountData();
            }
            else if (null != __currentAccProfile.errorData)
            {
                __currentAccProfile.parent.dataError(__currentAccProfile, __currentAccProfile.errorData);
            }
            else
            {
                __currentAccProfile.parent.dataReady(__currentAccProfile);
            }
        }

        // обновление данных с сервера
        updateData()
        {
            __currentAccProfile.accountInfo = null;
            __currentAccProfile.errorData = null;
            __currentAccProfile.getAccountData();
        }

        getAccountData(): void
        {
            $.ajax({
                type: "GET",
                url: __currentAccProfile.application.getFullUri("api/account"),
                success: __currentAccProfile.onAjaxGetAccountDataSuccess,
                error: __currentAccProfile.onAjaxGetAccountDataError
            });
        }



        onAjaxGetAccountDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            //window.console.log("_onAjaxError");

            __currentAccProfile.errorData = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            __currentAccProfile.parent.dataError(__currentAccProfile, __currentAccProfile.errorData);

            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            if (2 == parseInt(__currentAccProfile.errorData.code))
                __currentAccProfile.application.checkAuthStatus();
        }

        onAjaxGetAccountDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("_onAjaxGetAccountDataSuccess");

            // загрузка компонента произведена успешно
            __currentAccProfile.accountInfo = <AjaxAccountDataResponse>data.data;
            // помещаем данные в контролы
            __currentAccProfile.drawData();

            if (false == __currentAccProfile.isComponentLoaded)
            {
                __currentAccProfile.isComponentLoaded = true;
                __currentAccProfile.parent.dataLoaded(__currentAccProfile);
            }
            else
            {                
                __currentAccProfile.parent.dataReady(__currentAccProfile);
            }
        }


        // помещаем данные в контролы
        drawData(): void
        {
            // shortcut
            var info: AjaxAccountDataResponse = __currentAccProfile.accountInfo;

            // обновляем контролы
            $("#i-ctrl-account-num").text(info.id.toString());
            $("#i-ctrl-account-reg-date").text(info.regDate);
            $("#i-ctrl-account-login-txt").val(info.login);
            $("#i-ctrl-account-email-txt").val(info.email);
        }

        onLoginSubmitClick(event: JQueryEventObject): void
        {
            var updateData: AjaxUpdateAccountRequest = new AjaxUpdateAccountRequest();
            updateData.operation = "login";
            updateData.newLogin = $("#i-ctrl-account-login-txt").val();

            // прячем все сообщения
            __currentAccProfile.clearAllLoginMessages();

            // проверка данных
            var isValid: boolean = Validators.Validator.prototype.validateLogin(updateData.newLogin);
            var errorMessage: string = Validators.loginNotValidMessage;


            if (false == isValid)
            {
                __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-login-error-message", errorMessage, true);
            }
            else
            {                
                // блокируем и отображаем картинку загрузки
                __currentAccProfile.application.showOverlay("#i-ctrl-account-login-overlay", "#i-ctrl-account-login");
                // отправляем данные на сервер
                __currentAccProfile.updateAccountInfo(updateData);
            }

        }

        onLoginCancelClick(event: JQueryEventObject): void
        {
            $("#i-ctrl-account-login-txt").val(__currentAccProfile.accountInfo.login);
            // прячем все сообщения
            __currentAccProfile.clearAllLoginMessages();            
        }

        clearAllLoginMessages(): void
        {
            // прячем информационное сообщение
            __currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-login-info-message", "", false);
            // прячем сообщение об ошибке
            __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-login-error-message", "", false);
        }

        onEmailSubmitClick(event: JQueryEventObject): void
        {
            var updateData: AjaxUpdateAccountRequest = new AjaxUpdateAccountRequest();
            updateData.operation = "email";
            updateData.newEmail = $("#i-ctrl-account-email-txt").val();

            // прячем все сообщения
            __currentAccProfile.clearAllEmailMessages();

            // проверка данных
            var isValid: boolean = Validators.Validator.prototype.validateEmail(updateData.newEmail);
            var errorMessage: string = Validators.emailNotValidMessage;

            if (false == isValid)
            {
                __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-email-error-message", errorMessage, true);
            }
            else
            {                
                // блокируем и отображаем картинку загрузки
                __currentAccProfile.application.showOverlay("#i-ctrl-account-email-overlay", "#i-ctrl-account-email");
                // отправляем данные на сервер
                __currentAccProfile.updateAccountInfo(updateData);
            }
        }

        onEmailCancelClick(event: JQueryEventObject): void
        {
            $("#i-ctrl-account-email-txt").val(__currentAccProfile.accountInfo.email);
            // прячем все сообщения
            __currentAccProfile.clearAllEmailMessages();
        }

        clearAllEmailMessages(): void
        {
            // прячем информационное сообщение
            __currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-email-info-message", "", false);
            // прячем сообщение об ошибке
            __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-email-error-message", "", false);
        }

        onPasswordSubmitClick(event: JQueryEventObject): void
        {
            var updateData: AjaxUpdateAccountRequest = new AjaxUpdateAccountRequest();
            updateData.operation = "password";
            updateData.oldPass = $("#i-ctrl-account-old-password-txt").val();
            updateData.newPass = $("#i-ctrl-account-new-password-1-txt").val();
            updateData.newPassConf = $("#i-ctrl-account-new-password-2-txt").val();

            // прячем все сообщения
            __currentAccProfile.clearAllPasswordMessages();

            // проверка данных
            var errorMessage: string = null;            
            var strength: number = Validators.Validator.prototype.getPassStrength(updateData.newPass);
            var isValid: boolean = (strength > 0);

            if (false == isValid)
            {
                errorMessage = Validators.passNotValidMessage;
                __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-1-error-message", errorMessage, true);
            }
            else if (updateData.oldPass == updateData.newPass)
            {
                isValid = false;
                errorMessage = Validators.passMatchMessage;
                __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-1-error-message", errorMessage, true);
            }
            else if (updateData.newPass != updateData.newPassConf)
            {
                isValid = false;
                errorMessage = Validators.passNotMatchMessage;
                __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-2-error-message", errorMessage, true);
            }

            if (isValid)
            {
                // блокируем и отображаем картинку загрузки
                __currentAccProfile.application.showOverlay("#i-ctrl-account-password-overlay", "#i-ctrl-account-password");
                // отправляем данные на сервер
                __currentAccProfile.updateAccountInfo(updateData);
            }
        }

        onPasswordCancelClick(event: JQueryEventObject): void
        {
            $("#i-ctrl-profile-account-container :password").val("");
            // прячем все сообщения
            __currentAccProfile.clearAllPasswordMessages();
        }

        clearAllPasswordMessages(): void
        {
            // прячем информационное сообщение
            __currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-password-info-message", "", false);
            // прячем сообщение об ошибке
            __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-old-password-error-message", "", false);
            __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-1-error-message", "", false);
            __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-2-error-message", "", false);
        }


        updateAccountInfo(data: AjaxUpdateAccountRequest): void
        {
            $.ajax({
                type: "PUT",
                url: __currentAccProfile.application.getFullUri("api/account"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: __currentAccProfile.onAjaxUpdateAccountDataSuccess,
                error: __currentAccProfile.onAjaxUpdateAccountDataError
            });
        }

        onAjaxUpdateAccountDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var request: AjaxUpdateAccountRequest = <AjaxUpdateAccountRequest>response.data;

            if ("login" == request.operation)
            {
                __currentAccProfile.application.hideOverlay("#i-ctrl-account-login-overlay");
                __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-login-error-message", response.userMessage, true);
            }
            else if ("email" == request.operation)
            {
                __currentAccProfile.application.hideOverlay("#i-ctrl-account-email-overlay");
                __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-email-error-message", response.userMessage, true);
            }
            else if ("password" == request.operation)
            {
                __currentAccProfile.application.hideOverlay("#i-ctrl-account-password-overlay");

                var errCode: string[] = response.code.split(";");
                var errMsg: string[] = response.userMessage.split(";");

                for (var i: number = 0; i < errCode.length; i++)
                {
                    var code: number = parseInt(errCode[i]);

                    if (1005 == code || 1007 == code)
                    {
                        __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-1-error-message", errMsg[i], true);
                    }
                    else if (1006 == code)
                    {
                        __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-2-error-message", errMsg[i], true);
                    }
                    else if (1008 == code)
                    {
                        __currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-old-password-error-message", errMsg[i], true);
                    }
                }                
            }            

            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            if (2 == parseInt(response.code))
            {
                __currentAccProfile.application.checkAuthStatus();
            }

        }

        onAjaxUpdateAccountDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            var request: AjaxUpdateAccountRequest = <AjaxUpdateAccountRequest>data.data;
            
            if ("login" == request.operation)
            {
                __currentAccProfile.application.hideOverlay("#i-ctrl-account-login-overlay");
                __currentAccProfile.accountInfo.login = request.newLogin;
                __currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-login-info-message", "Имя пользователя успешно изменено", true);
            }
            else if ("email" == request.operation)
            {
                __currentAccProfile.application.hideOverlay("#i-ctrl-account-email-overlay");
                __currentAccProfile.accountInfo.email = request.newEmail;
                __currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-email-info-message", "Адрес электронной почты успешно изменён", true);
            }
            else if ("password" == request.operation)
            {
                __currentAccProfile.application.hideOverlay("#i-ctrl-account-password-overlay");
                __currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-password-info-message", "Пароль успешно изменён", true);
            }            
        }
                

    }

    export var __currentAccProfile = new AccountProfileController();
}