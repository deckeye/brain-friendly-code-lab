---
layout: default
title: IME入力時の文字分身問題と解決策
---
{% raw %}

# 🔧 IME入力時の「文字分身」問題と解決策

## 🐛 問題: 日本語入力モードで文字が分身する

### 症状

```
ユーザーが「いんぶ」と入力
    ↓
IMEで「INV」に変換
    ↓
画面に「IINNVV」と表示される ❌
```

**原因:**
- `input`イベントはIME変換中にも発火する
- 変換中に値を書き換えると、IMEの動作と干渉する
- 結果として文字が重複する

---

## 🎯 解決策: IME Composition Events を使用

### Composition Events とは？

JavaScriptには、IME入力を検出する3つのイベントがあります：

```javascript
// IME変換開始
input.addEventListener('compositionstart', (e) => {
    console.log('変換開始:', e.data);
});

// IME変換中（文字が変わるたび）
input.addEventListener('compositionupdate', (e) => {
    console.log('変換中:', e.data);
});

// IME変換確定
input.addEventListener('compositionend', (e) => {
    console.log('変換確定:', e.data);
});
```

---

## ✅ 修正版の実装

### Before: 問題のあるコード

```javascript
input.addEventListener('input', (e) => {
    const field = e.target.id;
    let value = e.target.value;
    
    // 自動修正を適用
    value = applyAutoCorrection(field, value);
    
    // ❌ IME変換中でも値を書き換えてしまう
    e.target.value = value;
    
    formData[field] = value;
});
```

**問題点:**
- IME変換中にも`input`イベントが発火
- 変換中に値を書き換えるとIMEが混乱
- 文字が重複する

---

### After: 修正版コード

```javascript
input.addEventListener('input', (e) => {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        // IME入力中フラグ
        let isComposing = false;
        
        // IME変換開始
        input.addEventListener('compositionstart', () => {
            isComposing = true;
            console.log('IME変換開始');
        });
        
        // IME変換終了
        input.addEventListener('compositionend', (e) => {
            isComposing = false;
            console.log('IME変換確定');
            // ✅ 変換確定後に自動修正を適用
            handleInput(e);
        });
        
        // 通常の入力イベント
        input.addEventListener('input', (e) => {
            // ✅ IME変換中はスキップ
            if (isComposing) {
                console.log('IME変換中 → スキップ');
                return;
            }
            handleInput(e);
        });
        
        // 入力処理（自動修正を適用）
        function handleInput(e) {
            const field = e.target.id;
            let value = e.target.value;
            
            // 自動修正を適用
            const correctedValue = applyAutoCorrection(field, value);
            
            // 修正後の値を設定
            if (e.target.value !== correctedValue) {
                const cursorPos = e.target.selectionStart;
                e.target.value = correctedValue;
                
                // カーソル位置を調整
                const diff = correctedValue.length - value.length;
                e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
            }
            
            formData[field] = correctedValue;
            validateField(field, correctedValue);
        }
    });
});
```

---

## 🔍 動作の流れ

### ケース1: 英数字の直接入力（半角モード）

```
ユーザーが「inv」と入力
    ↓
input イベント発火（isComposing = false）
    ↓
handleInput() 実行
    ↓
「INV」に自動修正 ✅
```

### ケース2: 日本語IME入力

```
1. ユーザーが「いんぶ」と入力
    ↓
   compositionstart 発火（isComposing = true）
    ↓
2. IME変換候補が表示される
   input イベント発火 → スキップ（isComposing = true）✅
    ↓
3. ユーザーが「INV」を選択してEnter
    ↓
   compositionend 発火（isComposing = false）
    ↓
   handleInput() 実行
    ↓
   「INV」に自動修正（大文字化） ✅
```

### ケース3: 全角数字の入力（日本語モード）

```
1. ユーザーが「１２３４」と入力
    ↓
   compositionstart 発火（isComposing = true）
    ↓
2. 変換候補が表示される
   input イベント発火 → スキップ ✅
    ↓
3. Enterで確定
    ↓
   compositionend 発火（isComposing = false）
    ↓
   handleInput() 実行
    ↓
   「1234」に自動修正（半角化） ✅
```

---

## 💡 重要なポイント

### 1. `isComposing` フラグを使う

```javascript
let isComposing = false;

input.addEventListener('compositionstart', () => {
    isComposing = true; // IME変換開始
});

input.addEventListener('compositionend', () => {
    isComposing = false; // IME変換終了
});

input.addEventListener('input', (e) => {
    if (isComposing) {
        return; // IME変換中はスキップ
    }
    // 通常の処理
});
```

### 2. `compositionend`でも処理を呼ぶ

```javascript
input.addEventListener('compositionend', (e) => {
    isComposing = false;
    handleInput(e); // ← これを忘れずに！
});
```

**理由:**
- `compositionend`の後、`input`イベントが発火しないブラウザがある
- 確実に処理するため、`compositionend`でも呼ぶ

### 3. カーソル位置の調整

```javascript
// 文字数の変化を計算
const diff = correctedValue.length - value.length;

// カーソル位置を調整
e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
```

**例:**
```
入力: 「１２３４」（4文字）→ 修正: 「1234」（4文字）
diff = 4 - 4 = 0

入力: 「¥1,234」（6文字）→ 修正: 「1234」（4文字）
diff = 4 - 6 = -2
cursorPos = 6 → 調整後 = 4
```

---

## 🧪 テストケース

### テスト1: 日本語IMEで英字入力

```
入力: 「いんぶ」→「INV」と変換
期待結果: 「INV」（重複なし） ✅
```

### テスト2: 日本語IMEで数字入力

```
入力: 「１２３４５６７」と入力して確定
期待結果: 「1234567」（半角に自動変換） ✅
```

### テスト3: 直接入力（半角モード）

```
入力: 「inv-2025」
期待結果: 「INV-2025」（即座に大文字化） ✅
```

### テスト4: 全角カナ入力

```
入力: 「カブシキガイシャサンプル」と入力
期待結果: そのまま保持（会社名は自動修正しない） ✅
```

---

## 🌏 ブラウザ互換性

### Composition Events のサポート

| ブラウザ | サポート | バージョン |
|---|---|---|
| Chrome | ✅ 完全サポート | 1+ |
| Firefox | ✅ 完全サポート | 9+ |
| Safari | ✅ 完全サポート | 5+ |
| Edge | ✅ 完全サポート | 12+ |
| IE | ⚠️ 部分サポート | 9+ |

**注意:** IE9-11では一部動作が異なる場合がありますが、基本的な動作は問題ありません。

---

## 📚 関連情報

### MDN ドキュメント

1. **CompositionEvent**
   - https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent

2. **compositionstart**
   - https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event

3. **compositionend**
   - https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event

### 参考記事

1. **「IME入力時のバリデーション問題」**
   - JavaScript IME対応の実装パターン

2. **「日本語入力とJavaScript」**
   - IME Composition Eventsの詳細解説

---

## 🎯 他の言語のIME

### 中国語（簡体字・繁体字）

```javascript
// 中国語のピンイン入力でも同じ問題が発生
// 例: 「zhongguo」→「中国」
// 同じ解決策が有効 ✅
```

### 韓国語（ハングル）

```javascript
// ハングル入力でも同じ問題が発生
// 例: 「annyeong」→「안녕」
// 同じ解決策が有効 ✅
```

### ベトナム語

```javascript
// 声調記号の入力でも同じ問題が発生
// 同じ解決策が有効 ✅
```

---

## 💡 ベストプラクティス

### 1. 常にIME対応を考慮する

```javascript
// ❌ 悪い例
input.addEventListener('input', (e) => {
    e.target.value = format(e.target.value);
});

// ✅ 良い例
let isComposing = false;

input.addEventListener('compositionstart', () => {
    isComposing = true;
});

input.addEventListener('compositionend', (e) => {
    isComposing = false;
    handleInput(e);
});

input.addEventListener('input', (e) => {
    if (isComposing) return;
    handleInput(e);
});
```

### 2. フラグは各inputごとに管理

```javascript
// ✅ 良い例: 各inputごとにフラグを持つ
inputs.forEach(input => {
    let isComposing = false; // ← inputごとに独立
    
    input.addEventListener('compositionstart', () => {
        isComposing = true;
    });
    // ...
});

// ❌ 悪い例: グローバルフラグを共有
let isComposing = false; // ← 複数inputで共有すると問題
```

### 3. デバッグログを残す

```javascript
input.addEventListener('compositionstart', () => {
    isComposing = true;
    console.log('[IME] 変換開始');
});

input.addEventListener('compositionend', (e) => {
    isComposing = false;
    console.log('[IME] 変換確定:', e.data);
});

input.addEventListener('input', (e) => {
    if (isComposing) {
        console.log('[IME] 変換中 → スキップ');
        return;
    }
    console.log('[Input] 通常処理:', e.target.value);
});
```

---

## 🎊 まとめ

### 問題

- IME入力中に値を書き換えると文字が重複する
- 日本語・中国語・韓国語などで発生

### 解決策

- `compositionstart`、`compositionend`イベントを使用
- IME変換中は自動修正をスキップ
- 変換確定後に自動修正を適用

### 実装のポイント

1. ✅ `isComposing`フラグで変換中を検出
2. ✅ `compositionend`でも`handleInput`を呼ぶ
3. ✅ カーソル位置を適切に調整
4. ✅ 各inputごとにフラグを管理

---

**最終更新: 2025年12月25日**
**作成者: Brain-Friendly Code Lab**

{% endraw %}
