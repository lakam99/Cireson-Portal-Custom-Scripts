//Written by Arkam Mazrui for the Cireson web portal
//arkam.mazrui@nserc-crsng.gc.ca
//arkam.mazrui@gmail.com
//IE 11 Compatible accentSuggest.js
//IE Compatibility is a ****

"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var accentSuggest = {
  constants: {
    suggest_letters: {
      'a': [224, 226, 230],
      'c': [231],
      'e': [233, 232, 234, 235],
      'i': [238, 239],
      'o': [244, 156],
      'u': [249, 251, 252],
      'y': [255]
    },
    type_speed_allowance: 200 //ms

  },
  properties: {
    enabled: null
  },
  objects: {
    userpicker_array: []
  },
  setters: {
    set_userpicker_array: function set_userpicker_array(arg) {
      if (Array.isArray(arg)) {
        accentSuggest.objects.userpicker_array = arg;

        if (arg.length) {
          accentSuggest.setters.set_enabled(true);
        } else {
          accentSuggest.setters.set_enabled(false);
        }
      } else {
        throw Error("Cannot set non-array to userpicker_array obj.");
      }
    },
    set_enabled: function set_enabled(val) {
      if (val !== true && val !== false) {
        throw Error("Enabled value must be a boolean.");
      } else {
        accentSuggest.properties.enabled = val;
      }
    }
  },
  getters: {
    get_userpicker_array: function get_userpicker_array() {
      return accentSuggest.objects.userpicker_array;
    },
    is_enabled: function is_enabled() {
      if (accentSuggest.properties.enabled === null) {
        throw Error("Enabled property accessed before accentSuggest was setup.");
      }

      return accentSuggest.properties.enabled;
    },
    get_page_userpickers: function get_page_userpickers() {
      return $("input.input-userpicker, input[data-control-itemtype='ServiceRequest']," + "input[data-control-itemtype='Incident']").toArray();
    },
    get_page_userpicker_obj: function get_page_userpicker_obj(element_reference) {
      return $(element_reference).data("kendoAutoComplete");
    },
    get_page_userpicker_objs: function get_page_userpicker_objs() {
      var r = [];
      accentSuggest.getters.get_page_userpickers().forEach(function (n, i) {
        r.push(accentSuggest.getters.get_page_userpicker_obj(n));
      });
      return r;
    },
    get_vowel_group: function get_vowel_group(character) {
      if (typeof character != "string" || typeof character == "string" && character.length > 1) {
        throw Error("Parameter to get_vowel_group must be single character.");
      }

      if (accentSuggest.constants.suggest_letters[character] === undefined) {
        throw Error("Invalid vowel " + character + " passed to get_vowel_group.");
      } else {
        var r = [];
        accentSuggest.constants.suggest_letters[character].forEach(function (n, i) {
          r.push(String.fromCharCode(n));
        });
        return r;
      }
    },
    get_vowel_groups: function get_vowel_groups(string_arg) {
      if (typeof string_arg != "string") {
        throw Error("generate_variations arg must be a string.");
      } //to lowercase character array


      var variations = [];
      var vowels = [];
      string_arg = string_arg.toLowerCase().split("");
      string_arg.forEach(function (n, i) {
        if (accentSuggest.constants.suggest_letters[n] !== undefined) {
          var p = [n];
          vowels.push(p.concat(accentSuggest.getters.get_vowel_group(n)));
        }
      });
      return vowels;
    }
  },
  functionality: {
    do_if_enabled: function do_if_enabled(callback) {
      var state = accentSuggest.getters.is_enabled();

      if (state) {
        callback();
      }
    },
    vowel_indexes: function vowel_indexes(word) {
      if (typeof word != "string") {
        throw Error("Argument passed to vowel_indexes must be string.");
      }

      var r = [];
      word.toLowerCase().split("").forEach(function (n, i) {
        if (accentSuggest.constants.suggest_letters[n] !== undefined) {
          r.push(i);
        }
      });
      return r;
    },
    loop: function loop(arg) {
      //gift from God
      var r = [];
      var statement = "";
      var inner_statement = "r.push(";

      for (var i = 0; i < arg.length; i++) {
        inner_statement += "arg[" + i + "][i" + i + "]";

        if (i != arg.length - 1) {
          inner_statement += "+";
        } else {
          inner_statement += ")";
        }
      }

      var i = 0;

      while (i < arg.length) {
        statement += "for (var i" + i + "=0; i" + i + " < arg[" + i + "].length; i" + i + "++) {";

        if (i == arg.length - 1) {
          statement += inner_statement + "}".repeat(arg.length);
        }

        i++;
      }

      eval(statement);
      return r;
    },
    generate_variation: function generate_variation(original_word, variation) {
      var vowel_indexes = accentSuggest.functionality.vowel_indexes(original_word);

      if (variation.length != vowel_indexes.length) {
        throw Error("Vowel indexes size doen't match length of variation.");
      }

      var word_arr = original_word.toLowerCase().split("");

      for (var i = 0; i < variation.length; i++) {
        word_arr[vowel_indexes[i]] = variation[i];
      }

      return word_arr.join('');
    },
    generate_variations: function generate_variations(word) {
      if (typeof word != "string") {
        throw Error("Argument passed to generate variations must be string.");
      }

      var max_vary = 50;
      var word_variations = [];
      var variations = accentSuggest.functionality.loop(accentSuggest.getters.get_vowel_groups(word)).slice(0, max_vary);

      if (variations.length) {
        variations.forEach(function (variation, i) {
          word_variations.push(accentSuggest.functionality.generate_variation(word, variation));
        });
      }

      return word_variations;
    },
    request_variation: function () {
      var _request_variation = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(word) {
        var max_results, request_data, url, method, r;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                max_results = 5;
                request_data = {
                  userFilter: word,
                  filterByAnalyst: false,
                  groupsOnly: false,
                  maxNumberOfResults: max_results,
                  fetchAll: false
                };
                url = window.location.origin + "/api/V3/User/GetUserList";
                method = "get";
                _context.next = 6;
                return ClientRequestManager.send_request(method, url, request_data, false);

              case 6:
                r = _context.sent;
                return _context.abrupt("return", JSON.parse(r));

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function request_variation(_x) {
        return _request_variation.apply(this, arguments);
      }

      return request_variation;
    }(),
    request_variations: function () {
      var _request_variations = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(word) {
        var variations, suggestions, i, suggestion;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                variations = accentSuggest.functionality.generate_variations(word);
                variations.splice(0, 1);
                suggestions = [];
                i = 0;

              case 4:
                if (!(i < variations.length)) {
                  _context2.next = 12;
                  break;
                }

                _context2.next = 7;
                return accentSuggest.functionality.request_variation(variations[i]);

              case 7:
                suggestion = _context2.sent;

                if (suggestion.length) {
                  suggestions.push(suggestion);
                }

              case 9:
                i++;
                _context2.next = 4;
                break;

              case 12:
                suggestions = [].concat.apply([], suggestions);
                return _context2.abrupt("return", suggestions);

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function request_variations(_x2) {
        return _request_variations.apply(this, arguments);
      }

      return request_variations;
    }()
  },
  setup: [function () {
    //Set userpicker objects (if any)
    accentSuggest.setters.set_userpicker_array(accentSuggest.getters.get_page_userpicker_objs());
  },
  /**function() {
      //Add buttons
      accentSuggest.getters.get_page_userpicker_objs().forEach(function(n,i){
          $(n.element).parent().before("<a class='k-button pull-right btn btn-accent"+i+"'>"+String.fromCharCode(232)+"</a>");
      });
  }, **/
  function () {
    //Bind listeners
    accentSuggest.getters.get_page_userpicker_objs().forEach(function (n, i) {
      var timeout = null;
      $(n.element).on("click", function () {
        n.popup.open();
      });
      $(n.element).off("focusout");
      $(n.element).on("keyup", function () {
        clearTimeout(timeout); //Set a timeout to allow the user to finish typing

        timeout = setTimeout(function () {
          if (n.popup.visible()) {
            var text = n.element.val();
            accentSuggest.functionality.request_variations(text).then(function (variations) {
              variations.forEach(function (variation, i) {
                n.dataSource.add(variation);
              });
              n.popup.open();
            });
          }
        }, accentSuggest.constants.type_speed_allowance);
      });
      console.log(i + ":Listener bound.");
    });
  }],
  main: {
    setup: function setup() {
      accentSuggest.setup.forEach(function (n, i) {
        n();
      });
    },
    start: function() {
      if (!settings_controller.get_setting_value("accentSuggest")) {return;}
      var accent_wait = setInterval(function() {
          if (accentSuggest.getters.get_page_userpicker_objs().length) {
              accentSuggest.main.setup();
              clearInterval(accent_wait);
          }
      }, 100);
  }
  }
};
accentSuggest.main.start();