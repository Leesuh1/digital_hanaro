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
const leadFormTriggers = document.querySelectorAll('[data-open-lead-form]');
const leadFormModal = document.getElementById('lead-form-modal');
const closeLeadFormButtons = document.querySelectorAll('[data-close-lead-form]');
const leadForm = document.getElementById('lead-form');
const leadFormMessage = document.getElementById('lead-form-message');
const leadEmailInput = document.getElementById('lead-email');
const leadLocationInput = document.getElementById('lead-cta-location');
const leadNameInput = document.getElementById('lead-cta-name');
const leadDeviceInput = document.getElementById('lead-device-type');
const leadSubmittedAtInput = document.getElementById('lead-submitted-at');

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xeerkdej';

function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, params);
}

function setMessage(element, text, status) {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove('error', 'success');

  if (status) {
    element.classList.add(status);
  }
}

function getDeviceType() {
  return window.innerWidth <= 860 ? 'mobile' : 'desktop';
}

async function submitToFormspree(form, messageElement, successText, eventParams) {
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.errors?.[0]?.message || 'submit_failed');
    }

    setMessage(messageElement, successText, 'success');
    trackEvent('lead_form_success', eventParams);
    form.reset();
    return true;
  } catch (error) {
    setMessage(messageElement, '전송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
    trackEvent('lead_form_error', {
      ...eventParams,
      error_type: error.message || 'unknown',
    });
    return false;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}

function openLeadForm(location) {
  if (!leadFormModal || !leadForm) {
    return;
  }

  leadFormModal.classList.add('is-open');
  leadFormModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  if (leadLocationInput) {
    leadLocationInput.value = location;
  }

  if (leadNameInput) {
    leadNameInput.value = '내 자산으로 분석하기';
  }

  if (leadDeviceInput) {
    leadDeviceInput.value = getDeviceType();
  }

  if (leadFormMessage) {
    setMessage(leadFormMessage, '', '');
  }

  trackEvent('lead_form_open', {
    form_type: 'my_asset_modal',
    cta_location: location,
    cta_name: '내 자산으로 분석하기',
  });

  window.setTimeout(() => {
    leadEmailInput?.focus();
  }, 120);
}

function closeLeadForm() {
  if (!leadFormModal) {
    return;
  }

  leadFormModal.classList.remove('is-open');
  leadFormModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
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

leadFormTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openLeadForm(trigger.dataset.openLeadForm || 'unknown');
  });
});

closeLeadFormButtons.forEach((button) => {
  button.addEventListener('click', closeLeadForm);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && leadFormModal?.classList.contains('is-open')) {
    closeLeadForm();
  }
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
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const emailValue = emailInput.value.trim();

    if (!emailPattern.test(emailValue)) {
      emailInput.classList.add('invalid');
      setMessage(formMessage, '올바른 이메일 주소를 입력해주세요.', 'error');
      emailInput.focus();
      return;
    }

    emailInput.classList.remove('invalid');
    trackEvent('lead_form_submit', {
      form_type: 'waitlist_inline',
      interest_type: 'early_access',
      cta_location: 'waitlist',
    });
    trackEvent('waitlist_submit', {
      form_name: 'early_access_waitlist',
      submit_location: 'waitlist',
    });
    await submitToFormspree(
      signupForm,
      formMessage,
      '신청이 완료되었습니다. 얼리 액세스 소식을 가장 먼저 전해드릴게요.',
      {
        form_type: 'waitlist_inline',
        interest_type: 'early_access',
      }
    );
  });

  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('invalid') && emailPattern.test(emailInput.value.trim())) {
      emailInput.classList.remove('invalid');
      setMessage(formMessage, '', '');
    }
  });
}

if (leadForm && leadFormMessage && leadEmailInput) {
  leadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const leadEmailValue = leadEmailInput.value.trim();
    const requiredFields = leadForm.querySelectorAll('select[required], input[required]');
    let hasError = false;

    if (!emailPattern.test(leadEmailValue)) {
      leadEmailInput.focus();
      setMessage(leadFormMessage, '올바른 이메일 주소를 입력해주세요.', 'error');
      hasError = true;
    }

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        hasError = true;
      }
    });

    if (hasError) {
      if (!leadFormMessage.textContent) {
        setMessage(leadFormMessage, '필수 항목을 모두 입력해주세요.', 'error');
      }
      return;
    }

    if (leadDeviceInput) {
      leadDeviceInput.value = getDeviceType();
    }

    if (leadSubmittedAtInput) {
      leadSubmittedAtInput.value = new Date().toISOString();
    }

    setMessage(leadFormMessage, '', '');
    trackEvent('lead_form_submit', {
      form_type: 'my_asset_modal',
      interest_type: 'my_asset_analysis',
      cta_location: leadLocationInput?.value || 'unknown',
    });

    const wasSubmitted = await submitToFormspree(
      leadForm,
      leadFormMessage,
      '등록이 완료되었습니다. 내 자산 분석 기능이 준비되면 먼저 알려드릴게요.',
      {
        form_type: 'my_asset_modal',
        interest_type: 'my_asset_analysis',
      }
    );

    if (wasSubmitted) {
      window.setTimeout(() => {
        closeLeadForm();
      }, 900);
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
