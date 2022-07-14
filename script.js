const qualityApp = {};

qualityApp.getCity = () => {
    //target the city dropdown's value
    const dropdown = document.querySelector('#cities');

    //target the form
    const form = document.querySelector('form');
    
    //listen for user submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        //store the selected city in a variable 
        const userCity = dropdown.value;
        
        //make an API call to get the selected city data
        const url = new URL(`https://api.teleport.org/api/urban_areas/slug:${userCity}/scoresss/`);

        fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
            
        })
        .then(function (result) {
            console.log(result);
        })
        .catch(function(error) {
            alert(error.message);
        })

    })
    
}


qualityApp.init = () => {
    qualityApp.getCity();
}

qualityApp.init();