///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="page.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
var Registration;
(function (Registration) {
    var RegistrationRequest = (function () {
        function RegistrationRequest(login, email) {
            this.login = login;
            this.email = email;
            //            this.pass = (typeof pass === "undefined") ? "" : pass;
        }
        return RegistrationRequest;
    })();

    var RegistrationController = (function () {
        function RegistrationController() {
        }
        RegistrationController.prototype._onTextChange = function (event) {
            var txtBox = $(event.delegateTarget);
            var containerId = txtBox.parent().parent().attr("id");

            if ("registration-account-login" == containerId)
                $("#registration-account-login div.page-property-message").text("");
else if ("registration-account-email" == containerId)
                $("#registration-account-email div.page-property-message").text("");
        };

        RegistrationController.prototype._onRegiterButtonClick = function (event) {
            var button = $(event.delegateTarget);
            var loginControl = $("#registration-account-login :text");
            var emailControl = $("#registration-account-email :text");
            var loginMessageControl = $("#registration-account-login div.page-property-message");
            var emailMessageControl = $("#registration-account-email div.page-property-message");

            // убираем сообщение об ошибке, если оно было
            $("#registration-account-cmd div.page-property-message").text("");

            // делаем кнопку недоступной
            button.attr("disabled", "disabled");

            // собираем данные для регистрации
            var login = loginControl.val();
            login = login.trim();
            loginControl.val(login);

            var email = emailControl.val();
            email = email.trim();
            emailControl.val(email);

            // проверки корректности введённых данных
            var validLogin = RegistrationController.prototype._validateLogin(login);

            if (!validLogin) {
                loginMessageControl.text("Логин указан неправильно. Укажите не менее 3-х и не более 15 латинских символов и, по желанию, цифр");
            }

            var validEmail = RegistrationController.prototype._validateEmail(email);

            if (!validEmail) {
                emailMessageControl.text("Email указан неправильно. Внимательно проверьте указанный адрес");
            }

            if (validLogin && validEmail) {
                // отправка данных на сервер
                var request = new RegistrationRequest(login, email);

                $.ajax({
                    type: "POST",
                    url: Page.PageController.prototype.getFullUrl("api/account"),
                    data: JSON.stringify(request),
                    contentType: "application/json",
                    dataType: "json",
                    success: RegistrationController.prototype._onAjaxSuccess,
                    error: RegistrationController.prototype._onAjaxError
                });
            } else {
                button.removeAttr("disabled");
            }
        };

        /*
        */
        RegistrationController.prototype._onAjaxError = function (jqXHR, status, message) {
            // делаем доступной кнопку регистрации
            $("#page-containers button").removeAttr("disabled");

            // обработка ответа сервера
            var data = JSON.parse(jqXHR.responseText);

            // разбираем переданные коды ошибок
            var errCodes = data.code.split(";");
            var errMessages = data.userMessage.split(";");

            for (var i = 0; i < errCodes.length; i++) {
                var eCode = parseInt(errCodes[i]);

                if (1 == eCode) {
                    $("#registration-account-cmd div.page-property-message").text(errMessages[i]);
                } else if (1001 == eCode) {
                    $("#registration-account-email div.page-property-message").text(errMessages[i]);
                } else if (1002 == eCode) {
                    $("#registration-account-login div.page-property-message").text(errMessages[i]);
                } else if (1003 == eCode) {
                    $("#registration-account-login div.page-property-message").text(errMessages[i]);
                } else if (1004 == eCode) {
                    $("#registration-account-email div.page-property-message").text(errMessages[i]);
                }
            }
            //window.console.log("Server error: code: " + data.code + ", message: " + data.userMessage + ", url: " + data.moreInfoUri);
            //window.console.log("Server error: status: " + status + ", message: " + message);
        };

        RegistrationController.prototype._onAjaxSuccess = function (data, status, jqXHR) {
            //$("#page-containers button").removeAttr("disabled");
            // отображение результата операции
            $("#page-registration-form").removeClass("page-property").addClass("hidden");
            $("#page-registration-complete").removeClass("hidden").addClass("page-property");
            //window.console.log("Server success: code: " + data.code + ", message: " + data.userMessage + ", url: " + data.moreInfoUri);
        };

        RegistrationController.prototype._validateEmail = function (email) {
            var emailReg = new RegExp("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$");

            var valid = emailReg.test(email);

            return valid;
        };

        RegistrationController.prototype._validateLogin = function (login) {
            // от 3 до 15 знаков
            var emailReg = new RegExp("^[a-z0-9_-]{3,15}$");

            var valid = emailReg.test(login);

            return valid;
        };

        RegistrationController.prototype.onDocumentReady = function () {
            // нажатие на кнопку регистрации
            $("#page-containers button").click(RegistrationController.prototype._onRegiterButtonClick);

            // изменение текста в полях
            $("#page-containers :text").change(RegistrationController.prototype._onTextChange);
        };
        return RegistrationController;
    })();
    Registration.RegistrationController = RegistrationController;
})(Registration || (Registration = {}));

$(document).ready(Registration.RegistrationController.prototype.onDocumentReady);
