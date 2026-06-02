/* ================================================
   NEXUM STUDIO — main.js
================================================ */

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
  nombre:  v => v.trim() ? '' : 'El nombre es requerido.',
  email:   v => {
    if (!v.trim()) return 'El email es requerido.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? '' : 'Ingresá un email válido.';
  },
  mensaje: v => v.trim() ? '' : 'El mensaje es requerido.',
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
  btnText.textContent = 'Enviando…';

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  fetch('https://formsubmit.co/ajax/hola@nexumstudio.agency', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
  .then(resData => {
    if (resData.success === "true" || resData.success === true) {
      form.reset();
      form.hidden        = true;
      formSuccess.hidden = false;
    } else {
      alert(resData.message || "Hubo un problema al enviar la consulta. Por favor, intente nuevamente.");
      submitBtn.disabled = false;
      btnText.textContent = originalText;
    }
  })
  .catch(error => {
    alert("Hubo un error de conexión al enviar el formulario. Por favor, intente nuevamente.");
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
