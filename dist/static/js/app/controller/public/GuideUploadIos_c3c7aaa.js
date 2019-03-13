'use strict';

define('js/app/controller/public/GuideUploadIos', ['js/app/controller/base', 'js/app/interface/GeneralCtr', 'js/app/controller/Top', 'js/app/controller/foo'], function (base, GeneralCtr, Top, Foo) {

    init();

    function init() {

        setTimeout(function () {
            base.hideLoadingSpin();
        }, 100);

        addListener();
    }

    function addListener() {}
});