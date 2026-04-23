/**
 * Contact form validation and submission.
 * Validates client-side, submits to Cloudflare Worker, displays status.
 */

const RULES = {
  name: {
    required: true,
    validate: (value) => value.trim().length >= 2,
  },
  email: {
    required: true,
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  },
  phone: {
    required: false,
    validate: (value) => value.trim() === '' || /^[\d\s\-+().]{7,}$/.test(value.trim()),
  },
  message: {
    required: true,
    validate: (value) => value.trim().length >= 10,
  },
};

function validateField(field, rule) {
  const group = field.closest('.form__group');
  const isValid = rule.validate(field.value);

  if (!isValid) {
    group.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    return false;
  }

  group.classList.remove('is-invalid');
  field.setAttribute('aria-invalid', 'false');
  return true;
}

function validateForm(form) {
  let isValid = true;

  for (const [name, rule] of Object.entries(RULES)) {
    const field = form.elements[name];
    if (!field) continue;

    if (rule.required && !field.value.trim()) {
      const group = field.closest('.form__group');
      group.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
      isValid = false;
      continue;
    }

    if (!validateField(field, rule)) {
      isValid = false;
    }
  }

  return isValid;
}

async function submitForm(form, submitBtn) {
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const data = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim(),
    message: form.elements.message.value.trim(),
  };

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Submission failed');

    const result = await response.json();

    if (result.success) {
      form.reset();
      document.getElementById('form-success').classList.add('is-visible');
      form.querySelectorAll('.form__group').forEach((g) => g.classList.remove('is-invalid'));
    } else {
      throw new Error(result.error || 'Submission failed');
    }
  } catch (error) {
    alert('Something went wrong. Please try again or call (917) 494-6886.');
    console.error('Form submission error:', error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

export function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Real-time validation on blur
  for (const [name, rule] of Object.entries(RULES)) {
    const field = form.elements[name];
    if (!field) continue;

    field.addEventListener('blur', () => {
      if (field.value.trim() || rule.required) {
        validateField(field, rule);
      }
    });

    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        validateField(field, rule);
      }
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('form-success').classList.remove('is-visible');

    if (validateForm(form)) {
      submitForm(form, document.getElementById('form-submit'));
    } else {
      const firstInvalid = form.querySelector('.is-invalid input, .is-invalid textarea');
      if (firstInvalid) firstInvalid.focus();
    }
  });
}
