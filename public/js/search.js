$(document).ready(function () {
    const PAGE_SIZE = 9;
    let uniArray = [];
    let allUniversities;
    $('#emptyResponse').hide();

    $.ajax({
        type: "GET",

        url: 'http://localhost:3000/search/universities',
        success: function (result, status, xhr) {
            if (result.length == 0) {
                return "No results";
            }
            else {
                allUniversities = result.sort((a, b) => a.ranking - b.ranking);
                const locations = {
                    states: Array.from(new Set(allUniversities.map(uni => uni.location.state))),
                    cities: Array.from(new Set(allUniversities.map(uni => uni.location.city)))
                }
                let select = document.getElementById('locList');
                header = document.createElement('option');
                header.appendChild(document.createElement('h1').appendChild(document.createTextNode('STATES')));
                header.setAttribute('disabled', '');
                select.appendChild(header);
                locations.states.forEach(state => {
                    option = document.createElement('option');
                    option.setAttribute('value', state);
                    option.appendChild(document.createTextNode(state));
                    select.appendChild(option);
                });
                header = document.createElement('option');
                header.setAttribute('disabled', '');
                header.appendChild(document.createTextNode('CITIES'));
                select.appendChild(header);
                locations.cities.forEach(city => {
                    option = document.createElement('option');
                    option.setAttribute('value', city);
                    option.appendChild(document.createTextNode(city));
                    select.appendChild(option);
                });

                uniArray = allUniversities;
                paginationBar();
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr, status, error);
        }
    });


    function paginationBar() {
        let pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        if (uniArray.length == 0) {
            $('#emptyResponse').show();
            return;
        }

        let previous = document.createElement('li');
        previous.className = 'page-item';
        spanLink = document.createElement('span');
        spanLink.className = 'page-link';
        spanLink.appendChild(document.createTextNode('Previous'));
        previous.appendChild(spanLink);
        pagination.appendChild(previous);
        for (let i = 0; i < (uniArray.length / PAGE_SIZE); i++) {
            let list = document.createElement('li');
            list.className = 'page-item';
            list.id = i + 1;
            let span = document.createElement('span');
            span.className = 'page-link';
            span.appendChild(document.createTextNode((i + 1).toString()));
            list.appendChild(span);
            pagination.appendChild(list);
        }
        let next = document.createElement('li');
        next.className = 'page-item';
        spanLink = document.createElement('span');
        spanLink.className = 'page-link';
        spanLink.appendChild(document.createTextNode('Next'));
        next.appendChild(spanLink);
        pagination.appendChild(next);
        document.getElementById('1').classList.add('active');
        populateArray(uniArray.slice(0, PAGE_SIZE));


    }


    $('#pagination').click(function (event) {
        let current = document.getElementsByClassName('active')[0];
        let pageNo = event.target.firstChild.data;
        if (pageNo === 'Previous') {
            if (+current.id != 1) {
                current.classList.remove('active');
                document.getElementById(+current.id - 1).classList.add('active');
                populateArray(uniArray.slice((PAGE_SIZE * (+current.id - 2)), PAGE_SIZE * (+current.id - 1)));
            }
        }
        else if (pageNo === 'Next') {
            if (+current.id != Math.ceil(uniArray.length / PAGE_SIZE)) {
                current.classList.remove('active');
                document.getElementById(+current.id + 1).classList.add('active');
                populateArray(uniArray.slice((PAGE_SIZE * +current.id), PAGE_SIZE * (+current.id + 1)));
            }
        }
        else {
            current.classList.remove('active');
            document.getElementById(pageNo).classList.add('active');
            populateArray(uniArray.slice((PAGE_SIZE * (pageNo - 1)), PAGE_SIZE * pageNo));
        }
    });

    function populateArray(paginationArray) {
        $('#uniList').empty();
        $('#emptyResponse').hide();
        for (let i = 0; i < paginationArray.length; i++) {
            let card = document.createElement('a');
            card.className = 'card col-3 m-4';
            card.setAttribute('href', '/university/' + paginationArray[i]._id.toString());
            let img = document.createElement('img');
            img.className = 'card-img-top';
            img.setAttribute('src', paginationArray[i].image);
            img.setAttribute('alt', 'Card image cap');
            card.appendChild(img);
            let body = document.createElement('div');
            body.className = 'card-body';
            let title = document.createElement('h6');
            title.className = 'card-title';
            title.appendChild(document.createTextNode(paginationArray[i].name));
            body.appendChild(title);
            let ul = document.createElement('ul');
            ul.className = 'list-group list-group-flush';
            let intro = document.createElement('li');
            let rank = document.createElement('li');
            intro.className = 'list-group';
            rank.className = 'list-group-item';
            rank.id = "rank1";
            intro.appendChild(document.createTextNode(paginationArray[i].introduction));
            rank.appendChild(document.createTextNode('Rank: ' + paginationArray[i].ranking));
            ul.appendChild(rank);
            ul.appendChild(intro);
            body.appendChild(ul);
            card.appendChild(body);
            document.getElementById('uniList').appendChild(card);


        }
    }
    $('#locList').on('change', function () {
        if ($(this).val() === '') {
            uniArray = allUniversities;
            paginationBar();
        }
        else {
            $("#uniList").empty();
            uniArray = allUniversities.filter(uni =>
                uni.location.state === $('#locList').val() || uni.location.city === $('#locList').val()
            );
            paginationBar();
        }
    })

    $('#uniSearchTerm').keyup(function () {
        if ($(this).val() === '') {
            uniArray = allUniversities;
            uniArray = $('#locList').val() ?
                allUniversities.filter(uni =>
                    (uni.location.state === $('#locList').val() || uni.location.city === $('#locList').val())
                ) :
                allUniversities;

            paginationBar();
        }
        else {
            $("#uniList").empty();

            uniArray = $('#locList').val() ?
                allUniversities.filter(uni =>
                    (uni.location.state === $('#locList').val() || uni.location.city === $('#locList').val())
                    && uni.name.toLowerCase().includes($("#uniSearchTerm").val().toLowerCase())) :
                allUniversities.filter(uni => uni.name.toLowerCase().includes($('#uniSearchTerm').val().toLowerCase()));

            paginationBar();
        }
    })
});