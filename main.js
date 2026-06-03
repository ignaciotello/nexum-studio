/* ================================================
   NEXUM STUDIO — main.js
================================================ */

// --- Language detection & selection ---
const getLang = () => document.documentElement.getAttribute('lang') || 'es';

const updatePlaceholders = () => {
  const isEn = getLang() === 'en';
  const nameInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const companyInput = document.getElementById('empresa');
  const messageInput = document.getElementById('mensaje');

  if (nameInput) nameInput.placeholder = isEn ? 'Your full name' : 'Tu nombre completo';
  if (emailInput) emailInput.placeholder = isEn ? 'you@company.com' : 'tu@empresa.com';
  if (companyInput) companyInput.placeholder = isEn ? 'Your company name' : 'Nombre de tu empresa';
  if (messageInput) messageInput.placeholder = isEn ? 'Tell us briefly about your current situation and what you want to improve...' : 'Contanos brevemente tu situación actual y qué querés mejorar...';
};

const setLanguage = (lang) => {
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('preferredLang', lang);
  updatePlaceholders();
};

const savedLang = localStorage.getItem('preferredLang');
if (savedLang) {
  setLanguage(savedLang);
} else {
  const userLang = navigator.language || navigator.userLanguage;
  setLanguage(userLang.startsWith('en') ? 'en' : 'es');
}

document.addEventListener('DOMContentLoaded', () => {
  updatePlaceholders();
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      setLanguage(getLang() === 'es' ? 'en' : 'es');
    });
  }
});

// --- AOS ---
AOS.init({
  duration: 560,
  once: true,
  easing: 'ease-out-cubic',
  offset: 64,
});

// --- Nav scroll ---
const nav       = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

const updateNav = () =>
  nav.classList.toggle('nav--scrolled', window.scrollY > 60);

updateNav();
window.addEventListener('scroll', updateNav, { passive: true });

// --- Mobile menu ---
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('nav__links--open');
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

function closeMenu() {
  navLinks.classList.remove('nav__links--open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// --- Form validation ---
const form        = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

const rules = {
  nombre:  v => {
    const isEn = getLang() === 'en';
    return v.trim() ? '' : (isEn ? 'Name is required.' : 'El nombre es requerido.');
  },
  email:   v => {
    const isEn = getLang() === 'en';
    if (!v.trim()) return isEn ? 'Email is required.' : 'El email es requerido.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? '' : (isEn ? 'Please enter a valid email.' : 'Ingresá un email válido.');
  },
  mensaje: v => {
    const isEn = getLang() === 'en';
    return v.trim() ? '' : (isEn ? 'Message is required.' : 'El mensaje es requerido.');
  },
};

function setError(fieldId, msg) {
  const errEl  = document.getElementById(fieldId + 'Error');
  const input  = document.getElementById(fieldId);
  if (errEl)  errEl.textContent = msg;
  if (input)  input.classList.toggle('form__input--error', !!msg);
}

// Clear errors on input
Object.keys(rules).forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => setError(id, ''));
});

form.addEventListener('submit', e => {
  e.preventDefault();

  let valid = true;

  Object.entries(rules).forEach(([id, validate]) => {
    const val = form[id]?.value ?? '';
    const err = validate(val);
    setError(id, err);
    if (err) valid = false;
  });

  if (!valid) {
    const firstErr = form.querySelector('.form__input--error');
    if (firstErr) firstErr.focus();
    return;
  }

  // Disable & show loading state
  submitBtn.disabled = true;
  const btnText = submitBtn.querySelector('.btn__text');
  const originalText = btnText.textContent;
  const isEn = getLang() === 'en';
  btnText.textContent = isEn ? 'Sending...' : 'Enviando…';

  const formData = new FormData(form);

  fetch('https://formsubmit.co/ajax/hola@nexumstudio.agency', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(resData => {
    if (resData.success === "true" || resData.success === true || resData.status === "success") {
      form.reset();
      form.hidden        = true;
      formSuccess.hidden = false;
    } else {
      alert(resData.message || (isEn ? "There was a problem sending your inquiry. Please try again." : "Hubo un problema al enviar la consulta. Por favor, intente nuevamente."));
      submitBtn.disabled = false;
      btnText.textContent = originalText;
    }
  })
  .catch(error => {
    alert(isEn ? "There was a connection error. Please try again." : "Hubo un error de conexión al enviar el formulario. Por favor, intente nuevamente.");
    submitBtn.disabled = false;
    btnText.textContent = originalText;
  });
});

// --- FAQ accordion ---
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const answer   = btn.nextElementSibling;

    // Cerrar todos los demás
    document.querySelectorAll('.faq__question').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        const otherAns = other.nextElementSibling;
        if (otherAns) otherAns.hidden = true;
      }
    });

    // Toggle el actual
    btn.setAttribute('aria-expanded', String(!expanded));
    if (answer) answer.hidden = expanded;
  });
});
