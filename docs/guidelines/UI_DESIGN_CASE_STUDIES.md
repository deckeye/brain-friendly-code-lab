# 実サービス事例集 - エラー防止とリカバリー機能

> **目的**: 実際に使われているサービスの優れた機能を参考資料としてまとめる

---

## 📊 事例一覧

| サービス名 | 業種 | 主要機能 | 特筆すべき点 |
|---|---|---|---|
| SmartDB | 業務管理 | 動的フォーム制御 | 入力内容に応じた項目表示 |
| 楽楽精算 | 経費精算 | OCR自動入力 | レシート読み取り |
| Carebase | 介護記録 | テーブル型UI | 記録漏れ防止 |
| kintone | 業務アプリ | ノーコード | 200以上の外部連携 |
| Notion | ドキュメント | リアルタイム保存 | オフライン対応 |
| BizRobo! | RPA | 自動転記 | ヒューマンエラー根絶 |
| i-Reporter | 現場帳票 | デジタル化 | 記入漏れチェック |
| HACCPヘルパー | 衛生管理 | 簡単入力 | 紙の記録からの脱却 |

---

## 1. SmartDB®（スマートDB）

### 概要
- **提供**: ドリーム・アーツ株式会社
- **用途**: 業務デジタル化プラットフォーム
- **URL**: https://hibiki.dreamarts.co.jp/smartdb/

### 優れた機能

#### 1.1 リアルタイム入力値チェック

**特徴**
- 入力と同時にバリデーション実行
- その場でエラー修正可能
- ユーザーのストレス軽減

**実装イメージ**
```typescript
const SmartDBValidation = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  
  const validateRealtime = (input: string) => {
    // リアルタイムで複数ルールをチェック
    if (input.length > 0 && input.length < 3) {
      setError('3文字以上で入力してください');
    } else if (input.includes('@') && !input.includes('.')) {
      setError('メールアドレスの形式が不完全です');
    } else {
      setError('');
    }
  };
  
  return (
    <div>
      <input 
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          validateRealtime(e.target.value);
        }}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
};
```

#### 1.2 動的項目制御

**特徴**
- ユーザー入力に応じて必要な項目のみ表示
- 不要な項目は非表示にしてシンプルに
- 入力負荷の軽減

**実装イメージ**
```typescript
const DynamicFormControl = () => {
  const [formData, setFormData] = useState({
    userType: '',
    corporateInfo: {},
    individualInfo: {},
  });

  const [visibleFields, setVisibleFields] = useState<string[]>([]);

  useEffect(() => {
    // 基本項目は常に表示
    const fields = ['userType', 'name', 'email'];

    // ユーザータイプに応じて追加
    if (formData.userType === 'corporate') {
      fields.push('companyName', 'department', 'position');
    } else if (formData.userType === 'individual') {
      fields.push('birthDate', 'address');
    }

    // 追加条件
    if (formData.needsInvoice) {
      fields.push('invoiceAddress', 'taxId');
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

#### 1.3 外部データ参照

**特徴**
- 他システムのデータを自動取得
- 手入力を最小化
- データの整合性を保証

**実装イメージ**
```typescript
const ExternalDataReference = () => {
  const [customerId, setCustomerId] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCustomerData = async (id: string) => {
    setLoading(true);
    try {
      // 外部APIから顧客情報を取得
      const response = await fetch(`/api/customers/${id}`);
      const data = await response.json();
      setCustomerData(data);
    } catch (error) {
      console.error('データ取得エラー', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        placeholder="顧客ID"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        onBlur={() => fetchCustomerData(customerId)}
      />
      
      {loading && <p>読み込み中...</p>}
      
      {customerData && (
        <div className="auto-filled">
          <input value={customerData.name} readOnly />
          <input value={customerData.email} readOnly />
          <input value={customerData.phone} readOnly />
        </div>
      )}
    </div>
  );
};
```

---

## 2. 楽楽精算

### 概要
- **提供**: 株式会社ラクス
- **用途**: 経費精算システム
- **URL**: https://www.rakurakuseisan.jp/

### 優れた機能

#### 2.1 OCR自動読み取り

**特徴**
- レシート画像から金額・日付を自動抽出
- 手入力の手間を大幅削減
- 入力ミスの根本的な防止

**実装イメージ**
```typescript
const OCRReceiptInput = () => {
  const [image, setImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const processReceipt = async (file: File) => {
    setProcessing(true);

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await fetch('/api/ocr/receipt', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      setExtractedData({
        date: result.date,
        amount: result.amount,
        merchant: result.merchant,
        category: result.category,
      });
    } catch (error) {
      console.error('OCR処理エラー', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          setImage(file);
          processReceipt(file);
        }}
      />

      {processing && (
        <div className="processing">
          <span>レシートを読み取り中...</span>
          <progress />
        </div>
      )}

      {extractedData && (
        <div className="extracted-data">
          <h3>読み取り結果</h3>
          <div className="field">
            <label>日付</label>
            <input 
              type="date" 
              value={extractedData.date}
              readOnly 
            />
          </div>
          <div className="field">
            <label>金額</label>
            <input 
              type="number" 
              value={extractedData.amount}
              readOnly 
            />
          </div>
          <div className="field">
            <label>店舗</label>
            <input 
              value={extractedData.merchant}
              readOnly 
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 2.2 二重入力の排除

**特徴**
- 一度の入力で全システムに反映
- 差し戻し件数の削減
- 作業時間の半減

**実装イメージ**
```typescript
const UnifiedInput = () => {
  const [expenseData, setExpenseData] = useState({});

  const handleSubmit = async () => {
    // 1回の送信で複数のシステムに反映
    await Promise.all([
      // 経費精算システム
      submitToExpenseSystem(expenseData),
      // 会計システム
      submitToAccountingSystem(expenseData),
      // 承認ワークフロー
      submitToApprovalWorkflow(expenseData),
    ]);

    alert('すべてのシステムに登録されました');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 一度だけ入力 */}
      <input 
        placeholder="費目"
        onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
      />
      <input 
        placeholder="金額"
        onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
      />
      <button type="submit">一括登録</button>
    </form>
  );
};
```

#### 2.3 自動チェック機能

**特徴**
- 規定違反を自動検知
- 提出前にエラー指摘
- 差し戻しの防止

**実装イメージ**
```typescript
const ExpenseValidation = () => {
  const [expense, setExpense] = useState({ amount: 0, category: '' });
  const [warnings, setWarnings] = useState<string[]>([]);

  const checkComplianceRules = (data: typeof expense) => {
    const newWarnings: string[] = [];

    // 規定チェック: 交通費の上限
    if (data.category === '交通費' && data.amount > 10000) {
      newWarnings.push('交通費は10,000円以下で申請してください');
    }

    // 規定チェック: 飲食費の時間帯
    if (data.category === '飲食費' && isLateNight(data.date)) {
      newWarnings.push('深夜の飲食費は申請できません');
    }

    // 規定チェック: レシート必須
    if (data.amount >= 3000 && !data.receiptImage) {
      newWarnings.push('3,000円以上の支出にはレシートが必須です');
    }

    setWarnings(newWarnings);
  };

  useEffect(() => {
    checkComplianceRules(expense);
  }, [expense]);

  return (
    <div>
      {warnings.length > 0 && (
        <div className="warnings">
          <h4>⚠️ 確認が必要な項目があります</h4>
          <ul>
            {warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      {/* フォーム */}
    </div>
  );
};
```

---

## 3. Carebase（ケアベース）

### 概要
- **提供**: Carebase
- **用途**: 介護記録・申し送り管理
- **URL**: https://carebase-lp.com/

### 優れた機能

#### 3.1 テーブル型UI

**特徴**
- 1画面で全体を見渡せる
- 記録漏れを即座に発見
- 直感的な操作性

**実装イメージ**
```typescript
const TableViewRecords = () => {
  const [records, setRecords] = useState([
    { time: '08:00', vital: '', meal: '', note: '' },
    { time: '12:00', vital: '', meal: '', note: '' },
    { time: '18:00', vital: '', meal: '', note: '' },
  ]);

  const updateRecord = (index: number, field: string, value: string) => {
    const newRecords = [...records];
    newRecords[index][field] = value;
    setRecords(newRecords);
  };

  const isMissing = (record: typeof records[0]) => {
    return !record.vital || !record.meal;
  };

  return (
    <table className="care-records">
      <thead>
        <tr>
          <th>時間</th>
          <th>バイタル</th>
          <th>食事</th>
          <th>備考</th>
          <th>状態</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record, index) => (
          <tr 
            key={index}
            className={isMissing(record) ? 'missing' : ''}
          >
            <td>{record.time}</td>
            <td>
              <input
                value={record.vital}
                onChange={(e) => updateRecord(index, 'vital', e.target.value)}
                placeholder="体温・血圧"
              />
            </td>
            <td>
              <input
                value={record.meal}
                onChange={(e) => updateRecord(index, 'meal', e.target.value)}
                placeholder="摂取量"
              />
            </td>
            <td>
              <input
                value={record.note}
                onChange={(e) => updateRecord(index, 'note', e.target.value)}
              />
            </td>
            <td>
              {isMissing(record) ? '⚠️ 未記入' : '✓'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

```css
.care-records tr.missing {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
}
```

#### 3.2 記録漏れ防止

**特徴**
- 必須項目の入力状況を視覚化
- 未入力項目を即座にハイライト
- 提出前の完全性チェック

---

## 4. Notion

### 概要
- **提供**: Notion Labs
- **用途**: ドキュメント管理・コラボレーション
- **URL**: https://www.notion.so/

### 優れた機能

#### 4.1 リアルタイム自動保存

**特徴**
- 入力と同時に自動保存
- ユーザーは保存を意識不要
- データ損失リスクゼロ

**実装イメージ**
```typescript
const NotionStyleAutoSave = () => {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    if (debouncedContent) {
      saveToServer(debouncedContent);
    }
  }, [debouncedContent]);

  const saveToServer = async (data: string) => {
    setSaveStatus('saving');
    
    try {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content: data }),
      });
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    }
  };

  return (
    <div>
      <div className="save-indicator">
        {saveStatus === 'saving' && '💾 保存中...'}
        {saveStatus === 'saved' && '✓ 保存済み'}
        {saveStatus === 'error' && '⚠️ 保存失敗'}
      </div>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setSaveStatus('editing');
        }}
        placeholder="入力を開始..."
      />
    </div>
  );
};
```

#### 4.2 無制限のUndo/Redo

**特徴**
- すべての編集履歴を保持
- いつでも過去の状態に戻れる
- 安心して編集できる

#### 4.3 オフライン対応

**特徴**
- オフライン時もローカルに保存
- オンライン復帰時に自動同期
- ネットワーク環境に依存しない

**実装イメージ**
```typescript
const OfflineSupport = () => {
  const [content, setContent] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveContent = async (data: string) => {
    if (isOnline) {
      // オンライン: サーバーに保存
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content: data }),
      });
    } else {
      // オフライン: ローカルに保存
      localStorage.setItem('offline_content', data);
      localStorage.setItem('offline_pending', 'true');
    }
  };

  const syncPendingChanges = async () => {
    if (localStorage.getItem('offline_pending') === 'true') {
      const pendingContent = localStorage.getItem('offline_content');
      
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content: pendingContent }),
      });

      localStorage.removeItem('offline_pending');
    }
  };

  return (
    <div>
      <div className={`network-status ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? '🟢 オンライン' : '🔴 オフライン'}
      </div>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          saveContent(e.target.value);
        }}
      />
    </div>
  );
};
```

---

## 5. BizRobo!（RPA）

### 概要
- **提供**: RPAテクノロジーズ株式会社
- **用途**: 業務自動化
- **URL**: https://rpa-technologies.com/

### 優れた機能

#### 5.1 自動転記によるミス防止

**特徴**
- 人間の手入力を完全排除
- システム間のデータ転記を自動化
- ヒューマンエラーの根絶

**実装イメージ**
```typescript
const AutomatedDataTransfer = () => {
  const transferData = async (sourceSystemId: string, targetSystemId: string) => {
    try {
      // 元システムからデータ取得
      const sourceData = await fetch(`/api/source/${sourceSystemId}`).then(r => r.json());

      // データ変換
      const transformedData = transformForTargetSystem(sourceData);

      // 対象システムに自動登録
      await fetch(`/api/target/${targetSystemId}`, {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });

      console.log('自動転記完了: エラー0件');
    } catch (error) {
      console.error('自動転記エラー', error);
      // エラー時は管理者に通知
      notifyAdmin(error);
    }
  };

  return (
    <button onClick={() => transferData('system-a', 'system-b')}>
      データ自動転記を実行
    </button>
  );
};
```

---

## 🎯 まとめ：各サービスから学べること

### エラー防止の戦略

| サービス | 戦略 | 具体的手法 |
|---|---|---|
| SmartDB | 動的制御 | 必要な項目だけ表示 |
| 楽楽精算 | 自動入力 | OCRで手入力排除 |
| Carebase | 視覚化 | テーブルで漏れを即座に発見 |
| Notion | 自動保存 | ユーザーに保存させない |
| BizRobo! | 自動化 | 人間の操作を排除 |

### リカバリーの戦略

| サービス | 戦略 | 具体的手法 |
|---|---|---|
| SmartDB | リアルタイム | その場でエラー修正 |
| 楽楽精算 | 事前チェック | 提出前に規定違反を指摘 |
| Notion | 履歴保持 | 無制限のUndo |
| Notion | オフライン対応 | ローカル保存→自動同期 |

---

## 📚 参考情報

### 各サービスの公式サイト

- SmartDB: https://hibiki.dreamarts.co.jp/smartdb/
- 楽楽精算: https://www.rakurakuseisan.jp/
- Carebase: https://carebase-lp.com/
- kintone: https://kintone.cybozu.co.jp/
- Notion: https://www.notion.so/
- BizRobo!: https://rpa-technologies.com/

---

**最終更新**: 2025年12月25日

