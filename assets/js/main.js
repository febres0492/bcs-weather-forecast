// seach when enter key is pressed
S('#searchInput')[0].addEventListener('keyup', (ev)=>{
    if(ev.key != 'Enter') {return}
    let val = S('#searchInput')[0].value;
    search(val);
})

// search button click event
S('#searchBtn')[0].addEventListener('click', ()=>{
    let val = S('#searchInput')[0].value;
    search(val);
})

// search when click on previous search history
S("#previous-res")[0].addEventListener('click', (ev)=>{
    if(ev.target.tagName == 'LI'){
        let value = ev.target.attributes.value.value
        search(value)
    }
})

// delete button click event
S('#deleteBtn')[0].addEventListener('click', deleteSearchHistory)

search('Orlando');

function search (val = null){
    if(val.length == 0) {return}
    getWeatherData(val);
    S('#searchInput')[0].value = '';

    updatingSearchHistory(val)
}

function getWeatherData(city){
    const apiKey = 'c781c6238645490d968171534240504';
    const days = 6;
    const country = 'US'; 
    city = capFirst(city)
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city},${country}&days=${days}&aqi=no&alerts=no`;

    fetch(url)
    .then(response => {
        if (response.ok) { return response.json(); }
        throw new Error('Request failed.');
    })
    .then(data => {
        updateContent(data)
        localStorage.setItem('bcs-weather-data', JSON.stringify(data));
    })
    .catch(error => {
        console.error('Error fetching data: ', error);
    });

}

function updateContent(data){

    [...S('.weather-card')].forEach((card, idx)=>{

        // clear card content
        card.innerHTML = '';

        // current day card
        data.current.date = data.location.localtime.split(' ')[0];
        if(idx == 0){
            data.current.name = `${data.location.name} ${data.location.region}`;
            data.current.country = data.location.country;
            data.current.clas = 'card overflow-hidden';
            updateCard(card, data.current)
            return
        }

        // next 5 days cards
        Object.values(data.forecast)[0].forEach((item, i) =>{
            // skip current day
            if(i == 0) {return}
            const obj = {
                'clas':'card',
                'date':item.date,  
                'temp_f':item.day.avgtemp_f, 
                'humidity':item.day.avghumidity, 
                'wind_mph':item.day.maxwind_mph,
                'condition':item.day.condition
            }
            updateCard(card, obj)
        })
    })
}

function updateCard(card, data){

    let {clas, name, temp_f, humidity, wind_mph, date, condition} = data;
    clas = clas ? clas : '';
    const title = name ? `<h5 class="card-title">${name}</h5>` : '';
    const country = data.country ? `<p class="card-text h5">${data.country}</p>` : '';
    const cardTemplate = `
        <div class="${clas}">
            <div class="card-body">
                <div class="d-flex jcsb">
                    ${title}
                    ${country}
                </div>
                <p class="card-text fw-bold">( ${date} )</p>
                <img src="${condition.icon}" alt="${condition.text}" class="img-fluid d-block mx-auto">
                <p class="card-text">Temp: ${temp_f}°F</p>
                <p class="card-text">Wind: ${wind_mph}mph</p>
                <p class="card-text">Humidity: ${humidity}%</p>
            </div>
        </div>
    `;
    card.innerHTML += cardTemplate;
}

// update search history
function updatingSearchHistory(value = null){

    let data = JSON.parse(localStorage.getItem('bcs-weather-search')) || [];
    if(value){
        data.push({'value': value})
        localStorage.setItem('bcs-weather-search', JSON.stringify(data));
    }

    // remove duplicate values
    data = [...new Set(data.map(v=>v.value.toLowerCase()))]
    
    // update search history
    S('#previous-res')[0].innerHTML = '';
    data.forEach(item=>{
        const li = ` <li class="btn li-btn btn-sm border" value="${item}">${capFirst(item)}</li> `
        S('#previous-res')[0].innerHTML += li;
    })
}

// delete search history
function deleteSearchHistory(){
    localStorage.removeItem('bcs-weather-search');
    localStorage.removeItem('bcs-weather-data')
    S('#previous-res')[0].innerHTML = '';
}

// selector function
function S(str){return document.querySelectorAll(str);}

// capitalize first letter
function capFirst(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}


