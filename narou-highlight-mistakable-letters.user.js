// ==UserScript==
// @name        narou-highlight-mistakable-letters
// @namespace   ktmizugaki
// @author      teru
// @description Highlight mistakable letters
// @version     1.0.0
// @match       https://ncode.syosetu.com/n*
// @match       https://syosetu.com/novelpreview/top/from/draftepisode/ncode/*
// @match       https://syosetu.com/draftepisode/view/draftepisodeid/*
// @grant       GM_getValue
// @grant       GM_setValue
// @noframes
// ==/UserScript==

(function() {
  "use strict";

  const CLASS_PREFIX = "bnwyeqhc";

  /* 次の行の "//" を消すと、すべてのカタカナを装飾します。 */
  //GM_setValue("pattern_katakana", "[ァ-ヴ][ァ-ヴー]*");
  /* 次の行の "//" を消すと、すべての漢数字を装飾します。 */
  //GM_setValue("pattern_kansuji", "[一二三四五六七八九十百千万億兆]+");
  /* 次の行の "//" を消すと、すべてのキリル文字を装飾します。 */
  //GM_setValue("pattern_cyrillic", "[\\u0400-\\u052f]+");
  const WORDS = [
    ["へ+", "hiragana", "ひらがなのへ"],
    [GM_getValue("pattern_katakana", "[ニヘ]+"), "katakana", "カタカナ"],
    [GM_getValue("pattern_kansuji", "[二]+"), "kansuji", "漢数字"],
    [GM_getValue("pattern_cyrillic", "[\\u041c\\u043c]+"), "cyrillic", "キリル文字"],
    ["ー+", "onbiki", "音引き"],
    ["–+", "en-dash", "enダッシュ"],
    ["—+", "em-dash", "emダッシュ"],
    ["―+", "horibar", "水平線"],
    ["[─━]+", "border", "罫線"],
  ];
  WORDS.forEach(function(word) {
    word[1] = CLASS_PREFIX+"-"+word[1];
  });

  function highlightWordsInText(textNode, pattern, classNames, titles) {
    let container = textNode.parentNode;
    let text = textNode.textContent;
    let n = 8, m;
    while (--n >= 0 && (m = text.match(pattern))) {
      let leftText = text.substring(0, m.index);
      if (leftText) {
          let leftTextNode = document.createTextNode(leftText);
          container.insertBefore(leftTextNode, textNode);
      }
      let word = m[0];
      text = text.substring(m.index+word.length);
      let span = document.createElement("span");
      let type = m.findIndex((e,i)=>i!=0&&e!=undefined)-1;
      if (classNames[type]) span.className = classNames[type];
      if (titles[type]) span.title = titles[type];
      span.innerText = word;
      container.insertBefore(span, textNode);
    }
    if (text) {
        textNode.textContent = text;
    } else {
        container.removeChild(textNode);
    }
  }

  function highlightWordsInElem(elem, pattern, classNames, titles) {
    if (["RP", "BR"].indexOf(elem.tagName) >= 0) {
      return;
    }
    Array.from(elem.childNodes).forEach(function(child) {
      if (child.constructor.name === "Text" || "splitText" in child) {
        highlightWordsInText(child, pattern, classNames, titles);
      } else if (child.childNodes) {
        highlightWordsInElem(child, pattern, classNames, titles);
      }
    });
  }

  function highlightWords(pattern, classNames, titles) {
    document.querySelectorAll("h1, p[id^=L]").forEach(function(elem) {
      if (elem.textContent.match(pattern)) {
        highlightWordsInElem(elem, pattern, classNames, titles);
      }
    });
  }

  let pattern = new RegExp(WORDS.map((x)=>"("+x[0]+")").join("|"));
  let classNames = WORDS.map((x)=>x[1]);
  let titles = WORDS.map((x)=>x[2]);
  highlightWords(pattern, classNames, titles);

  /**** 更新情報 ****
   * v1.0.0 (2026/07/28)
   初版
   ******************/
})();
