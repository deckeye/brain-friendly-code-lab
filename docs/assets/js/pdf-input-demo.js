// PDF入力アシスタント - デモ用JavaScript（自動修正機能付き）

// ===== 入力自動修正クラス =====
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
        return str.replace(/[-\s,、]/g, '');
    }
    
    // 金額クリーン（保存用）
    static cleanCurrency(str) {
        return this.removeSeparators(this.toHalfWidthNumber(str.replace(/[¥円,]/g, '')));
    }
    
    // 金額整形（表示用・3桁区切り）
    static formatCurrency(num) {
        const cleaned = this.cleanCurrency(num.toString());
        if (!/^\d+$/.test(cleaned)) return num;
        return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // 請求書番号整形
    static formatInvoiceNumber(str) {
        // 全角→半角
        let result = this.toHalfWidthAlpha(this.toHalfWidthNumber(str));
        // 大文字に統一
        result = result.toUpperCase();
        // スペース削除
        result = result.replace(/\s/g, '');
        return result;
    }
}

// ===== サンプルPDFデータ =====
const samplePDFData = {
    title: "請求書",
    companyName: "株式会社サンプル商事",
    invoiceNumber: "INV-2025-001",
    invoiceDate: "2025年12月25日",
    dueDate: "2026年1月25日",
    amount: "¥1,250,000",
    items: [
        { name: "商品A", quantity: 10, unitPrice: "¥50,000" },
        { name: "商品B", quantity: 5, unitPrice: "¥100,000" }
    ]
};

// ===== フォームデータ =====
let formData = {
    companyName: '',
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    amount: '',
    notes: ''
};

// ===== 現在のレイアウト =====
let currentLayout = 'split';

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', () => {
    initLayoutButtons();
    renderLayout(currentLayout);
    initAutosave();
});

// ===== レイアウトボタンの初期化 =====
function initLayoutButtons() {
    const buttons = document.querySelectorAll('.layout-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentLayout = button.dataset.layout;
            renderLayout(currentLayout);
        });
    });
}

// ===== レイアウトのレンダリング =====
function renderLayout(layout) {
    const container = document.getElementById('layoutContent');
    
    switch(layout) {
        case 'split':
            container.innerHTML = renderSplitLayout();
            break;
        case 'tabs':
            container.innerHTML = renderTabsLayout();
            initTabs();
            break;
        case 'overlay':
            container.innerHTML = renderOverlayLayout();
            initOverlay();
            break;
    }
    
    initFormInputs();
    updateProgress();
}

// ===== 左右分割レイアウト =====
function renderSplitLayout() {
    return `
        <div class="layout-split">
            <div class="pdf-viewer">
                ${renderPDFContent()}
            </div>
            <div class="form-area">
                ${renderForm()}
            </div>
        </div>
    `;
}

// ===== タブ切り替えレイアウト =====
function renderTabsLayout() {
    return `
        <div class="layout-tabs">
            <div class="tab-headers">
                <button class="tab-header active" data-tab="pdf">📄 PDFを見る</button>
                <button class="tab-header" data-tab="form">✏️ 入力する (${getFilledCount()}/6)</button>
            </div>
            <div class="tab-content active" data-tab="pdf">
                <div class="pdf-viewer">
                    ${renderPDFContent()}
                </div>
            </div>
            <div class="tab-content" data-tab="form">
                <div class="form-area">
                    ${renderForm()}
                </div>
            </div>
        </div>
    `;
}

// ===== オーバーレイレイアウト（改善版） =====
function renderOverlayLayout() {
    return `
        <div class="layout-overlay">
            <div class="pdf-viewer" style="min-height: 100vh;">
                ${renderPDFContent()}
            </div>
            <button class="overlay-btn" id="overlayBtn" aria-label="入力フォームを開く">
                ✏️
                <span class="overlay-btn-badge">${getFilledCount()}/6</span>
            </button>
            <div class="overlay-form" id="overlayForm">
                <div class="overlay-header">
                    <h3 style="margin: 0;">📝 データ入力</h3>
                    <button class="overlay-close-btn" id="overlayCloseBtn" aria-label="閉じる">✕</button>
                </div>
                <div class="form-area" style="max-height: calc(70vh - 60px); padding-top: 1rem;">
                    ${renderForm()}
                </div>
            </div>
        </div>
    `;
}

// ===== 入力済みフィールド数を取得 =====
function getFilledCount() {
    const requiredFields = ['companyName', 'invoiceNumber', 'invoiceDate', 'dueDate', 'amount'];
    const filledFields = requiredFields.filter(field => {
        const value = formData[field];
        return value && value.toString().trim() !== '';
    });
    return filledFields.length + (formData.notes ? 1 : 0);
}

// ===== PDFコンテンツのレンダリング =====
function renderPDFContent() {
    return `
        <div class="pdf-content">
            <h2>${samplePDFData.title}</h2>
            
            <div class="field-group">
                <div class="label">会社名</div>
                <div class="value">${samplePDFData.companyName}</div>
            </div>
            
            <div class="field-group">
                <div class="label">請求書番号</div>
                <div class="value">${samplePDFData.invoiceNumber}</div>
            </div>
            
            <div class="field-group">
                <div class="label">請求日</div>
                <div class="value">${samplePDFData.invoiceDate}</div>
            </div>
            
            <div class="field-group">
                <div class="label">支払期日</div>
                <div class="value">${samplePDFData.dueDate}</div>
            </div>
            
            <div class="field-group">
                <div class="label">合計金額</div>
                <div class="value" style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">
                    ${samplePDFData.amount}
                </div>
            </div>
            
            <div class="field-group">
                <div class="label">明細</div>
                ${samplePDFData.items.map(item => `
                    <div style="margin-left: 1rem; margin-top: 0.5rem;">
                        ${item.name} × ${item.quantity} = ${item.unitPrice}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ===== フォームのレンダリング =====
function renderForm() {
    return `
        <h3 style="margin-bottom: 1.5rem; color: var(--primary);">📝 データ入力</h3>
        
        <div class="auto-format-notice" style="background: #e3f2fd; padding: 0.75rem; border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.875rem; color: #1565c0;">
            ✨ 全角文字や区切り文字は自動で修正されます
        </div>
        
        <div class="form-group">
            <label class="form-label">
                会社名 <span class="required">*</span>
                <span class="tooltip">
                    <span class="tooltip-icon">?</span>
                    <span class="tooltip-content">PDFに記載されている会社名を入力</span>
                </span>
            </label>
            <input 
                type="text" 
                class="form-input" 
                id="companyName"
                placeholder="例: 株式会社サンプル商事"
                value="${formData.companyName}"
            >
            <div class="hint-message show">💡 全角・半角どちらでもOK</div>
            <div class="error-message" id="companyName-error"></div>
            <div class="success-message" id="companyName-success"></div>
        </div>
        
        <div class="form-group">
            <label class="form-label">
                請求書番号 <span class="required">*</span>
            </label>
            <input 
                type="text" 
                class="form-input" 
                id="invoiceNumber"
                placeholder="例: INV-2025-001"
                value="${formData.invoiceNumber}"
            >
            <div class="hint-message show">💡 自動で大文字・半角に変換されます</div>
            <div class="error-message" id="invoiceNumber-error"></div>
            <div class="success-message" id="invoiceNumber-success"></div>
        </div>
        
        <div class="form-group">
            <label class="form-label">
                請求日 <span class="required">*</span>
            </label>
            <input 
                type="date" 
                class="form-input" 
                id="invoiceDate"
                value="${formData.invoiceDate}"
            >
            <div class="hint-message show">💡 PDFの日付をYYYY-MM-DD形式で入力</div>
            <div class="error-message" id="invoiceDate-error"></div>
            <div class="success-message" id="invoiceDate-success"></div>
        </div>
        
        <div class="form-group">
            <label class="form-label">
                支払期日 <span class="required">*</span>
            </label>
            <input 
                type="date" 
                class="form-input" 
                id="dueDate"
                value="${formData.dueDate}"
            >
            <div class="error-message" id="dueDate-error"></div>
            <div class="success-message" id="dueDate-success"></div>
        </div>
        
        <div class="form-group">
            <label class="form-label">
                金額 <span class="required">*</span>
            </label>
            <input 
                type="text" 
                class="form-input" 
                id="amount"
                placeholder="例: 1250000"
                value="${formData.amount}"
            >
            <div class="hint-message show">💡 ¥や,（カンマ）は自動で削除されます</div>
            <div class="error-message" id="amount-error"></div>
            <div class="success-message" id="amount-success"></div>
        </div>
        
        <div class="form-group">
            <label class="form-label">備考</label>
            <textarea 
                class="form-input" 
                id="notes"
                rows="3"
                placeholder="必要に応じて備考を入力"
            >${formData.notes}</textarea>
            <div class="success-message" id="notes-success"></div>
        </div>
        
        <div class="form-actions">
            <button class="btn btn-primary" id="submitBtn">
                ✓ 送信する
            </button>
            <button class="btn btn-secondary" id="clearBtn">
                🔄 クリア
            </button>
        </div>
    `;
}

// ===== タブの初期化 =====
function initTabs() {
    const headers = document.querySelectorAll('.tab-header');
    const contents = document.querySelectorAll('.tab-content');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const tab = header.dataset.tab;
            
            headers.forEach(h => h.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            header.classList.add('active');
            document.querySelector(`.tab-content[data-tab="${tab}"]`).classList.add('active');
        });
    });
}

// ===== オーバーレイの初期化（改善版） =====
function initOverlay() {
    const btn = document.getElementById('overlayBtn');
    const form = document.getElementById('overlayForm');
    const closeBtn = document.getElementById('overlayCloseBtn');
    
    // FABボタンでトグル
    btn.addEventListener('click', () => {
        const isActive = form.classList.contains('active');
        form.classList.toggle('active');
        btn.setAttribute('aria-expanded', !isActive);
        
        // バッジを更新
        const badge = btn.querySelector('.overlay-btn-badge');
        if (badge) {
            badge.textContent = `${getFilledCount()}/6`;
        }
    });
    
    // 閉じるボタン
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            form.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
        });
    }
    
    // 背景クリックで閉じる（オプション）
    form.addEventListener('click', (e) => {
        if (e.target === form) {
            form.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
        }
    });
}

// ===== フォーム入力の初期化（自動修正機能付き） =====
function initFormInputs() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        // リアルタイムバリデーション + 自動修正
        input.addEventListener('input', (e) => {
            const field = e.target.id;
            let value = e.target.value;
            
            // 自動修正を適用
            value = applyAutoCorrection(field, value);
            
            // 修正後の値を設定（カーソル位置を保持）
            if (e.target.value !== value) {
                const cursorPos = e.target.selectionStart;
                e.target.value = value;
                e.target.setSelectionRange(cursorPos, cursorPos);
            }
            
            formData[field] = value;
            validateField(field, value);
            updateProgress();
            
            // タブのラベル更新（タブレイアウトの場合）
            updateTabLabels();
        });
    });
    
    // 送信ボタン
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
    
    // クリアボタン
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
    }
}

// ===== 自動修正を適用 =====
function applyAutoCorrection(field, value) {
    switch(field) {
        case 'invoiceNumber':
            // 請求書番号: 全角→半角、大文字化
            return InputFormatter.formatInvoiceNumber(value);
            
        case 'amount':
            // 金額: 全角→半角、¥・カンマ削除
            return InputFormatter.cleanCurrency(value);
            
        case 'companyName':
            // 会社名: そのまま（全角半角混在OK）
            return value;
            
        default:
            return value;
    }
}

// ===== フィールドバリデーション =====
function validateField(field, value) {
    const errorEl = document.getElementById(`${field}-error`);
    const successEl = document.getElementById(`${field}-success`);
    const inputEl = document.getElementById(field);
    
    if (!errorEl || !successEl || !inputEl) return;
    
    // エラー・成功メッセージをリセット
    errorEl.classList.remove('show');
    successEl.classList.remove('show');
    inputEl.classList.remove('valid', 'invalid');
    
    // 空の場合はスキップ（備考以外）
    if (!value && field !== 'notes') {
        return;
    }
    
    let isValid = true;
    let errorMessage = '';
    
    switch(field) {
        case 'companyName':
            if (value.length < 2) {
                isValid = false;
                errorMessage = '⚠️ 会社名は2文字以上で入力してください';
            }
            break;
            
        case 'invoiceNumber':
            if (!/^[A-Z]+-\d+-\d+$/.test(value)) {
                isValid = false;
                errorMessage = '⚠️ 形式が正しくありません（例: INV-2025-001）';
            }
            break;
            
        case 'invoiceDate':
        case 'dueDate':
            if (!value) {
                isValid = false;
                errorMessage = '⚠️ 日付を選択してください';
            }
            break;
            
        case 'amount':
            if (!/^\d+$/.test(value)) {
                isValid = false;
                errorMessage = '⚠️ 数字のみで入力してください';
            } else if (parseInt(value) <= 0) {
                isValid = false;
                errorMessage = '⚠️ 金額は1以上で入力してください';
            }
            break;
    }
    
    if (!isValid) {
        errorEl.textContent = errorMessage;
        errorEl.classList.add('show');
        inputEl.classList.add('invalid');
    } else if (value) {
        let successMessage = '✓ 正しい形式です';
        
        // 金額の場合は3桁区切りで表示
        if (field === 'amount' && value) {
            const formatted = InputFormatter.formatCurrency(value);
            successMessage = `✓ 正しい形式です（表示: ¥${formatted}）`;
        }
        
        successEl.textContent = successMessage;
        successEl.classList.add('show');
        inputEl.classList.add('valid');
    }
}

// ===== 進捗更新 =====
function updateProgress() {
    const requiredFields = ['companyName', 'invoiceNumber', 'invoiceDate', 'dueDate', 'amount'];
    const filledFields = requiredFields.filter(field => {
        const value = formData[field];
        return value && value.toString().trim() !== '';
    });
    
    const total = requiredFields.length + 1; // +1 for notes (optional)
    const filled = filledFields.length + (formData.notes ? 1 : 0);
    const percent = Math.round((filled / total) * 100);
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${filled}/${total}`;
    if (progressPercent) progressPercent.textContent = percent;
    
    // オーバーレイボタンのバッジを更新
    const overlayBtn = document.getElementById('overlayBtn');
    if (overlayBtn) {
        const badge = overlayBtn.querySelector('.overlay-btn-badge');
        if (badge) {
            badge.textContent = `${filled}/${total}`;
        }
    }
}

// ===== タブラベルを更新 =====
function updateTabLabels() {
    const formTab = document.querySelector('[data-tab="form"]');
    if (formTab) {
        formTab.textContent = `✏️ 入力する (${getFilledCount()}/6)`;
    }
}

// ===== 自動保存 =====
function initAutosave() {
    setInterval(() => {
        // 何か入力されていれば自動保存
        const hasData = Object.values(formData).some(value => value && value.toString().trim() !== '');
        
        if (hasData) {
            localStorage.setItem('pdfFormData', JSON.stringify(formData));
            showAutosaveIndicator();
        }
    }, 5000); // 5秒ごと
    
    // ページ読み込み時にデータを復元
    const savedData = localStorage.getItem('pdfFormData');
    if (savedData) {
        formData = JSON.parse(savedData);
    }
}

// ===== 自動保存インジケーター表示 =====
function showAutosaveIndicator() {
    const indicator = document.getElementById('autosaveIndicator');
    indicator.classList.add('show');
    
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

// ===== 送信処理 =====
function handleSubmit() {
    const requiredFields = ['companyName', 'invoiceNumber', 'invoiceDate', 'dueDate', 'amount'];
    const emptyFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '');
    
    if (emptyFields.length > 0) {
        alert('⚠️ 必須項目をすべて入力してください');
        return;
    }
    
    // すべてのフィールドをバリデーション
    let hasErrors = false;
    requiredFields.forEach(field => {
        validateField(field, formData[field]);
        const errorEl = document.getElementById(`${field}-error`);
        if (errorEl && errorEl.classList.contains('show')) {
            hasErrors = true;
        }
    });
    
    if (hasErrors) {
        alert('⚠️ 入力内容に誤りがあります。エラーメッセージを確認してください。');
        return;
    }
    
    // 送信成功（金額は表示用に整形）
    const displayData = {
        ...formData,
        amount: `¥${InputFormatter.formatCurrency(formData.amount)}`
    };
    
    alert('✅ データを送信しました！\n\n' + JSON.stringify(displayData, null, 2));
    
    // フォームをクリア
    handleClear();
}

// ===== クリア処理 =====
function handleClear() {
    if (!confirm('入力内容をクリアしてもよろしいですか？')) {
        return;
    }
    
    formData = {
        companyName: '',
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        amount: '',
        notes: ''
    };
    
    localStorage.removeItem('pdfFormData');
    renderLayout(currentLayout);
}
