# BULLNEO

BULLNEO（ぶるねお）は、ふたばちゃんねるの投稿フォームに `neo/dist/neo.js` を後付けで読み込み、描いた内容を PNG として添付欄へ戻すためのスクリプトです。

## 使い方

ブックマークレットとして次で使うことができます。
chromeなら、ブックマークバーに「ページを追加」で、URLを以下のjavascriptにしてください。

```javascript
javascript:(function(){var d=document,s=d.createElement('script');s.charset='UTF-8';s.src='https://neo.sakots.net/bullneo.js?bullneo_debug=1&v='+Date.now();(d.head||d.documentElement).appendChild(s)})()
```

## 開発

`bullneo.js` を HTTP(S) で置いて、`can.php` と同じ流儀のブックマークレットから読み込みます。`example.com` は実際に配置したホスト名へ置き換えてください。

```javascript
javascript:(function(){var d=document,s=d.createElement('script');s.charset='UTF-8';s.src='https://example.com/bullneo.js?bullneo_debug=1&v='+Date.now();(d.head||d.documentElement).appendChild(s)})()
```

`bullneo.js` は同じ場所から相対パスで `neo/dist/neo.js` と `neo/dist/neo.css` を読むので、次のように配置してください。

```text
/
  bullneo.js
  neo/
    dist/
      neo.js
      neo.css
```

ブックマークレットを実行すると、投稿フォームの近くに `手書き(NEO)` リンクを追加します。リンクを押すと NEO の編集画面を開き、`画像に反映` を押すと描いた絵が PNG になって添付ファイル欄へ入るので、そのまま通常どおり投稿できます。

`https://jun.2chan.net/oe/futaba.htm` のようにフォームが後から差し替わる板でも、添付欄つきフォームを監視して `手書き(NEO)` を再設置します。

## 更新履歴

### 2026/04/08

- 生やした
