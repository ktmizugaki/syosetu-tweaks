// ==UserScript==
// @name        syosetu-keyboard-navi
// @namespace   ktmizugaki
// @author      teru
// @description Syosetu keyboard navigation
// @version     1.0.0
// @match       https://ncode.syosetu.com/n*
// @match       https://kakuyomu.jp/works/*
// @match       https://syosetu.org/novel/*
// @grant       GM_getValue
// @grant       GM_setValue
// @noframes
// ==/UserScript==

(function() {
  "use strict";

  // GM_setValue("next_page", "C-b");
  // GM_setValue("prev_page", "C-f");
  const NEXT_PAGE_KEYS = GM_getValue("next_page", "ArrowRight\nl").split("\n");
  const PREV_PAGE_KEYS = GM_getValue("prev_page", "ArrowLeft\nh").split("\n");

  let Toast = {
    timer: 0,
    element: null,
    show: function(text, options) {
      options = options || {};
      let elem = this.element;
      if (!elem) {
        elem = document.createElement("div");
        elem.setAttribute("style", this.style);
        elem.addEventListener("click", (ev) => {this.hide();});
        this.element = elem;
      }
      if (this.timer) clearTimeout(this.timer);
      elem.innerText = text;
      document.body.appendChild(elem);
      this.timer = setTimeout(() => {this.hide();}, options.duration || 2300);
    },
    hide: function() {
      let elem = this.element;
      if (this.timer) clearTimeout(this.timer);
      this.timer = 0;
      if (elem && elem.parentNode) elem.parentNode.removeChild(elem);
    },

    style: `
display: inline-block;
position: fixed;
inset: auto 0 3em 0;
margin: 0 auto;
padding: 0.7rem;
color: #fff;
background-color: #777c;
boder-color: #fff;
border-radius: 0.6em;
cursor: pointer;
text-decoration: none;
max-width: calc(50% - 20px);
width: fit-content;
z-index: 2147483647;
`,
  };

  function isNextKey(key) {
    return NEXT_PAGE_KEYS.indexOf(key) !== -1;
  }

  function isPrevKey(key) {
    return PREV_PAGE_KEYS.indexOf(key) !== -1;
  }

  function event2key(event) {
    let key = "";
    if (event.ctrlKey) key += "C-";
    if (event.shiftKey) key += "S-";
    if (event.altKey) key += "M-";
    return key+event.key;
  }

  const pagerN = {
    host: "ncode.syosetu.com",
    pageInfoPattern: "^/(n\\d{4}[a-z]+)(?:/(\\d+))?/?$",
    isSingle: function(pageInfo) {
      /* 目次ページに本文があるなら短編。 */
      return !pageInfo[2] && document.body.querySelector(".p-novel__text");
    },
    gotoNextPage: function(pageInfo) {
      if (pageInfo[2]) {
        /* エピソードページであれば次の話へ遷移する。 */
        let url = "/"+pageInfo[1]+"/"+(+pageInfo[2]+1)+"/";
        /* 次ページの有無をチェック: 「次」リンクがあれば次ページあり */
        if (document.querySelector("a[href^=\""+url+"\"]")) {
          location.href = url;
        } else {
          Toast.show("最後のページです");
        }
      } else {
        /* 目次ページなら1話目へ遷移する。 */
        location.href = "/"+pageInfo[1]+"/1/";
      }
      return;
    },
    gotoPrevPageOrIndex: function(pageInfo) {
      if (pageInfo && pageInfo[2]) {
        /* 1話目なら目次へ遷移する。 */
        if (pageInfo[2] == "1") {
          location.href = "/"+pageInfo[1]+"/";
        } else {
          /* 2話目以降なら前の話へ遷移する。 */
          location.href = "/"+pageInfo[1]+"/"+(+pageInfo[2]-1)+"/";
        }
      }
    }
  };

  const pagerK = {
    host: "kakuyomu.jp",
    pageInfoPattern: "^/works/(\\d+)(?:/episodes/(\\d+))?$",
    isSingle: function(pageInfo) {
      return false;
    },
    gotoNextPage: function(pageInfo) {
      let link;
      if (pageInfo[2]) {
        /* エピソードページであれば次の話へ遷移する。 */
        link = document.querySelector("link[rel=next][href^=\"https://kakuyomu.jp/works/"+pageInfo[1]+"/episodes/\"]");
      } else {
        /* 目次ページなら最初のページに遷移する */
        link = document.querySelector("a[href^=\"/works/"+pageInfo[1]+"/episodes/\"]");
      }
      if (link) {
        location.href = link.href;
      } else {
        Toast.show("最後のページです");
      }
    },
    gotoPrevPageOrIndex: function(pageInfo) {
      if (pageInfo) {
        if (!pageInfo[2]) {
          return;
        }
        /* 前の話があれば前の話へ遷移する。 */
        let link = document.querySelector("link[rel=prev][href^=\"https://kakuyomu.jp/works/"+pageInfo[1]+"/episodes/\"]");
        if (link) {
          location.href = link.href;
        } else {
          /* なければ目次へ遷移する。 */
          location.href = "/works/"+pageInfo[1];
        }
      }
    },
  };

  const pagerH = {
    host: "syosetu.org",
    pageInfoPattern: "/novel/(\\d+)/(?:(\\d+)\\.html)?$",
    isSingle: function(pageInfo) {
      /* 目次ページに本文があるなら短編。 */
      return !pageInfo[2] && document.body.querySelector("#honbun");
    },
    gotoNextPage: function(pageInfo) {
      if (pageInfo[2]) {
        /* エピソードページであれば次の話へ遷移する。 */
        let link = document.querySelector("a.next_page_link");
        if (link) {
          location.href = link.href;
        } else {
          Toast.show("最後のページです");
        }
      } else {
        /* 目次ページなら1話目へ遷移する。 */
        location.href = "/novel/"+pageInfo[1]+"/1.html";
      }
    },
    gotoPrevPageOrIndex: function(pageInfo) {
      if (pageInfo) {
        if (!pageInfo[2]) {
          return;
        }
        /* 1話目なら目次へ遷移する。 */
        if (pageInfo[2] == "1") {
          location.href = "/novel/"+pageInfo[1]+"/";
        } else {
          /* 2話目以降なら前の話へ遷移する。 */
          location.href = "/novel/"+pageInfo[1]+"/"+(+pageInfo[2]-1)+".html";
        }
      }
      return;
    },
  };

  const pagers = [pagerN, pagerK, pagerH];
  const pager = pagers.find((pager) => pager.host === location.host);
  if (!pager) {
    return;
  }
  const pageInfo = location.pathname.match(new RegExp(pager.pageInfoPattern));
  if (!pageInfo) {
    return;
  }
  if (pager.isSingle(pageInfo)) {
    /* 短編ならキー処理は不要。 */
    return;
  }

  document.body.addEventListener("keydown", function(event) {
    /* 入力欄でのキーボードイベントを無視 */
    let tagName = event.target.tagName;
    if (["INPUT", "BUTTON", "TEXTAREA"].indexOf(tagName) >= 0) {
      return;
    }

    const key = event2key(event);
    if (isNextKey(key)) {
      event.preventDefault();
      event.stopPropagation();

      pager.gotoNextPage(pageInfo);
    } else if (isPrevKey(key)) {
      event.preventDefault();
      event.stopPropagation();

      pager.gotoPrevPageOrIndex(pageInfo);
    }
  });

  /**** 更新情報 ****
   * v1.0.0 (2026/07/11)
   初版
   ******************/
})();
