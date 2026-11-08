// ==UserScript==
// @name        narou-highlight-names
// @namespace   ktmizugaki
// @author      teru
// @description Register and highlight names
// @version     1.0.0
// @match       https://ncode.syosetu.com/n*
// @match       https://syosetu.com/novelpreview/top/from/*
// @match       https://syosetu.com/draftepisode/view/draftepisodeid/*
// @match       https://syosetu.com/usernoveldatamanage/top/ncode/*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// @noframes
// ==/UserScript==

const MMM = new MicroModuleManager();

MMM.register("constants", function(_MMM) {
  "use strict";
  /* 固定値と設定値 */
  // GM_setValue("key.register_name", "M-w");
  // GM_setValue("key.manage_name", "S-M-W");
  return Object.freeze({
    CLASS_PREFIX: "toiavaoq",
    REGISTER_NAME_KEYS: GM_getValue("key.register_name", "S-R").split("\n"),
    MANAGE_NAME_KEYS: GM_getValue("key.manage_name", "M-r").split("\n"),
    CATEGORY_COUNT: 10,
  });
});

MMM.register("main", function(MMM) {
  "use strict";
  const ncode = MMM.resolve("ncode");
  if (!ncode.get_ncode()) {
    return;
  }

  const { CLASS_PREFIX, REGISTER_NAME_KEYS, MANAGE_NAME_KEYS, CATEGORY_COUNT } = MMM.resolve("constants");
  const lcev = MMM.resolve("lcev");
  const DomUtils = MMM.resolve("dom-utils");
  const { handleKeys } = MMM.resolve("keyev");
  const categoryNameStore = MMM.resolve("category-name-store");
  const nameStore = MMM.resolve("name-store");
  const categoryNamesForm = MMM.resolve("category-names-form");
  const registerForm = MMM.resolve("register-form");
  const namesTable = MMM.resolve("names-table");
  const namePopup = MMM.resolve("name-popup");

  function handleRegisterNameKeys() {
    let data = {name: DomUtils.getSelectedText(), intro_page: ncode.get_pageno()};
    registerForm.show(data);
  }

  function handleManageNameKeys() {
    namesTable.show();
  }

  const KEY_HANDLERS = [
    [REGISTER_NAME_KEYS, handleRegisterNameKeys],
    [MANAGE_NAME_KEYS, handleManageNameKeys],
  ];

  document.body.addEventListener("keydown", function(event) {
    /* 入力欄でのキーボードイベントを無視 */
    let tagName = event.target.tagName;
    if (["INPUT", "BUTTON", "TEXTAREA"].indexOf(tagName) >= 0) {
      return;
    }

    handleKeys(event, KEY_HANDLERS);
  });

  lcev.add("names:update", function(){
    namesTable.reload();
  });
  lcev.add("category-names:update", function(){
    namesTable.reload();
    registerForm.reload();
  });
  lcev.add("name:click", function(evName, data){
    namePopup.show(data);
  });
  lcev.add("name:dblclick", function(evName, data){
    registerForm.show(data, data.name);
  });

  categoryNameStore.load();
  nameStore.load(ncode.get_ncode());
  if (nameStore.all().length) {
    nameStore.highlight();
  }
  namesTable.addOpenButton();
});

MMM.register("name-popup", function(MMM) {
  "use strict";
  /* 名前ポップアップ */
  const { CLASS_PREFIX } = MMM.resolve("constants");
  const DomUtils = MMM.resolve("dom-utils");
  const addStyle = MMM.resolve("add-style");
  const Template = MMM.resolve("template");

  addStyle(`
.toiavaoq-popup {
  display: none;
}
#${CLASS_PREFIX}-name_popup {
  width: 8em;
  position: fixed;
  right: 0;
  bottom: 0;
  background: #333;
  color: #fff;
  padding: 0.25em;
  border-radius: 0.25em;
}
.${CLASS_PREFIX}-name_popup-name, .${CLASS_PREFIX}-name_popup-desc {
  overflow-x: scroll;
  width: 100%;
  height: 2em;
  white-space: nowrap;
}
.${CLASS_PREFIX}-name_popup-name {
  width: calc(100% - 1.5em);
}
.${CLASS_PREFIX}-name_popup-details {
  overflow-y: scroll;
  width: 100%;
  max-height: 40vh;
  white-space: pre-line;
}
`);
  let hideId = null;
  const namePopup = {
    show: function(nameInfo) {
      let tmpl = [
        "div",
        {id:CLASS_PREFIX+"-name_popup", class:CLASS_PREFIX+"-popup"},
        ["button", {class:CLASS_PREFIX+"-pull-right","@click":this.hide}, "×"],
        ["div", {class:CLASS_PREFIX+"-name_popup-name"}, nameInfo.name],
        ["div", {class:CLASS_PREFIX+"-name_popup-desc"}, nameInfo.desc],
        ["div", {class:CLASS_PREFIX+"-name_popup-details"}, nameInfo.details],
      ];
      let elem = document.getElementById(CLASS_PREFIX+"-name_popup");
      if (elem) {
        Template.update(tmpl, elem);
      } else {
        elem = Template.build(tmpl, document.body);
      }
      if (hideId) {
        clearTimeout(hideId);
      }
      hideId = setTimeout(this.hide, 20000);
    },
    hide: function() {
      let elem = document.getElementById(CLASS_PREFIX+"-name_popup");
      if (elem) {
        DomUtils.remove(elem);
      }
      if (hideId) {
        clearTimeout(hideId);
        hideId = null;
      }
    },
    bindShow: function(data) {
      return () => this.show(data);
    },
  };
  namePopup.hide = namePopup.hide.bind(namePopup);
  return Object.freeze(namePopup);
});

MMM.register("names-table", function(MMM) {
  "use strict";
  /* 名前管理テーブル */
  const { CLASS_PREFIX } = MMM.resolve("constants");
  const DomUtils = MMM.resolve("dom-utils");
  const addStyle = MMM.resolve("add-style");
  const Template = MMM.resolve("template");
  const Dialog = MMM.resolve("dialog");
  const ncode = MMM.resolve("ncode");
  const categoryNameStore = MMM.resolve("category-name-store");
  const nameStore = MMM.resolve("name-store");
  const categoryNamesForm = MMM.resolve("category-names-form");
  const registerForm = MMM.resolve("register-form");

  addStyle(`
#${CLASS_PREFIX}-open_names_dialog {
  display: none;
  margin-bottom: 15px;
}
#${CLASS_PREFIX}-names_dialog {
  width: 90vw;
  max-width: unset;
  height: 90vh;
  max-height: unset;

  .${CLASS_PREFIX}-dialog-body {
    max-height: calc(90vh - 40px);
  }

  tr {
    height: 1.4em;
    vertical-align: top;
  }

  .${CLASS_PREFIX}-name-row {
    border-bottom: none;
    th:nth-child(1), td:nth-child(1) { width: 35%; min-width: 12em; }
    th:nth-child(2), td:nth-child(2) { width: 10%; min-width: 5em; }
    th:nth-child(3), td:nth-child(3) { width: 5%; min-width: 3em; }
    th:nth-child(4), td:nth-child(4) { width: auto; white-space: pre-line; }
  }
  .${CLASS_PREFIX}-desc-row {
    border-top: none;
    th:nth-child(1), td:nth-child(1) { text-indent: 1em; }
  }
}
`);
  const namesTable = {
    sorter: function(a, b) {
      const attrs = ["category", "name"];
      for (let attr of attrs) {
        if (a[attr] < b[attr]) {
          return -1;
        } else if (a[attr] > b[attr]) {
          return 1;
        }
      }
      return 0;
    },
    buildRow: function(data, tbody) {
      Template.build(["tr", {class:CLASS_PREFIX+"-name-row","@dblclick":registerForm.bindShow(data)},
        ["td", {class:CLASS_PREFIX+"-category"+data.category}, data.name||""],
        ["td", {}, categoryNameStore.get(data.category)],
        ["td", {}, ["a", {href:ncode.page_url(data.intro_page)||"#"}, data.intro_page||""]],
        ["td", {rowspan:"2"}, data.details||""],
      ], tbody);
      Template.build(["tr", {class:CLASS_PREFIX+"-desc-row","@dblclick":registerForm.bindShow(data)},
        ["td", {colspan:"3"}, data.desc||" "],
      ], tbody);
    },
    show: function() {
      let dialog = Dialog.showModal(CLASS_PREFIX+"-names_dialog", [
        categoryNamesForm.openButtonTemplate(),
        registerForm.openButtonTemplate(),
        ["h2", {class:CLASS_PREFIX+"-dialog-header"}, "名前一覧"],
        ["div", {class:CLASS_PREFIX+"-dialog-body"},
          ["table", {class:CLASS_PREFIX+"-table"},
            ["thead", {},
              ["tr", {class:CLASS_PREFIX+"-name-row"},
                ["th", {}, "名前"],
                ["th", {}, "分類"],
                ["th", {}, "紹介ページ"],
                ["th", {rowspan:"2"}, "詳細"],
              ],
              ["tr", {class:CLASS_PREFIX+"-desc-row"},
                ["th", {colspan:"3"}, "説明"],
              ]
            ],
            ["tbody", {}]
          ]
        ]
      ]);
      let tbody = dialog.getElementsByTagName("tbody")[0];
      let names = nameStore.all();
      names.sort(this.sorter);
      names.forEach((data)=>this.buildRow(data, tbody));
    },
    hide: function() {
      Dialog.closeModal(CLASS_PREFIX+"-names_dialog");
    },
    reload: function() {
      let dialog = document.getElementById(CLASS_PREFIX+"-names_dialog");
      if (dialog) {
        let tbody = dialog.getElementsByTagName("tbody")[0];
        while (tbody.firstChild) {
          DomUtils.remove(tbody.firstChild);
        }
        let names = nameStore.all();
        names.sort(this.sorter);
        names.forEach((data)=>{
          this.buildRow(data, tbody);
        });
      }
    },
    addOpenButton: function() {
      let elem = document.getElementById(CLASS_PREFIX+"-open_names_dialog");
      if (elem) {
        return;
      }
      elem = Template.build(["div", {style:"width:100%;"}, ["button",
        {class:CLASS_PREFIX+"-pull-right",id:CLASS_PREFIX+"-open_names_dialog",
          "@click":()=>this.show()},
        "名前管理"]]);
      let target = document.querySelectorAll("main.l-main div.c-pager, div.l-main div.c-up-panel");
      target = target && target.length >= 2 && target[target.length-1];
      if (target) {
        target.parentNode.insertBefore(elem, target.nextElementSibling);
        return;
      }
    },
  };
  return Object.freeze(namesTable);
});

MMM.register("register-form", function(MMM) {
  "use strict";
  /* 名前登録ダイアログ */
  const { CLASS_PREFIX, CATEGORY_COUNT } = MMM.resolve("constants");
  const addStyle = MMM.resolve("add-style");
  const Dialog = MMM.resolve("dialog");
  const ncode = MMM.resolve("ncode");
  const categoryNameStore = MMM.resolve("category-name-store");
  const nameStore = MMM.resolve("name-store");
  const categoryNamesForm = MMM.resolve("category-names-form");

  addStyle(`
#${CLASS_PREFIX}-reg_dialog {
  min-width: 18em;
}
`);
  const registerForm = {
    show: function(target, origname) {
      let isnew = !origname;
      let categoryOptions = [];
      for (let i = 1; i <= CATEGORY_COUNT; i++) {
        let option = ["option", {value:i}, categoryNameStore.get(i)];
        if (target.category == i) option[1].selected = "selected";
        categoryOptions.push(option);
      }
      Dialog.showModal(CLASS_PREFIX+"-reg_dialog", [
        categoryNamesForm.openButtonTemplate(),
        ["h2", {class:CLASS_PREFIX+"-dialog-header"}, isnew?"名前登録":"名前更新"],
        ["form", {class:CLASS_PREFIX+"-dialog-body", id:CLASS_PREFIX+"-reg_form", "@submit":this.onsubmit},
          ["input", {type:"hidden", name:"origname", value:origname||""}],
          ["div", {class:CLASS_PREFIX+"-row"},
            ["div", {}, ["label", {for:CLASS_PREFIX+"-reg_name"}, "名前"], ":"],
            ["div", {}, ["input", {type:"text", id:CLASS_PREFIX+"-reg_name", name:"name", value:target.name||""}]]],
          ["div", {class:CLASS_PREFIX+"-row"},
            ["div", {}, ["label", {for:CLASS_PREFIX+"-reg_category"}, "分類"], ":"],
            ["div", {}, ["select", {id:CLASS_PREFIX+"-reg_category", name:"category"}].concat(categoryOptions)]],
          ["div", {class:CLASS_PREFIX+"-row"},
            ["div", {}, ["label", {for:CLASS_PREFIX+"-reg_intro_page"}, "紹介ページ"], ":"],
            ["div", {}, ["input", {type:"number", id:CLASS_PREFIX+"-reg_intro_page", name:"intro_page",value:target.intro_page||""}]]],
          ["div", {class:CLASS_PREFIX+"-row"},
            ["div", {}, ["label", {for:CLASS_PREFIX+"-reg_desc"}, "説明"], ":"],
            ["div", {}, ["input", {type:"text", id:CLASS_PREFIX+"-reg_desc", name:"desc",value:target.desc||""}]]],
          ["div", {class:CLASS_PREFIX+"-row"},
            ["div", {}, ["label", {for:CLASS_PREFIX+"-reg_details"}, "詳細"], ":"],
            ["div", {}, ["textarea", {id:CLASS_PREFIX+"-reg_details", name:"details", rows:"10"}, target.details||""]]],
          ["button", {type:"submit"}, isnew? "登録": "更新"],
          isnew? "": ["button", {type:"button",class:CLASS_PREFIX+"-pull-right","@click":this.confirmDelete.bind(this, origname)}, "削除"],
        ]
      ]);
    },
    hide: function() {
      Dialog.closeModal(CLASS_PREFIX+"-reg_dialog");
    },
    reload: function() {
      let categorySelect = document.getElementById(CLASS_PREFIX+"-reg_category");
      if (categorySelect) {
        Array.from(categorySelect.children).forEach(function(option) {
          if (option.value) {
            option.textContent = categoryNameStore.get(option.value);
          }
        });
      }
    },
    onsubmit: function(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      let data = {};
      let form = document.getElementById(CLASS_PREFIX+"-reg_form");
      if (!form) {
        return;
      }
      form.querySelectorAll("[name]").forEach(function(el) {
        data[el.name] = el.value;
      });
      if (data.category) data.category = +data.category;
      let origname = data.origname;
      delete data.origname;
      if (nameStore.add(data, origname)) {
        this.hide();
        nameStore.save();
        if (origname) {
          nameStore.rename(data, origname);
        } else {
          nameStore.highlight([data]);
        }
      }
    },
    confirmDelete: function(origname) {
      let res = confirm("「"+origname+"」を削除します。\n相違ないですか？");
      if (res) {
        this.hide();
        nameStore.remove(origname);
        nameStore.save();
        nameStore.unhighlight(origname);
      }
    },
    bindShow: function(data) {
      return () => this.show(data, data.name);
    },
    openButtonTemplate: function() {
      let data = {intro_page: ncode.get_pageno()};
      return ["button", {class:CLASS_PREFIX+"-pull-right", "@click":this.bindShow(data)}, "名前追加"];
    },
  };
  registerForm.onsubmit = registerForm.onsubmit.bind(registerForm);
  return Object.freeze(registerForm);
});

MMM.register("category-names-form", function(MMM) {
  "use strict";
  /* 分類名設定ダイアログ */
  const { CLASS_PREFIX, CATEGORY_COUNT } = MMM.resolve("constants");
  const Dialog = MMM.resolve("dialog");
  const categoryNameStore = MMM.resolve("category-name-store");

  const categoryNamesForm = {
    show: function() {
      let categories = [];
      for (let i = 1; i <= CATEGORY_COUNT; i++) {
        categories.push(i);
      }
      Dialog.showModal(CLASS_PREFIX+"-cat_names_dialog", [
        ["h2", {class:CLASS_PREFIX+"-dialog-header"}, "分類名設定"],
        ["form", {class:CLASS_PREFIX+"-dialog-body",
          id:CLASS_PREFIX+"-cat_names_form", "@submit":this.onsubmit},
        ].concat(categories.map(function(category) {
          return ["div", {class:CLASS_PREFIX+"-row"},
            ["div", {}, ["label", {for:CLASS_PREFIX+"-cat_name_"+category}, "分類"+category], ":"],
            ["div", {}, ["input", {id:CLASS_PREFIX+"-cat_name_"+category, name:category, placeholder:categoryNameStore.getDefault(category), value:categoryNameStore.get(category, "")}]]]
          category
        })).concat(
          [
            ["button", {class:CLASS_PREFIX+"-submit",type:"submit"}, "設定"],
          ]
        ),
      ]);
    },
    hide: function() {
      Dialog.closeModal(CLASS_PREFIX+"-cat_names_dialog");
    },
    onsubmit: function(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      let data = {};
      let form = document.getElementById(CLASS_PREFIX+"-cat_names_form");
      if (!form) {
        return;
      }
      form.querySelectorAll("[name]").forEach(function(el) {
        data[el.name] = el.value;
      });
      this.hide();
      for (let i = 1; i <= CATEGORY_COUNT; i++) {
        categoryNameStore.set(i, data[i] || null);
      }
      categoryNameStore.save();
    },
    bindShow: function() {
      return () => this.show();
    },
    openButtonTemplate: function() {
      return ["button", {class:CLASS_PREFIX+"-pull-right", "@click":this.bindShow()}, "分類名設定"];
    },
  };
  categoryNamesForm.onsubmit = categoryNamesForm.onsubmit.bind(categoryNamesForm);
  return Object.freeze(categoryNamesForm);
});

MMM.register("name-store", function(MMM) {
  "use strict";
  /* 名前管理 */
  const { CLASS_PREFIX } = MMM.resolve("constants");
  const lcev = MMM.resolve("lcev");
  const DomUtils = MMM.resolve("dom-utils");
  const highlightWords = MMM.resolve("highlight-words");

  function isRegExp(str) {
    if (str.length <= 2 || str.charAt(0) != '/' || str.charAt(str.length-1) != '/') {
      return false;
    }
    try {
      str = str.substring(1, str.length-1);
      new RegExp(str);
    } catch(ex) {
      return false;
    }
    return true;
  }

  let currentNames = [];
  let currentNcode = null;
  const nameStore = {
    sorter: function(a, b) {
      let ar = isRegExp(a.name)?1:0, br = isRegExp(b.name)?1:0;
      if (ar != br) {
        return ar-br;
      }
      if (a.name.length != b.name.length) {
        return b.name.length - a.name.length;
      }
      return 0;
    },
    load: function(ncode) {
      let names = GM_getValue("names_"+ncode, null);
      currentNcode = ncode;
      currentNames = [];
      if (names) {
        try {
          currentNames = JSON.parse(names);
        } catch(e) {
        }
      }
      currentNames.sort(this.sorter);
      return currentNames;
    },
    save: function(ncode) {
      ncode = ncode || currentNcode;
      let names = JSON.stringify(currentNames);
      GM_setValue("names_"+ncode, names);
      lcev.fire("names:update");
    },
    ncode: function() {
      return currentNcode;
    },
    all: function() {
      return currentNames;
    },
    find: function(name) {
      for (let data of currentNames) {
        if (data.name === name) {
          return data;
        }
      }
    },
    add: function(data, origname) {
      if (!data.name) {
        alert("名前を入力してください。");
        return false;
      }
      let oldData = this.find(data.name);
      if (origname !== data.name) {
        if (oldData) {
          alert("名前がかぶっています。");
          return false;
        } else {
          oldData = this.find(origname);
        }
      }
      if (oldData) {
        Object.assign(oldData, data);
      } else {
        currentNames.push(data);
      }
      currentNames.sort(this.sorter);
      return true;
    },
    remove: function(origname) {
      currentNames = currentNames.filter((data) => data.name != origname);
    },
    highlight: function(names) {
      let patternList = [], attrsList = [];
      names = names || currentNames;
      if (!names || !names.length) {
        return;
      }
      names.forEach(function(data) {
        let name;
        if (isRegExp(data.name)) {
          name = data.name.substring(1, data.name.length-1);
        } else {
          name = RegExp.escape(data.name);
        }
        patternList.push(name);
        attrsList.push({
          "class": CLASS_PREFIX+"-category"+data.category,
          title: data.desc,
          "data-name": data.name,
          "@dblclick": lcev.firer("name:dblclick", data),
          "@click": lcev.firer("name:click", data),
        });
      });
      highlightWords.run(patternList, attrsList);
    },
    unhighlight: function(name) {
      let name2 = DomUtils.esc4qs(name);
      document.querySelectorAll('[data-name="'+name2+'"]').forEach(DomUtils.unwrap);
    },
    rename: function(data, origname) {
      let origname2 = DomUtils.esc4qs(origname);
      document.querySelectorAll('[data-name="'+origname2+'"]').forEach(function(elem) {
        elem.className = CLASS_PREFIX+"-category"+data.category;
        elem.title = data.desc;
        elem.setAttribute("data-name", data.name);
      });
    },
  };
  return Object.freeze(nameStore);
});

MMM.register("category-name-store", function(MMM) {
  "use strict";
  /* 分類名管理 */
  const lcev = MMM.resolve("lcev");

  let categoryNames = [];
  const categoryNameStore = {
    load: function() {
      let names = GM_getValue("category_names", null);
      if (names) {
        try {
          categoryNames = JSON.parse(names);
        } catch(e) {
        }
      }
    },
    save: function() {
      let names = JSON.stringify(categoryNames);
      GM_setValue("category_names", names);
      lcev.fire("category-names:update");
    },
    getDefault: function(category) {
      return "分類"+category;
    },
    get: function(category, fallback) {
      return categoryNames[category] ||
        (arguments.length >= 2? fallback: this.getDefault(category));
    },
    set: function(category, name) {
      if (name == null) {
        delete categoryNames[category];
      } else {
        categoryNames[category] = name;
      }
      this.save();
    },
  };
  return Object.freeze(categoryNameStore);
});

MMM.register("ncode", function(_MMM) {
  "use strict";
  /* ncode処理 */
  function toId(ncode) {
    let m = ncode.match(/^n(\d{4})([a-z]+)$/);
    if (m) {
      let nid = 0;
      m[2].split("").forEach(function(a) {
        nid *= 26;
        nid += a.toLowerCase().charCodeAt(0)-97;
      });
      nid *= 9999;
      nid += +m[1];
      return nid;
    }
  }
  function fromId(nid) {
    let m = nid%9999, n = (nid-m) / 9999;
    let ncode = "";
    if (n === 0) {
      ncode = "a";
    }
    while (n > 0) {
      let l = n%26;
      ncode = String.fromCharCode(97+l)+ncode;
      n = (n-l) / 26;
    }
    return "n"+("0000"+m).substr(-4, 4)+ncode;
  }

  let ncode, pageno;

  let m;
  if ((m = location.pathname.match(new RegExp("^/(n\\d{4}[a-z]+)(?:/(\\d+))?/?$")))) {
    ncode = m[1];
    pageno = m[2];
  } else if ((m = location.pathname.match(new RegExp("/ncode/(\\d+)")))) {
    ncode = fromId(+m[1]);
  } else if ((m = location.pathname.match(new RegExp("/draftepisodeid/(\\d+)")))) {
    let preview = document.querySelector("[data-url*=ncode][data-url*=\""+m[1]+"\"]");
    let dataUrl = preview && preview.getAttribute("data-url")
    if (dataUrl && (m = dataUrl.match(new RegExp("/ncode/(\\d+)")))) {
      ncode = fromId(+m[1]);
    }
  }

  return {
    get_ncode() {
      return ncode;
    },
    get_pageno() {
      return pageno;
    },
    page_url(pageno) {
      if (pageno && ncode) {
        return "/"+ncode+"/"+pageno+"/";
      }
    },
  }
});

MMM.register("highlight-words", function(MMM) {
  "use strict";
  /* 単語色分け */
  const { CLASS_PREFIX } = MMM.resolve("constants");
  const DomUtils = MMM.resolve("dom-utils");
  const Template = MMM.resolve("template");

  function isHighlightWord(el) {
    return el.tagName === "SPAN" &&
      el.className.indexOf(CLASS_PREFIX+"-") !== -1;
  }

  function findPatternId(m, len) {
    for (let i = 0; i < len; i++) {
      if (m.groups["_"+i] != undefined) {
        return i;
      }
    }
  }

  const highlightWords = {
    inText: function(textNode, pattern, attrsList) {
      let container = textNode.parentNode;
      let text = textNode.textContent;
      let matches = text.matchAll(pattern);
      let endIndex = 0;
      for (let m of matches) {
        if (endIndex < m.index) {
          let leftText = text.substring(endIndex, m.index);
          let leftTextNode = document.createTextNode(leftText);
          container.insertBefore(leftTextNode, textNode);
        }
        let word = m[0];
        let patternId = findPatternId(m, attrsList.length);
        let span = Template.build(["span", attrsList[patternId], word]);
        if (!span.className) span.className = CLASS_PREFIX+"-none";
        container.insertBefore(span, textNode);
        endIndex = m.index + word.length;
      }
      if (endIndex < text.length) {
        textNode.textContent = text.substring(endIndex);
      } else {
        container.removeChild(textNode);
      }
    },
    inElem: function(elem, pattern, attrsList) {
      if (["RP", "BR"].indexOf(elem.tagName) >= 0) {
        return;
      }
      Array.from(elem.childNodes).forEach(function(child) {
        if (DomUtils.isTextNode(child)) {
          highlightWords.inText(child, pattern, attrsList);
        } else if (child.childNodes) {
          if (isHighlightWord(child)) {
            /* 一度色付け済みの単語を再度色付けしないようにする。 */
            return;
          }
          highlightWords.inElem(child, pattern, attrsList);
        }
      });
    },

    run: function(patternList, attrsList) {
      patternList = patternList.map((pattern, index) => "(?<_"+index+">"+pattern+")");
      let pattern = new RegExp(patternList.join("|"), "g");
      document.querySelectorAll("h1, p[id^=L]").forEach(function(elem) {
        if (elem.innerText.match(pattern)) {
          highlightWords.inElem(elem, pattern, attrsList);
        }
      });
    },
  };
  return Object.freeze(highlightWords);
});

MMM.register("dialog", function(MMM) {
  "use strict";
  /* ダイアログ表示 */
  const { CLASS_PREFIX } = MMM.resolve("constants");
  const DomUtils = MMM.resolve("dom-utils");
  const addStyle = MMM.resolve("add-style");
  const Template = MMM.resolve("template");

  addStyle(`
/* ダイアログ */
.${CLASS_PREFIX}-dialog::backdrop {
  background: rgba(0, 0, 0, 0.3);
}
.${CLASS_PREFIX}-dialog {
  position: fixed;
  background: #fff;
  margin: auto;
  padding: 8px;
  width: 40vw;
  height: fit-content;
  min-width: 280px;
  max-width: 80vw;
  max-height: 80vh;
  & > button.${CLASS_PREFIX}-pull-right {
    margin-left: 8px;
  }
}
.${CLASS_PREFIX}-dialog-close {
  float: right;
  margin: 0 8px !important;
}
.${CLASS_PREFIX}-dialog-header {
  margin: 0 8px 8px 8px;
}
.${CLASS_PREFIX}-dialog-body {
  box-sizing: border-box;
  overflow-y: auto;
  max-height: calc(80vh - 40px);
  margin: 0;
  padding: 2px 10px 16px;
}

.${CLASS_PREFIX}-row {
  display: flex;
  flex-wrap: wrap;
}
.${CLASS_PREFIX}-row div:nth-child(1) {
  width: 34%;
  min-width: 3em;
}
.${CLASS_PREFIX}-row div:nth-child(2) {
  width: 66%;
  min-width: 11em;
}
.${CLASS_PREFIX}-row div:nth-child(2) input,
.${CLASS_PREFIX}-row div:nth-child(2) select,
.${CLASS_PREFIX}-row div:nth-child(2) textarea {
  width: 100%;
}

/* テーブル */
.${CLASS_PREFIX}-table {
  width: 100%;
  border-collapse: collapse;
}
.${CLASS_PREFIX}-table tr {
  text-align: left;
  border: 1px solid #333;
}

/* その他 */
.${CLASS_PREFIX}-pull-right {
  float: right;
}

button[class^=${CLASS_PREFIX}] {
  margin: 0;
  padding: 2px;
  font-size: 13px;
  line-height: 1;
  color: black;
}
`);

  function showModal(id, content) {
    closeModal(id);
    let el = Template.build(["dialog", {id:id, class:CLASS_PREFIX+"-dialog"},
        ["button", {class:CLASS_PREFIX+"-dialog-close",
          "@click":function(){closeModal(id)}}, "×"],
      ].concat(content));
    document.body.appendChild(el);
    el.showModal();
    return el;
  }
  function closeModal(id) {
    DomUtils.remove(document.getElementById(id));
  }
  return { showModal, closeModal };
});

MMM.register("template", function(MMM) {
  "use strict";
  /* 簡易HTMLテンプレート */
  const DomUtils = MMM.resolve("dom-utils");

  const Template = {
    text: function(string, parent) {
      var el = document.createTextNode(string);
      if (parent) parent.appendChild(el);
      return el;
    },
    tag: function(tag, parent) {
      var el = document.createElement(tag);
      if (parent) parent.appendChild(el);
      return el;
    },
    build: function(tmpl, parent) {
      if (typeof tmpl !== "object") {
        return this.text(tmpl, parent);
      }
      if (tmpl instanceof HTMLElement) {
        if (parent) parent.appendChild(tmpl);
        return tmpl;
      }
      var el = this.tag(tmpl[0], parent), attrs = tmpl[1];
      for (var i in attrs) {
        if (i.charAt(0) === "@") {
          el.addEventListener(i.substring(1), attrs[i]);
        } else if (attrs.hasOwnProperty(i)) {
          el.setAttribute(i, attrs[i]);
        }
      }
      for (var i = 2; i < tmpl.length; i++) {
        this.build(tmpl[i], el);
      }
      return el;
    },
    update: function(tmpl, target) {
      if (!target) {
        return;
      }
      if (typeof tmpl !== "object") {
        target.textContent = tmpl;
        return target;
      }
      if (tmpl instanceof HTMLElement) {
        if (tmpl != target && target.parentNode) {
          target.parentNode.insertBefore(tmpl, target);
          DomUtils.remove(target);
        }
        return target;
      }
      if (target.tagName != tmpl[0].toUpperCase()) {
        return;
      }
      var attrs = tmpl[1];
      for (var i in attrs) {
        if (i.charAt(0) === "@") {
          /* ignore event listener */
        } else if (attrs.hasOwnProperty(i)) {
          target.setAttribute(i, attrs[i]);
        }
      }
      for (var i = 2; i < tmpl.length; i++) {
        this.update(tmpl[i], target.childNodes[i-2]);
      }
      return target;
    },
  };
  return Object.freeze(Template);
});

MMM.register("keyev", function(_MMM) {
  "use strict";
  /* キー入力ハンドリング */
  function event2key(event) {
    let key = "";
    if (event.ctrlKey) key += "C-";
    if (event.shiftKey) key += "S-";
    if (event.altKey) key += "M-";
    return key+event.key;
  }
  function testKey(key, keys) {
    if (typeof keys === "string") {
      keys = keys.split("\n");
    }
    return (keys.indexOf && keys.indexOf(key) !== -1);
  }
  function handleKeys(event, keyHandlers) {
    const key = event2key(event);
    keyHandlers.forEach(function(data) {
      let keys = data[0], handler = data[1];
      if (testKey(key, keys)) {
        event.preventDefault();
        event.stopPropagation();
        handler(event);
      }
    });
  }
  return {
    event2key,
    testKey,
    handleKeys,
  };
});

MMM.register("add-style", function(_MMM) {
  "use strict";
  /* スタイルシート追加 */
  function addStyle(style) {
    if (!addStyle.sheet) {
      let styleSheet = document.createElement("style");
      styleSheet.setAttribute("type", "text/css");
      document.head.appendChild(styleSheet);
      addStyle.sheet = styleSheet;
    }
    addStyle.sheet.textContent += style+"\n";
  }
  return addStyle;
});

MMM.register("dom-utils", function(_MMM) {
  "use strict";
  /* DOM操作ユーティリティ */

  function isTextNode(node) {
    return node && (node.constructor.name === "Text" || "splitText" in node);
  }

  function getSelectedText() {
    var sel = document.getSelection();
    if (!sel) {
      return "";
    }
    return sel.toString();
  }

  function remove(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function unwrap(el) {
    if (el && el.parentNode) {
      let prevText = isTextNode(el.previousSibling) && el.previousSibling;
      while (el.firstChild) {
        let child = el.firstChild;
        if (isTextNode(child)) {
          if (prevText) {
            prevText.textContent += child.textContent;
            remove(child);
            continue;
          } else {
            prevText = child;
          }
        } else {
          prevText = null;
        }
        el.parentNode.insertBefore(child, el);
      }
      if (prevText && isTextNode(el.nextSibling)) {
        prevText.textContent += el.nextSibling.textContent;
        remove(el.nextSibling);
      }
      remove(el);
    }
  }

  function esc4qs(val) {
    return val.replace(/["\\]/g, '\\$&');
  }

  return {
    isTextNode,
    getSelectedText,
    remove,
    unwrap,
    esc4qs,
  };
});

MMM.register("lcev", function(_MMM) {
  "use strict";
  /* local events */
  let HandlersStore = Object.create(null);
  return Object.freeze({
    add(evName, listener, key) {
      if (!HandlersStore[evName]) {
        HandlersStore[evName] = [];
      }
      HandlersStore[evName].push([listener, key||listener]);
    },
    remove(evName, key) {
      let handlers = HandlersStore[evName];
      if (!handlers) {
        return;
      }
      for (let i = handlers.length-1; i>=0; i--) {
        if (handlers[i][1] === key) {
          handlers.splice(i, 1);
        }
      }
    },
    fire(evName, arg) {
      let handlers = HandlersStore[evName];
      if (!handlers) {
        return;
      }
      for (let i = handlers.length-1; i>=0; i--) {
        handlers[i][0](evName, arg);
      }
    },
    firer(evName, arg) {
      return () => this.fire(evName, arg);
    },
  });
});

MMM.resolve("main");

function MicroModuleManager() {
  "use strict";
  const Modules = Object.create(null);
  let inprocName = null;
  this.register = function(name, def) {
    if (Modules[name] !== undefined) {
      throw new Error("module \""+name+"\" is already registered");
    }
    if (typeof def !== "function") {
      throw new Error("MicroModuleManager.register: second argument must be function (module \""+name+"\")");
    }
    Modules[name] = { instance: null, state: 0, def };
  };
  this.resolve = function(name) {
    if (Modules[name] === undefined) {
      throw new Error("module \""+name+"\" is not registered");
    }
    let module = Modules[name];
    switch (module.state) {
    case 0:
      let parentName = inprocName;
      module.state = 1;
      inprocName = name;
      try {
        module.instance = module.def(this);
      } catch(e) {
        module.state = 3;
        throw e;
      } finally {
        inprocName = parentName;
      }
      module.state = 2;
      return module.instance;
    case 1:
      throw new Error("Detected cyclic dependency of \""+name+"\" while resolving \""+inprocName+"\"");
    case 2:
      return module.instance;
    case 3:
      throw new Error("Module \""+name+"\" has been failed to resolve");
    }
  };
  this.check = function() {
    for (let name in Modules) {
      if (Modules[name].state == 0) {
        console.log("Module \""+name+"\" is not used");
      }
    }
  };
}

/**** 更新情報 ****
 * v1.0.0 (2026/11/08)
 初版
 ******************/
