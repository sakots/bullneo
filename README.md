# BULLNEO

BULLNEO（ぶるねお）は、ふたばちゃんねるの投稿フォームに `neo/dist/neo.js` を後付けで読み込み、描いた内容を PNG として添付欄へ戻すためのスクリプトです。

## 使い方

`bullneo.js` を HTTP(S) で置いて、ブックマークレットから読み込みます。

```javascript
javascript:(()=>{const u='https://example.com/bullneo.js';const s=document.createElement('script');s.src=u+'?'+Date.now();document.body.appendChild(s)})()
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

起動すると投稿フォームの近くに `BULLNEO` ボタンを追加し、NEO の編集画面を開きます。`画像に反映` を押すと描いた絵が PNG になって添付ファイル欄へ入るので、そのまま通常どおり投稿できます。

## 実装方針

- `neo/dist/neo.js` 自体は変更せず、外側から読み込んで起動しています。
- 投稿は PaintBBS 互換送信ではなく、ふたばの通常の添付ファイル投稿に戻しています。
- そのため、ふたばの「手書きjs」的な後付けクライアント改造として使えます。

## 更新履歴

### 2026/04/08

- 生やした
