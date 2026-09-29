// Change this to your desired password
const PASSWORD = "stars";

const STORAGE_KEY = "bd2-unlocked";

if (sessionStorage.getItem(STORAGE_KEY) === "1") {
  location.replace("home.html");
}

const form = document.getElementById("lock-form");
const input = document.getElementById("password");
const error = document.getElementById("lock-error");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  error.classList.remove("is-visible");
  form.classList.remove("is-shake");

  const entered = (input.value ?? "").trim().toLowerCase();
  if (entered === PASSWORD.toLowerCase()) {
    sessionStorage.setItem(STORAGE_KEY, "1");
    location.href = "home.html";
    return;
  }

  error.textContent = "Incorrect password";
  error.classList.add("is-visible");
  form.classList.add("is-shake");
  input.value = "";
  input.focus();
});
