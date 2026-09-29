const wishBtn = document.getElementById("wish-btn");
const wishResult = document.getElementById("wish-result");

const wishes = [
  "Hope that your next chapter is softer, brighter, and betterrrrrr."
];

function setWishReady(ready) {
  if (!wishBtn) return;
  wishBtn.disabled = !ready;
  wishBtn.classList.toggle("is-ready", ready);
}

document.addEventListener("moon-active", (e) => {
  setWishReady(e.detail.active);
});

wishBtn?.addEventListener("click", () => {
  const msg = wishes[Math.floor(Math.random() * wishes.length)];
  wishResult.textContent = msg;
  wishResult.classList.add("is-visible");
  wishBtn.textContent = "Wish sent ✦";
});

const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

for (const el of revealEls) {
  observer.observe(el);
}
