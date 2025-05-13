document.addEventListener('DOMContentLoaded', () => {
    const birdsContainer = document.getElementById('birds-container');
    const searchBox = document.getElementById('search-box');
    const statusFilter = document.getElementById('status-filter');
    const photographerFilter = document.getElementById('photographer-filter');
    const searchForm = document.getElementById('search-form'); 
    const header = document.querySelector('header'); // Use querySelector to get the header element
    const addBirdButton = document.getElementById('add-bird-button'); // Get the add bird button

    // Array of bird images

    // Array of bird images
    const birdImages = [
        'data/albatross.png', 
        'data/tui.png', 
        'data/greatFrigate.png', 
        'data/kaka.png',
        'data/kakapo.png',
        'data/kereru.png',
        'data/kea.png',
        'data/pigeon.png',
        'data/seagull.png',
        'data/huia.png'
    ];
     /* creates the birds for the animation  */
    function createImageBird() {
        const imageBirdElement = document.createElement('img');
        imageBirdElement.src = birdImages[Math.floor(Math.random() * birdImages.length)]; //random bird
        imageBirdElement.classList.add('image-bird'); 
        
        // Position the bird randomly vertically
        imageBirdElement.style.top = `${Math.random() * 80}vh`;
        imageBirdElement.style.left = `${-50}px`; // Start just outside the left edge
        imageBirdElement.style.animationDuration = `${5}s`; // Random duration between 5s and 10s

        header.appendChild(imageBirdElement);
        
        // Remove the bird after its animation ends
        imageBirdElement.addEventListener('animationend', () => {
            imageBirdElement.remove();
        });
    }

        // Event listener for the add bird button
        addBirdButton.addEventListener('click', createImageBird);

        setInterval(createImageBird, 4000) //bird every 4 seconds
        
    fetch('data/nzbird.json')
        .then(responseCallback)
        .then(dataReadyCallback)
        .catch(fetchErrorCallback);

    // Prevent form submission
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    function responseCallback(response) {
        if (response.status !== 200) return;
        else {
            return response.text();
        }
    }

    function dataReadyCallback(data) {
        let birds = JSON.parse(data); //parse data from the JSON file
        populatePhotographerFilter(birds);
        displayBirds(birds);
        searchBox.addEventListener('input', () => filterBirds(birds)); //adds search box functionality
        statusFilter.addEventListener('change', () => filterBirds(birds)); //adds status filter functionality
        photographerFilter.addEventListener('change', () => filterBirds(birds)); //adds photographer filter functionality
    }

    function fetchErrorCallback(error) {
        alert("An error occurred when fetching the bird data. Please try again later."); //alert that pops on screen if bird data can't be fetched
        console.log(error);
    }
    

    /* function that populates the bird container with the bird cards */
    function displayBirds(birds) {
        birdsContainer.innerHTML = '';
        birds.forEach(bird => { //for each of the birds from the json file
            const birdCard = document.createElement('div');
            birdCard.classList.add('bird-card');
            birdCard.style.background = getStatusColor(bird.status);

            const birdImage = document.createElement('img');
            birdImage.src = bird.photo.source;
            birdImage.alt = bird.common_name;

            const birdName = document.createElement('h3');
            birdName.textContent = `${bird.common_name}`;
            
            const birdSecondName = document.createElement('p');
            if (bird.original_name === "") {
                birdSecondName.textContent = `Scientific Name: ${bird.scientific_name}`;
            } else {
                birdSecondName.textContent = `Original Name: ${bird.original_name}`;
            }

            const birdStatus = document.createElement('p');
            birdStatus.textContent = `Status: ${bird.status}`;

            const photoCredit = document.createElement('p');
            photoCredit.textContent = `Photo by: ${bird.photo.credit}`;

            birdCard.appendChild(birdImage);
            birdCard.appendChild(birdName);
            birdCard.appendChild(birdSecondName);
            birdCard.appendChild(birdStatus);
            birdCard.appendChild(photoCredit);

            birdsContainer.appendChild(birdCard);
        });
    }

    /* filters the birds and returns ones that fit parameters */
    function filterBirds(birds) {
        const searchQuery = searchBox.value.toLowerCase().normalize("NFC");
        const statusQuery = statusFilter.value;
        const photographerQuery = photographerFilter.value;
        
        
        const filteredBirds = birds.filter(bird => {   //gets all the birds that fit the search and filters paramaters
            const commonName = bird.common_name.toLowerCase().normalize("NFC");
            const scientificName = bird.scientific_name.toLowerCase().normalize("NFC");
            const originalName = bird.original_name.toLowerCase().normalize("NFC");
            const otherNames = bird.other_name.map(name => name.toLowerCase().normalize("NFC"));

            const matchesSearch = commonName.includes(searchQuery) ||
                                  scientificName.includes(searchQuery) ||
                                  originalName.includes(searchQuery) ||
                                  otherNames.some(name => name.includes(searchQuery));

            const matchesStatus = statusQuery === '' || bird.status === statusQuery;
            const matchesPhotographer = photographerQuery === '' || bird.photo.credit === photographerQuery;

            return matchesSearch && matchesStatus && matchesPhotographer;
        });

        displayBirds(filteredBirds);  //display the birds that fit filter criteria
    }

    //get the status colour from the bird status
    function getStatusColor(status) {
        const statusColors = {
            'Not Threatened': '#02a028',
            'Naturally Uncommon': '#649a31',
            'Relict': '#99cb68',
            'Recovering': '#fecc33',
            'Declining': '#fe9a01',
            'Nationally Increasing': '#c26967',
            'Nationally Vulnerable': '#9b0000',
            'Nationally Endangered': '#660032',
            'Nationally Critical': '#320033',
            'Extinct': '#000000',
            'Data Deficient': '#000000'
        };
        return statusColors[status] || '#000000'
    }

    /* populates the photographer filter with various photographer options */
    function populatePhotographerFilter(birds) {
        const photographers = new Set(birds.map(bird => bird.photo.credit));
        photographerFilter.innerHTML = '<option value="">Select Photographer</option>'; // Reset options
        photographers.forEach(photographer => {
            const option = document.createElement('option');
            option.value = photographer;
            option.textContent = photographer;
            photographerFilter.appendChild(option);
        });
    }
});
