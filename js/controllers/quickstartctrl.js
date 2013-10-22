var QuickStartCtrl = function ($scope, App, Config, Service, $location) {
    setCurrentApp('getting_started');
    Scope = $scope;
    Scope.Config = Config.get(function(data){
        Scope.CORSConfig = {"id": data.id, "verbs":["GET","POST","PUT","MERGE","PATCH","DELETE","COPY"],"host":"*","is_enabled":true};
    })

    Scope.Services = Service.get(function(){

        Scope.Services.record.forEach(function(service){
            if (service.type.indexOf("Local File Storage") != -1){
                Scope.defaultStorageID = service.id;
            }

        });
    });
    Scope.app ={native:0};
    Scope.step = 1;
    Scope.setStep = function(step){
        if(step == 2 && Scope.app.native =='1'){
            Scope.step = 4;
            Scope.create();
//            var height = $(window).height();
//            $('.well.main').css('height', height + 400);
//            return;
        }else if(step == 3){
            Scope.step = 4;
            return;
        }

        Scope.step = step;
    }
    Scope.launchApp = function(){
        window.open(location.protocol + '//' + location.host + '/app/applications/' + Scope.app.api_name+ '/index.html', "df-new");
    }
    Scope.downloadSDK = function(){
        $("#sdk-download").attr('src', location.protocol + '//' + location.host + '/rest/system/app/' + Scope.app.id + '?sdk=true&app_name=admin')
    }
    Scope.goToApps = function(){
        $location.path('/app');
    };
    Scope.saveConfig = function () {
        if(Scope.app.storage_service_id != 0){
            return;
        }

        Config.update(Scope.CORSConfig, function () {
//                $.pnotify({
//                    title: 'Configuration',
//                    type: 'success',
//                    text: 'Updated Successfully'
//                });
            },
            function (response) {
                var code = response.status;
//                if (code == 401) {
//                    if(window.top.Actions){
//
//                    }
//                    window.top.Actions.doSignInDialog("stay");
//                    return;
//                }
                var error = response.data.error;
                $.pnotify({
                    title: 'Error',
                    type: 'error',
                    hide: false,
                    addclass: "stack-bottomright",
                    text: error[0].message
                });


            });
    };
    Scope.create = function () {

        if (Scope.app.native == '1') {
            Scope.app.storage_service_id = null;
            Scope.app.storage_container = null;
            Scope.app.launch_url = "";


        }else if(Scope.app.storage_service_id == 0){
            Scope.app.storage_service_id = null;
            Scope.app.storage_container = null;

        }else{
            Scope.app.storage_service_id = Scope.defaultStorageID;
            Scope.app.storage_container = "applications"
        }
        Scope.app.name = Scope.app.api_name;
        App.save(Scope.app, function (data) {
                //Scope.Apps.record.push(data);
                Scope.app.id = data.id;
                //Scope.app = data;
                if(window.top.Actions){
                    window.top.Actions.updateSession("update");
                }
                $.pnotify({
                    title: Scope.app.api_name,
                    type: 'success',
                    text: 'Created Successfully'
                });

//                if (!Scope.app.native) {
//                    Scope.showAppPreview(data.launch_url);
//                }
            },
            function (response) {
                Scope.setStep(1);
                var code = response.status;
                if (code == 401) {
                    if(window.top.Actions){
                        window.top.Actions.doSignInDialog("stay");
                        return;
                    }
                }
                var error = response.data.error;
                $.pnotify({
                    title: 'Error',
                    type: 'error',
                    hide: false,
                    addclass: "stack-bottomright",
                    text: error[0].message
                });



            });


    };
//    $(function(){
//        var height = $(window).height();
//        var width = window.innerWidth - 300;
//        //$('#app-preview').css('height', height - 300).css('width', width);
//        $('.well.main').css('height', height);
//    });
//
//    $(window).resize(function(){
//        var height = $(window).height();
//        var width = window.innerWidth - 300;
//        //$('#app-preview').css('height', height - 300).css('width', width);
//        $('.well.main').css('height', height);
//
//    });
};