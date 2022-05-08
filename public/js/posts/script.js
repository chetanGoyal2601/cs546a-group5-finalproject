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
  /////
  let postEditing = document.getElementById("postEditing");
  let editedPost = document.getElementById("editedPost");
  if (postEditing) {
    postEditing.addEventListener("submit", (event) => {
      event.preventDefault();

      if (textValidation(editedPost.value)) {
        postEditing.submit();
      } else {
        alert("Please enter a valid text in the post!");
        postEditing.reset();
        newPost.focus();
      }
    });
  }
  /////
  /////
  let f = document.getElementsByTagName("form");
  //console.log(f[1], f[1].id.substring(0, 11), f[1].length);
  //let count = 0;
  //let k = {};
  for (let i = 0; i < f.length; i++) {
    //console.log(f[i]);
    if (f[i].id.substring(0, 11) === "postEditing") {
      //let postId = formId.substring(11);
      //k[count] = postId;
      //let editedPost = document.getElementById("editedPost" + f[i].substring(11));
      f[i].addEventListener("submit", (event) => {
        console.log(f[i].substring(11));
        event.preventDefault();
        console.log(
          document.getElementById("editedPost" + f[i].substring(11)).value
        );
        if (
          textValidation(
            document.getElementById("editedPost" + f[i].substring(11)).value
          )
        ) {
          f[i].submit();
        } else {
          alert("Please enter a valid text in the post!");
          f[i].reset();
          document.getElementById("editedPost" + f[i].substring(11)).focus();
        }
      });
    }
  }
  // let f = document.getElementsByTagName('form')
  // for (let i of f) {
  //   if (i) {i.id}
  // }
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
