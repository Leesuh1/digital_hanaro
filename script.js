const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const revealItems = document.querySelectorAll('.reveal');
const faqItems = document.querySelectorAll('.faq-item');
const signupForm = document.getElementById('signup-form');
const emailInput = document.getElementById('email');
const formMessage = document.getElementById('form-message');
const ctaLinks = document.querySelectorAll('a[href="#waitlist"], a[href="#experience"]');
const trackedCtas = document.querySelectorAll('.btn, .phone-cta');

function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, params);
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (siteNav && siteNav.classList.contains('is-open')) {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', '메뉴 열기');
    }
  });
});

trackedCtas.forEach((button) => {
  button.addEventListener('click', () => {
    const ctaName = button.textContent.trim();
    const ctaLocation =
      button.closest('.hero') ? 'hero' :
      button.closest('.site-header') ? 'header' :
      button.closest('#mobile-preview') ? 'mobile_preview' :
      button.closest('#waitlist') ? 'waitlist' :
      button.closest('.final-cta') ? 'final_cta' :
      'general';

    trackEvent('cta_click', {
      cta_name: ctaName,
      cta_location: ctaLocation,
      link_target: button.getAttribute('href') || '',
    });
  });
});

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    faqItems.forEach((faqItem) => {
      faqItem.classList.remove('open');
      const faqButton = faqItem.querySelector('.faq-question');
      const faqAnswer = faqItem.querySelector('.faq-answer');

      faqButton.setAttribute('aria-expanded', 'false');
      faqAnswer.style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16,
});

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (signupForm && emailInput && formMessage) {
  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailValue = emailInput.value.trim();

    if (!emailPattern.test(emailValue)) {
      emailInput.classList.add('invalid');
      formMessage.textContent = '올바른 이메일 주소를 입력해주세요.';
      formMessage.classList.add('error');
      formMessage.classList.remove('success');
      emailInput.focus();
      return;
    }

    emailInput.classList.remove('invalid');
    formMessage.textContent = '신청이 완료되었습니다. 얼리 액세스 소식을 가장 먼저 전해드릴게요.';
    formMessage.classList.add('success');
    formMessage.classList.remove('error');

    trackEvent('waitlist_submit', {
      form_name: 'early_access_waitlist',
      submit_location: 'waitlist',
    });

    signupForm.reset();
  });

  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('invalid') && emailPattern.test(emailInput.value.trim())) {
      emailInput.classList.remove('invalid');
      formMessage.textContent = '';
      formMessage.classList.remove('error');
    }
  });
}

ctaLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (link.getAttribute('href') === '#waitlist' && emailInput) {
      window.setTimeout(() => {
        emailInput.focus();
      }, 350);
    }
  });
});
