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

    if (carouselImageElement && burgerLabelElement) {
        function updateBurgerImage() {
            currentBurgerIndex = (currentBurgerIndex + 1) % burgerImages.length;
            carouselImageElement.src = `assets/${burgerImages[currentBurgerIndex].src}`;
            burgerLabelElement.textContent = burgerImages[currentBurgerIndex].name;
        }

        setInterval(updateBurgerImage, 10000);
        carouselImageElement.addEventListener('click', updateBurgerImage);
    }

    // ==========================
    // Gestion des ingrédients
    // ==========================
    const ingredientForm = document.getElementById('ingredientForm');
    const ingredientOneSelect = document.getElementById('ingredientOne');
    const ingredientTwoSelect = document.getElementById('ingredientTwo');
    const ingredientThreeSelect = document.getElementById('ingredientThree');
    const ingredients = {}; // Stockage des ingrédients ajoutés

    function updateIngredientOptions() {
        const selects = [ingredientOneSelect, ingredientTwoSelect, ingredientThreeSelect];
        selects.forEach(select => {
            if (select) {
                select.innerHTML = ''; // On vide les options actuelles
                Object.entries(ingredients).forEach(([name, quantity]) => {
                    if (quantity > 0) { // Ajout des ingrédients disponibles
                        select.innerHTML += `<option value="${name}">${name} (${quantity})</option>`;
                    }
                });
            }
        });
    }

    if (ingredientForm) {
        ingredientForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('ingredientInput').value.trim();
            const quantity = parseInt(document.getElementById('quantityInput').value, 10);

            if (!name || isNaN(quantity) || quantity <= 0) {
                document.getElementById('ingredientError').textContent = 'Veuillez entrer des valeurs valides.';
                return;
            }

            ingredients[name] = (ingredients[name] || 0) + quantity; // Ajout ou mise à jour de l'ingrédient
            localStorage.setItem('ingredients', JSON.stringify(ingredients));
            updateIngredientOptions();
            document.getElementById('ingredientError').textContent = '';
            ingredientForm.reset();

            showNotification(`Ingrédient "${name}" ajouté avec une quantité de ${quantity}.`);
        });
    }

    // ==========================
    // Gestion des burgers
    // ==========================
    const burgerForm = document.getElementById('burgerForm');

    if (burgerForm) {
        function updateIngredientOptions() {
            const ingredients = JSON.parse(localStorage.getItem('ingredients')) || {};
            const selects = ['#ingredientOne', '#ingredientTwo', '#ingredientThree'];
            selects.forEach(select => {
                $(select).empty();
                $(select).append('<option value="">Sélectionner un ingrédient</option>');
                $.each(ingredients, function(name, quantity) {
                    if (quantity > 0) {
                        $(select).append(`<option value="${name}">${name} (${quantity})</option>`);
                    }
                });
            });
        }

        updateIngredientOptions();

        $('#burgerForm').on('submit', function(event) {
            event.preventDefault();
            const burgerName = $('#burgerInput').val().trim();
            const ingredient1 = $('#ingredientOne').val();
            const ingredient2 = $('#ingredientTwo').val();
            const ingredient3 = $('#ingredientThree').val();

            if (!burgerName || !ingredient1 || !ingredient2 || !ingredient3) {
                $('#burgerError').text('Veuillez remplir tous les champs.');
                return;
            }

            let ingredients = JSON.parse(localStorage.getItem('ingredients')) || {};
            [ingredient1, ingredient2, ingredient3].forEach(ingredient => {
                if (ingredients[ingredient] > 0) {
                    ingredients[ingredient] -= 1;
                }
            });
            localStorage.setItem('ingredients', JSON.stringify(ingredients));

            updateIngredientOptions();
            $('#burgerForm')[0].reset();
            alert(`Burger "${burgerName}" créé avec : ${ingredient1}, ${ingredient2}, ${ingredient3}.`);
        });
    }

    // ==========================
    // Requête API pour "Qui sommes-nous ?"
    // ==========================
    const fetchInfoBtn = document.getElementById('fetchInfoBtn');
    const infoContainer = document.getElementById('infoContainer');

    if (fetchInfoBtn && infoContainer) {
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

        const notification = document.createElement('div');
        notification.classList.add('notification');
        if (type === 'error') {
            notification.style.backgroundColor = 'red';
        }
        notification.textContent = message;

        notificationsContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
});