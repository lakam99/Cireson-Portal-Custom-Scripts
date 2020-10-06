//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com
//IE 11 Compatible templateApplier.js
//IE Compatibility is a ****

"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var templateApplier = {
  properties: {
    template_applier_html: "<div id='template_applier'></div>",
    input_html: "<div id='template_input_container'><input id='template_applier_select'/></div>",
    loader_html: "<div class='k-overlay' id='loader_overlay' style='z-index: 12002; opacity: 0.5;'></div>",
    dialog: {
      width: "502px",
      title: "Apply Template",
      modal: true,
      visible: false
    },
    comboBox: {
      dataTextField: "Name",
      dataValueField: "Id",
      dataSource: {
        transport: {
          read: {
            dataType: "json",
            type: "get",
            url: window.location.origin + "/api/V3/Template/GetTemplates",
            data: {
              classId: '04b69835-6343-4de2-4b19-6be08c612989'
            }
          }
        }
      },
      filter: "contains",
      suggest: true,
      index: 0
    },
    currentTicket: {
      formObj: null,
      viewModel: null
    },
    whitelist: ["Activity", "Area"],
    resolveFunc: null
  },
  constants: {
    statuses: {
      submitted: {
        Id: "72b55e17-1c7d-b34c-53ae-f61f8732e425",
        Name: "Submitted"
      },
      in_progress: {
        Id: "59393f48-d85f-fa6d-2ebe-dcff395d7ed1",
        Name: "In Progress"
      }
    }
  },
  getters: {
    get_dialog: function get_dialog() {
      var r = templateApplier.properties.dialog;
      r.content = templateApplier.properties.input_html;
      r.actions = [{
        text: "Apply",
        action: templateApplier.functionality.apply,
        primary: true
      }, {
        text: "Cancel",
        action: templateApplier.functionality.cancel,
        primary: false
      }];
      return r;
    },
    get_template_applier: function get_template_applier() {
      return $("#template_applier");
    },
    get_dialog_window: function get_dialog_window() {
      return templateApplier.getters.get_template_applier().data("kendoDialog");
    },
    get_input: function get_input() {
      return $("#template_applier_select");
    },
    get_combobox: function get_combobox() {
      return templateApplier.getters.get_input().data("kendoComboBox");
    },
    get_selected_template_id: function get_selected_template_id() {
      return templateApplier.getters.get_combobox().value();
    },
    get_whitelisted_properties: function get_whitelisted_properties() {
      return templateApplier.properties.whitelist;
    }
  },
  setters: {
    set_ticket_info: function set_ticket_info(formObj, viewModel) {
      templateApplier.setters.set_formObj(formObj);
      templateApplier.setters.set_viewModel(viewModel);
    },
    set_formObj: function set_formObj(formObj) {
      templateApplier.properties.currentTicket.formObj = formObj;
    },
    set_viewModel: function set_viewModel(viewModel) {
      templateApplier.properties.currentTicket.viewModel = viewModel;
    }
  },
  functionality: {
    cancel: function cancel() {
      return true;
    },
    apply: function () {
      var _apply = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var current_obj, selected, templateObj, whitelist, new_obj;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                templateApplier.getters.get_dialog_window().close();
                current_obj = templateApplier.properties.currentTicket.viewModel;
                templateApplier.functionality.show_loading();
                _context.next = 5;
                return templateApplier.functionality.trigger_workflow_or_update_required(current_obj);

              case 5:
                current_obj = _context.sent;
                selected = templateApplier.getters.get_selected_template_id();
                _context.next = 9;
                return templateApplier.functionality.request_template_obj(selected);

              case 9:
                templateObj = _context.sent;

                if (!(templateObj.ClassTypeId !== current_obj.ClassTypeId)) {
                  _context.next = 13;
                  break;
                }

                kendo.alert("Cannot apply template with class " + templateObj.ClassName + ' to object of type ' + current_obj.ClassName + '.');
                return _context.abrupt("return");

              case 13:
                whitelist = templateApplier.getters.get_whitelisted_properties();
                new_obj = templateApplier.functionality.replace_properties(current_obj, templateObj, whitelist);
                templateApplier.functionality.set_obj_status(new_obj, templateApplier.constants.statuses.in_progress);
                templateApplier.functionality.remove_loading();
                templateApplier.functionality.ui_commit_new_obj(new_obj, current_obj);

              case 18:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function apply() {
        return _apply.apply(this, arguments);
      }

      return apply;
    }(),
    show_loading: function show_loading() {
      $("body").append(templateApplier.properties.loader_html);
      kendo.ui.progress($("#loader_overlay"), true);
    },
    remove_loading: function remove_loading() {
      $("#template_applier_select").remove();
    },
    deep_copy: function deep_copy(obj) {
      var r = $.extend([], obj);
      Object.keys(r).forEach(function (property) {
        if (r[property] != undefined && r[property] != null && _typeof(r[property]) === "object") {
          r[property] = $.extend({}, r[property]);
        }
      });
      return r;
    },
    replace_properties: function replace_properties(main_obj, replacement_obj, whitelist_properties) {
      var r = templateApplier.functionality.deep_copy(main_obj);

      if (!whitelist_properties || !Array.isArray(whitelist_properties)) {
        whitelist_properties = [];
      }

      whitelist_properties.forEach(function (property) {
        if (replacement_obj[property] === undefined) {
          delete r[property];
        } else {
          r[property] = replacement_obj[property];
        }
      });
      return r;
    },
    status_eq: function status_eq(s1, s2) {
      return s1.Id === s2.Id && s1.Name === s2.Name;
    },
    set_obj_status: function set_obj_status(obj, set_to_status) {
      obj.Status.Id = set_to_status.Id;
      obj.Status.Name = set_to_status.Name;
    },
    trigger_workflow_or_update_required: function () {
      var _trigger_workflow_or_update_required = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(obj) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  templateApplier.properties.resolveFunc = function (resolve_obj) {
                    resolve(resolve_obj);
                  };

                  if (!templateApplier.functionality.status_eq(obj.Status, templateApplier.constants.statuses.submitted)) {
                    var new_obj = templateApplier.functionality.deep_copy(obj);
                    templateApplier.functionality.set_obj_status(new_obj, templateApplier.constants.statuses.submitted);
                    templateApplier.functionality.commit_new_obj(new_obj, obj, function (resolve) {
                      templateApplier.properties.resolveFunc(new_obj);
                    });
                  } else {
                    resolve(obj);
                  }
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function trigger_workflow_or_update_required(_x) {
        return _trigger_workflow_or_update_required.apply(this, arguments);
      }

      return trigger_workflow_or_update_required;
    }(),
    request_template_obj: function () {
      var _request_template_obj = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(templateId) {
        var req, url, r;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                req = {
                  id: templateId,
                  createdById: session.user.Id
                };
                url = window.location.origin + '/api/V3/Projection/CreateProjectionByTemplate';
                _context3.next = 4;
                return ClientRequestManager.send_request("get", url, req, false);

              case 4:
                r = _context3.sent;
                return _context3.abrupt("return", JSON.parse(r));

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function request_template_obj(_x2) {
        return _request_template_obj.apply(this, arguments);
      }

      return request_template_obj;
    }(),
    generate_commit_data: function generate_commit_data(new_obj, old_obj) {
      return {
        formJSON: {
          original: old_obj,
          current: new_obj
        }
      };
    },
    commit_new_obj: function commit_new_obj(new_obj, old_obj, callback) {
      $.ajax({
        url: '/api/V3/Projection/Commit',
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(templateApplier.functionality.generate_commit_data(new_obj, old_obj)),
        success: callback,
        error: function error(o, status, msg) {
          console.log("An error occured: " + status + ": " + msg);
          console.log(o.responseJSON.exception);
        }
      });
    },
    ui_commit_new_obj: function ui_commit_new_obj(new_obj, old_obj) {
      kendo.confirm("Are you sure you want to apply this template?").then(function () {
        templateApplier.functionality.show_loading();
        templateApplier.functionality.commit_new_obj(new_obj, old_obj, function (result) {
          templateApplier.functionality.remove_loading();
          kendo.alert("<a href='" + window.location.href + "'>Template successfully applied!</a>");
        });
      });
    }
  },
  setup: [function () {
    //build UI
    $("body").append(templateApplier.properties.template_applier_html);
    templateApplier.getters.get_template_applier().kendoDialog(templateApplier.getters.get_dialog());
    templateApplier.getters.get_input().kendoComboBox(templateApplier.properties.comboBox);
  }, function () {
    //create task
    app.custom.formTasks.add('ServiceRequest', 'Apply Template', function (formObj, viewModel) {
      templateApplier.setters.set_ticket_info(formObj, viewModel);
      templateApplier.getters.get_dialog_window().open();
    });
  }],
  main: {
    setup: function setup() {
      templateApplier.setup.forEach(function (f) {
        f();
      });
    },
    start: function start() {
      $(document).ready(function () {
        templateApplier.main.setup();
      });
    }
  }
};
templateApplier.main.start();