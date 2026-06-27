// ==UserScript==
// @name        narou-squeeze-blank
// @namespace   ktmizugaki
// @author      teru
// @description Squeeze blank lines
// @version     1.0.0
// @match       https://ncode.syosetu.com/n*
// @grant       none
// @noframes
// ==/UserScript==

(function() {
  "use strict";

  const CLASS_PREFIX = "hhytmr0h";
  const RATIO = 45;

  let counts = [0, 0, 0];
  document.querySelectorAll("p[id^=L]").forEach(
    function(e){
      if (!e.id.match(/^L\d+$/)) {
        return;
      }
      counts[0]++;
      if (!e.innerText.match(/^\s*$/)) {
        counts[2] = 0;
        return;
      }
      counts[1]++;
      counts[2]++;
      e.classList.add(CLASS_PREFIX+"-blank");
      e.classList.add(CLASS_PREFIX+"-blank-"+counts[2]);
    });

  if (counts[1]*100 > counts[0]*RATIO) {
    document.querySelectorAll(".p-novel__text").forEach(
      function(e){
        e.classList.add(CLASS_PREFIX+"-squeeze-blank");
      });
  }

  /**** 更新情報 ****
   * v1.0.0 (2026/06/27)
   初版
   ******************/
})();
