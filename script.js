const qualityApp = {};

//target the city dropdownElement's value
qualityApp.dropdownElement = document.querySelector('#cities');
console.log(qualityApp.dropdownElement);

//target the form
qualityApp.formElement = document.querySelector('form');
console.log(qualityApp.formElement);

qualityApp.getCity = () => {
    //listen for user submission
    qualityApp.formElement.addEventListener('submit', function(e) {
        e.preventDefault();

        //store the selected city in a variable 
        const selectedCityValue = qualityApp.dropdownElement.value;

        //make an API call to get the selected city data
        const url = new URL(`https://api.teleport.org/api/urban_areas/slug:${selectedCityValue}/scores/`);

        fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(function (cityData) {
            console.log(cityData);
            qualityApp.displayScores(selectedCityValue, cityData)
        })
        .catch(function(error) {
            alert(error.message);
        })

    })
    
}

qualityApp.displayScores = (cityName, dataObject) => {
    const cityScoresElement = document.querySelector('#cityScores');
    cityScoresElement.innerHTML = '';

    const cityNameElement = document.querySelector('#cityName');
    const selectedCityName = qualityApp.dropdownElement.selectedOptions[0].innerText;

    // Display the city name
    cityNameElement.innerText = selectedCityName;

    // Create and append the score list items
    dataObject.categories.forEach(function (category) {
        const listElement = document.createElement('li');
        listElement.innerHTML = `<h3>${category.name}: </h3><p class="score">${category.score_out_of_10.toFixed(1)}/10</p>`

        cityScoresElement.append(listElement);
    })

}


qualityApp.init = () => {
    qualityApp.getCity();
}

qualityApp.init();