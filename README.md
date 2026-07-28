# 『小説家になろう』用校正支援スクリプト・スタイル集

## はじめに

ここで配布しているスクリプトは、以下の拡張機能に依存しますので、
まずこれらの拡張機能をインストールしてください。

* [Tampermonkey](https://www.tampermonkey.net/) ([Firefox](https://addons.mozilla.org/ja/firefox/addon/tampermonkey/), [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja))
  * 第三者が作成したスクリプトを任意のWebサイト上で実行させる拡張機能です。
  * ここで配布しているスクリプトでは、主にHTMLを追加するのに使います。
* [Stylus](https://add0n.com/stylus.html) ([Firefox](https://addons.mozilla.org/ja/firefox/addon/styl-us/), [Chrome](https://chromewebstore.google.com/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne?hl=ja))
  * Webサイトのスタイル（色とか見た目）を変更できる拡張機能です。
  * ここで配布しているスクリプトでは、主にスクリプトで追加したHTMLの見た目を設定するのに使います。

これらの拡張機能をインストール後に、スクリプト・スタイルのリンクをクリックすると、
対応する拡張機能のスクリプト・スタイルのインストール画面が開くので、インストールを行ってください。

## 注意事項

PCでの動作のみ検証しています。携帯端末での動作はサポート対象外です。

ここで配布しているスクリプトでは、スタイルを無効にすることで追加したHTMLが見えなくなるよう配慮しています。
一時的にスクリプトの効果を無効化したい場合に活用ください。

## narou-highlight-mistakable-letters

カタカナの「ニ」と漢数字の「二」、音引き「ー」とダッシュ「―」などの紛らわしい文字を装飾して目立たせて、誤字を見つけやすくします。

読者に公開されたページと執筆時のプレビューページで動作しますので、執筆者の方もご利用できます。

* スクリプト: [narou-highlight-mistakable-letters.user.js](/../../raw/trunk/narou-highlight-mistakable-letters.user.js)
* スタイル: [narou-highlight-mistakable-letters.user.css](/../../raw/trunk/narou-highlight-mistakable-letters.user.css)

文字の装飾を変えたい場合は、各々スタイルを変更してください。

ダッシュ系の装飾について、初期設定は同じにしていますが別々に設定できます。

装飾対象:
* ひらがなの「へ」
* カタカナの「ニ」
* カタカナの「ヘ」
* 漢数字の「二」
* キリル文字の「М」「м」
* 音引き
* enダッシュ
* emダッシュ
* 水平線
* 罫線

テストページ:
* https://ncode.syosetu.com/n2343mg/9/

## narou-squeeze-blank

小説家になろう本文の、多すぎる空行を削除します。

空行が45%を超えている場合を、多すぎるとしています。

* スクリプト: [narou-squeeze-blank.user.js](/../../raw/trunk/narou-squeeze-blank.user.js)
* スタイル: [narou-squeeze-blank.user.css](/../../raw/trunk/narou-squeeze-blank.user.css)

スタイルには、なろうの行間を広げる設定も追加してあります。

## narou-link-to-report

小説家になろう本文の各行に、誤字報告ページのその行へのリンクを追加します。

誤字を見つけた際に、「一番下へスクロールしての誤字報告リンクへ飛んでから、誤字のある行を探す」手間が省けます。

また、作者側の誤字報告の画面に、「自分で誤字報告」「エピソードを編集」ボタンを追加します。

提案された変更とは違う直し方をしたい場合に使います。

* スクリプト: [narou-link-to-report.user.js](/../../raw/trunk/narou-link-to-report.user.js)
* スタイル: [narou-link-to-report.user.css](/../../raw/trunk/narou-link-to-report.user.css)

ログイン中のみリンクを表示します。

空行・序文・後書きは誤字報告対象外のようなのでリンク作成の対象外です。

## narou-line-number

小説家になろう本文の各行に、行番号を表示します。
誤字のある行番号をメモするのに使えるかも？

* スクリプト: なし
* スタイル: [narou-line-number.user.css](/../../raw/trunk/narou-line-number.user.css)

## narou-subtitle-in-window

ウィンドウタイトルを、エピソードタイトルを先にしたものに変更します。

* スクリプト: [narou-subtitle-in-window.user.js](/../../raw/trunk/narou-subtitle-in-window.user.js)
* スタイル: なし

## syosetu-keyboard-navi

左と右の方向キー・hキーlキーで一頁戻ったり進んだりします。

* スクリプト: [syosetu-keyboard-navi.user.js](/../../raw/trunk/syosetu-keyboard-navi.user.js)
* スタイル: なし
