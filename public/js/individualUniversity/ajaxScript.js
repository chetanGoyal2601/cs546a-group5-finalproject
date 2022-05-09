(function ($) {
  let $favouriteForm = $("#favouriteForm");
  let $favouriteUniversitiesLength = $("#favouriteUniversitiesLength");
  let $uniId = $("#uniIdFav");

  $favouriteForm.submit(async function (event) {
    event.preventDefault();
    //console.log($uniId.val());

    try {
      var requestConfig = {
        type: "POST",
        url: "/university/favourite",
        data: JSON.stringify({
          uniId: $uniId.val(),
          favouriteUniversitiesLength: $favouriteUniversitiesLength.val(),
        }),
        contentType: "application/json",
      };

      $.ajax(requestConfig).then(function (responseMessage) {
        //console.log(responseMessage);
        if (!responseMessage.result) {
          alert(
            "Maximum 5 Universities can be added! Unfavourite any other to add this one."
          );
        } else if (responseMessage.result) {
          //alert("Successfully added to your favourite list!");
          window.location.reload(true);
        }
      });
    } catch (e) {
      alert(e.message);
    }
  });
})(window.jQuery);
