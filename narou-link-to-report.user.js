// ==UserScript==
// @name        narou-link-to-report
// @namespace   ktmizugaki
// @author      teru
// @description Add link to novelreport for each line
// @version     1.1.0
// @match       https://ncode.syosetu.com/n*
// @match       https://syosetu.com/usernovelreport/passivelist/*
// @match       https://syosetu.com/usernovelreport/novelpassivelist/*
// @grant       none
// @noframes
// ==/UserScript==

(function() {
  "use strict";
  /* 本文の各行に、該当行のアンカー付きの誤字報告リンクを追加する関数です。 */

  const CLASS_PREFIX = "xsk1esho";
  const LINK_TEXT = "‡";

  function is_logged_in() {
    return document.getElementsByClassName("c-menu__item--login").length == 0;
  }

  function get_reporturl() {
    let link = document.querySelector("[href^=\"https://novelcom.syosetu.com/novelreport/input/ncode/\"]");
    if (link) {
      return link.href;
    }
    return null;
  }

  let reporturl = get_reporturl();
  if (!is_logged_in() || !reporturl) {
    return;
  }

  document.querySelectorAll("p[id^=L]").forEach(
    function(e){
      if (!e.id.match(/^L\d+$/)) {
        return;
      }
      if (e.innerText.match(/^\s*$/)) {
        return;
      }
      /* 誤字報告リンクを追加します。 */
      let a = document.createElement("a");
      a.style = "display: none;";
      a.className = CLASS_PREFIX+"-reportlink";
      a.href = reporturl+"#"+e.id;
      a.target = "novelreport";
      a.innerText = LINK_TEXT;
      e.appendChild(a);
    });
})();

(function() {
  "use strict";
  /* 作者側の誤字報告の画面に、ボタンを追加する関数です。 */

  const TITLE_NID_PATTERN = new RegExp("/usernovelreport/novelpassivelist/ncode/(\\d+)/");

  document.querySelectorAll(".c-up-chk-item").forEach(
    function(e){
      if (!e.dataset.novelreportid || !e.dataset.noveldataid) {
        return;
      }
      /* 「作品毎の誤字報告確認ページ」へのリンクからnidを取り出します。 */
      let title = e.querySelector(".c-up-reaction-item__title a");
      let nid = title && title.href && title.href.match(TITLE_NID_PATTERN);
      if (!nid) {
        return;
      }
      let footer = e.querySelector(".c-up-reaction-item__footer");
      let buttons = document.createElement("div");
      buttons.className = footer.firstElementChild.className;
      footer.insertBefore(buttons, footer.firstElementChild);
      let url, a;

      /* 「自分で誤字報告」ボタンを追加します。 */
      url = "https://novelcom.syosetu.com/novelreport/input/ncode/"+nid[1]+"/";
      if (e.dataset.no) {
        url += "no/"+e.dataset.no+"/";
      }
      if (e.dataset.line) {
        url += "#L"+e.dataset.line;
      }
      a = document.createElement("a");
      a.className = "c-button c-button--outline";
      a.href = url;
      a.target = "novelreport";
      a.innerText = "自分で誤字報告";
      buttons.appendChild(a);

      /* 「エピソードを編集」ボタンを追加します。 */
      url = "https://syosetu.com/usernoveldatamanage/updateinput/ncode/"+nid[1]+"/";
      if (e.dataset.noveldataid) {
        url += "noveldataid/"+e.dataset.noveldataid+"/";
      }
      if (e.dataset.line) {
        url += "#L"+e.dataset.line;
      }
      a = document.createElement("a");
      a.className = "c-button c-button--outline";
      a.href = url;
      a.target = "_blank";
      a.innerText = "エピソードを編集";
      buttons.appendChild(a);
    });

  /**** 更新情報 ****
   * v1.1.0 (2026/07/11)
   作者側の誤字報告の画面に、「エピソードを編集」「自分で誤字報告」ボタンを追加。

   * v1.0.0 (2026/06/27)
   初版
   ******************/
})();
