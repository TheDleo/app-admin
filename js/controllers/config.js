var ConfigCtrl = function ($scope, Config, Role, EmailTemplates) {
    Scope = $scope;
    Scope.allVerbs = ["GET","POST", "PUT", "MERGE", "PATCH", "DELETE", "COPY"];
    Scope.Config = Config.get(function () {
    }, function (response) {
        var code = response.status;
        if (code == 401) {
            window.top.Actions.doSignInDialog("stay");
            return;
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
    Scope.Roles = Role.get(function () {
    }, function (response) {
        var code = response.status;
        if (code == 401) {
            window.top.Actions.doSignInDialog("stay");
            return;
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
    Scope.addHost = function () {
        Scope.Config.allowed_hosts.push(Scope.CORS.host);
        Scope.CORS.host = "";
    }
    Scope.save = function () {
        Config.update(Scope.Config, function () {
                $.pnotify({
                    title: 'Configuration',
                    type: 'success',
                    text: 'Updated Successfully'
                });
            },
            function (response) {
                var code = response.status;
                if (code == 401) {
                    window.top.Actions.doSignInDialog("stay");
                    return;
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
    Scope.upgrade = function () {

        window.top.location = CurrentServer + '/web/upgrade';
    }
    Scope.removeHost = function () {
        var index = this.$index;
        Scope.Config.allowed_hosts.splice(index, 1);
    }
    Scope.selectAll = function($event){

        if($event.target.checked){
            this.host.verbs = Scope.allVerbs;
        }else{
            this.host.verbs = [];
        }

    }
    Scope.toggleVerb = function () {

        var index = this.$parent.$index;
        if (Scope.Config.allowed_hosts[index].verbs.indexOf(this.verb) === -1) {
            Scope.Config.allowed_hosts[index].verbs.push(this.verb);
        } else {
            Scope.Config.allowed_hosts[index].verbs.splice(Scope.Config.allowed_hosts[index].verbs.indexOf(this.verb), 1);
        }
    };
    Scope.promptForNew = function(){
        var newhost = {};
        newhost.verbs = Scope.allVerbs;
        newhost.host = "";
        newhost.is_enabled = true;
        Scope.Config.allowed_hosts.unshift(newhost);
    }


    // EMAIL TEMPLATES
    // ------------------------------------

    // Store current user
    Scope.currentUser = window.CurrentUserID;

    // Store the id of an email template we have selected
    Scope.selectedEmailTemplateId = '';

    // Stores a copy email template that is currently being created or edited
    Scope.getSelectedEmailTemplate = {};

    // Stores email templates
    Scope.emailTemplates = EmailTemplates.get(function(){});

    // Facade: determines whether an email should be updated or created
    // and calls the appropriate function
    Scope.saveEmailTemplate = function(templateParams) {

        if ((templateParams.id === '') || (templateParams.id === undefined)) {

            Scope._saveNewEmailTemplate(templateParams);
        }
        else {
            Scope._updateEmailTemplate(templateParams);
        }
    };

    // Updates an existing email
    Scope._updateEmailTemplate = function(templateParams) {

        templateParams.last_modified_by_id = Scope.currentUser;


        EmailTemplates.update({id: templateParams.id}, templateParams, function () {
                $.pnotify({
                    title: 'Email Template',
                    type: 'success',
                    text: 'Updated Successfully'
                });
            },
            function (response) {
                var code = response.status;
                if (code == 401) {
                    window.top.Actions.doSignInDialog("stay");
                    return;
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

        Scope.$emit('updateTemplateListExisting');

    };

    // Creates a new email in the database
    Scope._saveNewEmailTemplate = function(templateParams) {

        templateParams.created_by_id = Scope.currentUser;
        templateParams.last_modified_by_id = Scope.currentUser;

        EmailTemplates.save({}, templateParams, function(data) {


                var emitArgs,
                    d = {},
                    key;

                for (key in data) {
                    if (data.hasOwnProperty(key)) {
                        d[key] = data[key];
                    }
                }

                emitArgs = d;

                Scope.$emit('updateTemplateListNew', emitArgs);

                $.pnotify({
                    title: 'Email Template',
                    type: 'success',
                    text: 'Created Successfully'
                });
            },
            function (response) {
                var code = response.status;
                if (code == 401) {
                    window.top.Actions.doSignInDialog("stay");
                    return;
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

    // Deletes and email from the database
    Scope.deleteEmailTemplate = function(templateId) {

        if(!confirm('Delete Email Template: \n\n' + Scope.getSelectedEmailTemplate.name)) {
            return;
        }

        EmailTemplates.delete({id: templateId}, function() {
                $.pnotify({
                    title: 'Email Templates',
                    type: 'success',
                    text: 'Template Deleted'
                });
            },
            function (response) {
                var code = response.status;
                if (code == 401) {
                    window.top.Actions.doSignInDialog("stay");
                    return;
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

        Scope.$emit('templateDeleted');

    };

    // Special Functions
    // Duplicates an email template for editing
    Scope.duplicateEmailTemplate = function() {

        var templateCopy;

        if ((Scope.getSelectedEmailTemplate.id === '') || (Scope.getSelectedEmailTemplate.id === undefined) || (Scope.getSelectedEmailTemplate === null)) {
            console.log('No email template Selected');

            $.pnotify({
                title: 'Email Templates',
                type: 'error',
                text: 'No template selected.'
            });
        }
        else {
            templateCopy = angular.copy(Scope.getSelectedEmailTemplate);

            templateCopy.id = '';
            templateCopy.name = 'Clone of ' + templateCopy.name;
            templateCopy.created_date = '';
            templateCopy.created_by_id = '';

            Scope.getSelectedEmailTemplate = angular.copy(templateCopy);
        }
    };

    // Events
    // Update existing Scope.emailTemplates.record entry
    Scope.$on('updateTemplateListExisting', function() {

        // Loop through emailTemplates.record to find our currently selected
        // email template by its id
        angular.forEach(Scope.emailTemplates.record, function(v, i) {
            if (v.id === Scope.selectedEmailTemplateId) {

                // replace that email template with the one we are currently working on
                Scope.emailTemplates.record.splice(i, 1, Scope.getSelectedEmailTemplate);
            }
        });
    });

    // Add a newly created email template to Scope.emailTemplates.record
    Scope.$on('updateTemplateListNew', function(event, emitArgs) {

        Scope.emailTemplates.record.push(emitArgs);
        Scope.newEmailTemplate();

    });

    // Delete email template from Scope.emailTemplates.record
    Scope.$on('templateDeleted', function() {

        var templateIndex = null;

        // Loop through Scope.emailTemplates.record
        angular.forEach(Scope.emailTemplates.record, function(v, i) {

            // If we find a template id that matches our currently selected
            // template id, store the index of that template object
            if (v.id === Scope.selectedEmailTemplateId) {
                templateIndex = i;
            }
        });


        // Check to make sure our template exists
        if ((templateIndex != '') || (templateIndex != undefined) || (templateIndex != null)) {

            // If it does splice it out
            Scope.emailTemplates.record.splice(templateIndex, 1);

            // Reset Scope.getSelectedEmailTemplate and Scope.selectedEmailTemplateId
            Scope.newEmailTemplate();
        }
    });

    // UI Functions
    // Reset Scope.selectedEmailTemplateId and Scope.getSelectedEmailTemplate
    Scope.newEmailTemplate = function() {
        // set selected email template to none and clear fields
        Scope.getSelectedEmailTemplate = {};
        Scope.selectedEmailTemplateId = '';
        Scope.showCreateEmailTab('template-info-pane');
    };

    // Create Email Nav
    // Store the nav tab we are currently on
    Scope.currentCreateEmailTab = 'template-info-pane';

    // Set the nav tab to the one we clicked
    Scope.showCreateEmailTab = function(id) {
        Scope.currentCreateEmailTab = id;
    };

    // Watch email template selection and assign proper template
    Scope.$watch('selectedEmailTemplateId', function() {

        // Store our found emailTemplate
        // Initialize with an empty record
        var result = [];

        // Loop through Scope.emailTemplates..record
        angular.forEach(Scope.emailTemplates.record, function(value, index) {

            // If we find our email template
            if (value.id === Scope.selectedEmailTemplateId) {

                // Store it
                result.push(value);
            }
            // Stop!  We found our email template
            return false;
        });


        // Double check that there is a result
        if (!result) {
            // Handle error: email template not found
            // console.log('Template Not found');
        }

        // If there is just one result(which there should only be one)
        else if (result.length === 1) {

            // Copy the result object for editing/deleting/updating and so on
            Scope.getSelectedEmailTemplate = angular.copy(result[0]);
        }

        // There was more that one template found.
        // This is a problem as every template should have a unique Id
        else if (result.length > 1) {
            // Handle error: more than one email template
            // with the same Id
            //console.log('multiple templates found');
            $.pnotify({
                title: 'Email Templates',
                type: 'warning',
                text: 'Multiple templates found.'
            });
        }
    });

}
