document.addEventListener('DOMContentLoaded', function() {
    const burgerImages = [
        { src: 'classicburger.png', name: 'Classique Burger' },
        { src: 'original.png', name: "l'Original" },
        { src: 'bbqbacon.png', name: 'BbqBacon' }
    ];

    let currentBurgerIndex = 0;
    const carouselImageElement = document.getElementById('carouselImage');
    const burgerLabelElement = document.getElementById('burgerLabel');

    function updateBurgerImage() {
        currentBurgerIndex = (currentBurgerIndex + 1) % burgerImages.length;
        carouselImageElement.src = `assets/${burgerImages[currentBurgerIndex].src}`;
        burgerLabelElement.textContent = burgerImages[currentBurgerIndex].name;
    }

    setInterval(updateBurgerImage, 10000);
    carouselImageElement.addEventListener('click', updateBurgerImage);

    const ingredientForm = document.getElementById('ingredientForm');
    const burgerForm = document.getElementById('burgerForm');
    const ingredientOneSelect = document.getElementById('ingredientOne');
    const ingredientTwoSelect = document.getElementById('ingredientTwo');
    const ingredientThreeSelect = document.getElementById('ingredientThree');

    const ingredients = {};

    function updateIngredientOptions() {
        const selects = [ingredientOneSelect, ingredientTwoSelect, ingredientThreeSelect];
        selects.forEach(select => {
            select.innerHTML = '';
            Object.entries(ingredients).forEach(([name, quantity]) => {
                if (quantity > 0) {
                    select.innerHTML += `<option value="${name}">${name} (${quantity})</option>`;
                }
            });
        });
    }

    ingredientForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('ingredientInput').value.trim();
        const quantity = parseInt(document.getElementById('quantityInput').value, 10);

        if (!name || isNaN(quantity) || quantity <= 0) {
            document.getElementById('ingredientError').textContent = 'Veuillez entrer des valeurs valides.';
            return;
        }

        ingredients[name] = (ingredients[name] || 0) + quantity;
        updateIngredientOptions();
        document.getElementById('ingredientError').textContent = '';
        ingredientForm.reset();
    });

    burgerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const burgerName = document.getElementById('burgerInput').value.trim();
        const ingredient1 = ingredientOneSelect.value;
        const ingredient2 = ingredientTwoSelect.value;
        const ingredient3 = ingredientThreeSelect.value;

        if (!burgerName || !ingredient1 || !ingredient2 || !ingredient3) {
            document.getElementById('burgerError').textContent = 'Veuillez remplir tous les champs.';
            return;
        }

        [ingredient1, ingredient2, ingredient3].forEach(ingredient => {
            if (ingredients[ingredient] > 0) {
                ingredients[ingredient] -= 1;
            }
        });

        updateIngredientOptions();
        alert(`Burger "${burgerName}" créé avec : ${ingredient1}, ${ingredient2}, ${ingredient3}`);
        burgerForm.reset();
    });

    // const fetchInfoBtn = document.getElementById('fetchInfoBtn');
    // const infoContainer = document.getElementById('infoContainer');

    // fetchInfoBtn.addEventListener('click', function() {
    //     fetch('mockData.json')
    //         .then(response => {
    //             if (!response.ok) throw new Error('Erreur lors de la récupération des informations.');
    //             return response.json();
    //         })
    //         .then(data => {
    //             if (!data.adressesOperateurs || data.adressesOperateurs.length === 0) {
    //                 throw new Error('Aucune adresse trouvée.');
    //             }

    //             const adresse = data.adressesOperateurs[0];
    //             const productions = data.productions || [];

    //             infoContainer.innerHTML = `
    //                 <p>Notre restaurant travaille avec des produits locaux provenant de la ferme bio numéro 
    //                 <strong>${data.numeroBio}</strong> de Monsieur <strong>${data.gerant}</strong>, située à 
    //                 <strong>${adresse.lieu} ${adresse.codePostal} ${adresse.ville}</strong>.</p>
    //                 <p>Cette ferme intervient dans les commerces :</p>
    //                 <ul>${productions.map(prod => `<li>${prod.nom}</li>`).join('')}</ul>
    //             `;
    //         })
    //         .catch(error => {
    //             console.error(error.message);
    //             infoContainer.innerHTML = '<p>Une erreur est survenue. Veuillez réessayer plus tard.</p>';
    //         });
    // });
    
    const fetchInfoBtn = document.getElementById('fetchInfoBtn');
    const infoContainer = document.getElementById('infoContainer');

    fetchInfoBtn.addEventListener('click', function () {
        // URL API avec le bon paramètre
        const apiUrl = "https://opendata.agencebio.org/api/gouv/operateurs"; // Base URL
        const siret = "79317749400028"; // SIRET fourni

        // Requête à l'API
        fetch(`${apiUrl}?siret=${siret}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur lors de la récupération des informations : ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Validation des données reçues
                if (!data || !data.items || data.items.length === 0) {
                    throw new Error('Aucune donnée trouvée pour le SIRET fourni.');
                }

                const item = data.items[0]; // Premier résultat
                const numeroBio = item.numeroBio;
                const gerant = item.gerant;
                const adresse = item.adressesOperateurs[0]; // Première adresse
                const productions = item.productions || []; // Liste des productions

                // Construction du contenu HTML
                infoContainer.innerHTML = `
                    <p>Notre restaurant travaille avec des produits locaux provenant de la ferme bio numéro 
                    <strong>${numeroBio}</strong> de Monsieur <strong>${gerant}</strong>, située à 
                    <strong>${adresse.lieu} ${adresse.codePostal} ${adresse.ville}</strong>.</p>
                    <p>Cette ferme intervient dans les commerces :</p>
                    <ul>${productions.map(prod => `<li>${prod.nom}</li>`).join('')}</ul>
                `;
            })
            .catch(error => {
                console.error('Erreur :', error.message);
                infoContainer.innerHTML = '<p>Une erreur est survenue. Veuillez réessayer plus tard.</p>';
            });
    });
});
