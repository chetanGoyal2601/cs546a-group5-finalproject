const $commentForm = $("#comment-form");
const $commentText = $("#comment");
const $commentList = $("#commentList");
const universityID = $("#universityID").val();
const $favUniversity = $("#fav_university");
$commentForm.submit(async function (event) {
  event.preventDefault();
  $("#error").hide();
  let commentTextVal = $commentText.val();

  var requestConfig = {
    type: "POST",
    url: "/university/" + universityID,
    data: JSON.stringify({
      comments: commentTextVal,
    }),
    contentType: "application/json",
  };

  try {
    const commentData = await $.ajax(requestConfig);
    if (!commentData) {
      $("#error").append("<p>" + "Something went wrong" + "</p>");
      $("#error").show();
    } else if (commentData.result == "redirect") {
      window.location.replace(commentData.url);
    } else {
      const p = `<p class="showLi">${commentData.text}</p>`;
      $commentList.append(p);
    }
    $commentList.show();
    $commentForm.trigger("reset");
  } catch (e) {
    const errorMessage = typeof e === "string" ? e : e.message;
    $("#error").append("<p>" + errorMessage + "</p");
    $("#error").show();
  }
});

//Ajax to add fav universities
$("#add_to_fav").click(async function (event) {
  event.preventDefault();
  var requestConfig = {
    type: "POST",
    url: "/university/" + universityID + "/fav",
    data: JSON.stringify({
      favUni: "Added to favourites",
    }),
    contentType: "application/json",
  };
  try {
    const uniData = await $.ajax(requestConfig);
    $("#saved_university").hide();
    if (!uniData) {
      $("#saved_university").hide();
      $("#add_to_fav").show();
    } else if (uniData.result == "redirect") {
      window.location.replace(uniData.url);
    } else {
      $("#saved_university").show();
      $("#add_to_fav").hide();
    }
  } catch (e) {
    const errorMessage = typeof e === "string" ? e : e.message;
    $("#saved_university").hide();
  }
});
