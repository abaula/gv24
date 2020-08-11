///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>
var AccountProfile;
(function (AccountProfile) {
    var AjaxUpdateAccountRequest = (function () {
        function AjaxUpdateAccountRequest() {
        }
        return AjaxUpdateAccountRequest;
    })();
    AccountProfile.AjaxUpdateAccountRequest = AjaxUpdateAccountRequest;

    var AccountProfileController = (function () {
        function AccountProfileController() {
            this.isComponentLoaded = false;
            this.application = null;
            this.parent = null;
            this.accountInfo = null;
            this.errorData = null;
        }
        AccountProfileController.prototype.onLoad = function (app, parent, state) {
            AccountProfile.__currentAccProfile.application = app;
            AccountProfile.__currentAccProfile.parent = parent;

            // события отправки изменённых данных на сервер
            $("#i-ctrl-account-login-submit-btn").click(AccountProfile.__currentAccProfile.onLoginSubmitClick);
            $("#i-ctrl-account-email-submit-btn").click(AccountProfile.__currentAccProfile.onEmailSubmitClick);
            $("#i-ctrl-account-password-submit-btn").click(AccountProfile.__currentAccProfile.onPasswordSubmitClick);

            // события отмены редактирования данных
            $("#i-ctrl-account-login-cancel-btn").click(AccountProfile.__currentAccProfile.onLoginCancelClick);
            $("#i-ctrl-account-email-cancel-btn").click(AccountProfile.__currentAccProfile.onEmailCancelClick);
            $("#i-ctrl-account-password-cancel-btn").click(AccountProfile.__currentAccProfile.onPasswordCancelClick);

            // получаем данные с сервера
            AccountProfile.__currentAccProfile.queryData();
        };

        AccountProfileController.prototype.onUpdate = function (state) {
            AccountProfile.__currentAccProfile.updateData();
        };

        AccountProfileController.prototype.onShow = function (state) {
            // запрашиваем данные у модели
            AccountProfile.__currentAccProfile.queryData();
        };

        AccountProfileController.prototype.onHide = function (state) {
            // ничего не делаем
        };

        AccountProfileController.prototype.onLogin = function () {
        };

        AccountProfileController.prototype.onLogout = function () {
        };

        AccountProfileController.prototype.dataLoaded = function (sender) {
        };

        AccountProfileController.prototype.dataReady = function (sender) {
        };

        AccountProfileController.prototype.dataError = function (sender, error) {
        };

        AccountProfileController.prototype.dictDataReady = function (name) {
        };

        // Запрос данных
        // Выполняется только если нет загруженных данных или сообщения об ошибке
        AccountProfileController.prototype.queryData = function () {
            if (null == AccountProfile.__currentAccProfile.accountInfo && null == AccountProfile.__currentAccProfile.errorData) {
                AccountProfile.__currentAccProfile.getAccountData();
            } else if (null != AccountProfile.__currentAccProfile.errorData) {
                AccountProfile.__currentAccProfile.parent.dataError(AccountProfile.__currentAccProfile, AccountProfile.__currentAccProfile.errorData);
            } else {
                AccountProfile.__currentAccProfile.parent.dataReady(AccountProfile.__currentAccProfile);
            }
        };

        // обновление данных с сервера
        AccountProfileController.prototype.updateData = function () {
            AccountProfile.__currentAccProfile.accountInfo = null;
            AccountProfile.__currentAccProfile.errorData = null;
            AccountProfile.__currentAccProfile.getAccountData();
        };

        AccountProfileController.prototype.getAccountData = function () {
            $.ajax({
                type: "GET",
                url: AccountProfile.__currentAccProfile.application.getFullUri("api/account"),
                success: AccountProfile.__currentAccProfile.onAjaxGetAccountDataSuccess,
                error: AccountProfile.__currentAccProfile.onAjaxGetAccountDataError
            });
        };

        AccountProfileController.prototype.onAjaxGetAccountDataError = function (jqXHR, status, message) {
            //window.console.log("_onAjaxError");
            AccountProfile.__currentAccProfile.errorData = JSON.parse(jqXHR.responseText);
            AccountProfile.__currentAccProfile.parent.dataError(AccountProfile.__currentAccProfile, AccountProfile.__currentAccProfile.errorData);

            if (2 == parseInt(AccountProfile.__currentAccProfile.errorData.code))
                AccountProfile.__currentAccProfile.application.checkAuthStatus();
        };

        AccountProfileController.prototype.onAjaxGetAccountDataSuccess = function (data, status, jqXHR) {
            //window.console.log("_onAjaxGetAccountDataSuccess");
            // загрузка компонента произведена успешно
            AccountProfile.__currentAccProfile.accountInfo = data.data;

            // помещаем данные в контролы
            AccountProfile.__currentAccProfile.drawData();

            if (false == AccountProfile.__currentAccProfile.isComponentLoaded) {
                AccountProfile.__currentAccProfile.isComponentLoaded = true;
                AccountProfile.__currentAccProfile.parent.dataLoaded(AccountProfile.__currentAccProfile);
            } else {
                AccountProfile.__currentAccProfile.parent.dataReady(AccountProfile.__currentAccProfile);
            }
        };

        // помещаем данные в контролы
        AccountProfileController.prototype.drawData = function () {
            // shortcut
            var info = AccountProfile.__currentAccProfile.accountInfo;

            // обновляем контролы
            $("#i-ctrl-account-num").text(info.id.toString());
            $("#i-ctrl-account-reg-date").text(info.regDate);
            $("#i-ctrl-account-login-txt").val(info.login);
            $("#i-ctrl-account-email-txt").val(info.email);
        };

        AccountProfileController.prototype.onLoginSubmitClick = function (event) {
            var updateData = new AjaxUpdateAccountRequest();
            updateData.operation = "login";
            updateData.newLogin = $("#i-ctrl-account-login-txt").val();

            // прячем все сообщения
            AccountProfile.__currentAccProfile.clearAllLoginMessages();

            // проверка данных
            var isValid = Validators.Validator.prototype.validateLogin(updateData.newLogin);
            var errorMessage = Validators.loginNotValidMessage;

            if (false == isValid) {
                AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-login-error-message", errorMessage, true);
            } else {
                // блокируем и отображаем картинку загрузки
                AccountProfile.__currentAccProfile.application.showOverlay("#i-ctrl-account-login-overlay", "#i-ctrl-account-login");

                // отправляем данные на сервер
                AccountProfile.__currentAccProfile.updateAccountInfo(updateData);
            }
        };

        AccountProfileController.prototype.onLoginCancelClick = function (event) {
            $("#i-ctrl-account-login-txt").val(AccountProfile.__currentAccProfile.accountInfo.login);

            // прячем все сообщения
            AccountProfile.__currentAccProfile.clearAllLoginMessages();
        };

        AccountProfileController.prototype.clearAllLoginMessages = function () {
            // прячем информационное сообщение
            AccountProfile.__currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-login-info-message", "", false);

            // прячем сообщение об ошибке
            AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-login-error-message", "", false);
        };

        AccountProfileController.prototype.onEmailSubmitClick = function (event) {
            var updateData = new AjaxUpdateAccountRequest();
            updateData.operation = "email";
            updateData.newEmail = $("#i-ctrl-account-email-txt").val();

            // прячем все сообщения
            AccountProfile.__currentAccProfile.clearAllEmailMessages();

            // проверка данных
            var isValid = Validators.Validator.prototype.validateEmail(updateData.newEmail);
            var errorMessage = Validators.emailNotValidMessage;

            if (false == isValid) {
                AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-email-error-message", errorMessage, true);
            } else {
                // блокируем и отображаем картинку загрузки
                AccountProfile.__currentAccProfile.application.showOverlay("#i-ctrl-account-email-overlay", "#i-ctrl-account-email");

                // отправляем данные на сервер
                AccountProfile.__currentAccProfile.updateAccountInfo(updateData);
            }
        };

        AccountProfileController.prototype.onEmailCancelClick = function (event) {
            $("#i-ctrl-account-email-txt").val(AccountProfile.__currentAccProfile.accountInfo.email);

            // прячем все сообщения
            AccountProfile.__currentAccProfile.clearAllEmailMessages();
        };

        AccountProfileController.prototype.clearAllEmailMessages = function () {
            // прячем информационное сообщение
            AccountProfile.__currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-email-info-message", "", false);

            // прячем сообщение об ошибке
            AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-email-error-message", "", false);
        };

        AccountProfileController.prototype.onPasswordSubmitClick = function (event) {
            var updateData = new AjaxUpdateAccountRequest();
            updateData.operation = "password";
            updateData.oldPass = $("#i-ctrl-account-old-password-txt").val();
            updateData.newPass = $("#i-ctrl-account-new-password-1-txt").val();
            updateData.newPassConf = $("#i-ctrl-account-new-password-2-txt").val();

            // прячем все сообщения
            AccountProfile.__currentAccProfile.clearAllPasswordMessages();

            // проверка данных
            var errorMessage = null;
            var strength = Validators.Validator.prototype.getPassStrength(updateData.newPass);
            var isValid = (strength > 0);

            if (false == isValid) {
                errorMessage = Validators.passNotValidMessage;
                AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-1-error-message", errorMessage, true);
            } else if (updateData.oldPass == updateData.newPass) {
                isValid = false;
                errorMessage = Validators.passMatchMessage;
                AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-1-error-message", errorMessage, true);
            } else if (updateData.newPass != updateData.newPassConf) {
                isValid = false;
                errorMessage = Validators.passNotMatchMessage;
                AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-2-error-message", errorMessage, true);
            }

            if (isValid) {
                // блокируем и отображаем картинку загрузки
                AccountProfile.__currentAccProfile.application.showOverlay("#i-ctrl-account-password-overlay", "#i-ctrl-account-password");

                // отправляем данные на сервер
                AccountProfile.__currentAccProfile.updateAccountInfo(updateData);
            }
        };

        AccountProfileController.prototype.onPasswordCancelClick = function (event) {
            $("#i-ctrl-profile-account-container :password").val("");

            // прячем все сообщения
            AccountProfile.__currentAccProfile.clearAllPasswordMessages();
        };

        AccountProfileController.prototype.clearAllPasswordMessages = function () {
            // прячем информационное сообщение
            AccountProfile.__currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-password-info-message", "", false);

            // прячем сообщение об ошибке
            AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-old-password-error-message", "", false);
            AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-1-error-message", "", false);
            AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-2-error-message", "", false);
        };

        AccountProfileController.prototype.updateAccountInfo = function (data) {
            $.ajax({
                type: "PUT",
                url: AccountProfile.__currentAccProfile.application.getFullUri("api/account"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: AccountProfile.__currentAccProfile.onAjaxUpdateAccountDataSuccess,
                error: AccountProfile.__currentAccProfile.onAjaxUpdateAccountDataError
            });
        };

        AccountProfileController.prototype.onAjaxUpdateAccountDataError = function (jqXHR, status, message) {
            var response = JSON.parse(jqXHR.responseText);
            var request = response.data;

            if ("login" == request.operation) {
                AccountProfile.__currentAccProfile.application.hideOverlay("#i-ctrl-account-login-overlay");
                AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-login-error-message", response.userMessage, true);
            } else if ("email" == request.operation) {
                AccountProfile.__currentAccProfile.application.hideOverlay("#i-ctrl-account-email-overlay");
                AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-email-error-message", response.userMessage, true);
            } else if ("password" == request.operation) {
                AccountProfile.__currentAccProfile.application.hideOverlay("#i-ctrl-account-password-overlay");

                var errCode = response.code.split(";");
                var errMsg = response.userMessage.split(";");

                for (var i = 0; i < errCode.length; i++) {
                    var code = parseInt(errCode[i]);

                    if (1005 == code || 1007 == code) {
                        AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-1-error-message", errMsg[i], true);
                    } else if (1006 == code) {
                        AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-new-password-2-error-message", errMsg[i], true);
                    } else if (1008 == code) {
                        AccountProfile.__currentAccProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-account-old-password-error-message", errMsg[i], true);
                    }
                }
            }

            if (2 == parseInt(response.code)) {
                AccountProfile.__currentAccProfile.application.checkAuthStatus();
            }
        };

        AccountProfileController.prototype.onAjaxUpdateAccountDataSuccess = function (data, status, jqXHR) {
            var request = data.data;

            if ("login" == request.operation) {
                AccountProfile.__currentAccProfile.application.hideOverlay("#i-ctrl-account-login-overlay");
                AccountProfile.__currentAccProfile.accountInfo.login = request.newLogin;
                AccountProfile.__currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-login-info-message", "Имя пользователя успешно изменено", true);
            } else if ("email" == request.operation) {
                AccountProfile.__currentAccProfile.application.hideOverlay("#i-ctrl-account-email-overlay");
                AccountProfile.__currentAccProfile.accountInfo.email = request.newEmail;
                AccountProfile.__currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-email-info-message", "Адрес электронной почты успешно изменён", true);
            } else if ("password" == request.operation) {
                AccountProfile.__currentAccProfile.application.hideOverlay("#i-ctrl-account-password-overlay");
                AccountProfile.__currentAccProfile.application.switchFormInfoMessageVisibility("#i-ctrl-account-password-info-message", "Пароль успешно изменён", true);
            }
        };
        return AccountProfileController;
    })();
    AccountProfile.AccountProfileController = AccountProfileController;

    AccountProfile.__currentAccProfile = new AccountProfileController();
})(AccountProfile || (AccountProfile = {}));
