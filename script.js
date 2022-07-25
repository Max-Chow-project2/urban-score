// Declare namespace object
const qualityApp = {};

//Target the city dropdownElement's value
qualityApp.dropdownElement = document.querySelector('#cities');

//Counter for saved cities
qualityApp.savedCityCounter = 0;

// Storage variable for the saved city image
qualityApp.savedCityImageUrl;

// Getter Methods for the City, City Href, and Continent
qualityApp.getCityName = () => qualityApp.dropdownElement.selectedOptions[0].innerText;
qualityApp.getCityHref = () => qualityApp.dropdownElement.value;
qualityApp.getSelectedContinent = () => document.querySelector('input[type=radio]:checked').value;

//Event listener for continent radio buttons to update the city list
qualityApp.continentListener = () => {
    const radioElements = document.querySelectorAll('input[type=radio]');
    
    radioElements.forEach((radioElement) => {
        radioElement.addEventListener('change', function () {
            //Create the dropdown list of cities for the selected continent
            if (radioElement.checked) {
                const selectedContinent = radioElement.value;
                qualityApp.createDropdown(selectedContinent);
            }
        })

    })
}

// Populate the dropdown list with cities in the selected continent
qualityApp.createDropdown = (continent) => {
    const url = new URL(`https://api.teleport.org/api/continents/geonames:${continent}/urban_areas/`);

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
    // Clear the city list
    qualityApp.dropdownElement.innerHTML = '<option value selected disabled>Select an option</option>';

    // Populate the city list
    cityListArray.forEach(function (city) {
        const cityOption = document.createElement('option');
        cityOption.value = city.href;
        cityOption.textContent = city.name;
        qualityApp.dropdownElement.append(cityOption);
    })
}

// Get the user's city selection and display related data
qualityApp.displayCity = () => {
    // Listen for city change
    qualityApp.dropdownElement.addEventListener('change', function() {

        // Get the selected continent's text value to display
        const selectedContinent = document.querySelector('input[type=radio]:checked + label').innerText;

        // Store the selected city name and API url
        const selectedCityName = qualityApp.getCityName();
        const selectedCityHref = qualityApp.getCityHref();

        // Make an API call to get to the required endpoints
        const imagesUrl = new URL(`${selectedCityHref}images/`);
        const scoresUrl = new URL(`${selectedCityHref}scores/`);

        // Connect to image endpoint and display image
        fetch(imagesUrl)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(function (imageData) {
            const cityImageObject = imageData.photos[0];
            qualityApp.savedCityImageUrl = cityImageObject.image.web;
            qualityApp.displayImage(selectedCityName, cityImageObject);
        })
        .catch(function (error) {
            alert(error.message);
        })

        // Connect to scores endpoint and display all text for the selected city
        fetch(scoresUrl)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(function (cityData) {
            const cityScoresArray = cityData.categories;
            const cityDescription = cityData.summary;
            const cityAPIScore = cityData.teleport_city_score;
            qualityApp.displaySummary(selectedContinent, selectedCityName, cityAPIScore, cityDescription);
            qualityApp.displayScores(cityScoresArray);
            qualityApp.manageSavedCities(selectedContinent, selectedCityName, cityAPIScore);
            qualityApp.toggleScoreVisibility();
        })
        .catch(function(error) {
            alert(error.message);
        })

    })
    
}

// Method to show an image from the given city
qualityApp.displayImage = (cityName, cityImage) => {
    const cityImageElement = document.querySelector('#cityImage');
    cityImageElement.src = ``;
    cityImageElement.alt = ``;

    cityImageElement.src = `${cityImage.image.web}`;
    cityImageElement.alt = `Photograph of ${cityName}`;
}

// Method to show continent name, city name, overall score, and city summary description
qualityApp.displaySummary = (continentName, cityName, cityAPIScore, citySummary) => {
    const cityAPIScoreElement = document.querySelector('#cityAPIScore');
    const citySummaryElement = document.querySelector('#citySummary');

    //unhide the save button
    const cityLockInButton = document.querySelector('#lock-in-city');
    cityLockInButton.classList.remove('hidden');

    // Display city and continent name
    const cityNameElement = document.querySelector('#cityName');
    
    cityNameElement.innerHTML = `<h2>${cityName} (${continentName})</h2>`;

    cityAPIScoreElement.textContent = `Overall Score: ${cityAPIScore.toFixed(1)} / 100`;

    // This is used to strip extra <p> and <b> tags in the citySummary from the API
    citySummaryElement.innerHTML = citySummary;
    citySummaryElement.innerHTML = citySummaryElement.textContent;
    
}

// Method to show all the category scores
qualityApp.displayScores = (cityScores) => {
    //Display category checkbox list
    const categoryContainerElement = document.querySelector('.categoryContainer');
    categoryContainerElement.classList.remove('hidden');
    
    // Clear the list first
    const cityScoresElement = document.querySelector('#cityScores');
    cityScoresElement.innerHTML = '';

    // Create and append the score list items
    cityScores.forEach(function (category, index) {
        const listElement = document.createElement('li');
        listElement.classList.add('category')
        const checkboxElement = document.querySelector(`input[value="${index}"]`);
        
        //if the checkbox category is not checked on load, hide the list item
        if (!checkboxElement.checked) {
            listElement.classList.add('hidden');
        }

        listElement.innerHTML = `<h4>${category.name}: <span class="score">${category.score_out_of_10.toFixed(1)}/10</span></h4>`;

        // Build and append the coloured score bars
        const fullBarElement = document.createElement('div');
        fullBarElement.classList.add('full-bar');

        const percentageBarElement = document.createElement('div');
        percentageBarElement.classList.add('percentage-bar');
        percentageBarElement.style.backgroundColor = category.color;
        percentageBarElement.style.width = category.score_out_of_10 * 10 + "%";

        fullBarElement.append(percentageBarElement)
        listElement.append(fullBarElement);
        cityScoresElement.append(listElement);
    })
}

//Method to manage category checkbox to show or hide individual scores
qualityApp.toggleScoreVisibility = () => {
    // target the checkbox elements
    const checkboxElements = document.querySelectorAll('input[type=checkbox]');
    // target the li elements with the class of category
    const listElements = document.querySelectorAll('.category');
    // target the span showing number of hidden scores
    const hiddenScoreCounterElement = document.querySelector('#hiddenScoreCount')

    // Count and display count of hidden scores
    let hiddenScoreCounter = 0;
    for (let i = 0; i < checkboxElements.length; i++) {
        if (!checkboxElements[i].checked) {
            hiddenScoreCounter++;
        }
    }
    hiddenScoreCounterElement.textContent = `(${hiddenScoreCounter} hidden)`;

    // Hide and show scores and update hidden score counter
    checkboxElements.forEach((checkboxElement, index) => {
        checkboxElement.addEventListener('change', function() {
            //if it's checked, we show the category
            if (checkboxElement.checked) {
                listElements[index].classList.remove('hidden');
                hiddenScoreCounter--;
            //if it's not checked we hide the category
            } else {
                listElements[index].classList.add('hidden');
                hiddenScoreCounter++;
            }
            hiddenScoreCounterElement.textContent = `(${hiddenScoreCounter} hidden)`;
        })
    })

}

// Method that takes continent, city, and overall score to save or delete individual city data if needed
qualityApp.manageSavedCities = (continentName, cityName, cityAPIScore) => {
    //selecting the lock-in button
    const lockCityButtonElement = document.querySelector('#lock-in-city');

    //listen for events on the save city lock-in button
    lockCityButtonElement.addEventListener('click', function () {

        //select the ul element on the DOM
        const savedCitiesListElement = document.querySelector('#savedCitiesList');

        //check to see if there's any duplicate city li
        const userSavedCities = document.querySelectorAll('.savedCity');
        const userSavedContinent = document.querySelectorAll('.savedContinent');

        // flag to determine if you should be able to save the city
        let appendCity = true;

        //local function for checking if there are city containers in the saved city section
        const displayEmptyMsg = () => {
            //h3 "no cities" msg we're targetting
            const savedCitiesTitleElement = document.querySelector('#savedCitiesSection h2');
            const noCitiesMsgElement = document.querySelector('#savedCitiesSection h3');

            savedCitiesTitleElement.classList.remove('hidden');

            //check if there are no more saved cities
            if (qualityApp.savedCityCounter === 0) {
                //show the "no cities" message to user
                noCitiesMsgElement.classList.remove('hidden');
            } else {
                noCitiesMsgElement.classList.add('hidden');
            }
        }

        //check each saved city container for duplicates
        for (i = 0; i < userSavedCities.length; i++) {
            //if there are duplicates, don't allow it to show up on HTML
            if (userSavedCities[i].textContent === cityName && userSavedContinent[i].textContent === continentName) {
                appendCity = false;
            }
        }

        //if there's no duplicates, then append the saved city onto the HTML
        if (appendCity === true) {

            //add one to the saved city counter for empty message display
            qualityApp.savedCityCounter++;

            //add a close button element to each container
            const buttonElement = document.createElement('button');
            buttonElement.classList.add('closeSavedCity');
            buttonElement.innerHTML = `<i class="fa-solid fa-xmark" aria-label="Close"></i>`;

            // create an div for each city we've saved
            const savedCity = document.createElement('div');

            //append the close button to the savedCity div
            savedCity.appendChild(buttonElement);

            //scores of saved city inside the container
            savedCity.innerHTML += `
            <p class="savedCity">${cityName}</p>
            <p class="savedContinent">${continentName}</p>
            <p class="savedScore">${cityAPIScore.toFixed(1)}/100</p>`;

            //create an li for each city, and give it a background image
            const savedCityContainer = document.createElement('li');
            savedCityContainer.style.backgroundImage = `linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) 100%), url('${qualityApp.savedCityImageUrl}')`

            savedCityContainer.style.backgroundPosition = `center`;
            savedCityContainer.style.backgroundSize = 'cover';

            //append the saved city to the li, and the li to the ul
            savedCityContainer.append(savedCity);
            savedCitiesListElement.append(savedCityContainer);

            //check for empty saved cities section
            displayEmptyMsg();

            //event listener for each container's close button
            const closeButtons = document.querySelectorAll('.closeSavedCity');
            closeButtons.forEach((button, index) => {

                //add event listener to the close button without duplicating
                if (index === qualityApp.savedCityCounter - 1) {
                    button.addEventListener('click', function () {
                        this.parentElement.parentElement.remove();

                        //remove one to the saved city counter for empty message display
                        qualityApp.savedCityCounter--;

                        displayEmptyMsg();
                    })
                }

            })
        }
    })
}

// Method to add accordion functionality to accordion-button and accordion-container
qualityApp.addAccordionListener = () => {
    // Target the button for accordion feature
    const accordionButton = document.querySelector('.accordion-button');

    // Reused code from Max's Assignment 2
    accordionButton.addEventListener('click', function (event) {
        // Toggle Arrow Icon on Click
        this.firstElementChild.classList.toggle('fa-angle-down');
        this.firstElementChild.classList.toggle('fa-angle-right');

        // Selecting the Accordion Container Element
        const accordionContainerEl = this.parentElement.lastElementChild;

        // Toggle Visibility Class (tracks visibility of container)
        accordionContainerEl.classList.toggle('accordion-container-visible');

        // Adjust max-height depending on visibility
        if (accordionContainerEl.classList.contains("accordion-container-visible")) {
            // Give accordion-container height of its content
            accordionContainerEl.style.maxHeight = "1000vh";
        } else {
            // Remove accordion-container's height
            accordionContainerEl.style.maxHeight = 0 + "px"
        }
    })
}

// Init
qualityApp.init = () => {
    qualityApp.continentListener();
    qualityApp.createDropdown(qualityApp.getSelectedContinent());
    qualityApp.displayCity();
    qualityApp.addAccordionListener();
}

qualityApp.init();