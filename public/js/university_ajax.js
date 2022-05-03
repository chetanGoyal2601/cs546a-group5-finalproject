$(function () {
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
        url:"/university/"+universityID,
        data: JSON.stringify({
          comments: commentTextVal
        }),
        contentType: "application/json"
      };
    
      try {
        const commentData = await $.ajax(requestConfig);
        if (!commentData) {
                $("#error").append("<p>" + "Something went wrong" + "</p>");
                $("#error").show();
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
      };

  });

  //Ajax to add fav universities
  $favUniversity.submit(async function (event) {
    event.preventDefault();
      var requestConfig = {
        type: "POST",
        url:"/university/"+universityID,
        data: JSON.stringify({
          favUni: "Added to favourites"
        }),
        contentType: "application/json"
      };
    
      try {
        const uniData = await $.ajax(requestConfig);
        $("#favUni").hide();
        if (!uniData) {
                $("#favUni").hide();
              } else {
                $("#favUni").show();
              }
      } catch (e) {
        const errorMessage = typeof e === "string" ? e : e.message;
       alert(errorMessage);
       $("#favUni").hide();
      };

  });
});