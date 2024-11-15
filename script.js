document.addEventListener('DOMContentLoaded', function() {
    // ==========================
    // Données des images du carousel
    // ==========================
    const burgerImages = [
        { src: 'classicburger.png', name: 'Classique Burger' },
        { src: 'original.png', name: "l'Original" },
        { src: 'bbqbacon.png', name: 'Barbecue Bacon' }
    ];

    let currentBurgerIndex = 0;
    const carouselImageElement = document.getElementById('carouselImage');
    const burgerLabelElement = document.getElementById('burgerLabel');

    // ==========================
    // Mise à jour de l'image du carousel toutes les 10 secondes
    // ==========================
    function updateBurgerImage() {
        currentBurgerIndex = (currentBurgerIndex + 1) % burgerImages.length;
        carouselImageElement.src = `assets/${burgerImages[currentBurgerIndex].src}`;
        burgerLabelElement.textContent = burgerImages[currentBurgerIndex].name;
    }

    setInterval(updateBurgerImage, 10000);
    carouselImageElement.addEventListener('click', updateBurgerImage);

    // ==========================
    // Gestion des ingrédients
    // ==========================
    const ingredientForm = document.getElementById('ingredientForm');
    const ingredientOneSelect = document.getElementById('ingredientOne');
    const ingredientTwoSelect = document.getElementById('ingredientTwo');
    const ingredientThreeSelect = document.getElementById('ingredientThree');
    const ingredients = {}; // Stockage des ingrédients ajoutés

    // Mise à jour des listes déroulantes d'ingrédients
    function updateIngredientOptions() {
        const selects = [ingredientOneSelect, ingredientTwoSelect, ingredientThreeSelect];
        selects.forEach(select => {
            select.innerHTML = ''; // On vide les options actuelles
            Object.entries(ingredients).forEach(([name, quantity]) => {
                if (quantity > 0) { // Ajout des ingrédients disponibles
                    select.innerHTML += `<option value="${name}">${name} (${quantity})</option>`;
                }
            });
        });
    }

    // ==========================
    // Affichage des notifications
    // ==========================
    function showNotification(message, type = 'success') {
        const notificationsContainer = document.getElementById('notifications');

        if (!notificationsContainer) {
            console.error('Le conteneur des notifications est introuvable.');
            return;
        }

        // Création de la notification
        const notification = document.createElement('div');
        notification.classList.add('notification');
        if (type === 'error') {
            notification.style.backgroundColor = 'red';
        }
        notification.textContent = message;

        // Ajout et suppression automatique de la notification
        notificationsContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // ==========================
    // Soumission du formulaire pour créer un ingrédient
    // ==========================
    ingredientForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('ingredientInput').value.trim();
        const quantity = parseInt(document.getElementById('quantityInput').value, 10);

        if (!name || isNaN(quantity) || quantity <= 0) {
            document.getElementById('ingredientError').textContent = 'Veuillez entrer des valeurs valides.';
            return;
        }

        ingredients[name] = (ingredients[name] || 0) + quantity; // Ajout ou mise à jour de l'ingrédient
        updateIngredientOptions();
        document.getElementById('ingredientError').textContent = '';
        ingredientForm.reset();

        showNotification(`Ingrédient "${name}" ajouté avec une quantité de ${quantity}.`);
    });

    // ==========================
    // Gestion des burgers
    // ==========================
    const burgerForm = document.getElementById('burgerForm');

    // Soumission du formulaire pour créer un burger
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

        // Mise à jour des quantités des ingrédients
        [ingredient1, ingredient2, ingredient3].forEach(ingredient => {
            if (ingredients[ingredient] > 0) {
                ingredients[ingredient] -= 1;
            }
        });

        updateIngredientOptions();
        burgerForm.reset();

        showNotification(`Burger "${burgerName}" créé avec : ${ingredient1}, ${ingredient2}, ${ingredient3}.`);
    });

    // ==========================
    // Requête API pour "Qui sommes-nous ?"
    // ==========================
    const fetchInfoBtn = document.getElementById('fetchInfoBtn');
    const infoContainer = document.getElementById('infoContainer');

    fetchInfoBtn.addEventListener('click', function() {
        const apiUrl = "https://opendata.agencebio.org/api/gouv/operateurs";
        const siret = "79317749400028";

        fetch(`${apiUrl}?siret=${siret}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur lors de la récupération des informations : ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data || !data.items || data.items.length === 0) {
                    throw new Error('Aucune donnée trouvée pour le SIRET fourni.');
                }

                // Construction du contenu à afficher
                const item = data.items[0];
                const numeroBio = item.numeroBio;
                const gerant = item.gerant;
                const adresse = item.adressesOperateurs[0];
                const productions = item.productions || [];

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

    // ==========================
    // Test pour simuler l'appel à une API via un fichier json
    // ==========================

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
});