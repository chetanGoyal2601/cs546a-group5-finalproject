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

function submitEditPost(form, text) {
  let editForm = document.getElementById(form);
  let editText = document.getElementById(text);
  //console.log("Hello1234", editText.value);
  if (!textValidation(editText.value)) {
    alert("Enter a valid text to submit the post!");
    editForm.reset();
    editForm.focus();
    return false;
  } else {
    console.log("Hello");
    editForm.submit();
    return true;
  }
}

function enableEditing(v1, v2, v3) {
  const editForm = document.getElementById(v1);
  const initialPost = document.getElementById(v2);
  const editPostSubmitButton = document.getElementById(v3);
  if (editForm.hidden) {
    editForm.hidden = false;
    initialPost.hidden = true;
    editPostSubmitButton.hidden = false;
  } else {
    editForm.hidden = true;
    initialPost.hidden = false;
    editPostSubmitButton.hidden = true;
  }
}

function enableComment(v3, v4) {
  const commentS = document.getElementById(v3);
  const commentSubmitButton = document.getElementById(v4);

  if (commentS.hidden) {
    commentS.hidden = false;
    commentSubmitButton.hidden = false;
  } else {
    commentS.hidden = true;
    commentSubmitButton.hidden = false;
  }
}

//to check if text is string type
function textValidation(text) {
  if (!text) return false;
  if (typeof text !== "string") return false;
  if (text.trim().length === 0) return false;
  //console.log("Hello111text");
  return true;
}
