# BULLNEO

BULLNEO（ぶるねお）は、ふたばちゃんねるの投稿フォームに `neo/dist/neo.js` を後付けで読み込み、描いた内容を PNG として添付欄へ戻すためのスクリプトです。

## 使い方

`bullneo.js` を HTTP(S) で置いて、`can.php` と同じ流儀のブックマークレットから読み込みます。`example.com` は実際に配置したホスト名へ置き換えてください。

```javascript
javascript:(function(d){if(location.protocol==='chrome-error:'){alert('壊れたフレーム上では実行できません');return;}var s=d.createElement('script');s.src='https://example.com/bullneo.js?'+Math.floor(Date.now()/36e5)*36e5;(d.head||d.body||d.documentElement).appendChild(s)})(document)
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

## 実装方針

- `neo/dist/neo.js` 自体は変更せず、外側から読み込んで起動しています。
- 投稿は PaintBBS 互換送信ではなく、ふたばの通常の添付ファイル投稿に戻しています。
- そのため、ふたばの「手書きjs」的な後付けクライアント改造として使えます。

## 更新履歴

### 2026/04/08

- 生やした
