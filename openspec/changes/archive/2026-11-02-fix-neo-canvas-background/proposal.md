# Proposal

## Why

NEO 1.8系でキャンバスの背景が白になるとの報告がある。現在のBULLNEOの背景色定数も要求色と異なるため、ふたばのお絵かきデフォルト色 `#f1e0d8` に表示とPNG出力を統一する。

## What Changes

- キャンバスの背景色を `#f1e0d8` に変更する。
- NEO 1.8系の初期化と描画APIに合わせ、初期化後の表示とPNG出力へ背景色が確実に適用されるよう修正する。
- 背景色の画素を検証する回帰テストを追加し、配布用JavaScriptと更新履歴を更新する。
- パレットの色、エディター外側のUI配色、NEO配信元は変更しない。

## Capabilities

### New Capabilities

- `canvas-background`: 編集キャンバスと書き出し画像の背景色を管理する。

### Modified Capabilities

なし。既存のOpenSpec仕様は未登録。

## Impact

- `src/bullneo.ts` の背景色定数、NEO初期化、背景合成処理。
- 生成物 `bullneo.js`、動作確認用ページ、背景色の回帰テスト。
- `README.md`、`changelog.md`。
