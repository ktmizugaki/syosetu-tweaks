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

## narou-squeeze-blank

小説家になろう本文の、多すぎる空行を削除します。

空行が45%を超えている場合を、多すぎるとしています。

* スクリプト: [narou-squeeze-blank.user.js](/../../raw/trunk/narou-squeeze-blank.user.js)
* スタイル: [narou-squeeze-blank.user.css](/../../raw/trunk/narou-squeeze-blank.user.css)

スタイルには、なろうの行間を広げる設定も追加してあります。
