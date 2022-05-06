(function () {
  let postForm = document.getElementById("formPosting");
  let newPost = document.getElementById("newPost");
  if (postForm) {
    postForm.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log(newPost.value);
      if (textValidation(newPost.value)) {
        postForm.submit();
      } else {
        alert("Please enter a valid text in the post!");
        postForm.reset();
        newPost.focus();
      }
    });
  }
})();

function enableEditing(v1, v2) {
  const editForm = document.getElementById(v1);
  const initialPost = document.getElementById(v2);
  editForm.hidden = false;
  initialPost.hidden = true;
}

function enableComment(v3) {
  const commentS = document.getElementById(v3);

  if (commentS.hidden) {
    commentS.hidden = false;
  } else {
    commentS.hidden = true;
  }
}

// function commentVerification(v1, v2) {
//   let commentForm = document.getElementById(v1);
//   let comment = document.getElementById(v2);
//   if (commentForm) {
//     commentForm.addEventListener("submit", (event) => {
//       event.preventDefault();
//       //console.log(newPost.value);
//       if (textValidation(comment.value)) {
//         commentForm.submit();
//       } else {
//         alert("Please enter a valid text in the comment!");
//         commentForm.reset();
//         comment.focus();
//       }
//     });
//   }
// }

//to check if text is string type
function textValidation(text) {
  if (!text) return false;
  if (typeof text !== "string") return false;
  if (text.trim().length === 0) return false;
  //console.log("Hello111text");
  return true;
}
