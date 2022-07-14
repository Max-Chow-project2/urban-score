const qualityApp = {};

//target the city dropdownElement's value
qualityApp.dropdownElement = document.querySelector('#cities');
console.log(qualityApp.dropdownElement);

//target the form
qualityApp.formElement = document.querySelector('form');
console.log(qualityApp.formElement);

// Populate the dropdown list with cities in North America
qualityApp.createDropdown = () => {
    const url = new URL(`https://api.teleport.org/api/continents/geonames%3ANA/urban_areas/`);

    fetch(url)
    .then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    })
    .then(function (cityListResult) {
        const cityListArray = cityListResult._links["ua:items"];
        qualityApp.populateDropdown(cityListArray);
    })
    .catch(function (error) {
        alert(error.message);
    })
}

// Appends options to the dropdown
qualityApp.populateDropdown = (cityListArray) => {
    cityListArray.forEach(function (city) {
        const cityOption = document.createElement('option');
        cityOption.value = city.href;
        cityOption.textContent = city.name;
        qualityApp.dropdownElement.append(cityOption);
    })
}

// Get the user's city selection
qualityApp.getCity = () => {
    // Listen for user submission
    qualityApp.formElement.addEventListener('submit', function(e) {
        e.preventDefault();

        // Store the selected city API url
        const selectedCityName = qualityApp.dropdownElement.selectedOptions[0].innerText;
        const selectedCityHref = qualityApp.dropdownElement.value;

        // Make an API call to get the selected city data endpoint
        const url = new URL(`${selectedCityHref}scores/`);

        fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(function (cityData) {
            const cityScoresArray = cityData.categories;
            qualityApp.displayScores(selectedCityName, cityScoresArray)
            console.log(selectedCityName);
        })
        .catch(function(error) {
            alert(error.message);
        })

    })
    
}

qualityApp.displayScores = (cityName, cityScores) => {
    
    // Display city name
    const cityNameElement = document.querySelector('#cityName');
    cityNameElement.innerText = cityName;
    
    // Clear the list first
    const cityScoresElement = document.querySelector('#cityScores');
    cityScoresElement.innerHTML = '';

    // Create and append the score list items
    cityScores.forEach(function (category) {
        const listElement = document.createElement('li');
        listElement.innerHTML = `<h3>${category.name}: </h3><p class="score">${category.score_out_of_10.toFixed(1)}/10</p>`

        cityScoresElement.append(listElement);
    })

}


qualityApp.init = () => {
    qualityApp.createDropdown();
    qualityApp.getCity();
}

qualityApp.init();