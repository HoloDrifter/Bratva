// Profile click func
const profile_card = document.querySelector(".profile_nav-card");
const profile_card_sub = document.querySelector(".profile_card-sub");

if(profile_card){

profile_card.addEventListener("click", (e) => {
  e.stopPropagation();
  profile_card_sub.classList.toggle("active");
});
document.addEventListener("click", (e) => {
  if (
    !profile_card.contains(e.target) &&
    !profile_card_sub.contains(e.target)
  ) {
    profile_card_sub.classList.remove("active");
  }
});
}



 // Password eye icon
 document.querySelectorAll(".togglePassword").forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.closest(".box").querySelector("input");

      if (input) {
        input.type = input.type === "password" ? "text" : "password";

        this.classList.toggle("ri-eye-line");
        this.classList.toggle("ri-eye-off-line");
      }
    });
  });



  // const passwordInput = document.getElementById("password");
  //     const togglePassword = document.getElementById("togglePassword");

  //     togglePassword.addEventListener("click", () => {
  //       const type =
  //         passwordInput.getAttribute("type") === "password"
  //           ? "text"
  //           : "password";
  //       passwordInput.setAttribute("type", type);

  //       togglePassword.classList.toggle("ri-eye-line");
  //       togglePassword.classList.toggle("ri-eye-off-line");
  //     });
