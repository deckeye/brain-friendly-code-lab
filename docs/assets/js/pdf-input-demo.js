// PDF入力アシスタント - デモ用JavaScript（自動修正機能付き）

// ===== ユーザー設定管理 =====
class UserSettings {
    constructor() {
        this.storageKey = 'pdfInputSettings';
        this.settings = this.load();
    }
    
    // 設定を読み込む
    load() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }
        return this.getDefaults();
    }
    
    // デフォルト設定
    getDefaults() {
        return {
            dateFormat: 'auto',  // 'auto', 'jp' (MM-DD), 'eu' (DD-MM), 'us' (MM-DD)
            autoExtractDates: true
        };
    }
    
    // 設定を保存
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    }
    
    // 設定を取得
    get(key) {
        return this.settings[key];
    }
    
    // 設定を更新
    set(key, value) {
        this.settings[key] = value;
        this.save();
    }
}

// グローバルな設定インスタンス
const userSettings = new UserSettings();

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
    
    // 半角カナ→全角カナ
    static toFullWidthKana(str) {
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
    
    // 会社名整形
    static formatCompanyName(str) {
        let result = str;
        
        // 1. 半角カナ→全角カナ（確実に正しい変換）
        result = this.toFullWidthKana(result);
        
        // 2. 全角英数字→半角英数字（会社名のABC等）
        result = this.toHalfWidthAlpha(this.toHalfWidthNumber(result));
        
        // 3. 前後の空白をトリム
        result = result.trim();
        
        // 4. 連続する空白を1つに
        result = result.replace(/\s+/g, ' ');
        
        // 5. 全角スペースを半角スペースに統一
        result = result.replace(/　/g, ' ');
        
        return result;
    }
    
    // 日付パーサー（様々なフォーマットに対応）
    static parseDate(input) {
        if (!input) return '';
        
        try {
            // 1. 全角→半角変換
            let normalized = this.toHalfWidthNumber(this.toHalfWidthAlpha(input));
            
            // 2. 和暦→西暦変換
            normalized = this.convertWarekiToSeireki(normalized);
            
            // 3. 曜日を削除
            normalized = normalized.replace(/\([月火水木金土日]\)/g, '');
            
            // 4. パターンマッチング
            const patterns = [
                // ISO形式: 2025-12-25
                { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, format: 'YYYY-MM-DD' },
                
                // スラッシュ: 2025/12/25
                { regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, format: 'YYYY/MM/DD' },
                
                // ドット: 2025.12.25
                { regex: /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/, format: 'YYYY.MM.DD' },
                
                // スペース: 2025 12 25
                { regex: /^(\d{4})\s+(\d{1,2})\s+(\d{1,2})$/, format: 'YYYY MM DD' },
                
                // 8桁数字: 20251225
                { regex: /^(\d{4})(\d{2})(\d{2})$/, format: 'YYYYMMDD' },
                
                // 日本語形式: 2025年12月25日
                { regex: /^(\d{4})年(\d{1,2})月(\d{1,2})日$/, format: 'YYYY年MM月DD日' },
                
                // 欧州形式（ハイフン）: 25-01-2025 → 2025-01-25
                { regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, format: 'DD-MM-YYYY' },
                
                // 欧州形式（スラッシュ）: 25/01/2025 → 2025-01-25
                { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, format: 'DD/MM/YYYY' },
                
                // 月日のみ: 12/25 → 今年の12月25日
                { regex: /^(\d{1,2})\/(\d{1,2})$/, format: 'MM/DD' },
                
                // 月日のみ: 12-25 → 今年の12月25日
                { regex: /^(\d{1,2})-(\d{1,2})$/, format: 'MM-DD' },
                
                // 月日のみ: 1225 → 今年の12月25日
                { regex: /^(\d{2})(\d{2})$/, format: 'MMDD' },
                
                // 年月のみ: 2025/12 → 2025-12-01
                { regex: /^(\d{4})\/(\d{1,2})$/, format: 'YYYY/MM' },
                
                // 年月のみ: 2025-12 → 2025-12-01
                { regex: /^(\d{4})-(\d{1,2})$/, format: 'YYYY-MM' },
                
                // 年月のみ: 202512 → 2025-12-01
                { regex: /^(\d{4})(\d{2})$/, format: 'YYYYMM' },
                
                // 日本語（月日のみ）: 12月25日 → 今年の12月25日
                { regex: /^(\d{1,2})月(\d{1,2})日$/, format: 'MM月DD日' }
            ];
            
            for (const pattern of patterns) {
                const match = normalized.match(pattern.regex);
                if (match) {
                    return this.formatDateFromMatch(match, pattern.format);
                }
            }
            
            // 5. 相対日付（今日、明日、昨日）
            if (/^(今日|きょう)$/.test(normalized)) {
                return this.formatDateObject(new Date());
            }
            if (/^(明日|あした)$/.test(normalized)) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return this.formatDateObject(tomorrow);
            }
            if (/^(昨日|きのう)$/.test(normalized)) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return this.formatDateObject(yesterday);
            }
            
            // 6. 相対日付（+7、-7）
            const relativeMatch = normalized.match(/^([+-])(\d+)$/);
            if (relativeMatch) {
                const days = parseInt(relativeMatch[2], 10);
                const sign = relativeMatch[1];
                const date = new Date();
                date.setDate(date.getDate() + (sign === '+' ? days : -days));
                return this.formatDateObject(date);
            }
            
            // 7. フォールバック: そのまま返す（バリデーションでエラーにする）
            return normalized;
            
        } catch (e) {
            if (e.message === 'AMBIGUOUS_DATE') {
                // 曖昧な日付の場合は特別なマーカーを返す
                return 'AMBIGUOUS:' + input;
            }
            console.error('Date parse error:', e);
            return input;
        }
    }
    
    // 和暦→西暦変換
    static convertWarekiToSeireki(str) {
        const warekiMap = {
            '令和': 2018, // 令和元年 = 2019年
            'R': 2018,
            '平成': 1988, // 平成元年 = 1989年
            'H': 1988,
            '昭和': 1925, // 昭和元年 = 1926年
            'S': 1925,
            '大正': 1911, // 大正元年 = 1912年
            'T': 1911,
            '明治': 1867  // 明治元年 = 1868年
        };
        
        for (const era in warekiMap) {
            // 「令和6年12月25日」形式
            let regex = new RegExp(`^${era}(\\d{1,2})年(\\d{1,2})月(\\d{1,2})日$`);
            let match = str.match(regex);
            if (match) {
                const year = warekiMap[era] + parseInt(match[1], 10);
                const month = match[2].padStart(2, '0');
                const day = match[3].padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
            
            // 「R6.12.25」形式
            regex = new RegExp(`^${era}(\\d{1,2})\\.(\\d{1,2})\\.(\\d{1,2})$`);
            match = str.match(regex);
            if (match) {
                const year = warekiMap[era] + parseInt(match[1], 10);
                const month = match[2].padStart(2, '0');
                const day = match[3].padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
            
            // 「R6/12/25」形式
            regex = new RegExp(`^${era}(\\d{1,2})/(\\d{1,2})/(\\d{1,2})$`);
            match = str.match(regex);
            if (match) {
                const year = warekiMap[era] + parseInt(match[1], 10);
                const month = match[2].padStart(2, '0');
                const day = match[3].padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
            
            // 「R6-12-25」形式
            regex = new RegExp(`^${era}(\\d{1,2})-(\\d{1,2})-(\\d{1,2})$`);
            match = str.match(regex);
            if (match) {
                const year = warekiMap[era] + parseInt(match[1], 10);
                const month = match[2].padStart(2, '0');
                const day = match[3].padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        }
        
        return str;
    }
    
    // マッチ結果からフォーマット
    static formatDateFromMatch(match, format) {
        const now = new Date();
        let year, month, day;
        
        switch(format) {
            case 'YYYY-MM-DD':
            case 'YYYY/MM/DD':
            case 'YYYY.MM.DD':
            case 'YYYY MM DD':
            case 'YYYY年MM月DD日':
                year = match[1];
                month = match[2].padStart(2, '0');
                day = match[3].padStart(2, '0');
                break;
                
            case 'YYYYMMDD':
                year = match[1];
                month = match[2];
                day = match[3];
                break;
                
            case 'MM/DD':
            case 'MM-DD':
            case 'MM月DD日':
                year = now.getFullYear();
                month = match[1].padStart(2, '0');
                day = match[2].padStart(2, '0');
                break;
                
            case 'MMDD':
                year = now.getFullYear();
                month = match[1];
                day = match[2];
                break;
                
            case 'YYYY/MM':
            case 'YYYY-MM':
                year = match[1];
                month = match[2].padStart(2, '0');
                day = '01';
                break;
                
            case 'YYYYMM':
                year = match[1];
                month = match[2];
                day = '01';
                break;
                
            case 'DD/MM/YYYY':
            case 'DD-MM-YYYY':
                // 曖昧さチェック: 両方の数値が12以下の場合
                const firstNum = parseInt(match[1], 10);
                const secondNum = parseInt(match[2], 10);
                
                if (firstNum <= 12 && secondNum <= 12) {
                    // 曖昧！設定に従う
                    const preference = userSettings.get('dateFormat');
                    
                    if (preference === 'eu') {
                        // 欧州形式（DD-MM-YYYY）
                        day = match[1].padStart(2, '0');
                        month = match[2].padStart(2, '0');
                        year = match[3];
                    } else if (preference === 'us' || preference === 'jp') {
                        // 米国/日本形式（MM-DD-YYYY）
                        month = match[1].padStart(2, '0');
                        day = match[2].padStart(2, '0');
                        year = match[3];
                    } else {
                        // auto: 判別不能エラー
                        throw new Error('AMBIGUOUS_DATE');
                    }
                } else if (firstNum > 12) {
                    // 確実に欧州形式（日が12より大きい）
                    day = match[1].padStart(2, '0');
                    month = match[2].padStart(2, '0');
                    year = match[3];
                } else {
                    // 確実に米国形式（月が12より大きい）
                    month = match[1].padStart(2, '0');
                    day = match[2].padStart(2, '0');
                    year = match[3];
                }
                break;
                
            case 'MM/DD/YYYY':
                month = match[1].padStart(2, '0');
                day = match[2].padStart(2, '0');
                year = match[3];
                break;
                
            default:
                return '';
        }
        
        // バリデーション
        if (!this.isValidDate(year, month, day)) {
            return '';
        }
        
        return `${year}-${month}-${day}`;
    }
    
    // Dateオブジェクトからフォーマット
    static formatDateObject(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // 日付の妥当性チェック
    static isValidDate(year, month, day) {
        const y = parseInt(year, 10);
        const m = parseInt(month, 10);
        const d = parseInt(day, 10);
        
        if (y < 1900 || y > 2100) return false;
        if (m < 1 || m > 12) return false;
        if (d < 1 || d > 31) return false;
        
        // 月ごとの日数チェック
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        
        // うるう年チェック
        if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) {
            daysInMonth[1] = 29;
        }
        
        if (d > daysInMonth[m - 1]) return false;
        
        return true;
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
            <div class="overlay-form" id="overlayForm">
                <div class="overlay-header" id="overlayHeader">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <h3 style="margin: 0;">📝 データ入力</h3>
                        <span class="overlay-progress-badge">${getFilledCount()}/6</span>
                    </div>
                    <button class="overlay-toggle-btn" id="overlayToggleBtn" aria-label="フォームを展開・折りたたむ">
                        »
                    </button>
                </div>
                <div class="overlay-content">
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
    // 今日の日付を取得（プレースホルダー用）
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayDisplay = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
    
    return `
        <h3 style="margin-bottom: 1.5rem; color: var(--primary);">📝 データ入力</h3>
        
        <div class="auto-format-notice" style="background: #e3f2fd; padding: 0.75rem; border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.875rem; color: #1565c0;">
            ✨ 全角文字や区切り文字は自動で修正されます
        </div>
        
        <div class="form-group">
            <label class="form-label">
                会社名 <span class="required">*</span>
                <span class="hint-icon" title="半角カナは自動で全角に、英数字は半角に変換されます">ⓘ</span>
            </label>
            <div class="form-field-wrapper">
                <input 
                    type="text" 
                    class="form-input" 
                    id="companyName"
                    placeholder="例: 株式会社サンプル商事"
                    value="${formData.companyName}"
                >
                <div class="error-icon" id="companyName-error-icon" style="display: none;">⚠</div>
                <div class="error-tooltip" id="companyName-error-tooltip"></div>
                <div class="error-annotation" id="companyName-error-annotation"></div>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">
                請求書番号 <span class="required">*</span>
                <span class="hint-icon" title="自動で大文字・半角に変換されます">ⓘ</span>
            </label>
            <div class="form-field-wrapper">
                <input 
                    type="text" 
                    class="form-input" 
                    id="invoiceNumber"
                    placeholder="例: INV-2025-001"
                    value="${formData.invoiceNumber}"
                >
                <div class="error-icon" id="invoiceNumber-error-icon" style="display: none;">⚠</div>
                <div class="error-tooltip" id="invoiceNumber-error-tooltip"></div>
                <div class="error-annotation" id="invoiceNumber-error-annotation"></div>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">
                請求日 <span class="required">*</span>
                <span class="hint-icon" title="推奨: YYYY/MM/DD、YYYY-MM-DD、和暦も対応">ⓘ</span>
                <button class="settings-btn" id="dateSettingsBtn" title="日付フォーマット設定">⚙️</button>
            </label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <div class="form-field-wrapper" style="flex: 1;">
                    <input 
                        type="text" 
                        class="form-input" 
                        id="invoiceDate"
                        placeholder="${todayDisplay} (今日)"
                        value="${formData.invoiceDate}"
                        list="invoiceDate-datalist"
                    >
                    <div class="error-icon" id="invoiceDate-error-icon" style="display: none;">⚠</div>
                    <div class="error-tooltip" id="invoiceDate-error-tooltip"></div>
                    <div class="error-annotation" id="invoiceDate-error-annotation"></div>
                </div>
                <input 
                    type="date" 
                    class="form-input" 
                    id="invoiceDate-calendar"
                    value="${formData.invoiceDate}"
                    style="width: 150px;"
                    title="カレンダーから選択"
                >
            </div>
            <datalist id="invoiceDate-datalist">
                <option value="${todayDisplay}">今日</option>
                <option value="2025/12/25">2025/12/25</option>
                <option value="令和6年12月25日">令和6年12月25日</option>
            </datalist>
        </div>
        
        <div class="form-group">
            <label class="form-label">
                支払期日 <span class="required">*</span>
                <span class="hint-icon" title="推奨: YYYY/MM/DD、YYYY-MM-DD、和暦も対応">ⓘ</span>
            </label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <div class="form-field-wrapper" style="flex: 1;">
                    <input 
                        type="text" 
                        class="form-input" 
                        id="dueDate"
                        placeholder="${todayDisplay} (今日)"
                        value="${formData.dueDate}"
                        list="dueDate-datalist"
                    >
                    <div class="error-icon" id="dueDate-error-icon" style="display: none;">⚠</div>
                    <div class="error-tooltip" id="dueDate-error-tooltip"></div>
                    <div class="error-annotation" id="dueDate-error-annotation"></div>
                </div>
                <input 
                    type="date" 
                    class="form-input" 
                    id="dueDate-calendar"
                    value="${formData.dueDate}"
                    style="width: 150px;"
                    title="カレンダーから選択"
                >
            </div>
            <datalist id="dueDate-datalist">
                <option value="${todayDisplay}">今日</option>
                <option value="2025/12/25">2025/12/25</option>
                <option value="令和6年12月25日">令和6年12月25日</option>
            </datalist>
        </div>
        
        <div class="form-group">
            <label class="form-label">
                金額 <span class="required">*</span>
                <span class="hint-icon" title="¥や,（カンマ）は自動で削除されます">ⓘ</span>
            </label>
            <div class="form-field-wrapper">
                <input 
                    type="text" 
                    class="form-input" 
                    id="amount"
                    placeholder="例: 1250000"
                    value="${formData.amount}"
                >
                <div class="error-icon" id="amount-error-icon" style="display: none;">⚠</div>
                <div class="error-tooltip" id="amount-error-tooltip"></div>
                <div class="error-annotation" id="amount-error-annotation"></div>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">備考</label>
            <textarea 
                class="form-input" 
                id="notes"
                rows="3"
                placeholder="必要に応じて備考を入力"
            >${formData.notes}</textarea>
        </div>
        
        <div class="form-actions">
            <button class="btn btn-primary" id="submitBtn">
                ✓ 送信する
            </button>
            <button class="btn btn-secondary" id="clearBtn">
                🔄 クリア
            </button>
        </div>
        
        <!-- 日付フォーマット設定モーダル -->
        <div class="modal" id="dateSettingsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚙️ 日付フォーマット設定</h3>
                    <button class="modal-close" id="closeSettingsModal">✕</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 1rem; color: var(--text-light);">
                        曖昧な日付（例: 01-02-2025）の解釈方法を選択してください。
                    </p>
                    
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="dateFormat" value="auto" ${userSettings.get('dateFormat') === 'auto' ? 'checked' : ''}>
                            <span>自動判別（曖昧な場合はエラー表示）</span>
                        </label>
                        
                        <label class="radio-label">
                            <input type="radio" name="dateFormat" value="jp" ${userSettings.get('dateFormat') === 'jp' ? 'checked' : ''}>
                            <span>日本/米国形式を優先（MM-DD-YYYY）</span>
                            <span class="example">例: 01-02-2025 → 2025年1月2日</span>
                        </label>
                        
                        <label class="radio-label">
                            <input type="radio" name="dateFormat" value="eu" ${userSettings.get('dateFormat') === 'eu' ? 'checked' : ''}>
                            <span>欧州形式を優先（DD-MM-YYYY）</span>
                            <span class="example">例: 01-02-2025 → 2025年2月1日</span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="saveSettings">保存</button>
                    <button class="btn btn-secondary" id="cancelSettings">キャンセル</button>
                </div>
            </div>
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
    const form = document.getElementById('overlayForm');
    const header = document.getElementById('overlayHeader');
    const toggleBtn = document.getElementById('overlayToggleBtn');
    
    // 状態管理: 'normal' (50%), 'expanded' (70%), 'minimized' (60px)
    let state = 'normal'; // 初期状態は50%
    
    // アイコンを更新
    function updateToggleIcon() {
        if (!toggleBtn) return;
        
        if (state === 'normal') {
            toggleBtn.textContent = '∨'; // シングルシェブロン（下）
            toggleBtn.setAttribute('aria-label', 'フォームを最小化');
        } else if (state === 'expanded') {
            toggleBtn.textContent = '⏬'; // ダブルシェブロン（下）
            toggleBtn.setAttribute('aria-label', 'フォームを最小化');
        } else {
            toggleBtn.textContent = '⏫'; // ダブルシェブロン（上）
            toggleBtn.setAttribute('aria-label', 'フォームを開く');
        }
    }
    
    // トグルボタンクリック
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleOverlay();
        });
    }
    
    // ヘッダークリックでもトグル
    if (header) {
        header.addEventListener('click', () => {
            toggleOverlay();
        });
    }
    
    function toggleOverlay() {
        if (state === 'normal') {
            // 50% → 60px に最小化
            form.classList.add('minimized');
            state = 'minimized';
        } else if (state === 'minimized') {
            // 60px → 70% に展開
            form.classList.remove('minimized');
            form.classList.add('expanded');
            state = 'expanded';
        } else {
            // 70% → 50% に戻す
            form.classList.remove('expanded');
            state = 'normal';
        }
        
        updateToggleIcon();
        updateProgressBadge();
    }
    
    function updateProgressBadge() {
        const badge = document.querySelector('.overlay-progress-badge');
        if (badge) {
            badge.textContent = `${getFilledCount()}/6`;
        }
    }
    
    // 初期アイコン・バッジ更新
    updateToggleIcon();
    updateProgressBadge();
}

// ===== フォーム入力の初期化（自動修正機能付き・IME対応） =====
function initFormInputs() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        // IME入力中フラグ
        let isComposing = false;
        
        // IME変換開始
        input.addEventListener('compositionstart', () => {
            isComposing = true;
        });
        
        // IME変換終了
        input.addEventListener('compositionend', (e) => {
            isComposing = false;
            // 変換確定後に自動修正を適用
            handleInput(e);
        });
        
        // 通常の入力イベント
        input.addEventListener('input', (e) => {
            // IME変換中はスキップ
            if (isComposing) {
                return;
            }
            handleInput(e);
        });
        
        // 入力処理
        function handleInput(e) {
            const field = e.target.id;
            let value = e.target.value;
            
            // 自動修正を適用
            const correctedValue = applyAutoCorrection(field, value);
            
            // 修正後の値を設定（カーソル位置を保持）
            if (e.target.value !== correctedValue) {
                const cursorPos = e.target.selectionStart;
                e.target.value = correctedValue;
                // カーソル位置を調整（文字数の変化を考慮）
                const diff = correctedValue.length - value.length;
                e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
            }
            
            formData[field] = correctedValue;
            validateField(field, correctedValue);
            updateProgress();
            
            // タブのラベル更新（タブレイアウトの場合）
            updateTabLabels();
        }
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
    
    // カレンダー入力との連携
    const invoiceDateCalendar = document.getElementById('invoiceDate-calendar');
    const invoiceDateText = document.getElementById('invoiceDate');
    const dueDateCalendar = document.getElementById('dueDate-calendar');
    const dueDateText = document.getElementById('dueDate');
    
    if (invoiceDateCalendar && invoiceDateText) {
        // カレンダーからテキストへ
        invoiceDateCalendar.addEventListener('change', (e) => {
            const value = e.target.value; // YYYY-MM-DD形式
            if (value) {
                invoiceDateText.value = value;
                formData.invoiceDate = value;
                validateField('invoiceDate', value);
                updateProgress();
            }
        });
        
        // テキストからカレンダーへ（自動修正後）
        invoiceDateText.addEventListener('blur', () => {
            const value = formData.invoiceDate;
            if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                invoiceDateCalendar.value = value;
            }
        });
    }
    
    if (dueDateCalendar && dueDateText) {
        // カレンダーからテキストへ
        dueDateCalendar.addEventListener('change', (e) => {
            const value = e.target.value; // YYYY-MM-DD形式
            if (value) {
                dueDateText.value = value;
                formData.dueDate = value;
                validateField('dueDate', value);
                updateProgress();
            }
        });
        
        // テキストからカレンダーへ（自動修正後）
        dueDateText.addEventListener('blur', () => {
            const value = formData.dueDate;
            if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                dueDateCalendar.value = value;
            }
        });
    }
    
    // 日付フィールドのペースト処理（自動抽出）
    const dateFields = [invoiceDateText, dueDateText].filter(Boolean);
    dateFields.forEach(field => {
        field.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            
            // 日付部分を抽出
            const datePatterns = [
                /(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/,
                /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,
                /(令和|平成|昭和)\d{1,2}年\d{1,2}月\d{1,2}日/
            ];
            
            let extractedDate = pastedText;
            for (const pattern of datePatterns) {
                const match = pastedText.match(pattern);
                if (match) {
                    extractedDate = match[1] || match[0];
                    break;
                }
            }
            
            // 抽出した日付を設定
            field.value = extractedDate;
            
            // 自動修正を適用
            const fieldId = field.id;
            const corrected = applyAutoCorrection(fieldId, extractedDate);
            field.value = corrected;
            formData[fieldId] = corrected;
            validateField(fieldId, corrected);
            updateProgress();
            
            // ヒント表示（抽出した場合）
            if (extractedDate !== pastedText) {
                const hintEl = document.getElementById(`${fieldId}-hint`);
                if (hintEl) {
                    const originalHint = hintEl.textContent;
                    hintEl.textContent = `💡 「${pastedText}」から「${extractedDate}」を抽出しました`;
                    hintEl.style.color = 'var(--success)';
                    setTimeout(() => {
                        hintEl.textContent = originalHint;
                        hintEl.style.color = '';
                    }, 3000);
                }
            }
        });
    });
    
    // 設定モーダルの初期化
    initDateSettingsModal();
}

// ===== 日付設定モーダルの初期化 =====
function initDateSettingsModal() {
    const modal = document.getElementById('dateSettingsModal');
    const openBtn = document.getElementById('dateSettingsBtn');
    const closeBtn = document.getElementById('closeSettingsModal');
    const saveBtn = document.getElementById('saveSettings');
    const cancelBtn = document.getElementById('cancelSettings');
    
    if (!modal || !openBtn) return;
    
    // モーダルを開く
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    }
    
    // モーダルを閉じる
    const closeModal = () => {
        modal.classList.remove('active');
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    // 背景クリックで閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 保存ボタン
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const selectedFormat = document.querySelector('input[name="dateFormat"]:checked');
            if (selectedFormat) {
                userSettings.set('dateFormat', selectedFormat.value);
                
                // 成功メッセージを表示
                alert('設定を保存しました。\n\n曖昧な日付は選択した形式で解釈されます。');
                closeModal();
                
                // 既存の日付フィールドを再検証
                ['invoiceDate', 'dueDate'].forEach(fieldId => {
                    const value = formData[fieldId];
                    if (value) {
                        const corrected = applyAutoCorrection(fieldId, value);
                        const inputEl = document.getElementById(fieldId);
                        if (inputEl) inputEl.value = corrected;
                        formData[fieldId] = corrected;
                        validateField(fieldId, corrected);
                    }
                });
            }
        });
    }
}

// ===== 自動修正を適用 =====
function applyAutoCorrection(field, value) {
    switch(field) {
        case 'companyName':
            // 会社名: 半角カナ→全角カナ、全角英数→半角英数、スペース整理
            return InputFormatter.formatCompanyName(value);
            
        case 'invoiceNumber':
            // 請求書番号: 全角→半角、大文字化
            return InputFormatter.formatInvoiceNumber(value);
            
        case 'invoiceDate':
        case 'dueDate':
            // 日付: 様々なフォーマットをYYYY-MM-DDに変換
            return InputFormatter.parseDate(value);
            
        case 'amount':
            // 金額: 全角→半角、¥・カンマ削除
            return InputFormatter.cleanCurrency(value);
            
        default:
            return value;
    }
}

// ===== フィールドバリデーション（新UI対応） =====
function validateField(field, value) {
    const inputEl = document.getElementById(field);
    const errorIcon = document.getElementById(`${field}-error-icon`);
    const errorTooltip = document.getElementById(`${field}-error-tooltip`);
    const errorAnnotation = document.getElementById(`${field}-error-annotation`);
    const inlineHint = inputEl?.nextElementSibling;
    
    if (!inputEl) return false;
    
    // エラー表示をリセット
    inputEl.classList.remove('valid', 'invalid');
    if (errorIcon) errorIcon.style.display = 'none';
    if (errorTooltip) {
        errorTooltip.classList.remove('active');
        errorTooltip.textContent = '';
    }
    if (errorAnnotation) {
        errorAnnotation.classList.remove('show');
        errorAnnotation.textContent = '';
    }
    
    // 空の場合はスキップ（備考以外）
    if (!value && field !== 'notes') {
        return true;
    }
    
    let isValid = true;
    let errorMessage = '';
    
    switch(field) {
        case 'companyName':
            if (value.length < 2) {
                isValid = false;
                errorMessage = '会社名は2文字以上で入力してください';
            }
            break;
            
        case 'invoiceNumber':
            if (!/^[A-Z]+-\d+-\d+$/.test(value)) {
                isValid = false;
                errorMessage = '形式: ABC-1234-567';
            }
            break;
            
        case 'invoiceDate':
        case 'dueDate':
            // 曖昧な日付チェック
            if (value && value.startsWith('AMBIGUOUS:')) {
                isValid = false;
                const originalInput = value.substring(10);
                errorMessage = `曖昧な形式: ${originalInput}\n\n推奨形式:\n• 2025/12/25\n• 2025-12-25\n• 令和7年12月25日\n\nまたは⚙️ボタンから優先フォーマットを設定`;
            } else if (!value) {
                isValid = false;
                errorMessage = '日付を入力してください';
            } else if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                isValid = false;
                errorMessage = '正しい日付形式で入力してください（YYYY-MM-DD）';
            }
            break;
            
        case 'amount':
            if (!/^\d+$/.test(value)) {
                isValid = false;
                errorMessage = '数字のみで入力してください';
            } else if (parseInt(value) <= 0) {
                isValid = false;
                errorMessage = '金額は1以上で入力してください';
            }
            break;
    }
    
    if (!isValid) {
        // エラー表示
        inputEl.classList.add('invalid');
        if (errorIcon) errorIcon.style.display = 'block';
        if (errorTooltip) errorTooltip.textContent = errorMessage;
        if (errorAnnotation) {
            errorAnnotation.textContent = '⚠️ ' + errorMessage;
            errorAnnotation.classList.add('show');
        }
        
        // エラーアイコンにイベントリスナーを追加
        if (errorIcon) {
            errorIcon.onclick = () => {
                if (errorTooltip) {
                    errorTooltip.classList.toggle('active');
                }
            };
            errorIcon.onmouseenter = () => {
                if (errorTooltip) {
                    errorTooltip.classList.add('active');
                }
            };
            errorIcon.onmouseleave = () => {
                if (errorTooltip && !errorTooltip.classList.contains('pinned')) {
                    errorTooltip.classList.remove('active');
                }
            };
        }
        
        return false;
    } else if (value) {
        // 成功表示（控えめに）
        inputEl.classList.add('valid');
        return true;
    }
    
    return true;
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
