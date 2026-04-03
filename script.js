document.addEventListener('DOMContentLoaded', () => {
  initBurger();
  initSmoothScroll();
  initFAQ();
  initPhoneMask();
  initForm();
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
function initPhoneMask() {
  const input = document.getElementById('phone');
  if (!input) return;

  input.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');

    if (val.length > 0 && val[0] === '8') {
      val = '7' + val.slice(1);
    }
    if (val.length > 0 && val[0] !== '7') {
      val = '7' + val;
    }

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

  input.addEventListener('focus', () => {
    if (!input.value) {
      input.value = '+7';
    }
  });

  input.addEventListener('blur', () => {
    if (input.value === '+7') {
      input.value = '';
    }
  });
}

/* ===== FORM SUBMIT ===== */
function initForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]');
    const phone = form.querySelector('[name="phone"]');
    let valid = true;

    name.classList.remove('error');
    phone.classList.remove('error');

    if (!name.value.trim()) {
      name.classList.add('error');
      valid = false;
    }

    const digits = phone.value.replace(/\D/g, '');
    if (digits.length < 11) {
      phone.classList.add('error');
      valid = false;
    }

    if (!valid) return;

    const data = {
      name: name.value.trim(),
      phone: phone.value,
      car: form.querySelector('[name="car"]').value.trim()
    };

    console.log('Lead:', data);

    form.innerHTML = `
      <div style="text-align:center; padding: 40px 0;">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin-bottom:16px;">
          <circle cx="32" cy="32" r="32" fill="rgba(255,107,0,0.15)"/>
          <path d="M20 32l8 8 16-16" stroke="#ff6b00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3 style="color:#fff; font-size:1.5rem; margin-bottom:8px;">Заявка отправлена!</h3>
        <p style="color:#8a9bb0;">Мы свяжемся с вами в ближайшее время</p>
      </div>
    `;
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
