require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/",
    paths: {
        //kendo: "kendo/js/kendo.mobile.min",
        //jquery: "jquery/jquery.min",
        text: "require/text"
    },

    shim: {
        //kendo: {
        //    deps: ['jquery'],
        //    exports: 'kendo'
        //}
    }
});

//let's let the user know that things are happening
app.lib.mask.apply();
$("body").css("cursor", "wait");
$(document).ajaxStop(function () {
    $("body").css("cursor", "auto");
});

require(["forms/taskBuilder", "forms/headerBuilder", "forms/formBuilder", "forms/formHelper"], function (taskBuilder, headerBuilder, formBuilder, formHelper, messagesStructure) {

    var saveUrl = pageForm.saveUrl;
    var mainContainer = $(pageForm.container);
    var taskContainer = $('<div class="task-panel task-panel-narrow"></div>');
    //var headerContainer = $('<div/>').addClass("form-header form-panel");
    var headerContainer = $('.page_bar').empty(); //use new page header div, just clear it out before adding things
    var formContainer = $('<div/>').addClass("page-form");
    var formType = pageForm.type;
    var dataVM = pageForm.viewModel;
    var dataVMUnchanged = pageForm.jsonRaw;
    var priorityJSON = (pageForm.priorityJSON) ? pageForm.priorityJSON : false; // for priority matrix in Incident
    var bHasNoInitalAssignee = (_.isUndefined(pageForm.viewModel.AssignedWorkItem) || _.isNull(pageForm.viewModel.AssignedWorkItem)) ? true : false; //for set first assigned date in incident
    var bShowAddWatchList = _.isUndefined(_.find(pageForm.viewModel.WatchList, function (user) { return (user.Id == session.user.Id || user.BaseId == session.user.Id); }));
    var bShowRemoveWatchList = !bShowAddWatchList;


    //set a check for unsubmitted action log commnets
    dataVM.set('commentDirty', false);

    //seems like the activity builder calls this on ready function once all the activity stuff is loaded
    pageForm.onReady = function () {
        //make sure activities did not make the form dirty
        pageForm.viewModel.set("isDirty", false);
        if (!pageForm.isNew) {
            formHelper.makeFormPristine(pageForm.viewModel);
        }
    }

    //check for errors
    if (!_.isUndefined(pageForm.viewModel.WorkItemErrorMessage)) {
        var jumbotron = $('<div/>').addClass('jumbotron');
        jumbotron.append($('<h1 />').addClass("error uppercase").html("<i class='fa fa-frown-o'></i> " + localization.Failed));
        jumbotron.append($('<p />').addClass("error").html(pageForm.viewModel.WorkItemErrorMessage));

        mainContainer.append(jumbotron);

        app.lib.mask.remove();
        $("body").css("cursor", "auto");
        return;
    }

    //add the ability to bind to form load
    var readyArray = [];
    pageForm.boundReady = function (func) {
        readyArray.push(func);
    }

    //add the ability to bind change to viewModel by index, with support for null index
    var changesArray = [];
    pageForm.boundChange = function (index, func) {
        changesArray[index] = func;
    }

    //add custom viewModel function in the custom space
    var methods = app.custom.actionMethod.get(formType);
    if (_.isArray(methods)) {
        dataVM.custom = {};
        $.each(methods, function (i, method) {
            if (_.isFunction(method.func)) {
                dataVM.custom[method.index] = method.func;
            }
        });
    }

    //add header json definition
    //since all WI have same header structure we put it in this file
    //if this changes we need to move this to all the cshtml New/Edit files
    pageForm.headerTemplate = {
        rows: [
                {
                    columns: [
                        { View: "sticky", Class: "" }
                        //{ View: "status", Class: "col-md-6 col-xs-12" },
                        //{ View: "relationships", Class: "col-md-4 col-xs-12" },
                        //{ View: "slo", Class: "col-md-3 col-xs-12" }
                    ]
                }
        ]
    };

    if ($("html").attr("dir")=="rtl") {
        pageForm.headerTemplate.rows[0].columns.reverse();
    }


    //going to define tasks based on pageForm.type & pageForm.newWI to reduce repetative code
    pageForm.taskTemplate = {};
    pageForm.taskTemplate.task = [];

    //if tasks are visible for analysts only, check if AP license is valid too
    var isAnalystAndValidAPLicense = session.user.Analyst && session.consoleSetting.AnalystPortalLicense.IsValid;
    var isAnalyst = session.user.Analyst;
    var isValidAPLicense = session.consoleSetting.AnalystPortalLicense.IsValid;

    //Change Request Tasks

    var ChangeStatus = "0bf0a71b-9e9e-f719-0271-c9a4ff352600";
    var ChangeStatus_New = "a87c003e-8c19-a25f-f8b2-151b56670e5c";
    var ChangeStatus_Failed = "85f00ead-2603-6c68-dfec-531c83bf900f";
    var ChangeStatus_Closed = "f228d50b-2b5a-010f-b1a4-5c7d95703a9b";
    var ChangeStatus_InProgress = "6d6c64dd-07ac-aaf5-f812-6a7cceb5154d";
    var ChangeStatus_OnHold = "dd6b0870-bcea-1520-993d-9f1337e39d4d";
    var ChangeStatus_Cancelled = "877defb6-0d21-7d19-89d5-a1107d621270";
    var ChangeStatus_Submitted = "504f294c-ae38-2a65-f395-bff4f085698b";
    var ChangeStatus_Completed = "68277330-a0d3-cfdd-298d-d5c31d1d126f";

    if (pageForm.type === 'ChangeRequest') {
        var statusCancelled = (pageForm.viewModel.Status.Id == ChangeStatus_Cancelled);
        var statusCompleted = (pageForm.viewModel.Status.Id == ChangeStatus_Completed);
        var statusFailed = (pageForm.viewModel.Status.Id == ChangeStatus_Failed);
        var showCancelled = (!pageForm.newWI) && !statusCancelled && !statusCompleted && !statusFailed;
        var showChangeStatus = (isAnalystAndValidAPLicense && !pageForm.newWI);
        var showAnalystByGroup = (isAnalystAndValidAPLicense && pageForm.CRSupportGroupField != "");

        pageForm.taskTemplate = {
            tasks: [
                { Task: "analystByGroup", Label: localization.AssignToAnalystByGroup, Access: showAnalystByGroup, Configs: { propertyName: pageForm.CRSupportGroupField, enumId: pageForm.CRSupportGroupGuid } },
                        { Task: "assignToMe", Label: localization.AssignToMe, Access: isAnalystAndValidAPLicense, Configs: { target: "AssignedWorkItem", baseId: session.user.Id, displayName: session.user.Name } },
                        { Task: "addMeToWatchList", Label: bShowAddWatchList ? localization.AddMeToWatchList : localization.RemoveMeFromWatchList, Access: isValidAPLicense, Configs: { isAddWatchlist: bShowAddWatchList } },
                        { Task: "changeStatus", Label: localization.ChangeStatusTask, Access: showChangeStatus, Configs: { type: pageForm.type, statusEnumId: ChangeStatus } },
                        { Task: "newStatus", Label: localization.CancelRequest, Access: showCancelled, Configs: { confirmTitle: localization.CancelRequest, confirmMessage: localization.SureCancelRequest, newStatusName: localization.Cancelled, newStatusId: ChangeStatus_Cancelled } },
                        { Task: "sendEmail", Label: localization.SendEmail, Access: isAnalystAndValidAPLicense, Configs: {} },
                        { Task: "print", Label: localization.Print, Access: true, Configs: {} }
            ]
        };
    }


    //Incident Tasks

    var IncidentStatus = "89b34802-671e-e422-5e38-7dae9a413ef8";
    var IncidentStatus_Active = "5e2d3932-ca6d-1515-7310-6f58584df73e";
    var IncidentStatus_Closed = "bd0ae7c4-3315-2eb3-7933-82dfc482dbaf";
    var IncidentStatus_Resolved = "2b8830b6-59f0-f574-9c2a-f4b4682f1681";
    var IncidentStatus_Active_Pending = "b6679968-e84e-96fa-1fec-8cd4ab39c3de";
    var IncidentTierQueue = "c3264527-a501-029f-6872-31300080b3bf";
    var IncidentResolution = "72674491-02cb-1d90-a48f-1b269eb83602";

    if (pageForm.type === 'Incident') {
        var statusNotResolvedOrClosed = (pageForm.viewModel.Status.Id !== IncidentStatus_Resolved && pageForm.viewModel.Status.Id !== IncidentStatus_Closed);
        var showAcknowledge = isAnalyst && statusNotResolvedOrClosed && pageForm.viewModel.FirstResponseDate == null;
        var showLinkToparent = isAnalyst && statusNotResolvedOrClosed && !pageForm.viewModel.IsParent;
        var showRevertToParent = isAnalyst && statusNotResolvedOrClosed && pageForm.viewModel.IsParent;
        var showConvertToParent = isAnalyst && statusNotResolvedOrClosed && !pageForm.viewModel.IsParent && (_.isNull(pageForm.viewModel.ParentWorkItem) || _.isUndefined(pageForm.viewModel.ParentWorkItem));
        var statusResolved = (pageForm.viewModel.Status.Id == IncidentStatus_Resolved);
        var showChangeStatus = (isAnalyst && !pageForm.newWI);

        pageForm.taskTemplate = {
            tasks: [
                        { Task: "analystByGroup", Label: localization.AssignToAnalystByGroup, Access: isAnalystAndValidAPLicense, Configs: { propertyName: "TierQueue", enumId: IncidentTierQueue } },
                        { Task: "assignToMe", Label: localization.AssignToMe, Access: isAnalyst, Configs: { target: "AssignedWorkItem", baseId: session.user.Id, displayName: session.user.Name } },
                        { Task: "addMeToWatchList", Label: bShowAddWatchList ? localization.AddMeToWatchList : localization.RemoveMeFromWatchList, Access: isValidAPLicense, Configs: { isAddWatchlist: bShowAddWatchList } },
                        { Task: "acknowledge", Label: localization.Acknowledge, Access: showAcknowledge, Configs: {} },
                        { Task: "changeStatus", Label: localization.ChangeStatusTask, Access: showChangeStatus, Configs: { type: pageForm.type, statusEnumId: IncidentStatus, resolutionCategoryEnumId: IncidentResolution } },
                        { Task: "convertToParent", Label: localization.ConvertToParent, Access: showConvertToParent, Configs: { isParent: true, confirmTitle: localization.ConvertToParent, confirmMessage: localization.SureConvertToParent } },
                        { Task: "convertToParent", Label: localization.RevertToParent, Access: showRevertToParent, Configs: { isParent: false, confirmTitle: localization.RevertToParent, confirmMessage: localization.SureRevertToParent } },
                        { Task: "linkToParent", Label: localization.LinktoParentIncident, Access: showLinkToparent, Configs: {} },
                        { Task: "sendEmail", Label: localization.SendEmail, Access: isAnalyst, Configs: {} },
                        { Task: "newStatus", Label: localization.CloseIncident, Access: statusResolved, Configs: { confirmTitle: localization.CloseIncident, confirmMessage: localization.SureCloseIncident, newStatusName: localization.Closed, newStatusId: IncidentStatus_Closed } },
                        { Task: "newStatus", Label: localization.ReactivateIncident, Access: statusResolved, Configs: { confirmTitle: localization.ReactivateIncident, confirmMessage: localization.SureReactivateIncident, newStatusName: localization.Active, newStatusId: IncidentStatus_Active, otherBoundChanges: { "ResolutionDescription": null, "ResolutionCategory": null, "RelatesToTroubleTicket": null } } },
                        { Task: "copyToNewWI", Label: localization.CopyToNew, Access: isAnalystAndValidAPLicense, Configs: {} },
                        { Task: "print", Label: localization.Print, Access: true, Configs: {} }

            ]
        };
    }



    //Service Request Tasks

    var ServiceRequestStatus = "4e0ab24a-0b46-efe6-c7d2-5704d95824c7";
    var ServiceRequestStatus_New = "a52fbc7d-0ee3-c630-f820-37eae24d6e9b";
    var ServiceRequestStatus_Closed = "c7b65747-f99e-c108-1e17-3c1062138fc4";
    var ServiceRequestStatus_Completed = "b026fdfd-89bd-490b-e1fd-a599c78d440f";
    var ServiceRequestStatus_Failed = "21dbfcb4-05f3-fcc0-a58e-a9c48cde3b0e";
    var ServiceRequestStatus_Cancelled = "674e87e4-a58e-eab0-9a05-b48881de784c";
    var ServiceRequestStatus_OnHold = "05306bf5-a6b9-b5ad-326b-ba4e9724bf37";
    var ServiceRequestStatus_InProgress = "59393f48-d85f-fa6d-2ebe-dcff395d7ed1";
    var ServiceRequestStatus_Submitted = "72b55e17-1c7d-b34c-53ae-f61f8732e425";
    var ServiceRequestSupportGroup = "23c243f6-9365-d46f-dff2-03826e24d228";
    var ServiceRequestImplementationResults = "4ea37c27-9b24-615a-94da-510539371f4c";



    if (pageForm.type === 'ServiceRequest') {
        var statusCancelled = (pageForm.viewModel.Status.Id == ServiceRequestStatus_Cancelled);
        var statusCompleted = (pageForm.viewModel.Status.Id == ServiceRequestStatus_Completed);
        var statusFailed = (pageForm.viewModel.Status.Id == ServiceRequestStatus_Failed);
        var showCancelled = !pageForm.newWI && !statusCancelled && !statusCompleted && !statusFailed;
        var showChangeStatus = (isAnalystAndValidAPLicense && pageForm.viewModel.Status.Id != ServiceRequestStatus_New);
        var showCloseStatus = isValidAPLicense && !pageForm.newWI && (statusCancelled || statusCompleted || statusFailed);
        var showAcknowledge = isAnalystAndValidAPLicense && !statusCompleted && pageForm.viewModel.FirstResponseDate == null;

        pageForm.taskTemplate = {
            tasks: [
                        { Task: "analystByGroup", Label: localization.AssignToAnalystByGroup, Access: isAnalystAndValidAPLicense, Configs: { propertyName: "SupportGroup", enumId: ServiceRequestSupportGroup } },
                        { Task: "assignToMe", Label: localization.AssignToMe, Access: isAnalystAndValidAPLicense, Configs: { target: "AssignedWorkItem", baseId: session.user.Id, displayName: session.user.Name } },
                        { Task: "addMeToWatchList", Label: bShowAddWatchList ? localization.AddMeToWatchList : localization.RemoveMeFromWatchList, Access: isValidAPLicense, Configs: { isAddWatchlist: bShowAddWatchList } },
                        { Task: "acknowledge", Label: localization.Acknowledge, Access: showAcknowledge, Configs: {} },
                        { Task: "changeStatus", Label: localization.ChangeStatusTask, Access: showChangeStatus, Configs: { type: pageForm.type, statusEnumId: ServiceRequestStatus, resolutionCategoryEnumId: ServiceRequestImplementationResults } },
                        { Task: "newStatus", Label: localization.CancelRequest, Access: showCancelled, Configs: { confirmTitle: localization.CancelRequest, confirmMessage: localization.SureCancelRequest, newStatusName: localization.Cancelled, newStatusId: ServiceRequestStatus_Cancelled } },
                        { Task: "newStatus", Label: localization.CloseServiceRequest, Access: showCloseStatus, Configs: { confirmTitle: localization.CloseServiceRequest, confirmMessage: localization.SureCloseServiceRequest, newStatusName: localization.Closed, newStatusId: ServiceRequestStatus_Closed } },
                        { Task: "sendEmail", Label: localization.SendEmail, Access: isAnalystAndValidAPLicense, Configs: {} },
                        { Task: "copyToNewWI", Label: localization.CopyToNew, Access: isAnalystAndValidAPLicense, Configs: {} },
                        { Task: "print", Label: localization.Print, Access: true, Configs: {} }
            ]
        };
    }



    //Problem Tasks

    var ProblemStatus = "56c99a7d-6ac7-ab3c-e6c0-bbf5fe76a65c";
    var ProblemStatus_Active = "720438eb-ba08-1263-0944-6791fcb48991";
    var ProblemStatus_Closed = "25eac210-e091-8ae8-a713-fea2472f32ff";
    var ProblemStatus_Resolved = "7ff92b06-1694-41e5-2df7-b4d5970d2d2b";
    //var ProblemStatus_Active_Pending = "b6679968-e84e-96fa-1fec-8cd4ab39c3de";
    //var ProblemTierQueue = "c3264527-a501-029f-6872-31300080b3bf";
    var ProblemResolution = "52a0bfb0-b7e6-d16e-d06e-97ce62b4a335";

    if (pageForm.type === 'Problem') {
        var statusNotResolvedOrClosed = (pageForm.viewModel.Status.Id !== ProblemStatus_Resolved && pageForm.viewModel.Status.Id !== ProblemStatus_Closed);
        var statusResolved = (pageForm.viewModel.Status.Id == ProblemStatus_Resolved);
        var showChangeStatus = (isAnalystAndValidAPLicense && !pageForm.newWI);
        var showAnalystByGroup = (isAnalystAndValidAPLicense && pageForm.PRSupportGroupField!="");

        pageForm.taskTemplate = {
            tasks: [
                        { Task: "analystByGroup", Label: localization.AssignToAnalystByGroup, Access: showAnalystByGroup, Configs: { propertyName: pageForm.PRSupportGroupField, enumId: pageForm.PRSupportGroupGuid } },
                        { Task: "assignToMe", Label: localization.AssignToMe, Access: isAnalystAndValidAPLicense, Configs: { target: "AssignedWorkItem", baseId: session.user.Id, displayName: session.user.Name } },
                        { Task: "addMeToWatchList", Label: bShowAddWatchList ? localization.AddMeToWatchList : localization.RemoveMeFromWatchList, Access: isValidAPLicense, Configs: { isAddWatchlist: bShowAddWatchList } },
                        { Task: "changeStatus", Label: localization.ChangeStatusTask, Access: showChangeStatus, Configs: { type: pageForm.type, statusEnumId: ProblemStatus, resolutionCategoryEnumId: ProblemResolution } },
                        { Task: "sendEmail", Label: localization.SendEmail, Access: isAnalystAndValidAPLicense, Configs: {} },
                        { Task: "newStatus", Label: localization.CloseProblem, Access: statusResolved, Configs: { confirmTitle: localization.CloseProblem, confirmMessage: localization.SureCloseProblem, newStatusName: localization.Closed, newStatusId: ProblemStatus_Closed } },
                        { Task: "newStatus", Label: localization.ReactivateProblem, Access: statusResolved, Configs: { confirmTitle: localization.ReactivateProblem, confirmMessage: localization.SureReactivateProblem, newStatusName: localization.Active, newStatusId: ProblemStatus_Active, otherBoundChanges: { "ResolutionDescription": null, "ResolutionCategory": null } } },
                        { Task: "print", Label: localization.Print, Access: true, Configs: {} }


            ]
        };
    }



    //Release Record Tasks

    var ReleaseRecordStatus = "8909ce55-a87f-2d7e-eb64-aba670596696";
    var ReleaseRecordStatus_New = "9b3c924a-3f95-b9d8-6711-42aa8271dd30";
    var ReleaseRecordStatus_Closed = "221155fc-ad9f-1e40-c50e-9028ee303137";
    var ReleaseRecordStatus_Completed = "c46ca677-e6c5-afe0-b51e-6aaad1f50e58";
    var ReleaseRecordStatus_Failed = "f0073e33-fdda-a1ba-cd93-40b7c88afff4";
    var ReleaseRecordStatus_Cancelled = "a000ff0a-2897-4184-73cb-308f533c0dca";
    var ReleaseRecordStatus_Editing = "f71c86cf-afbd-debf-4464-52fe122b888b";
    var ReleaseRecordStatus_OnHold = "bab68d61-1e58-96ff-9f64-33a530fdaf98";
    var ReleaseRecordStatus_InProgress = "1840bfdc-3589-88a5-cea9-67536fd95a3b";
    //var ReleaseRecordSupportGroup = "23c243f6-9365-d46f-dff2-03826e24d228";
    var ReleaseRecordImplementationResults = "3f02cab3-0d33-804a-1b3e-7266e2728d69";



    if (pageForm.type === 'ReleaseRecord') {
        var statusCancelled = (pageForm.viewModel.Status.Id == ReleaseRecordStatus_Cancelled);
        var statusCompleted = (pageForm.viewModel.Status.Id == ReleaseRecordStatus_Completed);
        var statusFailed =  (pageForm.viewModel.Status.Id == ReleaseRecordStatus_Failed);
        var showCancelled = !pageForm.newWI && !statusCancelled && !statusCompleted && !statusFailed;
        var showChangeStatus = (isAnalystAndValidAPLicense && !pageForm.newWI);
        var showCloseStatus = isValidAPLicense && !pageForm.newWI && (statusCancelled || statusCompleted || statusFailed);
        var showAcknowledge = isAnalystAndValidAPLicense && !statusCompleted && pageForm.viewModel.FirstResponseDate == null;
        var statusNotResolvedOrClosed = isValidAPLicense && (pageForm.viewModel.Status.Id !== ReleaseRecordStatus_Completed && pageForm.viewModel.Status.Id !== ReleaseRecordStatus_Failed && pageForm.viewModel.Status.Id !== ReleaseRecordStatus_Closed);
        var showLinkToparent = isAnalystAndValidAPLicense && statusNotResolvedOrClosed && !pageForm.viewModel.IsParent;
        var showRevertToParent = isAnalystAndValidAPLicense && statusNotResolvedOrClosed && pageForm.viewModel.IsParent;
        var showConvertToParent = isAnalystAndValidAPLicense && statusNotResolvedOrClosed && !pageForm.viewModel.IsParent && (_.isNull(pageForm.viewModel.ParentWorkItem) || _.isUndefined(pageForm.viewModel.ParentWorkItem));
        var showRun = isValidAPLicense && (pageForm.viewModel.Status.Id == ReleaseRecordStatus_Editing || pageForm.viewModel.Status.Id == ReleaseRecordStatus_OnHold);

        pageForm.taskTemplate = {
            tasks: [
                       //{ Task: "analystByGroup", Label: localization.AssignToAnalystByGroup, Access: session.user.Analyst, Configs: { propertyName: "SupportGroup", enumId: ReleaseRecordSupportGroup } },
                        { Task: "assignToMe", Label: localization.AssignToMe, Access: isAnalystAndValidAPLicense, Configs: { target: "AssignedWorkItem", baseId: session.user.Id, displayName: session.user.Name } },
                        { Task: "addMeToWatchList", Label: bShowAddWatchList ? localization.AddMeToWatchList : localization.RemoveMeFromWatchList, Access: isValidAPLicense, Configs: { isAddWatchlist: bShowAddWatchList } },
                        { Task: "changeStatus", Label: localization.ChangeStatusTask, Access: showChangeStatus, Configs: { type: pageForm.type, statusEnumId: ReleaseRecordStatus, resolutionCategoryEnumId: ReleaseRecordImplementationResults } },
                        { Task: "convertToParent", Label: localization.ConvertToParent, Access: showConvertToParent, Configs: { isParent: true, confirmTitle: localization.ConvertToParent, confirmMessage: localization.SureConvertToParentRecord } },
                        { Task: "convertToParent", Label: localization.RevertToParent, Access: showRevertToParent, Configs: { isParent: false, confirmTitle: localization.RevertToParent, confirmMessage: localization.SureRevertToParentRecord } },
                        { Task: "linkToParent", Label: localization.LinktoParentRecord, Access: showLinkToparent, Configs: {} },
                        { Task: "newStatus", Label: localization.Run, Access: showRun, Configs: { newStatusName: localization.Run, newStatusId: ReleaseRecordStatus_InProgress, commentMessage: localization.RunComentMessage } },
                        { Task: "newStatus", Label: localization.CancelRequest, Access: showCancelled, Configs: { confirmTitle: localization.CancelRequest, confirmMessage: localization.SureCancelRequest, newStatusName: localization.Cancelled, newStatusId: ReleaseRecordStatus_Cancelled } },
                        { Task: "newStatus", Label: localization.CloseReleaseRecord, Access: showCloseStatus, Configs: { confirmTitle: localization.CloseReleaseRecord, confirmMessage: localization.SureCloseReleaseRecord, newStatusName: localization.Closed, newStatusId: ReleaseRecordStatus_Closed } },
                        { Task: "sendEmail", Label: localization.SendEmail, Access: isAnalystAndValidAPLicense, Configs: {} },
                        { Task: "print", Label: localization.Print, Access: true, Configs: {} }
            ]
        };

    }


    //add custom tasks
    var tasks = app.custom.formTasks.get(pageForm.type);
    if (_.isArray(tasks)) {
        $.each(tasks, function (i, task) {
            pageForm.taskTemplate.tasks.push({ Task: "custom", Type: pageForm.type, Label: task.label, Access: true, Configs: { func: task.func } })
        });
    }


    var init = function () {
        var isClosed = false;
        // select template
        setTemplateJSONFromSessionAdJSON();

        //check if form is disabled
        if (!pageForm.newWI) {
            //if status is closed then disable the form
            if (pageForm.viewModel.Status.Id === ServiceRequestStatus_Closed || // "c7b65747-f99e-c108-1e17-3c1062138fc4" ||  // SR Closed
                pageForm.viewModel.Status.Id === ChangeStatus_Closed ||// "f228d50b-2b5a-010f-b1a4-5c7d95703a9b" || // CR Closed
                pageForm.viewModel.Status.Id === IncidentStatus_Closed || // "bd0ae7c4-3315-2eb3-7933-82dfc482dbaf") { // Incident Closed
                pageForm.viewModel.Status.Id === ProblemStatus_Closed ||
                pageForm.viewModel.Status.Id === ReleaseRecordStatus_Closed) {
                isClosed = true;
                pageForm.viewModel.isDisabled = true;
            }

            //disable workitems on free version
            if (!session.consoleSetting.AnalystPortalLicense.IsValid) {
                pageForm.viewModel.isDisabled = true;

                //allow analyst access to incidents on free version
                if ((session.user.IsAdmin || session.user.Analyst) && pageForm.viewModel.ClassName == "System.WorkItem.Incident") {
                    pageForm.viewModel.isDisabled = false;
                }
            }
        }

        var alertContainer = $('#alertMessagesContainer');
        alertContainer.addClass("sticky-header");
        formContainer.addClass("sticky-header");
        taskContainer.addClass("sticky-header");
        headerContainer.addClass("sticky-header");

        if (!app.isMobile()) {

            //add dynamic containers to main container
            //mainContainer.append(headerContainer, formContainer);
            mainContainer.append(formContainer);

            //add task container before main
            mainContainer.before(taskContainer);

        } else {
            mainContainer.append(formContainer);
            mainContainer.after(taskContainer);
        }

        if (!isClosed) {
            //build out tasks
            taskContainer.append("<h2>" + localization.Tasks + "</h2>");
            taskBuilder.build(pageForm, function (view) {
                taskContainer.append(view);
            });

        }

        //build and add header container
        headerBuilder.build(pageForm, function (view) {
            headerContainer.append(view);
        });

        //build and add form from json definition
        formBuilder.build(pageForm, function (html) {
            formContainer.append(html);
            app.controls.apply(formContainer, { localize: true, vm: dataVM, bind: true });
            formContainer.show();

            // make sure we have the drawer before we try to add buttons buttons
            //if (!_.isUndefined(drawermenu)) { //stupid underscore need to move to lo-dash
            if (typeof (drawermenu) != 'undefined') {
                createButtons();
            } else {
                app.events.subscribe("drawerCreated", function () {
                    createButtons();
                });
            }


            setPriorityByMatrix();
            setScheduleDuration();
            app.lib.handleMessages();

            //bind change event no that form is built
            dataVM.bind("change", function (e) {
                onVmChange(e);
            });

            // call bound on ready functions
            _.each(readyArray, function (func, index) {
                if (_.isFunction(func)) {
                    func();
                }
            });

            // prevent 'enter' key from submitting form on older browsers.
            formContainer.on('keypress', function (e) {
                app.lib.stopEnterKeySubmitting(e);
            });

            if (!app.isMobileDevice()) {
                var $taskPanel = $('.task-panel').first();
                $taskPanel.affix({ offset: { top: $taskPanel[0].getBoundingClientRect().top - 84 } });
                kendo.data.binders.yScrollOnResize($taskPanel[0], { yScrollOnResize: { path: { top: 'auto', bottom: 50 } } }, {});
            }
            //manage dirty
            formHelper.manageDirty(dataVM);
        });

        //remove the mask
        app.lib.mask.remove();
    }

    // Template Decider
    // Chooses template from JSON by session and work item type
    var setTemplateJSONFromSessionAdJSON = function () {
        var type = formType;
        var defaultName = "Default";
        var json = pageForm.formTemplate;
        var msg = "A '" + defaultName + "' template is required.";
        var customMsg = " \r\r When creating a JSON template for '" + type + "' you must add a template with the key of '" + defaultName + "'. This is used for fallback if a specific template is not found. No Default key is found on the custom template, default template will be used.";
        var defaultMsg = " \r\r When creating a JSON template for '" + type + "' you must add a template with the key of '" + defaultName + "'. This is used for fallback if a specific template is not found.";
        if (json.customTemplate != null && json.customTemplate != '')
        {
            //This will check if the custom form have the Default key.
            json = pageForm.formTemplate.customTemplate;
            if (!json.Default) { //If Default is not found, it will going to alert for a message stating it will use the Default form/Template.
                if (type) {
                    msg += customMsg;
                }

                //From here, it will going to get the Default template/Form.
                json = pageForm.formTemplate.defaultTemplate;
                if (!json.Default) {
                    if (type) {
                        msg += defaultMsg;
                    }
                }

                if (session.user.IsAdmin) {
                    alert(msg);
                }
                else {
                    console.log(msg);
                }
            }
        }
        else {

            //If the custom template/form is not found, it will used the default form/template.
            json = pageForm.formTemplate;
            if (!json.Default) {
                if (type) {
                    msg += defaultMsg;
                }

                if (session.user.IsAdmin) {
                    alert(msg);
                }
                else {
                    console.log(msg);
                }
            }
        }


        // using a matcher in case something changes on either side
        // this will be easier and faster fix
        // { "formType from work item cshtml": "prop name from session.user that holds template" }
        var typeToSession = {
            "Incident": "IncidentForm",
            "ChangeRequest": "ChangeRequestForm",
            "ServiceRequest": "ServiceRequestForm",
            "Problem": "ProblemForm",
            "ReleaseRecord": "ReleaseRecordForm"
        }
        var getTemplateNameFromSession = function () {
            if (type && typeToSession[type] && session && session.user &&
                session.user[typeToSession[type]] && json[session.user[typeToSession[type]]]) {
                return session.user[typeToSession[type]];
            }
            return defaultName;
        }
        var templateName = getTemplateNameFromSession();
        pageForm.formTemplate = json[templateName];


    }

    // Form Buttons
    var createButtons = function () {
        // Save Failure
        //TODO: this could possibly end up being a switch statement to check what the error source is
        var saveFailure = function (exceptionMessage) {
            //console.log('save failure');
            if (exceptionMessage == localization.RequiredFieldsErrorMessage) {
                app.lib.message.add(exceptionMessage, "danger");
            } else {
                //fallback to generic message
                app.lib.message.add(localization.PleaseCorrectErrors, "danger");
            }
            app.lib.message.show();
            //take use to the error message
            window.scrollTo(0, 0);
        }

        // Save Button
        drawermenu.addButton(localization.Save, "fa fa-check cs-form__drawer--save", function () {

            save(function (data) {
                //console.log('save form type check');
                //this message needs to be tailored to the different types of WIs
                var message = "";
                var link = "";
                switch (pageForm.type) {
                    case "ChangeRequest":
                        message = localization.ChangeRequestSavedMessage;
                        link = "/ChangeRequest/Edit/" + dataVM.Id;
                        break;
                    case "ServiceRequest":
                        message = localization.ServiceRequestSavedMessage;
                        link = "/ServiceRequest/Edit/" + dataVM.Id;
                        break;
                    case "Incident":
                        message = localization.IncidentSavedMessage;
                        link = "/Incident/Edit/" + dataVM.Id;
                        break;
                    case "Problem":
                        message = localization.ProblemSavedMessage;
                        link = "/Problem/Edit/" + dataVM.Id;
                        break;
                    case "ReleaseRecord":
                        message = localization.ReleaseRecordSavedMessage;
                        link = "/ReleaseRecord/Edit/" + dataVM.Id;
                        break;
                    default:
                        message = localization.WorkItemSavedMessage;
                        break;

                }

                if (!session.consoleSetting.AnalystPortalLicense.IsValid) {
                    var queryStringParams = app.lib.getQueryParams();
                    if (!_.isUndefined(queryStringParams.activityid) && !_.isNull(queryStringParams.activityid)) {
                        link = link + "?activityId=" + queryStringParams.activityid + "&tab=activity";
                        message = localization.WorkItemSavedMessage;
                        app.lib.message.add(message + "&nbsp;&nbsp;<a href='" + link + "'><strong>" + queryStringParams.activityid + "</strong></a> ", "success");
                    } else {
                        app.lib.message.add(message + "&nbsp;&nbsp;<a href='" + link + "'><strong>" + dataVM.Id + "</strong></a> ", "success");
                    }
                } else {
                    app.lib.message.add(message + "&nbsp;&nbsp;<a href='" + link + "'><strong>" + dataVM.Id + "</strong></a> ", "success");
                }

                if (!_.isUndefined(pageForm.view.isCopyNew) && pageForm.view.isCopyNew) {
                    //now lets just close ourself
                    app.lib.gotoFormReturnUrl();
                } else { 
                //forward the user along
                    app.lib.gotoFormReturnUrl();
                }

                return;

            }, saveFailure);
        });
        // Apply Button
        drawermenu.addButton(localization.Apply, "fa fa-pencil cs-form__drawer--apply", function () {

            save(function (data) {
                app.lib.message.add(localization.ChangesApplied, "success");
                //forcing the page to reload allows use to make sure change in status and form disable is handled
                //we should only do this if status was changed to a value that requires the form tb be disabled
                var link = "";
                switch (pageForm.type) {
                    case "ChangeRequest":
                        link = "/ChangeRequest/Edit/" + pageForm.viewModel.Id;
                        break;
                    case "ServiceRequest":
                        link = "/ServiceRequest/Edit/" + pageForm.viewModel.Id;
                        break;
                    case "Incident":
                        link = "/Incident/Edit/" + pageForm.viewModel.Id;
                        break;
                    case "Problem":
                        link = "/Problem/Edit/" + pageForm.viewModel.Id;
                        break;
                    case "ReleaseRecord":
                        link = "/ReleaseRecord/Edit/" + pageForm.viewModel.Id;
                        break;
                    default:
                        location.href = "/WorkItems/MyItems/";
                        break;
                }

                if (!session.consoleSetting.AnalystPortalLicense.IsValid) {
                    var queryStringParams = app.lib.getQueryParams();
                    if (!_.isUndefined(queryStringParams.activityid) && !_.isNull(queryStringParams.activityid)) {
                        link = link + "?activityId=" + queryStringParams.activityid + "&tab=activity";
                    };
                }

                if (app.lib.isNewForm()) {
                    location.href = link;
                }
                else {
                    location.reload();
                }
                
            }, saveFailure);
        });
        // Cancel Button
        drawermenu.addButton(localization.Cancel, "fa fa-times cs-form__drawer--cancel", function () {
            if (dataVM.get("isDirty")) {
                $.when(kendo.ui.ExtOkCancelDialog.show({
                    title: localization.Warning,
                    message: localization.UnsavedDataMessage,
                    icon: "fa fa-exclamation"
                })
                ).done(function (response) {
                    if (response.button === "ok") {
                        //make the form clean so we don't trigger onbeforeunload
                        dataVM.set("isDirty", false);

                        app.lib.gotoFormReturnUrl();
                        return;
                    }
                });
            } else {
                app.lib.gotoFormReturnUrl();
                return;
            }
        });


        // mobile task Button
        formHelper.mobileDrawerTaskButton(taskContainer);


    }

    var sendMentionsMail = function (emailData) {
        $.ajax({
            url: "/EmailNotification/SendMentionsNotification",
            type: "POST",
            data: emailData,
            success: function () {
                kendo.ui.progress($(".k-window"), false);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown);
            }
        });
    }

    var processTemplate = function (actionLog, workItem, givenTemplate) {
        //replace tokens in action log notification template
        var template = $('<div/>').html(givenTemplate).text();

        var tokens = template.match(/{{([^}]+)}}/g);
        _.each(tokens, function (key) {
            var token = key.replace('{{', '').replace('}}', '').replace(/\s/g, '');
            var type = token.substring(token.lastIndexOf(':') + 1, token.length)
            token = token.substring(0, token.lastIndexOf(':'));
            var value = "";
            if (type === "ActionLog")
                value = actionLog[token];

            if (type === "WorkItem") {
                if (token === "URL") {
                    value = app.lib.getLinkUrl(workItem.ClassName.split(".").pop(), workItem.Id);
                } else
                    value = workItem[token];
            }
            if (app.lib.isDateValue(value))
                value = kendo.toString(kendo.parseDate(new Date(value)), "g");

            template = template.replace(key, value);
        });

        if (!session.sendNotificationAsHTML)
            template = app.lib.htmlEntities(template);

        return template;
    }

    // Ajax Save Method (to be moved)
    var save = function (success, failure) {
        //ensure all values inputted have been bound to VM
        //not sure this is even needed and it causes many problems
        //need to delete after regression -JK
        //$(".page_content *").blur();


        app.lib.mask.apply();
        var valid = true;
        var required = true;
        //todo separate function for CR and RR
        //if separate function page is slows

        if (pageForm.type === 'ReleaseRecord') {
            if (!_.isNull(dataVM.ScheduledStartDate) || !_.isNull(dataVM.ScheduledEndDate)) {
                if (!app.lib.CheckedManualActivityStartAndEndDate(dataVM.ScheduledStartDate, dataVM.ScheduledEndDate, localization.ScheduledStartDateExceedScheduledEndDate)) {
                    app.lib.mask.remove();
                    return;
                }
            }
            if (!_.isNull(dataVM.ActualStartDate) || !_.isNull(dataVM.ActualEndDate)) {
                if (!app.lib.CheckedManualActivityStartAndEndDate(dataVM.ActualStartDate, dataVM.ActualEndDate, localization.ActualStartDateExceedActualEndDate)) {
                    app.lib.mask.remove();
                    return;
                }
            }
            if (!_.isNull(dataVM.ScheduledDowntimeStartDate) || !_.isNull(dataVM.ScheduledDowntimeEndDate)) {
                if (!app.lib.CheckedManualActivityStartAndEndDate(dataVM.ScheduledDowntimeStartDate, dataVM.ScheduledDowntimeEndDate, localization.ScheduledDowntimeStartDateExceedScheduledDowntimeEndDate)) {
                    app.lib.mask.remove();
                    return;
                }
            }
            if (!_.isNull(dataVM.ActualDowntimeStartDate) || !_.isNull(dataVM.ActualDowntimeEndDate)) {
                if (!app.lib.CheckedManualActivityStartAndEndDate(dataVM.ActualDowntimeStartDate, dataVM.ActualDowntimeEndDate, localization.ActualDowntimeStartDateExceedActualDowntimeEndDate)) {
                    app.lib.mask.remove();
                    return;
                }
            }
        }
        if (pageForm.type === 'ChangeRequest') {
            if (!_.isNull(dataVM.ScheduledStartDate) || !_.isNull(dataVM.ScheduledEndDate)) {
                if (!app.lib.CheckedManualActivityStartAndEndDate(dataVM.ScheduledStartDate, dataVM.ScheduledEndDate, localization.ScheduledStartDateExceedScheduledEndDate)) {
                    app.lib.mask.remove();
                    return;
                }
            }

        }

        var checkActivityDates = function (dataVM) {
            if (dataVM.Activity && dataVM.Activity.length > 0) {
                _.each(dataVM.Activity, function (activity) {
                    if (activity.ClassName == "System.WorkItem.Activity.ManualActivity") {
                        //check actual end dates
                        if (!_.isNull(activity.ActualStartDate) || !_.isNull(activity.ActualEndDate)) {
                            if (!app.lib.CheckedManualActivityStartAndEndDate(activity.ActualStartDate, activity.ActualEndDate, localization.MaActualStartDateExceedActualEndDate)) {
                                app.lib.mask.remove();
                                valid = false;
                                return;
                            }
                        }
                        //check scheduled end dates 
                        if (!_.isNull(activity.ScheduledStartDate) || !_.isNull(activity.ScheduledEndDate)) {
                            if (!app.lib.CheckedManualActivityStartAndEndDate(activity.ScheduledStartDate, activity.ScheduledEndDate, localization.MaScheduledStartDateExceedScheduledEndDate)) {
                                app.lib.mask.remove();
                                valid = false;
                                return;
                            }
                        }
                    }
                    if (activity.ClassName == "System.WorkItem.Activity.ParallelActivity" || activity.ClassName == "System.WorkItem.Activity.SequentialActivity") {
                        if (valid) {
                            checkActivityDates(activity);
                        }
                    }
                });
            }
            return;
        }

        //check for MA dates
        if (dataVM.Activity && dataVM.Activity.length > 0) {
            checkActivityDates(dataVM);
        }

        //checks all required fields
        formContainer.find(".form-group").removeClass("has-error");
        formContainer.find("[required]").each(function () {
            var jqEle = $(this);

            //This code is to check if enum is required or not for IE9.
            var property = !_.isUndefined(jqEle.attr("data-control-bind")) ? jqEle.attr("data-control-bind") : jqEle[0].name;
            if (_.isUndefined(property) || property != "") {
                if (!_.isUndefined(jqEle[0].kendoBindingTarget) && !_.isUndefined(jqEle[0].kendoBindingTarget.options)) {
                    property = jqEle[0].kendoBindingTarget.options.propertyName;
                }
            }
            if (!_.isUndefined(property)) {
                var isEnum = _.isObject(pageForm.viewModel[property]) && !_.isUndefined(pageForm.viewModel[property].Id);
                if ((_.isNull(pageForm.viewModel[property]) || (pageForm.viewModel[property] === "")) ||
                    (_.isObject(pageForm.viewModel[property]) && isEnum && (_.isNull(pageForm.viewModel[property].Id) || pageForm.viewModel[property].Id === "")) ||
                    (((_.isObject(pageForm.viewModel[property]) && !isEnum && (_.isUndefined(pageForm.viewModel[property].BaseId) || _.isNull(pageForm.viewModel[property].BaseId)))))) {
                    valid = false;
                    jqEle.parents(".form-group").addClass("has-error");
                }
            }
            //END This code is to check if enum is required or not for IE9.

            var nodeName = jqEle[0].nodeName.toLowerCase();
            if (nodeName != "input" && nodeName != "textarea") {
                jqEle = jqEle.find("input");
            }
            if (jqEle.val() == "") {
                valid = false;
                jqEle.parents(".form-group").addClass("has-error");
            }

        });

        //check for valid enums
        formContainer.find(".input-error").each(function () {
            valid = false;
        });

        formContainer.find("[data-invalid]").each(function () {
            valid = false;
            var jqEle = $(this);
            jqEle.parents(".form-group").addClass("has-error");

            jqEle.css({
                "background-color": "#FBE3E4"
            });

        });
        if (!required) {
            failure(localization.RequiredFieldsErrorMessage);
            app.lib.mask.remove();
            return;
        }
        //end check of req fields


        if (!valid) {
            failure(localization.PleaseCorrectErrors);
            app.lib.mask.remove();
            return;
        }
        //end check for valid enums


        //check for un added action log commnets
        if (dataVM.get('commentDirty')) {
            app.lib.message.add("<strong>" + localization.UnAddedActionLogComment + "</strong>", "warning");

            //only going to warn you once
            dataVM.set('commentDirty', false);

            app.lib.message.show();
            //take use to the error message
            window.scrollTo(0, 0);

            app.lib.mask.remove();
            return;
        }
        //end check for un added action log commnets

        var current = dataVM.toJSON();


        var mailBox = [];

        //check if there are mentioned users, send mail to users
        if (current.AppliesToTroubleTicket) {
            if (current.AppliesToTroubleTicket.length > 0) {
                var logs = current.AppliesToTroubleTicket || [];
                for (var i in logs) {
                    if (logs[i].MentionedUsers) {
                        if (logs[i].MentionedUsers.length > 0 && !session.disableActionLogNotification) {
                            var emailData = {
                                To: logs[i].MentionedUsers.join(";"),
                                Cc: '',
                                Subject: (session.actionLogNotificationTitle) ? processTemplate(logs[i], current, session.actionLogNotificationTitle) : (current.Id.length != 0) ? '[' + current.Id + '] ' + current.Title : current.Title,
                                Message: (session.actionLogNotificationTemplate) ? encodeURIComponent(processTemplate(logs[i], current, session.actionLogNotificationTemplate)) : logs[i].DescriptionHTML,
                                AttachedFileName: '',
                                WorkItemId: current.BaseId
                            };
                            mailBox.push(emailData);
                        }
                        delete current.AppliesToTroubleTicket[i].MentionedUsers;
                    }
                    delete current.AppliesToTroubleTicket[i].DescriptionHTML;
                }
            }
        } else if (current.AppliesToWorkItem) {
            if (current.AppliesToWorkItem.length > 0) {
                var logs = current.AppliesToWorkItem || [];
                for (var i in logs) {
                    if (logs[i].MentionedUsers) {
                        if (logs[i].MentionedUsers.length > 0 && !session.disableActionLogNotification) {
                            var emailData = {
                                To: logs[i].MentionedUsers.join(";"),
                                Cc: '',
                                Subject: (session.actionLogNotificationTitle) ? processTemplate(logs[i], current, session.actionLogNotificationTitle): (current.Id.length != 0) ? '[' +current.Id + '] ' + current.Title: current.Title,
                                Message: (session.actionLogNotificationTemplate) ? encodeURIComponent(processTemplate(logs[i], current, session.actionLogNotificationTemplate)) : logs[i].DescriptionHTML,
                                WorkItemId: current.BaseId
                            };
                            mailBox.push(emailData);
                        }
                        delete current.AppliesToWorkItem[i].MentionedUsers;
                    }
                    delete current.AppliesToWorkItem[i].DescriptionHTML;
                }
            }
        }


        //This will optimized the passing of mulitple object to only send the deleted or/and added items
        if (pageForm.newWI == false) {
            app.lib.optimizeFormMultiObject.BeforeSave(current, pageForm.jsonRaw);
        }
        
        
        var postData = encodeURIComponent(JSON.stringify({
            isDirty: true,
            current: current,
            original: pageForm.jsonRaw
        }));

        $.ajax({
            type: 'POST',
            dataType: 'text',
            url: saveUrl,
            data: "formJson=" + postData,
            success: function (data, status, xhr) {

                //make the form clean so we don't trigger onbeforeunload
                dataVM.set("isDirty", false);

                _.each(mailBox,
                    function(item) {
                        sendMentionsMail(item);
                    });

                if (data.search('loginForm') < 0) { // Logged out check                   
                    success(data);
                } else {
                    //session expired
                    window.location = "/Login/Login?ReturnUrl=" + window.location.pathname;
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                //do we have a data conflict
                if (xhr.status == 409) {

                    $.when(kendo.ui.ExtYesNoDialog.show({
                        title: localization.DataConflict,
                        message: localization.DataConflictError + "<br/><br/><small>(" + localization.DataConflictDescription + ")</small>",
                        icon: "fa fa-exchange text-danger",
                        width: "500px",
                        height: "300px"
                    })
                    ).done(function (response) {
                        if (response.button === "yes") {
                            //open in new tab, may not work this way in all browsers
                            window.open(window.location.pathname);
                        } else {
                            //refresh page
                            location.href = window.location.pathname;
                        }
                    });

                } else if (xhr.status == 503) { //SDK unavailable
                    var jsonRsp = xhr.responseText;
                    app.lib.log(jsonRsp);
                    var msgResponse = JSON.parse(jsonRsp);
                    //determine error Message
                    var errorMsg = localization.RequestFailed;
                    if (msgResponse.exception && msgResponse.exception.length > 0) {
                        errorMsg = msgResponse.exception;
                    }
                    //alert the user
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Failed,
                        message: errorMsg,
                        icon: "fa fa-times-circle text-danger"
                    });
                } else if (xhr.status == 403) { //user does not have access
                    var jsonRsp = xhr.responseText;
                    var errorMsg = "";
                    try {
                        app.lib.log(jsonRsp);
                        var msgResponse = JSON.parse(jsonRsp);
                        //determine error Message
                        errorMsg = localization.RequestFailed;
                        if (msgResponse.exception && msgResponse.exception.length > 0) {
                            errorMsg = msgResponse.exception;
                        }
                    }
                    catch (ex) {
                        errorMsg = localization.RequestFailed;
                    }

                    //alert the user
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Failed,
                        message: errorMsg,
                        icon: "fa fa-times-circle text-danger"
                    });


                } else {

                    failure();
                    console && app.lib.log(localization.RequestFailed);
                    app.lib.log(thrownError);

                    var jsonRsp = xhr.responseText;
                    app.lib.log(jsonRsp);

                    var msgResponse = JSON.parse(jsonRsp);
                    //determine error Message
                    var errorMsg = localization.RequestFailed;
                    if (msgResponse.exception && msgResponse.exception.length > 0) {
                        errorMsg = msgResponse.exception;
                    }

                    kendo.ui.ExtAlertDialog.show({
                        title: localization.ErrorDescription,
                        message: errorMsg,
                        icon: "fa fa-exclamation"
                    });
                }
            },
            processData: false,
            async: true
        });
    }
    //make pageForm Happy
    pageForm.save = save;

    // Priority Matrix logic for Incident
    var setPriorityByMatrix = function () {
        if (!priorityJSON) {
            return;
        }

        var priority = !_.isNull(pageForm.viewModel.Priority) ? pageForm.viewModel.Priority : 0;
        var priorityJSONU = priorityJSON.Matrix.U;
        for (var i in priorityJSONU) {
            var obj = priorityJSONU[i];
            if (obj.Id == pageForm.viewModel.Urgency.Id) {
                for (var x in obj.I) {
                    var obj2 = obj.I[x];
                    if (obj2.Id == pageForm.viewModel.Impact.Id) {
                        priority = obj2.P;
                        break;
                    } else {
                        priority = 9;
                    }
                }
            }
        }


        if (priority != pageForm.viewModel.Priority) {
            pageForm.viewModel.set("Priority", priority);
        }
    }

    //Set First Assigned Date(Incident/Service Request)
    var setFirstAssignedDateValue = function () {
        if ((session.user.Analyst == 1) && (pageForm.type === "Incident" || pageForm.type === "ServiceRequest")) {
            if (_.isUndefined(pageForm.viewModel.AssignedWorkItem))
                return;

            var bHasCurrentAssignee = (pageForm.viewModel.AssignedWorkItem.BaseId != null) ? true : false;
            var assignedDateEle = $("input[name='FirstAssignedDate']");

            if (pageForm.viewModel.FirstAssignedDate == null && bHasNoInitalAssignee && bHasCurrentAssignee) {
                var date = new Date();
                pageForm.viewModel.FirstAssignedDate = date.toISOString();

                if (assignedDateEle.attr('data-control') == 'datePicker') {
                    assignedDateEle.val(kendo.toString(new Date(), "d"));
                } else if (assignedDateEle.attr('data-control') == 'dateTimePicker') {
                    assignedDateEle.val(kendo.toString(new Date(), "g"));
                }

            } else if (bHasNoInitalAssignee && !bHasCurrentAssignee) {

                //clear out first assigned date if first assignee is removed(prior to saving)
                pageForm.viewModel.FirstAssignedDate = null;

                if (assignedDateEle.attr('data-control') == 'datePicker') {
                    assignedDateEle.val("");
                } else if (assignedDateEle.attr('data-control') == 'dateTimePicker') {
                    assignedDateEle.val("");
                }
            }





        }
    }

    //add record assigned log everytime assignee is changed
    var lastAddedAssignee = null;
    var addRecordAssignedLog = function () {

        if ((session.user.Analyst == 1) && (pageForm.type === "Incident" || pageForm.type === "ServiceRequest" || pageForm.type === "Problem")) {
            if (_.isUndefined(pageForm.viewModel.AssignedWorkItem))
                return;

            //skip on edit form page load
            if (!pageForm.newWI && _.isNull(lastAddedAssignee)) {
                var original = pageForm.jsonRaw;
                lastAddedAssignee = (_.isUndefined(original.AssignedWorkItem)) ? "" : original.AssignedWorkItem.DisplayName;
            }

            if ((!_.isNull(pageForm.viewModel.AssignedWorkItem.DisplayName) && !_.isUndefined(pageForm.viewModel.AssignedWorkItem.DisplayName) && pageForm.viewModel.AssignedWorkItem.DisplayName.length > 0)
               && (pageForm.viewModel.AssignedWorkItem.DisplayName != lastAddedAssignee)) {
                var actionLogType = app.controls.getWorkItemLogType(pageForm.viewModel);
                if (actionLogType) {
                    pageForm.viewModel[actionLogType]
                        .unshift(new app.dataModels[actionLogType].recordAssigned(pageForm.viewModel.AssignedWorkItem.DisplayName));
                }

                lastAddedAssignee = pageForm.viewModel.AssignedWorkItem.DisplayName;
            }
        }
    }

    //set schedule duration for release record
    var isScheduleBounded = false;
    var setScheduleDuration = function () {

        if ((pageForm.type !== "ReleaseRecord")) { return; }

        if (!isScheduleBounded) {
            pageForm.viewModel.bind("change", function (obj) {
                isScheduleBounded = true;
                setScheduleDuration();
            });
        }

        var scheduledDuration = calculateTimeDuration(pageForm.viewModel["ScheduledStartDate"], pageForm.viewModel["ScheduledEndDate"]);
        var actualDuration = calculateTimeDuration(pageForm.viewModel["ActualStartDate"], pageForm.viewModel["ActualEndDate"]);
        var scheduledDowntimeDuration = calculateTimeDuration(pageForm.viewModel["ScheduledDowntimeStartDate"], pageForm.viewModel["ScheduledDowntimeEndDate"]);
        var actualDowntimeDuration = calculateTimeDuration(pageForm.viewModel["ActualDowntimeStartDate"], pageForm.viewModel["ActualDowntimeEndDate"]);

        pageForm.viewModel.set("ScheduleDuration", scheduledDuration);
        pageForm.viewModel.set("ActualDuration", actualDuration);
        pageForm.viewModel.set("ScheduledDowntimeDuration", scheduledDowntimeDuration);
        pageForm.viewModel.set("ActualDowntimeDuration", actualDowntimeDuration);

    }
    var calculateTimeDuration = function (startDate, endDate) {
        if (_.isNull(startDate) || _.isNull(endDate)) { return ""; }
        var dtStart = new Date(startDate);
        var dtEnd = new Date(endDate);

        var dayDiff = Math.round((dtEnd - dtStart) / 1000 / 60 / 60 / 24);
        var hourDiff = Math.round(dtEnd.getHours() - dtStart.getHours());
        var minDiff = Math.round(dtEnd.getMinutes() - dtStart.getMinutes());

        if (hourDiff < 0) {
            dayDiff = dayDiff - 1;
            hourDiff = 24 + hourDiff;
        }
        if (minDiff < 0) {
            hourDiff = hourDiff - 1;
            minDiff = 60 + minDiff;
        }

        return localization.ScheduleDurationText.replace("{0}", dayDiff).replace("{1}", hourDiff).replace("{2}", minDiff);
    }
    var changeCntr = 0;
    //set a global vm change function
    var onVmChange = function (e) {
        //This will optimized the passing of mulitple object to only send the deleted or/and added items
        app.lib.optimizeFormMultiObject.OnVmChange(e);

        //if we have a custom function bound to this change then fire it 
        if (_.isFunction(changesArray[e.field])) {
            changesArray[e.field](e);
        }

        if (e.field === 'Urgency' || e.field === 'Impact' || e.field === "Urgency.Id" || e.field === "Impact.Id") {
            //update priority for IRs, which is calculated based on Urgency and Impact vals
            setPriorityByMatrix();
        }

        if (e.field === 'Title') {
            //update displayname every time title changes
            var displayName = !_.isNull(pageForm.viewModel.Title) ? pageForm.viewModel.Id + " - " + pageForm.viewModel.Title : pageForm.viewModel.Id;
            pageForm.viewModel.set("DisplayName", displayName);
        }

        if (e.field.indexOf("AssignedWorkItem") > -1) {
            if (e.field.indexOf("BaseId") > -1) changeCntr++;
            if (e.field.indexOf("DisplayName") > -1) changeCntr++;

            if (changeCntr === 0 || changeCntr === 2) {
                addRecordAssignedLog();
                setFirstAssignedDateValue();
                changeCntr = 0;
            }
        }

    }
    //make the things global - grrrr
    pageForm.onVmChange = onVmChange;

    init();
});