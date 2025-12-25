---
layout: default
title: UI設計ガイドライン：エラー防止とリカバリー
---
{% raw %}

# UI設計ガイドライン：エラー防止とリカバリー

> **作成日**: 2025年12月25日  
> **目的**: 入力ミスが出づらく、ミスをしてもリカバリーしやすいUI設計の参考資料  
> **対象**: フロントエンド開発者、UI/UXデザイナー

---

## 目次

1. [概要](#概要)
2. [認知負荷を軽減する設計原則](#認知負荷を軽減する設計原則)
3. [入力ミス防止の原則](#入力ミス防止の原則)
4. [リカバリーしやすい設計](#リカバリーしやすい設計)
5. [実装パターン集](#実装パターン集)
6. [実際のサービス事例](#実際のサービス事例)
7. [チェックリスト](#チェックリスト)

---

## 概要

### なぜエラー防止とリカバリーが重要か

- **ユーザー体験の向上**: ストレスのない入力体験を提供
- **業務効率化**: 修正作業やサポート対応の削減
- **データ品質の向上**: 正確なデータ入力を促進
- **離脱率の低下**: エラーによるフォーム離脱を防止

### 設計の基本方針

1. **エラーを起こさせない** - ミスが発生しにくい設計
2. **エラーを早期発見** - リアルタイムでのフィードバック
3. **エラーから迅速に回復** - 簡単に修正・復元できる仕組み
4. **認知負荷を最小化** - 情報を記憶しなくても使えるUI

---

## 認知負荷を軽減する設計原則

### なぜ認知負荷の軽減が重要か

多くのユーザーは以下のような状況で作業を行います：
- **マルチタスク環境**: 複数の作業を並行して処理
- **時間的制約**: 急いで作業を完了させる必要がある
- **情報過多**: 覚えておくべき情報が多い
- **中断と再開**: 作業が頻繁に中断される

このような状況では、短期記憶（ワーキングメモリー）への負荷を減らし、集中力を維持しやすいUIが不可欠です。

### 基本原則

1. **情報を記憶させない** - 見れば分かるUIにする
2. **一度に1つのことに集中** - 段階的な情報提示
3. **中断に強い設計** - 作業再開が容易
4. **視覚的な手がかり** - 次に何をすべきかが明確

---

### 1. 情報の段階的開示（Progressive Disclosure）

#### 概要
一度に表示する情報量を最小限にし、必要な時にだけ詳細を表示する。

#### 実装例

```typescript
// 基本情報のみ表示、詳細は展開式
const ProgressiveDetailsCard = ({ item }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="card">
      {/* 必須情報のみ表示 */}
      <div className="card-summary">
        <h3>{item.title}</h3>
        <p className="card-status">{item.status}</p>
      </div>

      {/* 詳細情報は必要時のみ */}
      <button 
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
      >
        {showDetails ? '詳細を閉じる' : '詳細を表示'}
      </button>

      {showDetails && (
        <div className="card-details">
          <p><strong>作成日:</strong> {item.createdAt}</p>
          <p><strong>担当者:</strong> {item.assignee}</p>
          <p><strong>説明:</strong> {item.description}</p>
        </div>
      )}
    </div>
  );
};
```

#### CSSアニメーション

```css
.card-details {
  animation: slideDown 0.3s ease-out;
  overflow: hidden;
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 500px;
    opacity: 1;
  }
}
```

---

### 2. コンテキスト情報の常時表示

#### 概要
ユーザーが「今どこにいるのか」「何をしているのか」を常に明示する。

#### 実装例

```typescript
// パンくずリスト + 現在の状態表示
const ContextualHeader = ({ currentPage, breadcrumbs, taskProgress }) => {
  return (
    <header className="contextual-header">
      {/* パンくずリスト */}
      <nav aria-label="パンくず">
        <ol className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <li key={index}>
              {index < breadcrumbs.length - 1 ? (
                <a href={crumb.url}>{crumb.label}</a>
              ) : (
                <span aria-current="page">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* 現在のタスク情報 */}
      <div className="current-task">
        <h1>{currentPage.title}</h1>
        <p className="task-hint">{currentPage.description}</p>
      </div>

      {/* 進捗状況 */}
      {taskProgress && (
        <div className="progress-context">
          <span>ステップ {taskProgress.current} / {taskProgress.total}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(taskProgress.current / taskProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
```

```css
.contextual-header {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.breadcrumbs {
  display: flex;
  gap: 8px;
  list-style: none;
  font-size: 0.875rem;
  color: #666;
}

.breadcrumbs li:not(:last-child)::after {
  content: '›';
  margin-left: 8px;
  color: #999;
}

.task-hint {
  color: #666;
  font-size: 0.9rem;
  margin-top: 4px;
}
```

---

### 3. インライン説明とヒント

#### 概要
各項目の目的や入力方法を、その場で確認できるようにする。

#### 実装例

```typescript
const InputWithInlineHelp = ({ 
  label, 
  helpText, 
  placeholder, 
  example,
  ...props 
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="input-with-help">
      <div className="label-row">
        <label>{label}</label>
        <button
          type="button"
          className="help-toggle"
          onClick={() => setShowHelp(!showHelp)}
          aria-label="ヘルプを表示"
        >
          ?
        </button>
      </div>

      {/* 常に表示される簡潔なヒント */}
      {placeholder && (
        <input placeholder={placeholder} {...props} />
      )}

      {/* 展開式の詳細ヘルプ */}
      {showHelp && (
        <div className="help-content" role="region">
          <p>{helpText}</p>
          {example && (
            <div className="help-example">
              <strong>入力例:</strong> {example}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 使用例
<InputWithInlineHelp
  label="電話番号"
  placeholder="090-1234-5678"
  helpText="ハイフンを含めて入力してください。固定電話の場合は市外局番から入力してください。"
  example="03-1234-5678（東京の固定電話）"
/>
```

```css
.label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.help-toggle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #999;
  background: white;
  color: #666;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-toggle:hover {
  background: #f0f0f0;
  border-color: #666;
}

.help-content {
  background: #f8f9fa;
  border-left: 3px solid #007bff;
  padding: 12px;
  margin-top: 8px;
  font-size: 0.875rem;
  line-height: 1.5;
}

.help-example {
  margin-top: 8px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-family: monospace;
}
```

---

### 4. 視覚的な手がかりと強調

#### 概要
次に何をすべきかを視覚的に明確にする。

#### 実装例

```typescript
const FocusGuidedForm = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { id: 'name', label: '名前', completed: false },
    { id: 'email', label: 'メール', completed: false },
    { id: 'phone', label: '電話番号', completed: false },
  ];

  return (
    <form className="focus-guided-form">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`form-step ${
            index === activeStep ? 'active' : ''
          } ${step.completed ? 'completed' : ''}`}
        >
          {/* ステップインジケーター */}
          <div className="step-indicator">
            {step.completed ? (
              <span className="check-icon">✓</span>
            ) : index === activeStep ? (
              <span className="current-step">→</span>
            ) : (
              <span className="pending-step">{index + 1}</span>
            )}
          </div>

          {/* フォームフィールド */}
          <div className="step-content">
            <label>{step.label}</label>
            <input
              id={step.id}
              autoFocus={index === activeStep}
              onBlur={() => {
                // 入力完了後、次のステップへ
                if (index === activeStep) {
                  setActiveStep(index + 1);
                }
              }}
            />
          </div>
        </div>
      ))}
    </form>
  );
};
```

```css
.form-step {
  display: flex;
  gap: 16px;
  padding: 16px;
  margin-bottom: 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.form-step.active {
  opacity: 1;
  border-color: #007bff;
  background: #f0f7ff;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
}

.form-step.completed {
  opacity: 0.7;
  background: #f8f9fa;
}

.step-indicator {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
}

.form-step.active .step-indicator {
  background: #007bff;
  color: white;
  animation: pulse 2s infinite;
}

.form-step.completed .step-indicator {
  background: #28a745;
  color: white;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.current-step {
  font-size: 1.5rem;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

---

### 5. タスクの分割と小さなゴール

#### 概要
大きなフォームを小さなステップに分割し、達成感を与える。

#### 実装例

```typescript
const ChunkedForm = () => {
  const [currentChunk, setCurrentChunk] = useState(0);
  const [completedChunks, setCompletedChunks] = useState<number[]>([]);

  const chunks = [
    {
      title: '基本情報',
      description: 'お名前とメールアドレスを入力してください',
      fields: ['name', 'email'],
    },
    {
      title: '連絡先',
      description: '電話番号と住所を入力してください',
      fields: ['phone', 'address'],
    },
    {
      title: '確認',
      description: '入力内容を確認してください',
      fields: [],
    },
  ];

  const completeChunk = (chunkIndex: number) => {
    setCompletedChunks([...completedChunks, chunkIndex]);
    setCurrentChunk(chunkIndex + 1);
  };

  return (
    <div className="chunked-form">
      {/* 全体の進捗 */}
      <div className="overall-progress">
        <h2>登録まで あと{chunks.length - currentChunk}ステップ</h2>
        <div className="progress-dots">
          {chunks.map((_, index) => (
            <div
              key={index}
              className={`dot ${
                completedChunks.includes(index) ? 'completed' :
                index === currentChunk ? 'active' : 'pending'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 現在のチャンク */}
      <div className="current-chunk">
        <div className="chunk-header">
          <h3>{chunks[currentChunk].title}</h3>
          <p className="chunk-description">
            {chunks[currentChunk].description}
          </p>
        </div>

        {/* フィールド（実装は省略） */}
        <div className="chunk-fields">
          {/* ... */}
        </div>

        {/* 次へボタン */}
        <button
          className="btn-next-chunk"
          onClick={() => completeChunk(currentChunk)}
        >
          {currentChunk === chunks.length - 1 ? '完了' : '次へ'}
        </button>
      </div>

      {/* 励ましメッセージ */}
      {completedChunks.length > 0 && (
        <div className="encouragement">
          🎉 {completedChunks.length}ステップ完了しました！
        </div>
      )}
    </div>
  );
};
```

```css
.overall-progress {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 24px;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.completed {
  background: #28a745;
  transform: scale(1.2);
}

.dot.active {
  background: white;
  transform: scale(1.5);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
}

.chunk-header {
  margin-bottom: 24px;
}

.chunk-description {
  color: #666;
  font-size: 0.95rem;
  margin-top: 8px;
}

.encouragement {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 12px 16px;
  border-radius: 8px;
  text-align: center;
  margin-top: 16px;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

### 6. 中断からの復帰サポート

#### 概要
作業が中断されても、容易に再開できるようにする。

#### 実装例

```typescript
const ResumableForm = ({ formId }) => {
  const [formData, setFormData] = useState({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [sessionStart, setSessionStart] = useState<Date>(new Date());

  // 定期的に自動保存
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage(formId, formData);
      setLastSaved(new Date());
    }, 30000); // 30秒ごと

    return () => clearInterval(interval);
  }, [formData, formId]);

  // ページ離脱時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges(formData)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  return (
    <div className="resumable-form">
      {/* セッション情報 */}
      <div className="session-info">
        <div className="info-item">
          <span className="info-label">作業開始:</span>
          <span className="info-value">
            {formatTime(sessionStart)}
          </span>
        </div>
        {lastSaved && (
          <div className="info-item">
            <span className="info-label">最終保存:</span>
            <span className="info-value">
              {getTimeAgo(lastSaved)} 前
            </span>
          </div>
        )}
      </div>

      {/* 入力済み項目のサマリー */}
      <div className="completion-summary">
        <h4>入力状況</h4>
        <div className="summary-items">
          {Object.entries(formData).map(([key, value]) => (
            value && (
              <div key={key} className="summary-item">
                <span className="check-mark">✓</span>
                <span>{getFieldLabel(key)}</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* フォーム本体 */}
      <form>
        {/* ... */}
      </form>
    </div>
  );
};
```

```css
.session-info {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-label {
  color: #666;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.completion-summary {
  background: #e7f3ff;
  border-left: 4px solid #007bff;
  padding: 16px;
  margin-bottom: 24px;
}

.summary-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: white;
  border-radius: 16px;
  font-size: 0.875rem;
}

.check-mark {
  color: #28a745;
}
```

---

### 7. デフォルト値とスマート入力補完

#### 概要
可能な限り自動入力し、ユーザーの入力量を減らす。

#### 実装例

```typescript
const SmartDefaultsForm = () => {
  const [formData, setFormData] = useState({
    country: 'JP', // デフォルト値
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // 自動検出
    language: navigator.language, // ブラウザ言語
  });

  // 郵便番号から住所を自動補完
  const handleZipCodeChange = async (zipCode: string) => {
    if (zipCode.length === 7) {
      const address = await fetchAddressFromZipCode(zipCode);
      setFormData({
        ...formData,
        zipCode,
        prefecture: address.prefecture,
        city: address.city,
        street: address.street,
      });
    }
  };

  // メールドメインのサジェスト
  const suggestEmailDomain = (partialEmail: string) => {
    const commonDomains = ['gmail.com', 'yahoo.co.jp', 'outlook.com'];
    const [localPart, domainPart] = partialEmail.split('@');
    
    if (domainPart && domainPart.length > 0) {
      return commonDomains.filter(domain => 
        domain.startsWith(domainPart)
      );
    }
    return [];
  };

  return (
    <form>
      {/* 郵便番号入力 → 住所自動入力 */}
      <div className="form-group">
        <label>郵便番号</label>
        <input
          type="text"
          value={formData.zipCode || ''}
          onChange={(e) => handleZipCodeChange(e.target.value)}
          placeholder="1234567"
        />
      </div>

      {/* 自動入力された住所（編集可能） */}
      {formData.prefecture && (
        <div className="auto-filled-notice">
          <span className="auto-icon">✨</span>
          住所を自動入力しました
        </div>
      )}

      <div className="form-group">
        <label>都道府県</label>
        <input
          type="text"
          value={formData.prefecture || ''}
          onChange={(e) => setFormData({...formData, prefecture: e.target.value})}
          disabled={!formData.prefecture}
        />
      </div>

      {/* 以前の入力履歴からサジェスト */}
      <div className="form-group">
        <label>よく使う配送先</label>
        <datalist id="saved-addresses">
          {getSavedAddresses().map(addr => (
            <option key={addr.id} value={addr.fullAddress} />
          ))}
        </datalist>
        <input list="saved-addresses" />
      </div>
    </form>
  );
};
```

```css
.auto-filled-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #856404;
  margin-bottom: 16px;
}

.auto-icon {
  font-size: 1.2rem;
}

input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}
```

---

### 8. 視覚的な整理と空白の活用

#### 概要
情報を視覚的にグループ化し、認知負荷を軽減する。

#### 実装例

```css
/* 関連項目のグループ化 */
.form-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.form-section + .form-section {
  margin-top: 32px; /* セクション間に十分な空白 */
}

.form-section h2 {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
}

/* 入力フィールド間の適切な間隔 */
.form-field {
  margin-bottom: 20px;
}

.form-field:last-child {
  margin-bottom: 0;
}

/* 関連する項目を水平配置 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 重要な情報を視覚的に強調 */
.form-field.important {
  padding: 16px;
  background: #fff8e1;
  border-left: 4px solid #ffa000;
  border-radius: 4px;
}

/* アイコンで視覚的な手がかり */
.form-field label::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  background-size: contain;
  vertical-align: middle;
}

.form-field[data-type="email"] label::before {
  background-image: url('email-icon.svg');
}

.form-field[data-type="phone"] label::before {
  background-image: url('phone-icon.svg');
}
```

---

### 9. エラー防止のための事前警告

#### 概要
ミスを犯す前に優しく警告を表示する。

#### 実装例

```typescript
const PreventiveWarningInput = ({ value, onChange, rules }) => {
  const [warning, setWarning] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const checkForWarnings = (inputValue: string) => {
    // エラーではないが、注意が必要な状況
    if (rules.includesEmail && !inputValue.includes('@')) {
      if (inputValue.length > 3) {
        setWarning('メールアドレスには「@」が必要です');
        setShowWarning(true);
      }
    }

    // 大文字小文字の警告
    if (rules.caseSensitive && /[A-Z]/.test(inputValue)) {
      setWarning('このフィールドは大文字と小文字を区別します');
      setShowWarning(true);
    }

    // 全角数字の警告
    if (rules.numericOnly && /[０-９]/.test(inputValue)) {
      setWarning('半角数字で入力してください');
      setShowWarning(true);
    }
  };

  return (
    <div className="preventive-input">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          checkForWarnings(e.target.value);
        }}
      />
      
      {showWarning && (
        <div className="soft-warning" role="status">
          <span className="warning-icon">💡</span>
          {warning}
        </div>
      )}
    </div>
  );
};
```

```css
.soft-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff9e6;
  border: 1px solid #ffe066;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #8b6914;
  margin-top: 8px;
}

.warning-icon {
  font-size: 1.1rem;
}
```

---

### 10. タイムプレッシャーの軽減

#### 概要
セッションタイムアウトやタイマーによるストレスを軽減する。

#### 実装例

```typescript
const SessionManager = ({ children }) => {
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30分
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // 5分前に警告
        if (newTime === 5 * 60) {
          setShowWarning(true);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const extendSession = async () => {
    await api.extendSession();
    setTimeRemaining(30 * 60);
    setShowWarning(false);
  };

  return (
    <>
      {children}
      
      {/* セッション延長の通知（押しつけがましくない） */}
      {showWarning && (
        <div className="session-warning">
          <p>
            あと{Math.floor(timeRemaining / 60)}分でセッションが切れます。
            <br />
            作業を続ける場合は延長してください。
          </p>
          <button onClick={extendSession}>
            セッションを延長（+30分）
          </button>
          <small>
            ※ 入力内容は自動保存されているので安心してください
          </small>
        </div>
      )}
    </>
  );
};
```

```css
.session-warning {
  position: fixed;
  bottom: 24px;
  right: 24px;
  max-width: 360px;
  padding: 20px;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.session-warning button {
  margin-top: 12px;
  width: 100%;
  padding: 12px;
  background: #ffc107;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.session-warning small {
  display: block;
  margin-top: 12px;
  color: #856404;
  text-align: center;
}
```

---

### 認知負荷軽減のチェックリスト

#### 情報の提示

- [ ] 一度に表示する情報は最小限にしている
- [ ] 必要な情報は段階的に表示している
- [ ] 現在の位置や状態が常に明確
- [ ] 次に何をすべきかが一目で分かる
- [ ] 視覚的な手がかりが豊富にある

#### 記憶への負荷

- [ ] 情報を覚えておく必要がない
- [ ] 以前の入力内容が確認できる
- [ ] デフォルト値や自動入力を活用
- [ ] 参照情報が常に表示されている
- [ ] パンくずリストで経路が分かる

#### 中断と再開

- [ ] 自動保存が頻繁に行われる
- [ ] セッションタイムアウトの警告がある
- [ ] 入力済み項目が一目で分かる
- [ ] 途中から再開しやすい
- [ ] ページ離脱時に警告が出る

#### タスクの管理

- [ ] 大きなタスクが小分けされている
- [ ] 進捗が視覚的に分かる
- [ ] 各ステップの目的が明確
- [ ] 達成感を得られる仕組みがある
- [ ] 残り時間や作業量が見える

#### エラーと混乱の防止

- [ ] ミスを犯す前に警告がある
- [ ] エラーメッセージが具体的
- [ ] 修正方法が明示されている
- [ ] 元に戻す操作が簡単
- [ ] 確認画面で最終チェックできる

---

## 入力ミス防止の原則

### 1. リアルタイムバリデーション

#### 概要
ユーザーが入力中または入力直後に、データの妥当性を即座にチェックしフィードバックを提供する。

#### 実装のポイント

**タイミング戦略**
```javascript
// ❌ 悪い例: onChange（入力中に毎回検証）
<input onChange={validate} />

// ✅ 良い例: onBlur（フォーカスが外れたタイミング）
<input onBlur={validate} />

// ✅ 最良: onBlur + 修正時はonChange
<input 
  onBlur={handleBlur}
  onChange={isDirty ? handleChange : null}
/>
```

**バリデーションの種類**
- **必須チェック**: 空欄の検出
- **フォーマットチェック**: メール、電話番号、郵便番号など
- **範囲チェック**: 数値の最小・最大値
- **文字数チェック**: 最小・最大文字数
- **重複チェック**: ID、メールアドレスの重複確認

#### ベストプラクティス

```typescript
// バリデーション実装例
interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}

const validateField = (value: string, rules: ValidationRule[]) => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value || value.trim() === '') {
          return { valid: false, message: rule.message };
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { valid: false, message: rule.message };
        }
        break;
      case 'minLength':
        if (value.length < rule.value) {
          return { valid: false, message: rule.message };
        }
        break;
      // ... 他のルール
    }
  }
  return { valid: true, message: '' };
};
```

#### UIデザイン

```jsx
// React実装例
const InputField = ({ label, name, rules, ...props }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    const result = validateField(value, rules);
    setError(result.valid ? '' : result.message);
  };

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={name}>
        {label}
        {rules.some(r => r.type === 'required') && (
          <span className="required">*</span>
        )}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${name}-error`} className="error-message" role="alert">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};
```

#### CSSスタイル例

```css
/* エラー状態の視覚的フィードバック */
.form-field.has-error input {
  border: 2px solid #dc3545;
  background-color: #fff5f5;
}

.form-field input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 4px;
}

.required {
  color: #dc3545;
  margin-left: 2px;
}
```

---

### 2. 入力補助機能

#### オートコンプリート

```typescript
// オートコンプリート実装例
interface AutocompleteProps {
  suggestions: string[];
  onSelect: (value: string) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ 
  suggestions, 
  onSelect 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    onSelect(suggestion);
  };

  return (
    <div className="autocomplete">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        aria-autocomplete="list"
        aria-controls="suggestions-list"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul id="suggestions-list" role="listbox">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              role="option"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

#### 入力マスク

```typescript
// 電話番号の入力マスク例
const formatPhoneNumber = (value: string): string => {
  // 数字のみ抽出
  const numbers = value.replace(/\D/g, '');
  
  // フォーマット適用
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
};

const PhoneInput = () => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue(formatted);
  };

  return (
    <input
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder="090-1234-5678"
      maxLength={13}
    />
  );
};
```

#### ドロップダウン選択

```jsx
// 選択式入力で手入力ミスを防止
const SelectField = ({ label, options, value, onChange }) => {
  return (
    <div className="select-field">
      <label>{label}</label>
      <select value={value} onChange={onChange}>
        <option value="">選択してください</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
```

---

### 3. 動的フォーム制御（Progressive Disclosure）

#### 概要
ユーザーの入力内容に応じて、必要な項目のみを段階的に表示する。

#### 実装例

```typescript
const DynamicForm = () => {
  const [formData, setFormData] = useState({
    userType: '',
    companyName: '',
    individualName: '',
  });

  return (
    <form>
      {/* ユーザータイプ選択 */}
      <div>
        <label>ユーザータイプ</label>
        <select
          value={formData.userType}
          onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
        >
          <option value="">選択してください</option>
          <option value="corporate">法人</option>
          <option value="individual">個人</option>
        </select>
      </div>

      {/* 法人の場合のみ表示 */}
      {formData.userType === 'corporate' && (
        <div>
          <label>会社名</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        </div>
      )}

      {/* 個人の場合のみ表示 */}
      {formData.userType === 'individual' && (
        <div>
          <label>お名前</label>
          <input
            type="text"
            value={formData.individualName}
            onChange={(e) => setFormData({ ...formData, individualName: e.target.value })}
          />
        </div>
      )}
    </form>
  );
};
```

---

### 4. 明確なエラーメッセージ

#### エラーメッセージの原則

**❌ 悪い例**
```
エラーが発生しました
入力が正しくありません
必須項目です
```

**✅ 良い例**
```
メールアドレスの形式が正しくありません。「@」と「.」を含めて入力してください。
パスワードは8文字以上で入力してください。（現在: 5文字）
電話番号にハイフンは不要です。数字のみで入力してください。
```

#### 実装パターン

```typescript
// エラーメッセージ管理
const errorMessages = {
  required: (fieldName: string) => `${fieldName}は必須項目です`,
  email: '有効なメールアドレスを入力してください（例: example@email.com）',
  minLength: (min: number, current: number) => 
    `${min}文字以上で入力してください（現在: ${current}文字）`,
  maxLength: (max: number, current: number) => 
    `${max}文字以内で入力してください（現在: ${current}文字）`,
  pattern: (example: string) => 
    `正しい形式で入力してください（例: ${example}）`,
};

// エラー表示コンポーネント
const ErrorMessage = ({ error, fieldName }) => {
  if (!error) return null;

  return (
    <div className="error-container" role="alert">
      <svg className="error-icon" aria-hidden="true">
        {/* エラーアイコン */}
      </svg>
      <span className="error-text">{error}</span>
      {/* 修正方法のヒント */}
      <button 
        type="button" 
        className="error-help"
        aria-label={`${fieldName}の入力方法を表示`}
      >
        ?
      </button>
    </div>
  );
};
```

---

### 5. 視覚的フィードバック

#### 入力状態の視覚化

```css
/* 未入力 */
.input-field {
  border: 1px solid #ccc;
}

/* フォーカス中 */
.input-field:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* 有効な入力 */
.input-field.valid {
  border-color: #28a745;
  background-image: url('checkmark.svg');
  background-repeat: no-repeat;
  background-position: right 12px center;
}

/* エラー */
.input-field.invalid {
  border-color: #dc3545;
  background-color: #fff5f5;
}

/* 無効状態 */
.input-field:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}
```

#### アイコンの活用

```jsx
const InputWithIcon = ({ status, ...props }) => {
  const getIcon = () => {
    switch(status) {
      case 'valid': return '✓';
      case 'invalid': return '✗';
      case 'loading': return '⏳';
      default: return null;
    }
  };

  return (
    <div className="input-wrapper">
      <input {...props} />
      {getIcon() && (
        <span className={`input-icon ${status}`} aria-hidden="true">
          {getIcon()}
        </span>
      )}
    </div>
  );
};
```

---

### 6. 必須項目の明示

#### デザインパターン

```jsx
const FormField = ({ label, required, children }) => {
  return (
    <div className="form-field">
      <label>
        {label}
        {required && (
          <>
            <span className="required-mark" aria-label="必須">*</span>
            <span className="required-badge">必須</span>
          </>
        )}
      </label>
      {children}
    </div>
  );
};
```

```css
.required-mark {
  color: #dc3545;
  margin-left: 4px;
  font-weight: bold;
}

.required-badge {
  background-color: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  margin-left: 8px;
}
```

---

### 7. フォーム全体のデザイン

#### シンプルで直感的なレイアウト

```jsx
const WellDesignedForm = () => {
  return (
    <form className="well-designed-form">
      {/* 進捗表示 */}
      <div className="form-progress">
        <div className="progress-bar" style={{ width: '33%' }} />
        <span>ステップ 1 / 3</span>
      </div>

      {/* セクション分け */}
      <section className="form-section">
        <h2>基本情報</h2>
        <div className="form-grid">
          {/* 関連する項目をグループ化 */}
          <FormField label="姓" required>
            <input type="text" />
          </FormField>
          <FormField label="名" required>
            <input type="text" />
          </FormField>
        </div>
      </section>

      {/* ヘルプテキスト */}
      <p className="form-help">
        💡 入力した情報は、お客様の同意なく第三者に提供されることはありません。
      </p>

      {/* アクション */}
      <div className="form-actions">
        <button type="button" className="btn-secondary">戻る</button>
        <button type="submit" className="btn-primary">次へ</button>
      </div>
    </form>
  );
};
```

---

## リカバリーしやすい設計

### 1. 自動保存機能

#### 実装パターン

```typescript
// ローカルストレージを使った自動保存
const useAutoSave = (key: string, interval: number = 30000) => {
  const [data, setData] = useState(() => {
    // 初回マウント時に復元
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    // 定期的に保存
    const timer = setInterval(() => {
      localStorage.setItem(key, JSON.stringify(data));
      console.log('自動保存しました');
    }, interval);

    return () => clearInterval(timer);
  }, [data, key, interval]);

  return [data, setData];
};

// 使用例
const FormWithAutoSave = () => {
  const [formData, setFormData] = useAutoSave('form-draft', 10000);

  return (
    <form>
      <div className="autosave-indicator">
        <span>✓ 自動保存済み</span>
      </div>
      {/* フォーム内容 */}
    </form>
  );
};
```

#### UIフィードバック

```jsx
const AutoSaveIndicator = ({ status }) => {
  const messages = {
    saving: '保存中...',
    saved: '✓ 保存済み',
    error: '⚠️ 保存に失敗しました',
  };

  return (
    <div className={`autosave-status ${status}`}>
      {messages[status]}
    </div>
  );
};
```

---

### 2. 操作の取り消し（Undo/Redo）

#### 実装例

```typescript
// Undo/Redo機能のカスタムフック
interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

const useHistory = <T,>(initialState: T) => {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const set = (newPresent: T) => {
    setState({
      past: [...state.past, state.present],
      present: newPresent,
      future: [],
    });
  };

  const undo = () => {
    if (state.past.length === 0) return;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);

    setState({
      past: newPast,
      present: previous,
      future: [state.present, ...state.future],
    });
  };

  const redo = () => {
    if (state.future.length === 0) return;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    setState({
      past: [...state.past, state.present],
      present: next,
      future: newFuture,
    });
  };

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

// 使用例
const TextEditorWithHistory = () => {
  const { state, set, undo, redo, canUndo, canRedo } = useHistory('');

  return (
    <div>
      <div className="toolbar">
        <button onClick={undo} disabled={!canUndo}>
          ↶ 元に戻す
        </button>
        <button onClick={redo} disabled={!canRedo}>
          ↷ やり直す
        </button>
      </div>
      <textarea
        value={state}
        onChange={(e) => set(e.target.value)}
      />
    </div>
  );
};
```

---

### 3. 確認ダイアログ

#### 実装パターン

```typescript
// 確認ダイアログコンポーネント
interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '実行',
  cancelText = 'キャンセル',
  danger = false,
}) => {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true">
      <div className="dialog-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button
            onClick={onCancel}
            className="btn-secondary"
            autoFocus
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// 使用例
const DeleteButton = ({ itemId, itemName }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // 削除処理
    deleteItem(itemId);
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        削除
      </button>
      {showConfirm && (
        <ConfirmDialog
          title="削除の確認"
          message={`「${itemName}」を削除してもよろしいですか？この操作は取り消せません。`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          confirmText="削除する"
          danger
        />
      )}
    </>
  );
};
```

---

### 4. 下書き保存と復元

#### 実装例

```typescript
// 下書き管理システム
class DraftManager {
  private storageKey: string;

  constructor(formId: string) {
    this.storageKey = `draft_${formId}`;
  }

  // 下書き保存
  saveDraft(data: any) {
    const draft = {
      data,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(this.storageKey, JSON.stringify(draft));
  }

  // 下書き取得
  getDraft() {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) return null;
    return JSON.parse(saved);
  }

  // 下書き削除
  clearDraft() {
    localStorage.removeItem(this.storageKey);
  }

  // 下書き存在チェック
  hasDraft(): boolean {
    return localStorage.getItem(this.storageKey) !== null;
  }
}

// Reactコンポーネントでの使用
const FormWithDraft = ({ formId }) => {
  const draftManager = useMemo(() => new DraftManager(formId), [formId]);
  const [formData, setFormData] = useState({});
  const [showDraftNotice, setShowDraftNotice] = useState(false);

  useEffect(() => {
    // 下書きが存在する場合は通知を表示
    if (draftManager.hasDraft()) {
      setShowDraftNotice(true);
    }
  }, []);

  const restoreDraft = () => {
    const draft = draftManager.getDraft();
    if (draft) {
      setFormData(draft.data);
      setShowDraftNotice(false);
    }
  };

  const discardDraft = () => {
    draftManager.clearDraft();
    setShowDraftNotice(false);
  };

  return (
    <>
      {showDraftNotice && (
        <div className="draft-notice" role="alert">
          <p>前回の入力内容が残っています</p>
          <button onClick={restoreDraft}>復元する</button>
          <button onClick={discardDraft}>破棄する</button>
        </div>
      )}
      <form>
        {/* フォーム内容 */}
      </form>
    </>
  );
};
```

---

### 5. エラーハンドリングと復旧

#### ネットワークエラー対応

```typescript
// リトライ機能付きAPI送信
const submitWithRetry = async (
  data: any,
  maxRetries: number = 3
): Promise<void> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await api.submit(data);
      return; // 成功
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        // 指数バックオフで待機
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError; // 全て失敗
};

// 使用例
const FormSubmit = () => {
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (data) => {
    setStatus('submitting');
    
    try {
      await submitWithRetry(data);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      // ローカルに保存してオフライン対応
      localStorage.setItem('pending_submission', JSON.stringify(data));
    }
  };

  return (
    <div>
      {status === 'error' && (
        <div className="error-banner" role="alert">
          <p>送信に失敗しました。データは保存されています。</p>
          <button onClick={() => handleSubmit(JSON.parse(localStorage.getItem('pending_submission')))}>
            再送信
          </button>
        </div>
      )}
    </div>
  );
};
```

---

### 6. バージョン履歴

#### 実装例

```typescript
// バージョン管理システム
interface Version {
  id: string;
  data: any;
  timestamp: Date;
  description: string;
}

class VersionControl {
  private versions: Version[] = [];
  private maxVersions: number = 10;

  // 新しいバージョンを保存
  saveVersion(data: any, description: string = '自動保存') {
    const version: Version = {
      id: crypto.randomUUID(),
      data: JSON.parse(JSON.stringify(data)), // ディープコピー
      timestamp: new Date(),
      description,
    };

    this.versions.push(version);

    // 最大数を超えたら古いものを削除
    if (this.versions.length > this.maxVersions) {
      this.versions.shift();
    }
  }

  // バージョン一覧取得
  getVersions(): Version[] {
    return [...this.versions].reverse(); // 新しい順
  }

  // 特定バージョンのデータ取得
  getVersion(id: string): any {
    const version = this.versions.find(v => v.id === id);
    return version ? version.data : null;
  }
}

// UIコンポーネント
const VersionHistory = ({ versionControl, onRestore }) => {
  const [showHistory, setShowHistory] = useState(false);
  const versions = versionControl.getVersions();

  return (
    <div>
      <button onClick={() => setShowHistory(!showHistory)}>
        📜 履歴を表示 ({versions.length})
      </button>
      
      {showHistory && (
        <div className="version-history">
          <h3>変更履歴</h3>
          <ul>
            {versions.map(version => (
              <li key={version.id}>
                <div className="version-info">
                  <span className="version-time">
                    {formatTimestamp(version.timestamp)}
                  </span>
                  <span className="version-desc">
                    {version.description}
                  </span>
                </div>
                <button onClick={() => onRestore(version.data)}>
                  復元
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

---

## 実装パターン集

### パターン1: 多段階フォーム

```typescript
const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useAutoSave('multi-step-form');

  const steps = [
    { id: 1, title: '基本情報', component: BasicInfoStep },
    { id: 2, title: '詳細情報', component: DetailStep },
    { id: 3, title: '確認', component: ConfirmStep },
  ];

  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="multi-step-form">
      {/* プログレスバー */}
      <div className="progress-indicator">
        {steps.map(step => (
          <div
            key={step.id}
            className={`step ${currentStep >= step.id ? 'completed' : ''} ${currentStep === step.id ? 'active' : ''}`}
          >
            <div className="step-number">{step.id}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>

      {/* 現在のステップ */}
      <CurrentStepComponent
        data={formData}
        onChange={setFormData}
      />

      {/* ナビゲーション */}
      <div className="form-navigation">
        <button
          onClick={goToPrevStep}
          disabled={currentStep === 1}
        >
          ← 戻る
        </button>
        <button onClick={goToNextStep}>
          {currentStep === steps.length ? '送信' : '次へ →'}
        </button>
      </div>
    </div>
  );
};
```

---

### パターン2: リアルタイムプレビュー

```typescript
// 入力内容をリアルタイムでプレビュー
const FormWithPreview = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  return (
    <div className="form-with-preview">
      <div className="form-section">
        <h2>入力フォーム</h2>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="タイトル"
        />
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="説明"
        />
      </div>

      <div className="preview-section">
        <h2>プレビュー</h2>
        <div className="preview-card">
          <h3>{formData.title || 'タイトルを入力してください'}</h3>
          <p>{formData.description || '説明を入力してください'}</p>
        </div>
      </div>
    </div>
  );
};
```

---

### パターン3: バルクエラー表示

```typescript
// フォーム全体のエラーをまとめて表示
const ErrorSummary = ({ errors }) => {
  if (Object.keys(errors).length === 0) return null;

  return (
    <div className="error-summary" role="alert">
      <h3>入力内容に誤りがあります</h3>
      <ul>
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`} onClick={() => {
              document.getElementById(field)?.focus();
            }}>
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FormWithErrorSummary = () => {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // フォームの先頭にスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ErrorSummary errors={errors} />
      {/* フォームフィールド */}
    </form>
  );
};
```

---

## 実際のサービス事例

### 事例1: SmartDB（スマートDB）

**特徴**
- リアルタイム入力チェック
- 動的項目制御
- 外部データ参照

**実装のポイント**
```typescript
// SmartDB風の動的フォーム制御
const SmartDBStyleForm = () => {
  const [formData, setFormData] = useState({});
  const [visibleFields, setVisibleFields] = useState(['name', 'email']);

  // 入力内容に応じて表示項目を制御
  useEffect(() => {
    const fields = ['name', 'email'];
    
    if (formData.userType === 'corporate') {
      fields.push('companyName', 'department');
    }
    
    if (formData.needsInvoice === true) {
      fields.push('invoiceAddress');
    }
    
    setVisibleFields(fields);
  }, [formData.userType, formData.needsInvoice]);

  return (
    <form>
      {visibleFields.map(field => (
        <FormField key={field} name={field} />
      ))}
    </form>
  );
};
```

---

### 事例2: 楽楽精算

**特徴**
- OCR自動読み取り
- 二重入力不要
- 差し戻し防止機能

**実装のポイント**
```typescript
// レシートOCR + 自動入力
const ExpenseFormWithOCR = () => {
  const [receiptImage, setReceiptImage] = useState(null);
  const [extractedData, setExtractedData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = async (file) => {
    setIsProcessing(true);
    
    // OCR処理
    const result = await ocrService.extract(file);
    
    setExtractedData({
      date: result.date,
      amount: result.amount,
      merchant: result.merchant,
    });
    
    setIsProcessing(false);
  };

  return (
    <form>
      <div className="receipt-upload">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0])}
        />
        {isProcessing && <p>読み取り中...</p>}
      </div>

      {/* 抽出されたデータを自動入力 */}
      <input
        type="date"
        value={extractedData.date || ''}
        readOnly={!!extractedData.date}
      />
      <input
        type="number"
        value={extractedData.amount || ''}
        readOnly={!!extractedData.amount}
      />
    </form>
  );
};
```

---

### 事例3: Notion

**特徴**
- リアルタイム自動保存
- 無制限のUndo/Redo
- オフライン対応

**実装のポイント**
```typescript
// Notion風の自動保存とオフライン対応
const NotionStyleEditor = () => {
  const [content, setContent] = useState('');
  const [syncStatus, setSyncStatus] = useState('synced');
  const debouncedContent = useDebounce(content, 1000);

  // 自動保存
  useEffect(() => {
    const saveContent = async () => {
      setSyncStatus('saving');
      
      try {
        if (navigator.onLine) {
          await api.save(debouncedContent);
          setSyncStatus('synced');
        } else {
          // オフライン時はローカルに保存
          localStorage.setItem('offline_content', debouncedContent);
          setSyncStatus('offline');
        }
      } catch (error) {
        setSyncStatus('error');
      }
    };

    if (debouncedContent) {
      saveContent();
    }
  }, [debouncedContent]);

  return (
    <div>
      <div className="sync-indicator">
        {syncStatus === 'saving' && '保存中...'}
        {syncStatus === 'synced' && '✓ 保存済み'}
        {syncStatus === 'offline' && '⚠️ オフライン'}
        {syncStatus === 'error' && '❌ 保存失敗'}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
};

// デバウンスフック
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
```

---

### パターン5: レイアウトシフト防止（CLS対策）

#### 概要

エラーメッセージが表示される際に画面が下に伸びる「レイアウトシフト」は、UX上の大きな問題です。Google Core Web VitalsのCLS（Cumulative Layout Shift）スコアを改善し、ユーザー体験を向上させます。

#### 問題点

```typescript
// ❌ 悪い例: display: none/block を使用
<div className="error-message" style={{ display: error ? 'block' : 'none' }}>
  {error}
</div>
```

**悪影響:**
- **CLS（Cumulative Layout Shift）スコアの悪化** (0.25以上 = 不良)
- **ユーザーの視線が強制移動** → 認知負荷の増加
- **次のフィールドの位置がずれる** → 誤クリックの原因
- **プロフェッショナルでない印象**
- **集中力の散漫** → 特に注意力が散りやすいユーザーに影響大

#### 解決策1: スペース事前確保（推奨）★★★★★

```typescript
// ✅ 良い例: opacity + min-height でレイアウトシフトを防止
const FormFieldWithStableLayout = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value) => {
    if (!value) return '';
    if (!value.includes('@')) {
      return '⚠️ メールアドレスには「@」が必要です';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return '⚠️ メールアドレスの形式が正しくありません（例: example@email.com）';
    }
    return '';
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError(validateEmail(value));
  };

  return (
    <div className="form-field">
      <label htmlFor="email">
        メールアドレス <span className="required">*</span>
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={handleChange}
        className={error ? 'invalid' : ''}
        aria-describedby="email-error"
        aria-invalid={!!error}
      />
      {/* 常に領域を確保、opacityで表示制御 */}
      <div 
        id="email-error"
        className={`error-message ${error ? 'show' : ''}`}
        role="alert"
        aria-live="polite"
      >
        {error || '\u00A0'} {/* 空の場合は非表示スペース */}
      </div>
    </div>
  );
};
```

#### CSS実装

```css
/* レイアウトシフト防止のためのスタイル */
.form-field {
  margin-bottom: 1.5rem;
}

.form-field input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  border: 2px solid #e2e8f0;
  font-size: 1rem;
  transition: border-color 0.3s, background-color 0.3s;
}

.form-field input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-field input.invalid {
  border-color: #ff5252;
  background-color: #fff5f5;
}

/* エラーメッセージ用の固定スペースを確保 */
.error-message {
  font-size: 0.875rem;
  color: #ff5252;
  min-height: 1.5rem; /* 1行分の高さを確保 */
  margin-bottom: 0.5rem;
  transition: opacity 0.3s ease; /* スムーズな表示/非表示 */
  opacity: 0; /* デフォルトは透明 */
  display: block; /* 常に表示して領域確保 */
}

/* メッセージ表示時のみ不透明に */
.error-message.show {
  opacity: 1;
}
```

#### CLS（Cumulative Layout Shift）の評価基準

| スコア | 評価 | ユーザー体験 |
|---|---|---|
| **0.1未満** | ✅ 良好 | ストレスなし |
| **0.1〜0.25** | ⚠️ 改善が必要 | やや気になる |
| **0.25以上** | ❌ 不良 | イライラする |

**目標:** CLSスコア **0.05以下**（優秀）

#### 解決策2: 絶対配置

```css
.form-field {
  position: relative;
  margin-bottom: 3rem; /* エラーメッセージ分のスペース */
}

.error-message {
  position: absolute;
  bottom: -1.5rem; /* inputの下に固定配置 */
  left: 0;
  font-size: 0.875rem;
  color: #ff5252;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.error-message.show {
  opacity: 1;
}
```

**メリット:**
- レイアウトに一切影響しない
- 複数フィールドでもスッキリ

**デメリット:**
- スクロール時にエラーが見えにくい場合がある

#### 解決策3: トースト通知（複数フィールド向け）

```typescript
const ToastNotification = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`toast toast-${type}`}
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        animation: 'slideInRight 0.3s ease'
      }}
    >
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'error' ? '⚠️' : '✓'}
        </span>
        <span className="toast-message">{message}</span>
        <button 
          className="toast-close"
          onClick={onClose}
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
```

```css
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast {
  min-width: 300px;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background: white;
}

.toast-error {
  border-left: 4px solid #ff5252;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
```

#### 推奨される選択基準

| シチュエーション | 推奨手法 | CLSスコア | 実装難易度 |
|---|---|---|---|
| 単一フィールド（シンプル） | スペース事前確保 | ✅ 0.0 | 簡単 ⭐⭐⭐⭐⭐ |
| 複数フィールド（短いフォーム） | スペース事前確保 | ✅ 0.0 | 簡単 ⭐⭐⭐⭐⭐ |
| 複数フィールド（長いフォーム） | 絶対配置 or トースト | ✅ 0.0 | 中 ⭐⭐⭐☆☆ |
| モバイル | トースト or 画面上部固定 | ✅ 0.0 | 中 ⭐⭐⭐☆☆ |
| 認知負荷が気になる場合 | スペース事前確保 | ✅ 0.0 | 簡単 ⭐⭐⭐⭐⭐ |

#### デジタル庁・WCAG 2.1との対応

| 基準 | 達成レベル | 関連する達成基準 |
|---|---|---|
| **JIS X 8341-3:2016** | レベルAA | 3.2.1 フォーカス時（達成基準A） |
| **WCAG 2.1** | レベルAA | 3.2.2 入力時（達成基準A） |
| **Core Web Vitals** | 良好 | CLS < 0.1 |

**デジタル庁のガイドライン:**
- 予測可能性の確保
- 視覚的な安定性
- ユーザーの操作を妨げない

#### パフォーマンス測定

```javascript
// CLSをプログラムで測定
import { getCLS } from 'web-vitals';

getCLS((metric) => {
  console.log('CLS score:', metric.value);
  // 0.1未満が目標
  if (metric.value >= 0.1) {
    console.warn('CLSスコアが高すぎます！改善が必要です。');
  }
});
```

**Lighthouse での確認:**
1. Chrome DevTools を開く
2. Lighthouse タブ
3. "Generate report" をクリック
4. "Cumulative Layout Shift" をチェック

#### まとめ

| 手法 | CLS | 実装難易度 | 認知負荷 | 推奨度 |
|---|---|---|---|---|
| `display: none/block` | ❌ 0.3+ | 簡単 | 高い | ⭐☆☆☆☆ |
| `opacity + min-height` | ✅ 0.0 | 簡単 | 低い | ⭐⭐⭐⭐⭐ |
| `position: absolute` | ✅ 0.0 | 中 | 低い | ⭐⭐⭐⭐☆ |
| トースト通知 | ✅ 0.0 | 中〜高 | 中 | ⭐⭐⭐⭐☆ |

**結論:** エラーメッセージ用のスペースを事前に確保し、`opacity`で表示/非表示を制御するのが最もシンプルで効果的です。

---

## チェックリスト

### 認知負荷の軽減

- [ ] 一度に表示する情報量が適切
- [ ] 段階的な情報開示を実装している
- [ ] 現在の位置・状態が常に明確
- [ ] パンくずリストやプログレスバーがある
- [ ] インラインヘルプが利用可能
- [ ] デフォルト値や自動入力を活用
- [ ] 視覚的な手がかりが豊富
- [ ] タスクが小さなステップに分割されている
- [ ] 中断からの復帰が容易
- [ ] セッションタイムアウトの適切な管理
- [ ] 入力済み項目のサマリーが見える
- [ ] 達成感を与える仕組みがある

### 入力ミス防止

- [ ] リアルタイムバリデーションを実装している
- [ ] エラーメッセージは具体的で理解しやすい
- [ ] 必須項目が明確に表示されている
- [ ] 入力フォーマットの例示がある
- [ ] オートコンプリート/サジェスト機能がある
- [ ] ドロップダウンなど選択式入力を活用している
- [ ] 入力マスクで自動フォーマットしている
- [ ] 動的に不要な項目を非表示にしている
- [ ] 入力状態の視覚的フィードバックがある
- [ ] フォームが論理的にグループ化されている

### リカバリー機能

- [ ] 自動保存機能がある
- [ ] Undo/Redo機能がある
- [ ] 重要な操作前に確認ダイアログを表示
- [ ] 下書き保存・復元機能がある
- [ ] エラー時のリトライ機能がある
- [ ] オフライン対応している
- [ ] バージョン履歴を保持している
- [ ] セッション復元機能がある

### アクセシビリティ

- [ ] キーボード操作に対応している
- [ ] ARIA属性を適切に使用している
- [ ] スクリーンリーダー対応している
- [ ] コントラスト比が十分である
- [ ] フォーカス表示が明確である

### パフォーマンス

- [ ] バリデーションが過度に実行されない
- [ ] 大量データでも快適に動作する
- [ ] 自動保存の頻度が適切である
- [ ] 不要な再レンダリングを抑制している

### ユーザー体験

- [ ] 進捗状況が分かりやすい
- [ ] 操作結果のフィードバックがある
- [ ] エラー時の対処法が明確
- [ ] ヘルプ・ガイドが用意されている
- [ ] モバイルでも使いやすい

---

## まとめ

### 重要な設計原則

1. **エラーを起こさせない**: 適切な制約と補助機能
2. **エラーを早期発見**: リアルタイムフィードバック
3. **エラーから迅速に回復**: 自動保存とUndo機能
4. **認知負荷を最小化**: 情報を記憶させない、段階的開示、視覚的手がかり

### 誰もが使いやすいUIの要素

**集中力の維持**
- 一度に1つのタスクに集中できる設計
- 視覚的な手がかりで次の行動が明確
- 達成感を与える小さなゴール設定

**ワーキングメモリーへの配慮**
- 情報を記憶させずに見れば分かるUI
- コンテキスト情報の常時表示
- デフォルト値と自動入力の活用

**中断に強い設計**
- 頻繁な自動保存
- 入力済み項目のサマリー表示
- 作業再開時のスムーズな復帰

### 実装の優先順位

**必須（P0）**
- リアルタイムバリデーション
- 明確なエラーメッセージ
- 必須項目の明示
- 基本的な自動保存

**推奨（P1）**
- オートコンプリート
- Undo/Redo機能
- 確認ダイアログ
- 下書き保存

**あると良い（P2）**
- バージョン履歴
- オフライン対応
- 高度なエラーリカバリー

### 継続的改善

1. **ユーザーフィードバックの収集**
   - エラー発生箇所の分析
   - ユーザーの離脱ポイント特定

2. **A/Bテスト**
   - バリデーションタイミングの最適化
   - エラーメッセージの改善

3. **アクセシビリティ監査**
   - WCAG準拠の確認
   - スクリーンリーダーテスト

---

## 参考リソース

### デザインシステム
- Material Design: https://material.io/
- Ant Design: https://ant.design/
- Carbon Design System: https://carbondesignsystem.com/

### ガイドライン
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- Nielsen Norman Group: https://www.nngroup.com/
- デジタル庁 ユーザビリティガイドライン

### ツール
- React Hook Form: フォーム管理
- Yup/Zod: バリデーションスキーマ
- Formik: フォームライブラリ
- React Query: データ同期

---

**最終更新**: 2025年12月25日

{% endraw %}
