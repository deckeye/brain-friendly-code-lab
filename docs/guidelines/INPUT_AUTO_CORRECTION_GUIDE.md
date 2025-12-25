---
layout: default
title: 入力自動修正・自動整形の完全ガイド
---
{% raw %}

# 📝 入力自動修正・自動整形の完全ガイド

## 🎯 なぜ自動修正が重要か？

### ユーザーの認知負荷を最小化

```
ユーザーが入力 → システムが自動で修正 → ユーザーは確認するだけ
```

**効果:**
- 入力ミスが減る
- 入力速度が上がる
- ストレスが減る
- 完了率が上がる

---

## 📊 自動修正のパターン一覧

### 1. 全角・半角の自動変換

#### パターン1-1: 数字（全角→半角）

**入力:** `１２３４５`  
**自動修正:** `12345`

```javascript
function toHalfWidthNumber(str) {
    return str.replace(/[０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

// 使用例
const input = "金額：１２３４５";
const result = toHalfWidthNumber(input); // "金額：12345"
```

**適用場面:**
- 金額入力
- 郵便番号
- 電話番号
- 数量

#### パターン1-2: 英字（全角→半角）

**入力:** `ＡＢＣ－０１`  
**自動修正:** `ABC-01`

```javascript
function toHalfWidthAlpha(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

// 使用例
const input = "請求書番号：ＩＮＶ－２０２５";
const result = toHalfWidthAlpha(input); // "請求書番号：INV-2025"
```

**適用場面:**
- 請求書番号
- 品番
- コード入力

#### パターン1-3: カナ（半角→全角）

**入力:** `ﾔﾏﾀﾞ ﾀﾛｳ`  
**自動修正:** `ヤマダ タロウ`

```javascript
function toFullWidthKana(str) {
    const kanaMap = {
        'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
        'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
        'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
        'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
        'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
        'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
        '｡': '。', '｢': '「', '｣': '」', '､': '、', '･': '・',
        'ｰ': 'ー', 'ﾞ': '゛', 'ﾟ': '゜'
    };
    
    let result = str;
    // 濁点・半濁点付き文字を先に変換
    Object.keys(kanaMap).forEach(key => {
        if (key.length > 1) {
            result = result.split(key).join(kanaMap[key]);
        }
    });
    // 残りの文字を変換
    Object.keys(kanaMap).forEach(key => {
        if (key.length === 1) {
            result = result.split(key).join(kanaMap[key]);
        }
    });
    
    return result;
}

// 使用例
const input = "氏名：ﾔﾏﾀﾞ ﾀﾛｳ";
const result = toFullWidthKana(input); // "氏名：ヤマダ タロウ"
```

**適用場面:**
- 氏名（カナ）
- 住所（カナ）
- フリガナ

---

### 2. 区切り文字の自動削除・追加

#### パターン2-1: ハイフン・カンマの削除

**入力:** `123-4567` または `1,234,567`  
**自動修正:** `1234567`

```javascript
function removeSeparators(str) {
    return str.replace(/[-,]/g, '');
}

// 使用例
const postalCode = "123-4567";
const amount = "1,234,567";
console.log(removeSeparators(postalCode)); // "1234567"
console.log(removeSeparators(amount)); // "1234567"
```

**適用場面:**
- 郵便番号
- 電話番号
- 金額（データベース保存時）

#### パターン2-2: 電話番号の自動整形

**入力:** `09012345678` または `090-1234-5678`  
**自動修正:** `090-1234-5678`

```javascript
function formatPhoneNumber(str) {
    // ハイフンを削除
    const cleaned = str.replace(/\D/g, '');
    
    // 携帯電話（11桁）
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    // 固定電話（10桁）
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
        return cleaned.replace(/(\d{2,4})(\d{2,4})(\d{4})/, '$1-$2-$3');
    }
    
    return cleaned;
}

// 使用例
console.log(formatPhoneNumber("09012345678")); // "090-1234-5678"
console.log(formatPhoneNumber("0312345678")); // "03-1234-5678"
console.log(formatPhoneNumber("090-1234-5678")); // "090-1234-5678"
```

**適用場面:**
- 電話番号入力
- FAX番号入力

#### パターン2-3: 郵便番号の自動整形

**入力:** `1234567` または `123-4567`  
**自動修正:** `123-4567`

```javascript
function formatPostalCode(str) {
    const cleaned = str.replace(/\D/g, '');
    
    if (cleaned.length === 7) {
        return cleaned.replace(/(\d{3})(\d{4})/, '$1-$2');
    }
    
    return cleaned;
}

// 使用例
console.log(formatPostalCode("1234567")); // "123-4567"
console.log(formatPostalCode("123-4567")); // "123-4567"
```

**適用場面:**
- 郵便番号入力

#### パターン2-4: クレジットカード番号の整形

**入力:** `1234567812345678`  
**自動修正:** `1234 5678 1234 5678`

```javascript
function formatCreditCard(str) {
    const cleaned = str.replace(/\D/g, '');
    
    if (cleaned.length <= 16) {
        return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    return cleaned;
}

// 使用例
console.log(formatCreditCard("1234567812345678")); 
// "1234 5678 1234 5678"
```

**適用場面:**
- クレジットカード番号入力

---

### 3. 住所の自動整形

#### パターン3-1: 番地のハイフン表記変換

**入力:** `1-2-3` または `1丁目2番3号`  
**相互変換可能**

```javascript
// ハイフン → 丁目番号表記
function toChomeBango(str) {
    return str.replace(/(\d+)-(\d+)-(\d+)/, '$1丁目$2番$3号');
}

// 丁目番号表記 → ハイフン
function toHyphenAddress(str) {
    return str.replace(/(\d+)丁目(\d+)番(\d+)号/, '$1-$2-$3');
}

// 使用例
const address1 = "東京都渋谷区渋谷1-2-3";
const address2 = "東京都渋谷区渋谷1丁目2番3号";

console.log(toChomeBango(address1));
// "東京都渋谷区渋谷1丁目2番3号"

console.log(toHyphenAddress(address2));
// "東京都渋谷区渋谷1-2-3"
```

**適用場面:**
- 住所入力
- 配送先住所
- 請求書住所

#### パターン3-2: 建物名の整形

**入力:** `○○ビル 3F` または `○○ビル3階`  
**自動修正:** `○○ビル 3階`

```javascript
function formatBuildingFloor(str) {
    // F表記を階表記に
    return str.replace(/(\d+)F/gi, '$1階');
}

// 使用例
const building = "渋谷ヒカリエ 11F";
console.log(formatBuildingFloor(building)); // "渋谷ヒカリエ 11階"
```

**適用場面:**
- 住所入力（建物名）

---

### 4. 日付の自動整形

#### パターン4-1: スラッシュ区切りの日付

**入力:** `20251225` または `2025/12/25`  
**自動修正:** `2025-12-25`

```javascript
function formatDate(str) {
    // スラッシュ・ハイフンを削除
    const cleaned = str.replace(/[\/\-]/g, '');
    
    // YYYYMMDD形式（8桁）
    if (/^\d{8}$/.test(cleaned)) {
        const year = cleaned.substring(0, 4);
        const month = cleaned.substring(4, 6);
        const day = cleaned.substring(6, 8);
        return `${year}-${month}-${day}`;
    }
    
    return str;
}

// 使用例
console.log(formatDate("20251225")); // "2025-12-25"
console.log(formatDate("2025/12/25")); // "2025-12-25"
```

**適用場面:**
- 日付入力
- 生年月日入力

#### パターン4-2: 和暦→西暦変換

**入力:** `令和7年12月25日`  
**自動修正:** `2025-12-25`

```javascript
function warekiToSeireki(str) {
    const eraMap = {
        '令和': 2018,
        '平成': 1988,
        '昭和': 1925,
        '大正': 1911,
        '明治': 1867
    };
    
    const match = str.match(/(令和|平成|昭和|大正|明治)(\d+)年(\d+)月(\d+)日/);
    
    if (match) {
        const era = match[1];
        const year = parseInt(match[2]);
        const month = match[3].padStart(2, '0');
        const day = match[4].padStart(2, '0');
        const seirekiYear = eraMap[era] + year;
        
        return `${seirekiYear}-${month}-${day}`;
    }
    
    return str;
}

// 使用例
console.log(warekiToSeireki("令和7年12月25日")); // "2025-12-25"
console.log(warekiToSeireki("平成31年4月30日")); // "2019-04-30"
```

**適用場面:**
- 生年月日入力
- 契約日入力

---

### 5. 金額の自動整形

#### パターン5-1: 3桁区切りカンマ

**入力:** `1234567`  
**自動修正（表示）:** `1,234,567`

```javascript
function formatCurrency(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 使用例
console.log(formatCurrency(1234567)); // "1,234,567"
console.log(formatCurrency(1234567.89)); // "1,234,567.89"
```

**適用場面:**
- 金額表示
- 売上入力

#### パターン5-2: 円マーク・カンマの自動削除

**入力:** `¥1,234,567`  
**自動修正（保存時）:** `1234567`

```javascript
function cleanCurrency(str) {
    return str.replace(/[¥,円]/g, '').trim();
}

// 使用例
console.log(cleanCurrency("¥1,234,567")); // "1234567"
console.log(cleanCurrency("1,234,567円")); // "1234567"
```

**適用場面:**
- 金額入力（データベース保存前）

---

### 6. メールアドレスの自動整形

#### パターン6-1: 全角→半角、スペース削除

**入力:** `　ｙａｍａｄａ＠ｅｘａｍｐｌｅ．ｃｏｍ　`  
**自動修正:** `yamada@example.com`

```javascript
function formatEmail(str) {
    // 全角→半角
    let result = str.replace(/[Ａ-Ｚａ-ｚ０-９＠．]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    
    // スペース削除
    result = result.replace(/\s/g, '');
    
    // 小文字に統一
    result = result.toLowerCase();
    
    return result;
}

// 使用例
const input = "　ＹＡＭＡＤＡ＠ＥＸＡＭＰＬＥ．ＣＯＭ　";
console.log(formatEmail(input)); // "yamada@example.com"
```

**適用場面:**
- メールアドレス入力

---

### 7. URLの自動整形

#### パターン7-1: プロトコルの自動追加

**入力:** `example.com`  
**自動修正:** `https://example.com`

```javascript
function formatURL(str) {
    let url = str.trim();
    
    // プロトコルがない場合は追加
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    
    return url;
}

// 使用例
console.log(formatURL("example.com")); // "https://example.com"
console.log(formatURL("http://example.com")); // "http://example.com"
```

**適用場面:**
- URLフィールド
- ウェブサイト入力

---

## 🎯 総合的な入力整形関数

```javascript
class InputFormatter {
    // 全角数字→半角
    static toHalfWidthNumber(str) {
        return str.replace(/[０-９]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
    }
    
    // 全角英字→半角
    static toHalfWidthAlpha(str) {
        return str.replace(/[Ａ-Ｚａ-ｚ]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
    }
    
    // 区切り文字削除
    static removeSeparators(str) {
        return str.replace(/[-\s,]/g, '');
    }
    
    // 郵便番号整形
    static formatPostalCode(str) {
        const cleaned = this.removeSeparators(this.toHalfWidthNumber(str));
        if (cleaned.length === 7) {
            return cleaned.replace(/(\d{3})(\d{4})/, '$1-$2');
        }
        return cleaned;
    }
    
    // 電話番号整形
    static formatPhoneNumber(str) {
        const cleaned = this.removeSeparators(this.toHalfWidthNumber(str));
        
        // 携帯電話（11桁）
        if (cleaned.length === 11 && cleaned.startsWith('0')) {
            return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        // 固定電話（10桁）
        if (cleaned.length === 10 && cleaned.startsWith('0')) {
            // 03/06など
            if (cleaned.startsWith('03') || cleaned.startsWith('06')) {
                return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
            }
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        
        return cleaned;
    }
    
    // 金額整形（表示用）
    static formatCurrency(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // 金額クリーン（保存用）
    static cleanCurrency(str) {
        return this.removeSeparators(this.toHalfWidthNumber(str.replace(/[¥円]/g, '')));
    }
    
    // メールアドレス整形
    static formatEmail(str) {
        let result = this.toHalfWidthAlpha(this.toHalfWidthNumber(str));
        result = result.replace(/＠/g, '@').replace(/\s/g, '');
        return result.toLowerCase();
    }
}

// 使用例
console.log(InputFormatter.formatPostalCode("１２３４５６７"));
// "123-4567"

console.log(InputFormatter.formatPhoneNumber("０９０１２３４５６７８"));
// "090-1234-5678"

console.log(InputFormatter.formatCurrency(1234567));
// "1,234,567"

console.log(InputFormatter.cleanCurrency("¥１，２３４，５６７"));
// "1234567"
```

---

## 📚 参考資料

### 📖 書籍

1. **「フォームデザイン 利用者を導くUI/UX」**
   - 著者: ルーク・ローブルウスキー
   - 出版社: ボーンデジタル
   - 内容: フォーム設計の決定版

2. **「ノンデザイナーズ・デザインブック」**
   - 著者: Robin Williams
   - 出版社: マイナビ出版
   - 内容: UIデザインの基本原則

3. **「だから、そのデザインはダメなんだ。」**
   - 著者: 香西睦
   - 出版社: エムディエヌコーポレーション
   - 内容: UIの良い例・悪い例

### 🌐 WEB記事・サイト

1. **UX MILK**
   - URL: https://uxmilk.jp/
   - 内容: エラーメッセージの配置、バリデーションのタイミング

2. **Baidu UX**
   - URL: https://baigie.me/
   - 内容: 入力フォームのエラーデザイン

3. **デジタル庁 ウェブアクセシビリティ導入ガイドブック**
   - URL: https://www.digital.go.jp/
   - 内容: フォームラベル、エラーメッセージ

### 🔧 ライブラリ

1. **Cleave.js**
   - URL: https://nosir.github.io/cleave.js/
   - 機能: 電話番号、クレジットカード、日付の自動整形

2. **IMask.js**
   - URL: https://imask.js.org/
   - 機能: より柔軟な入力マスク

3. **jQuery.inputmask**
   - URL: https://robinherbots.github.io/Inputmask/
   - 機能: 複雑なマスクパターン

4. **libphonenumber-js**
   - URL: https://www.npmjs.com/package/libphonenumber-js
   - 機能: 国際電話番号の解析・整形

5. **validator.js**
   - URL: https://www.npmjs.com/package/validator
   - 機能: 入力値のバリデーション

### 📝 記事

1. **「入力支援UI パターン集」**
   - サイト: UX MILK
   - 内容: リアルタイムバリデーション、オートコンプリート

2. **「Web アプリを使いやすく！ 「入力チェック（バリデーション）」の正しい考え方」**
   - サイト: ASCII.jp
   - 内容: バリデーションの UX

---

## 🎯 実装の優先順位

### Phase 1: 基本的な変換（即効性高）

1. ✅ 全角数字→半角
2. ✅ 全角英字→半角
3. ✅ 区切り文字の削除
4. ✅ スペースのトリム

### Phase 2: 整形機能（効果大）

5. ✅ 郵便番号の自動整形
6. ✅ 電話番号の自動整形
7. ✅ 金額の3桁区切り

### Phase 3: 高度な変換（差別化）

8. ✅ 住所の番地表記変換
9. ✅ 和暦→西暦変換
10. ✅ 建物階数表記変換

---

## 💡 UXのポイント

### 1. ユーザーに通知する

```html
<div class="format-notice">
💡 全角文字は自動で半角に変換されます
</div>
```

### 2. 変換前の値も保持

```javascript
// オリジナル値を保存
input.dataset.original = input.value;

// 整形後の値を表示
input.value = formatted;
```

### 3. Undo 機能を提供

```javascript
// Ctrl+Z で元に戻す
input.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        input.value = input.dataset.original;
    }
});
```

---

**最終更新: 2025年12月25日**
**作成者: Brain-Friendly Code Lab**

{% endraw %}
