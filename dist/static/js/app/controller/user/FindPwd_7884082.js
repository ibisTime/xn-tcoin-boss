'use strict';

define('js/app/controller/user/FindPwd', ['js/app/controller/base', 'js/lib/swiper/idangerous.swiper.min', 'js/app/module/validate/validate', 'js/app/interface/UserCtr', 'js/app/module/smsCaptcha/smsCaptcha', 'js/app/controller/Top', 'js/app/controller/foo'], function (base, Swiper, Validate, UserCtr, smsCaptcha, Top, Foo) {
			var langType = localStorage.getItem('langType') || 'ZH';
			var userReferee = base.getUrlParam("ref") || "";

			if (base.isLogin()) {
						base.gohref("../user/user.html");
			} else {
						init();
			}

			function init() {
						$(".head-button-wrap .button-login").removeClass("hidden");
						$(".head-button-wrap .button-login").removeClass("hidden");
						$(".head-button-wrap .button-register").removeClass("hidden");
						if (langType == 'EN') {
									$('title').text('Forgot password-FUNMVP blockchain technology application experimental platform');
						}
						$('title').text('忘记密码-FUNMVP区块链技术应用实验平台');
						base.hideLoadingSpin();
						addListener();
			}

			function resetPwd(params) {
						return UserCtr.resetPwd(params).then(function (data) {

									base.hideLoadingSpin();
									base.showMsg(base.getText('密码重置成功', langType));
									setTimeout(function () {
												base.gohref("../user/login.html");
									}, 800);
						}, base.hideLoadingSpin);
			}

			function addListener() {
						var _formWrapper = $("#form-wrapper");
						_formWrapper.validate({
									'rules': {
												"mobile": {
															required: true,
															mm: true
												},
												"smsCaptcha": {
															required: true,
															sms: true
												},
												"newLoginPwd": {
															required: true,
															minlength: 6
												},
												"reNewLoginPwd": {
															required: true,
															minlength: 6,
															equalTo: "#newLoginPwd"
												}
									},
									onkeyup: false
						});

						$("#subBtn").click(function () {
									if (_formWrapper.valid()) {
												base.showLoadingSpin();
												var params = _formWrapper.serializeObject();
												delete params.reNewLoginPwd;
												resetPwd(params);
									}
						});

						smsCaptcha.init({
									checkInfo: function checkInfo() {
												return $("#mobile").valid();
									},
									bizType: "805063",
									id: "getVerification",
									mobile: "mobile",
									errorFn: function errorFn() {}
						});
			}
});