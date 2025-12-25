---
layout: default
title: PDF閲覧しながらデータ入力するWEBアプリの設計
---
{% raw %}

# 📄 PDF閲覧しながらデータ入力するWEBアプリの設計

## 🎯 課題認識

PDF書類を見ながらデータを入力する作業は、**認知負荷が極めて高い**業務です。

### なぜ認知負荷が高いのか？

```
1. 視線移動の頻発
   PDF → フォーム → PDF → フォーム...
   ↓
   ワーキングメモリを消費

2. 情報の一時記憶
   「えーと、金額は...1,250,000円だったな」
   ↓
   記憶違いのリスク

3. 画面切り替えのストレス
   PDF表示 ⇔ 入力画面
   ↓
   集中力の分散

4. 入力ミスの不安
   「さっき入力した会社名、合ってたかな？」
   ↓
   確認のための往復作業
```

---

## 💡 3つのレイアウト戦略

### 比較表

| レイアウト | デバイス | 認知負荷 | 使いやすさ | 推奨用途 |
|---|---|---|---|---|
| **左右分割** | PC | ⭐⭐⭐⭐⭐ 最小 | ⭐⭐⭐⭐⭐ | 大量入力作業 |
| **タブ切り替え** | PC/タブレット | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐☆ | 少量入力、確認重視 |
| **オーバーレイ** | スマホ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐⭐ | モバイル専用 |

---

## 🖥️ レイアウト1: 左右分割（PC推奨）

### 概要

```
┌─────────────────────────────────────┐
│ [進捗バー]                          │
├──────────────────┬──────────────────┤
│                  │                  │
│   PDF表示        │   入力フォーム   │
│                  │                  │
│   - 請求書       │   - 会社名       │
│   - 明細         │   - 請求番号     │
│   - 金額         │   - 日付         │
│                  │   - 金額         │
│                  │                  │
└──────────────────┴──────────────────┘
```

### メリット

✅ **視線移動が最小**
- PDF→フォームの距離が短い
- 両方が同時に見える
- ワーキングメモリの負担が最小

✅ **入力効率が最高**
- PDFを見ながら入力できる
- 確認のための画面切り替え不要
- 大量の書類処理に最適

✅ **誤入力防止**
- すぐに確認できる
- 転記ミスに気づきやすい

### デメリット

⚠️ 画面が狭いと両方が小さくなる
⚠️ スマホでは実質的に使えない

### 実装ポイント

```css
/* 左右分割レイアウト */
.layout-split {
    display: grid;
    grid-template-columns: 1fr 1fr; /* 均等に分割 */
    gap: 0;
}

.pdf-viewer {
    border-right: 1px solid var(--border);
    overflow-y: auto;
}

.form-area {
    overflow-y: auto;
}

/* レスポンシブ: タブレット以下では縦に */
@media (max-width: 1024px) {
    .layout-split {
        grid-template-columns: 1fr;
    }
}
```

### 最適な使用シーン

- 経理部門の請求書入力
- 人事部門の履歴書データ化
- 契約書のデータベース登録
- **長時間の連続入力作業**

### 認知負荷軽減のポイント

1. **固定ヘッダー**
   - 進捗バーを常に表示
   - 「あとどれくらい？」の不安を軽減

2. **同期スクロール（オプション）**
   - PDFとフォームを連動させる
   - 該当箇所を自動ハイライト

3. **エラー箇所の対応表示**
   - フォームでエラーが出たら
   - PDF上の該当箇所も強調表示

---

## 📱 レイアウト2: タブ切り替え（PC/タブレット推奨）

### 概要

```
┌─────────────────────────────────────┐
│ [進捗バー]                          │
├─────────────────────────────────────┤
│ [📄 PDFを見る] [✏️ 入力する]       │
├─────────────────────────────────────┤
│                                     │
│   現在のタブの内容を表示            │
│                                     │
│   PDF表示タブ                       │
│   または                            │
│   入力フォームタブ                  │
│                                     │
└─────────────────────────────────────┘
```

### メリット

✅ **画面を広く使える**
- 一方に集中できる
- 小さい画面でも見やすい

✅ **確認→入力の流れが明確**
- まずPDFで内容確認
- 次にフォームで入力
- ワークフローが分かりやすい

✅ **タッチ操作に最適**
- タブレットで使いやすい
- 大きなタッチ領域

### デメリット

⚠️ 画面切り替えが必要
⚠️ PDFを見ながら入力できない
⚠️ ワーキングメモリの負担が増加

### 実装ポイント

```javascript
// タブ切り替えの実装
function initTabs() {
    const headers = document.querySelectorAll('.tab-header');
    const contents = document.querySelectorAll('.tab-content');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const tab = header.dataset.tab;
            
            // すべて非アクティブに
            headers.forEach(h => h.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // 選択されたタブをアクティブに
            header.classList.add('active');
            document.querySelector(`.tab-content[data-tab="${tab}"]`)
                .classList.add('active');
        });
    });
}
```

### 認知負荷軽減のポイント

1. **タブの状態表示**
   ```
   [📄 PDFを見る ✓] [✏️ 入力する (3/6)]
   ```
   - 入力済みフィールド数を表示
   - 完了状況が一目で分かる

2. **スマートなタブ切り替え**
   - フィールド入力後、自動でPDFタブに戻る（オプション）
   - 「確認→入力」のリズムをサポート

3. **前回入力値の表示**
   - PDFタブに入力済み値を薄く表示
   - 「さっき何入れたっけ？」を防ぐ

---

## 🎯 レイアウト3: オーバーレイ（スマホ最適）

### 概要

```
┌─────────────────────────────────────┐
│                                     │
│   PDF表示（全画面）                 │
│                                     │
│                                     │
│                                     │
│                                     │
│                            [✏️]     │ ← FAB
└─────────────────────────────────────┘

ボタンをタップ ↓

┌─────────────────────────────────────┐
│   PDF表示（背景）                   │
├─────────────────────────────────────┤
│                                     │
│   入力フォーム（オーバーレイ）      │
│                                     │
│   - 会社名                          │
│   - 請求番号                        │
│                            [✕]     │
└─────────────────────────────────────┘
```

### メリット

✅ **スマホで最高のUX**
- PDF閲覧を邪魔しない
- 入力時は全画面使える
- ジェスチャー操作が直感的

✅ **コンテキストを保持**
- PDFの表示位置を維持
- フォームを閉じても元の場所に戻る

✅ **モダンなUI**
- FAB（Floating Action Button）
- ボトムシート
- ネイティブアプリ風

### デメリット

⚠️ 完全に切り替わるため、PDFを見ながら入力できない
⚠️ PC/大画面では不向き

### 実装ポイント

```css
/* オーバーレイフォーム */
.overlay-form {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
    transform: translateY(100%); /* 初期状態は画面外 */
    transition: transform 0.3s ease;
    z-index: 99;
    max-height: 70vh; /* 画面の70%まで */
    overflow-y: auto;
}

.overlay-form.active {
    transform: translateY(0); /* スライドイン */
}

/* FABボタン */
.overlay-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    z-index: 100;
}
```

### 認知負荷軽減のポイント

1. **スワイプジェスチャー**
   - 下スワイプでフォームを閉じる
   - 上スワイプでフォームを開く
   - 直感的な操作

2. **スマート入力補助**
   - キーボード表示を最適化
   - 数字フィールドはテンキー
   - 日付フィールドはカレンダー

3. **入力済みフィールドの可視化**
   ```
   [✏️ 入力する (3/6完了)]
   ```
   - FABに進捗を表示
   - 残りタスクが分かる

---

## 🧠 認知負荷軽減の共通設計

### 1. 進捗バーの常時表示

**なぜ重要？**
- 「あとどれくらい？」の不安を軽減
- モチベーション維持
- ゴールの可視化

**実装例:**

```html
<div class="progress-container">
    <div class="progress-bar-wrapper">
        <div class="progress-bar" style="width: 50%"></div>
    </div>
    <div class="progress-text">
        入力済み: 3/6 フィールド（50%）
    </div>
</div>
```

**デザインのポイント:**
```css
.progress-bar {
    background: linear-gradient(90deg, 
        var(--primary), 
        var(--success)
    ); /* 進むほど緑に */
    transition: width 0.3s ease; /* スムーズなアニメーション */
}
```

---

### 2. 自動保存と復元

**なぜ重要？**
- 入力中断に強い
- 「保存し忘れた！」の不安がゼロ
- ブラウザを閉じても大丈夫

**実装例:**

```javascript
// 5秒ごとに自動保存
setInterval(() => {
    const hasData = Object.values(formData).some(v => v);
    if (hasData) {
        localStorage.setItem('pdfFormData', JSON.stringify(formData));
        showAutosaveIndicator(); // 「💾 保存しました」
    }
}, 5000);

// ページ読み込み時に復元
const savedData = localStorage.getItem('pdfFormData');
if (savedData) {
    formData = JSON.parse(savedData);
    // フォームに値を復元
}
```

**UXの工夫:**
```javascript
function showAutosaveIndicator() {
    const indicator = document.getElementById('autosaveIndicator');
    indicator.classList.add('show'); // フェードイン
    
    setTimeout(() => {
        indicator.classList.remove('show'); // 2秒後にフェードアウト
    }, 2000);
}
```

---

### 3. リアルタイムバリデーション

**なぜ重要？**
- エラーの早期発見
- 「送信ボタンを押したらエラー」を防ぐ
- 入力中に気づける

**実装例:**

```javascript
input.addEventListener('input', (e) => {
    const field = e.target.id;
    const value = e.target.value;
    
    validateField(field, value);
});

function validateField(field, value) {
    const errorEl = document.getElementById(`${field}-error`);
    const successEl = document.getElementById(`${field}-success`);
    
    if (field === 'invoiceNumber') {
        if (!/^[A-Z]+-\d+-\d+$/.test(value)) {
            errorEl.textContent = '⚠️ 形式が正しくありません（例: INV-2025-001）';
            errorEl.classList.add('show');
            inputEl.classList.add('invalid');
        } else {
            successEl.textContent = '✓ 正しい形式です';
            successEl.classList.add('show');
            inputEl.classList.add('valid');
        }
    }
}
```

**CLS対策（重要！）:**
```css
/* エラーメッセージ用のスペースを事前確保 */
.error-message,
.success-message {
    min-height: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s;
}

.error-message.show,
.success-message.show {
    opacity: 1;
}
```

---

### 4. 入力ヒントとツールチップ

**なぜ重要？**
- 入力形式が分かる
- 迷わない
- PDFと画面を往復しなくていい

**実装例:**

```html
<label class="form-label">
    請求書番号 <span class="required">*</span>
    <span class="tooltip">
        <span class="tooltip-icon">?</span>
        <span class="tooltip-content">
            PDFに記載されている番号を入力
            <br>例: INV-2025-001
        </span>
    </span>
</label>
<input 
    type="text" 
    placeholder="例: INV-2025-001"
>
<div class="hint-message show">
    💡 アルファベット-数字-数字の形式で入力
</div>
```

---

### 5. スマート入力補完

**なぜ重要？**
- 入力速度が上がる
- タイプミスが減る
- 過去の入力から学習

**実装例:**

```javascript
// 過去の入力履歴から補完候補を表示
const pastCompanies = JSON.parse(
    localStorage.getItem('companyHistory') || '[]'
);

// オートコンプリート
<datalist id="companyList">
    ${pastCompanies.map(c => `<option value="${c}">`).join('')}
</datalist>

<input 
    list="companyList" 
    id="companyName"
>
```

---

## 📊 レイアウト選択のフローチャート

```
デバイスは？
├─ PC/大画面
│  └─ 入力量は？
│      ├─ 大量（10件以上/日）
│      │  └─ ✅ 左右分割レイアウト
│      │
│      └─ 少量（1-5件/日）
│          └─ ✅ タブ切り替えレイアウト
│
└─ タブレット
   └─ 画面向きは？
       ├─ 横向き
       │  └─ ✅ 左右分割レイアウト
       │
       └─ 縦向き
           └─ ✅ タブ切り替えレイアウト

└─ スマホ
   └─ ✅ オーバーレイレイアウト
```

---

## 🎯 パフォーマンス目標

### Core Web Vitals

| 指標 | 目標値 | 理由 |
|---|---|---|
| **CLS** | < 0.05 | 業務アプリなので最厳格 |
| **LCP** | < 2.5秒 | PDFロードが遅いとストレス |
| **INP** | < 100ms | 入力の快適性に直結 |

### 追加指標

| 指標 | 目標値 | 測定方法 |
|---|---|---|
| **入力完了率** | > 95% | フォーム送信数 / 開始数 |
| **平均入力時間** | < 3分 | 開始から送信まで |
| **エラー率** | < 5% | エラー発生フィールド / 全フィールド |
| **離脱率** | < 10% | 途中離脱 / 開始数 |

---

## 💡 実装のベストプラクティス

### 1. レスポンシブ自動切り替え

```javascript
// 画面サイズに応じて最適レイアウトを自動選択
function selectOptimalLayout() {
    const width = window.innerWidth;
    
    if (width >= 1024) {
        return 'split'; // PC: 左右分割
    } else if (width >= 768) {
        return 'tabs'; // タブレット: タブ切り替え
    } else {
        return 'overlay'; // スマホ: オーバーレイ
    }
}

// リサイズ時に自動切り替え
window.addEventListener('resize', () => {
    const optimalLayout = selectOptimalLayout();
    if (optimalLayout !== currentLayout) {
        renderLayout(optimalLayout);
    }
});
```

### 2. キーボードショートカット

```javascript
// タブ切り替えをキーボードで
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && e.ctrlKey) {
        e.preventDefault();
        switchTab(); // Ctrl + Tab で切り替え
    }
    
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        submitForm(); // Ctrl + Enter で送信
    }
});
```

### 3. PDFハイライト連動

```javascript
// フォーカスしたフィールドに対応するPDF箇所をハイライト
input.addEventListener('focus', (e) => {
    const field = e.target.id;
    highlightPDFField(field);
});

function highlightPDFField(field) {
    // PDF上の対応する箇所を黄色でハイライト
    const pdfElement = document.querySelector(`[data-field="${field}"]`);
    pdfElement.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
}
```

---

## 📈 期待される効果

### ビフォー・アフター比較

| 指標 | Before | After | 改善率 |
|---|---|---|---|
| 平均入力時間 | 5分 | 3分 | **-40%** |
| 入力エラー率 | 15% | 5% | **-67%** |
| 完了率 | 75% | 95% | **+27%** |
| ユーザー満足度 | 3.2/5.0 | 4.6/5.0 | **+44%** |

### ビジネスインパクト

```
入力時間短縮: 2分 × 100件/日 × 20日 = 約67時間/月
↓
人件費削減: 約10万円/月
```

---

## 🎊 まとめ

### 最重要ポイント

1. **デバイスに応じたレイアウト選択**
   - PC: 左右分割
   - タブレット: タブ切り替え
   - スマホ: オーバーレイ

2. **認知負荷の最小化**
   - 進捗バー常時表示
   - 自動保存
   - リアルタイムバリデーション

3. **CLS対策の徹底**
   - エラーメッセージ用スペース事前確保
   - `opacity`でフェードイン/アウト
   - レイアウトシフトゼロ

4. **継続的な改善**
   - ユーザーテスト
   - アナリティクス分析
   - フィードバック収集

---

**デモURL:**
- https://deckeye.github.io/brain-friendly-code-lab/demo-pdf-input.html

**最終更新: 2025年12月25日**
**作成者: Brain-Friendly Code Lab**

{% endraw %}
