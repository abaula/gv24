var Validators;
(function (Validators) {
    var Validator = (function () {
        function Validator() {
        }
        Validator.prototype.validateEmail = function (email) {
            var emailReg = new RegExp("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$");

            var valid = emailReg.test(email);

            return valid;
        };

        Validator.prototype.validateLogin = function (login) {
            // от 3 до 15 знаков
            var emailReg = new RegExp("^[a-z0-9_-]{3,15}$");

            var valid = emailReg.test(login);

            return valid;
        };

        Validator.prototype.validatePhone = function (phone) {
            var reg = new RegExp("^((8|\\+7)[\\- ]?)?(\\(?\\d{3}\\)?[\\- ]?)?[\\d\\- ]{7,10}$");
            var valid = reg.test(phone);

            return valid;
        };

        Validator.prototype.validateOGRN = function (orgn) {
            if (orgn.length == 13 && (orgn.slice(12, 13) == (parseInt(orgn.slice(0, -1)) % 11).toString().slice(-1))) {
                return true;
            } else if (orgn.length == 15 && (orgn.slice(14, 15) == (parseInt(orgn.slice(0, -1)) % 13).toString().slice(-1))) {
                return true;
            }

            return false;
        };

        Validator.prototype.validateINN = function (inn) {
            //преобразуем в массив
            var arr = inn.split('');

            if ((arr.length == 10) && (parseInt(arr[9]) == ((2 * parseInt(arr[0]) + 4 * parseInt(arr[1]) + 10 * parseInt(arr[2]) + 3 * parseInt(arr[3]) + 5 * parseInt(arr[4]) + 9 * parseInt(arr[5]) + 4 * parseInt(arr[6]) + 6 * parseInt(arr[7]) + 8 * parseInt(arr[8])) % 11) % 10)) {
                return true;
            } else if ((arr.length == 12) && ((parseInt(arr[10]) == ((7 * parseInt(arr[0]) + 2 * parseInt(arr[1]) + 4 * parseInt(arr[2]) + 10 * parseInt(arr[3]) + 3 * parseInt(arr[4]) + 5 * parseInt(arr[5]) + 9 * parseInt(arr[6]) + 4 * parseInt(arr[7]) + 6 * parseInt(arr[8]) + 8 * parseInt(arr[9])) % 11) % 10) && (parseInt(arr[11]) == ((3 * parseInt(arr[0]) + 7 * parseInt(arr[1]) + 2 * parseInt(arr[2]) + 4 * parseInt(arr[3]) + 10 * parseInt(arr[4]) + 3 * parseInt(arr[5]) + 5 * parseInt(arr[6]) + 9 * parseInt(arr[7]) + 4 * parseInt(arr[8]) + 6 * parseInt(arr[9]) + 8 * parseInt(arr[10])) % 11) % 10))) {
                return true;
            }

            return false;
        };

        Validator.prototype.getPassStrength = function (password) {
            var strength = 0;

            if (password.length < 6)
                return strength;

            if (password.length >= 6)
                strength++;

            if (password.length > 7)
                strength++;

            if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))
                strength++;

            if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))
                strength++;

            if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))
                strength++;

            if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/))
                strength++;

            return strength;
        };
        return Validator;
    })();
    Validators.Validator = Validator;

    Validators.loginNotValidMessage = "Логин указан неправильно. Укажите не менее 3-х и не более 15 латинских символов и, по желанию, цифр.";
    Validators.emailNotValidMessage = "Email указан неправильно. Внимательно проверьте указанный адрес.";
    Validators.passNotValidMessage = "Пароль должен быть длинной не менее 6-ти символов.";
    Validators.passNotMatchMessage = "Пароли не совпадают.";
    Validators.passMatchMessage = "Старый и новый пароли не должны совпадать.";
    Validators.ogrnNotValidMessage = "ОГРН указан неправильно. Внимательно проверьте указанный номер.";
    Validators.innNotValidMessage = "ИНН указан неправильно. Внимательно проверьте указанный номер.";
    Validators.phoneNotValidMessage = "Телефон указан неправильно. Внимательно проверьте указанный номер.";
})(Validators || (Validators = {}));
