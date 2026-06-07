document.addEventListener('DOMContentLoaded', () => {
  initBurger();
  initSmoothScroll();
  initFAQ();
  initPhoneMasks();
  initForms();
  initCalculator();
  initGalleries();
  initReveal();
});

/* ===== BURGER MENU ===== */
function initBurger() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('.header__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      nav.classList.remove('open');
    });
  });
}

/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ===== FAQ ACCORDION ===== */
function initFAQ() {
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const answer = item.querySelector('.faq__answer');
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.faq__item.active').forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          other.querySelector('.faq__answer').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ===== PHONE MASK ===== */
function applyPhoneMask(input) {
  input.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 0 && val[0] === '8') val = '7' + val.slice(1);
    if (val.length > 0 && val[0] !== '7') val = '7' + val;

    let formatted = '';
    if (val.length > 0) formatted = '+7';
    if (val.length > 1) formatted += ' (' + val.substring(1, 4);
    if (val.length >= 4) formatted += ') ';
    if (val.length > 4) formatted += val.substring(4, 7);
    if (val.length > 7) formatted += '-' + val.substring(7, 9);
    if (val.length > 9) formatted += '-' + val.substring(9, 11);
    e.target.value = formatted;
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && input.value.length <= 3) {
      e.preventDefault();
      input.value = '';
    }
  });

  input.addEventListener('focus', () => { if (!input.value) input.value = '+7'; });
  input.addEventListener('blur', () => { if (input.value === '+7') input.value = ''; });
}

function initPhoneMasks() {
  document.querySelectorAll('input[type="tel"]').forEach(applyPhoneMask);
}

/* ===== LEAD DELIVERY via Vercel API route ===== */
function sendLead(data) {
  return fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => {
    if (!r.ok) console.error('Lead API error', r.status);
    if (typeof ym === 'function') ym(window.YM_ID, 'reachGoal', 'form_submit');
  }).catch(err => console.error('Ошибка отправки заявки:', err));
}

function showSuccess(container) {
  container.innerHTML = `
    <div style="text-align:center; padding: 40px 0;">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin-bottom:16px;">
        <circle cx="32" cy="32" r="32" fill="rgba(255,107,0,0.15)"/>
        <path d="M20 32l8 8 16-16" stroke="#ff6b00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3 style="color:#fff; font-size:1.5rem; margin-bottom:8px;">Заявка отправлена!</h3>
      <p style="color:#8a9bb0;">Мы свяжемся с вами в ближайшее время</p>
    </div>
  `;
}

function bindLeadForm(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    let valid = true;

    [nameInput, phoneInput].forEach(el => el && el.classList.remove('error'));

    if (nameInput && !nameInput.value.trim()) {
      nameInput.classList.add('error');
      valid = false;
    }
    const digits = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
    if (digits.length < 11) {
      phoneInput && phoneInput.classList.add('error');
      valid = false;
    }
    if (!valid) return;

    const carInput = form.querySelector('[name="car"]');
    const data = {
      name: nameInput ? nameInput.value.trim() : '',
      phone: phoneInput ? phoneInput.value : '',
      car: carInput ? carInput.value.trim() : ''
    };

    sendLead(data).then(() => showSuccess(form));
  });
}

function initForms() {
  document.querySelectorAll('form.veli-lead-form, #leadForm').forEach(bindLeadForm);

  document.querySelectorAll('a[href*="t.me"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof ym === 'function') ym(window.YM_ID, 'reachGoal', 'tg_click');
    });
  });
}

/* ===== IMAGE GALLERIES ===== */
function initGalleries() {
  document.querySelectorAll('.case-card__gallery').forEach(gallery => {
    const track = gallery.querySelector('.gallery__track');
    const images = track.querySelectorAll('img');
    const prevBtn = gallery.querySelector('.gallery__btn--prev');
    const nextBtn = gallery.querySelector('.gallery__btn--next');
    const dotsContainer = gallery.querySelector('.gallery__dots');
    let current = 0;

    images.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'gallery__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Фото ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      current = (index + images.length) % images.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dotsContainer.querySelectorAll('.gallery__dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    let startX = 0;
    let diff = 0;
    gallery.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    gallery.addEventListener('touchmove', (e) => { diff = e.touches[0].clientX - startX; }, { passive: true });
    gallery.addEventListener('touchend', () => {
      if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? current - 1 : current + 1);
      }
      diff = 0;
    });
  });
}

/* ===== CALCULATOR ===== */
function initCalculator() {
  const budget = document.getElementById('budget');
  if (!budget) return;

  const rangeVal = document.getElementById('rangeVal');
  const resultPrice = document.getElementById('resultPrice');
  const resultSave = document.getElementById('resultSave');
  const segBtns = document.querySelectorAll('#seg-country button');
  let k = 0.78;

  function fmt(n) { return Math.round(n / 10000) * 10000; }
  function ruble(n) { return n.toLocaleString('ru-RU') + ' ₽'; }

  function recalc() {
    const b = +budget.value;
    const our = fmt(b * k);
    const save = b - our;
    rangeVal.textContent = ruble(b);
    resultPrice.textContent = '≈ ' + ruble(our);
    resultSave.textContent = '≈ ' + ruble(save);
  }

  budget.addEventListener('input', recalc);
  segBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      segBtns.forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      k = +btn.dataset.k;
      recalc();
    });
  });
  recalc();
}

/* ===== REVEAL ON SCROLL ===== */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  items.forEach(item => observer.observe(item));
}
