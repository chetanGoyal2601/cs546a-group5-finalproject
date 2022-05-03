$(function () {
  const $commentForm = $("#comment-form");
  const $commentText = $("#comment");
  const $commentList = $("#commentList");

  function checkComment(comment, varName) {
    if (!comment) throw `Error: You must provide a ${varName}`;
    if (typeof comment !== "string") throw `Error:${varName} must be a string`;
    comment = comment.trim();
    if (comment.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;

    return comment;
  }

  $commentForm.submit(async function (event) {
    event.preventDefault();
    $("#error").hide();
    let commentTextVal = $commentText.val();

    try {
      commentTextVal = checkComment(commentTextVal, "Comment");

      var requestConfig = {
        method: "post",
        url: "/comments",
        data: { commentTextVal },
      };

      $.ajax(requestConfig).then(function (responseMessage) {
        if (!responseMessage._id) {
          $("#error").append("<p>" + responseMessage.message + "</p");
          $("#error").show();
        } else {
          const p = `<p class="showLi" id ='${responseMessage._id}'>${responseMessage.text} </p>`;
          $commentList.append(p);
        }
        $commentList.show();
        $commentForm.trigger("reset");
      });
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : e.message;
      $("#error").append("<p>" + errorMessage + "</p");
      $("#error").show();
    }
  });
});
