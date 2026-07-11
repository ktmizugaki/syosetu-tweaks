// ==UserScript==
// @name        narou-subtitle-in-window
// @namespace   ktmizugaki
// @author      teru
// @description Swap subtitle and title in window
// @version     1.0.0
// @match       https://ncode.syosetu.com/n*/*/
// @grant       none
// @noframes
// ==/UserScript==

(function() {
  "use strict";

  let subtitleElem = document.querySelector(".p-novel__title--rensai");
  if (subtitleElem) {
    let subtitle = subtitleElem.textContent;
    document.title = subtitle + " - " + document.title.replace(" - "+subtitle, "");
  }

  /**** 更新情報 ****
   * v1.0.0 (2026/07/11)
   初版
   ******************/
})();
