// ==UserScript==
// @name        narou-link-to-report
// @namespace   ktmizugaki
// @author      teru
// @description Add link to novelreport for each line
// @version     1.0.0
// @match       https://ncode.syosetu.com/n*
// @grant       none
// @noframes
// ==/UserScript==

(function() {
  "use strict";

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
      let a = document.createElement("a");
      a.style = "display: none;";
      a.className = CLASS_PREFIX+"-reportlink";
      a.href = reporturl+"#"+e.id;
      a.target = "novelreport";
      a.innerText = LINK_TEXT;
      e.appendChild(a);
    });

  /**** 更新情報 ****
   * v1.0.0 (2026/06/27)
   初版
   ******************/
})();
