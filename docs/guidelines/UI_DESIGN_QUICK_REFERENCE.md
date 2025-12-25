# UI設計クイックリファレンス - エラー防止とリカバリー

> **簡易版**: 開発時にすぐ参照できるチートシート

---

## 🎯 基本原則（4つの設計戦略）

1. **エラーを起こさせない** - 制約と補助
2. **エラーを早期発見** - リアルタイムチェック
3. **エラーから迅速回復** - 自動保存とUndo
4. **認知負荷を最小化** - 記憶させない、見れば分かるUI

---

## 🧠 認知負荷軽減のクイック実装

### 段階的情報開示

```tsx
// 複雑な情報は展開式に
const [expanded, setExpanded] = useState(false);

<div>
  <div className="summary">基本情報のみ表示</div>
  {expanded && <div className="details">詳細情報</div>}
  <button onClick={() => setExpanded(!expanded)}>
    {expanded ? '閉じる' : '詳細を表示'}
  </button>
</div>
```

### コンテキスト情報の常時表示

```tsx
// パンくず + 進捗バー
<header className="sticky-header">
  <nav>ホーム › フォーム › 入力中</nav>
  <div className="progress">ステップ 2/4</div>
</header>
```

### インラインヘルプ

```tsx
<div className="field">
  <label>
    電話番号
    <button className="help-icon">?</button>
  </label>
  <input placeholder="090-1234-5678" />
  <small className="hint">ハイフンを含めて入力</small>
</div>
```

### 視覚的な現在位置の強調

```css
.form-step {
  opacity: 0.4;
  transition: all 0.3s;
}

.form-step.active {
  opacity: 1;
  background: #f0f7ff;
  border-left: 4px solid #007bff;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
}
```

### 小さなゴール設定

```tsx
const [completed, setCompleted] = useState(0);
const total = 5;

<div className="progress-message">
  🎉 {completed}/{total} 完了！あと{total - completed}ステップ
</div>
```

### 自動保存インジケーター

```tsx
const [saveStatus, setSaveStatus] = useState('saved');

<div className="save-indicator">
  {saveStatus === 'saving' && '💾 保存中...'}
  {saveStatus === 'saved' && '✓ 保存済み'}
  {saveStatus === 'offline' && '⚠️ オフライン'}
</div>
```

### 入力済みサマリー

```tsx
// 中断からの復帰をサポート
<div className="completion-summary">
  <h4>入力済み項目:</h4>
  <ul>
    {Object.entries(formData).map(([key, value]) => 
      value && <li key={key}>✓ {key}</li>
    )}
  </ul>
</div>
```

---

## ⚡ クイック実装テンプレート

### 1. バリデーション付き入力フィールド

```tsx
<input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onBlur={() => validate(value)}
  aria-invalid={!!error}
  aria-describedby={error ? `${id}-error` : undefined}
/>
{error && <span id={`${id}-error`} role="alert">{error}</span>}
```

### 2. 自動保存フック

```typescript
const useAutoSave = (key: string, interval = 30000) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(key, JSON.stringify(data));
    }, interval);
    return () => clearInterval(timer);
  }, [data, key, interval]);

  return [data, setData];
};
```

### 3. Undo/Redo

```typescript
const useHistory = <T,>(initial: T) => {
  const [state, setState] = useState({
    past: [], present: initial, future: []
  });

  const set = (newPresent: T) => {
    setState({
      past: [...state.past, state.present],
      present: newPresent,
      future: []
    });
  };

  const undo = () => {
    if (state.past.length === 0) return;
    const previous = state.past[state.past.length - 1];
    setState({
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future]
    });
  };

  return { state: state.present, set, undo, canUndo: state.past.length > 0 };
};
```

### 4. 確認ダイアログ

```tsx
const useConfirm = () => {
  const [state, setState] = useState({ show: false, resolve: null });

  const confirm = () => new Promise((resolve) => {
    setState({ show: true, resolve });
  });

  const handleConfirm = () => {
    state.resolve(true);
    setState({ show: false, resolve: null });
  };

  const handleCancel = () => {
    state.resolve(false);
    setState({ show: false, resolve: null });
  };

  return { confirm, isOpen: state.show, handleConfirm, handleCancel };
};
```

---

## 🎨 CSSスニペット

### エラー状態

```css
/* エラー */
.input-error {
  border: 2px solid #dc3545;
  background-color: #fff5f5;
}

/* 成功 */
.input-valid {
  border-color: #28a745;
}

/* フォーカス */
.input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}
```

### エラーメッセージ

```css
.error-message {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 4px;
}
```

### 必須マーク

```css
.required {
  color: #dc3545;
  margin-left: 4px;
}

.required-badge {
  background: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
}
```

---

## 📋 バリデーションルール

### よく使うパターン

```typescript
const validationRules = {
  // 必須
  required: (value) => !value ? 'この項目は必須です' : null,
  
  // メール
  email: (value) => 
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
      ? '有効なメールアドレスを入力してください' : null,
  
  // 最小文字数
  minLength: (min) => (value) => 
    value.length < min 
      ? `${min}文字以上で入力してください（現在: ${value.length}文字）` : null,
  
  // 最大文字数
  maxLength: (max) => (value) => 
    value.length > max 
      ? `${max}文字以内で入力してください（現在: ${value.length}文字）` : null,
  
  // 数値範囲
  range: (min, max) => (value) => {
    const num = Number(value);
    return num < min || num > max 
      ? `${min}〜${max}の範囲で入力してください` : null;
  },
  
  // パスワード強度
  password: (value) => {
    if (value.length < 8) return 'パスワードは8文字以上で入力してください';
    if (!/[A-Z]/.test(value)) return '大文字を1つ以上含めてください';
    if (!/[0-9]/.test(value)) return '数字を1つ以上含めてください';
    return null;
  },
  
  // 電話番号
  phone: (value) => 
    !/^0\d{9,10}$/.test(value.replace(/-/g, '')) 
      ? '有効な電話番号を入力してください' : null,
  
  // 郵便番号
  zipCode: (value) => 
    !/^\d{3}-?\d{4}$/.test(value) 
      ? '郵便番号は123-4567の形式で入力してください' : null,
};
```

---

## 🔧 入力補助機能

### 入力マスク（電話番号）

```typescript
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0,3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0,3)}-${numbers.slice(3,7)}-${numbers.slice(7,11)}`;
};
```

### 入力マスク（郵便番号）

```typescript
const formatZipCode = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  return `${numbers.slice(0,3)}-${numbers.slice(3,7)}`;
};
```

### 入力マスク（クレジットカード）

```typescript
const formatCreditCard = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.match(/.{1,4}/g)?.join(' ') || numbers;
};
```

---

## 🎯 エラーメッセージのDo/Don't

### ❌ 悪い例

```
エラーが発生しました
入力が正しくありません
必須項目です
無効な値です
```

### ✅ 良い例

```
メールアドレスの形式が正しくありません。「@」と「.」を含めて入力してください。
パスワードは8文字以上で入力してください。（現在: 5文字）
電話番号にハイフンは不要です。数字のみで入力してください。
開始日は終了日より前の日付を入力してください。
```

---

## 📊 実装優先度

### P0 (必須)

- [x] リアルタイムバリデーション
- [x] 明確なエラーメッセージ
- [x] 必須項目の明示
- [x] 基本的な自動保存

### P1 (推奨)

- [ ] オートコンプリート
- [ ] Undo/Redo機能
- [ ] 確認ダイアログ
- [ ] 下書き保存

### P2 (あると良い)

- [ ] バージョン履歴
- [ ] オフライン対応
- [ ] 高度なエラーリカバリー

---

## 🚀 パフォーマンス最適化

### デバウンス

```typescript
const useDebounce = (value: string, delay: number = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
```

### スロットル

```typescript
const useThrottle = (value: string, limit: number = 500) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => clearTimeout(handler);
  }, [value, limit]);

  return throttledValue;
};
```

---

## 🎨 アクセシビリティ

### 必須のARIA属性

```tsx
<input
  aria-required="true"        // 必須項目
  aria-invalid={hasError}     // エラー状態
  aria-describedby="error-id" // エラーメッセージとの関連付け
/>

<span id="error-id" role="alert">
  エラーメッセージ
</span>
```

### キーボードショートカット

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+Z: Undo
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    }
    // Ctrl+Y: Redo
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      redo();
    }
    // Ctrl+S: 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      save();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [undo, redo, save]);
```

---

## 🔍 デバッグTips

### バリデーションログ

```typescript
const validateWithLog = (value: string, rules: ValidationRule[]) => {
  console.group('Validation');
  console.log('Value:', value);
  
  const result = validateField(value, rules);
  
  console.log('Result:', result);
  console.groupEnd();
  
  return result;
};
```

### 自動保存ログ

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('[AutoSave]', new Date().toLocaleTimeString(), data);
    localStorage.setItem(key, JSON.stringify(data));
  }, interval);

  return () => clearInterval(timer);
}, [data, key, interval]);
```

---

## 📋 チェックリスト

開発完了前に確認:

**認知負荷軽減**
- [ ] 一度に表示する情報は最小限
- [ ] 現在位置が常に明確
- [ ] インラインヘルプがある
- [ ] 視覚的な手がかりが豊富
- [ ] タスクが小分けされている
- [ ] 進捗が見える
- [ ] 自動保存がある
- [ ] デフォルト値を活用

**入力ミス防止**
- [ ] すべての入力にバリデーションがある
- [ ] エラーメッセージが具体的
- [ ] 必須項目にマークがある
- [ ] フォーマット例示がある

**リカバリー**
- [ ] 自動保存が動作している
- [ ] Undoが使える
- [ ] 重要操作に確認がある
- [ ] エラー時にリトライできる

**アクセシビリティ**
- [ ] キーボード操作可能
- [ ] ARIA属性が正しい
- [ ] スクリーンリーダーテスト済み
- [ ] コントラスト比OK

**パフォーマンス**
- [ ] バリデーションが適切にデバウンスされている
- [ ] 不要な再レンダリングがない
- [ ] 大量データでもスムーズ

---

## 🔗 クイックリンク

- [詳細ガイドライン](./UI_DESIGN_GUIDELINES_ERROR_PREVENTION.md)
- Material Design Forms: https://material.io/components/text-fields
- React Hook Form: https://react-hook-form.com/
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

---

**最終更新**: 2025年12月25日

