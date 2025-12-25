// Brain-Friendly Code Lab JavaScript

// Bad Form: 使いにくい例（レイアウトシフトあり）
const badEmail = document.getElementById('bad-email');
const badError = document.getElementById('bad-error');

if (badEmail) {
    badEmail.addEventListener('blur', () => {
        const value = badEmail.value;
        if (!value.includes('@')) {
            badEmail.classList.add('invalid');
            badError.textContent = 'エラー: 入力が正しくありません';
            badError.classList.add('show');
        }
    });
}

// Good Form: 使いやすい例（レイアウトシフト防止）
const goodEmail = document.getElementById('good-email');
const goodError = document.getElementById('good-error');
const goodSuccess = document.getElementById('good-success');

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

if (goodEmail) {
    goodEmail.addEventListener('input', () => {
        const value = goodEmail.value;
        
        // エラー・成功メッセージを非表示に（レイアウトは保持）
        goodError.classList.remove('show');
        goodSuccess.classList.remove('show');
        goodEmail.classList.remove('invalid', 'valid');

        if (value.length === 0) return;

        if (!value.includes('@')) {
            goodEmail.classList.add('invalid');
            goodError.textContent = '⚠️ メールアドレスには「@」が必要です';
            goodError.classList.add('show');
        } else if (!validateEmail(value)) {
            goodEmail.classList.add('invalid');
            goodError.textContent = '⚠️ メールアドレスの形式が正しくありません（例: example@email.com）';
            goodError.classList.add('show');
        } else {
            goodEmail.classList.add('valid');
            goodSuccess.textContent = '✓ 正しい形式です';
            goodSuccess.classList.add('show');
        }
    });
}

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

