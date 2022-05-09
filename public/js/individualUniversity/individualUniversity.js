(function () {
  // let favouriteForm = document.getElementById("favouriteForm");
  // let favouriteUniversitiesLength = document.getElementById(
  //   "favouriteUniversitiesLength"
  // );
  //console.log(favouriteUniversitiesLength);
  let commentOnUniversity = document.getElementById("commentOnUniversity");
  let commentText = document.getElementById("newComment");
  //coooo
  // if (favouriteForm) {
  //   favouriteForm.addEventListener("submit", (event) => {
  //     //console.log(typeof favouriteUniversitiesLength.value);
  //     event.preventDefault();
  //     if (Number(favouriteUniversitiesLength.value) >= 5) {
  //       alert(
  //         "Uh oh! You can add only five universities to your favourite list. Unfavourite any of your favourited ones to add more."
  //       );
  //     } else {
  //       favouriteForm.submit();
  //     }
  //   });
  // }

  let favouriteForm2 = document.getElementById("favouriteForm2");
  let favouriteUniversitiesLength2 = document.getElementById(
    "favouriteUniversitiesLength2"
  );

  if (favouriteForm2) {
    favouriteForm2.addEventListener("submit", (event) => {
      //console.log(typeof favouriteUniversitiesLength.value);
      event.preventDefault();
      if (Number(favouriteUniversitiesLength2.value) >= 5) {
        alert(
          "Uh oh! You can add only five universities to your favourite list. Unfavourite any of your favourited ones to add more."
        );
      } else {
        favouriteForm2.submit();
      }
    });
  }

  if (commentOnUniversity) {
    commentOnUniversity.addEventListener("submit", (event) => {
      event.preventDefault();
      //console.log(commentText.value);
      if (!textValidation(commentText.value)) {
        alert("Please provide a valid text to submit!");
        commentOnUniversity.reset();
        //commentOnUniversity.target();
      } else {
        commentOnUniversity.submit();
      }
    });
  }
})();

//to check if text is string type
function textValidation(text) {
  if (!text) return false;
  if (typeof text !== "string") return false;
  if (text.trim().length === 0) return false;
  return true;
}
