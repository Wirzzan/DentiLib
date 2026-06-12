const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function clearFormValidation(form) {
  form.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
}

function markInvalid(field) {
  if (field) field.classList.add("input-error");
}

function bindClearOnInput(form) {
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    const clear = () => field.classList.remove("input-error");
    field.addEventListener("input", clear);
    field.addEventListener("change", clear);
  });
}

function isEmpty(value) {
  return !String(value ?? "").trim();
}

function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value).trim());
}
