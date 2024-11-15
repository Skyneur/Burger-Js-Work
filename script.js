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
    let ingredients = JSON.parse(localStorage.getItem('ingredients')) || {}; // Charger les ingrédients depuis le localStorage

    function updateIngredientOptions() {
        const selects = [ingredientOneSelect, ingredientTwoSelect, ingredientThreeSelect];
        selects.forEach(select => {
            if (select) {
                const selectedValue = select.value; // Sauvegarder la valeur sélectionnée
                select.innerHTML = '<option value="">Sélectionner un ingrédient</option>'; // Option par défaut
                Object.entries(ingredients).forEach(([name, quantity]) => {
                    select.innerHTML += `<option value="${name}">${name} (${quantity})</option>`;
                });
                select.value = selectedValue; // Réappliquer la sélection précédente
            }
        });
    }

    if (ingredientForm) {
        ingredientForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('ingredientInput').value.trim();
            const quantity = parseInt(document.getElementById('quantityInput').value, 10);

            if (!name || !/^[a-zA-Z]+$/.test(name) || isNaN(quantity) || quantity <= 0) {
                document.getElementById('ingredientError').textContent = 'Veuillez entrer un nom valide (lettres uniquement) et une quantité valide.';
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

    function updateBurgerIngredientOptions() {
        const selectedIngredients = [
            ingredientOneSelect.value,
            ingredientTwoSelect.value,
            ingredientThreeSelect.value
        ];

        const selects = [ingredientOneSelect, ingredientTwoSelect, ingredientThreeSelect];
        selects.forEach(select => {
            if (select) {
                const selectedValue = select.value; // Sauvegarder la valeur sélectionnée
                select.innerHTML = '<option value="">Sélectionner un ingrédient</option>'; // Option par défaut
                Object.entries(ingredients).forEach(([name, quantity]) => {
                    const selectedCount = selectedIngredients.filter(ingredient => ingredient === name).length;
                    const availableQuantity = quantity - selectedCount;
                    select.innerHTML += `<option value="${name}">${name} (${availableQuantity})</option>`;
                });
                select.value = selectedValue; // Réappliquer la sélection précédente
            }
        });
    }

    if (burgerForm) {
        updateIngredientOptions();

        [ingredientOneSelect, ingredientTwoSelect, ingredientThreeSelect].forEach(select => {
            select.addEventListener('change', updateBurgerIngredientOptions);
        });

        $('#burgerForm').on('submit', function(event) {
            event.preventDefault();
            const burgerName = $('#burgerInput').val().trim();
            const ingredient1 = $('#ingredientOne').val();
            const ingredient2 = $('#ingredientTwo').val();
            const ingredient3 = $('#ingredientThree').val();

            if (!burgerName || !/^[a-zA-Z]+$/.test(burgerName) || !ingredient1 || !ingredient2 || !ingredient3) {
                showNotification('Veuillez entrer un nom de burger valide (lettres uniquement) et remplir tous les champs.', 'error');
                return;
            }

            let hasError = false;
            [ingredient1, ingredient2, ingredient3].forEach(ingredient => {
                if (ingredients[ingredient] > 0) {
                    ingredients[ingredient] -= 1;
                } else {
                    hasError = true;
                }
            });

            if (hasError) {
                showNotification('Pas assez d\'ingrédients pour créer ce burger.', 'error');
                return;
            }

            // Supprimer les ingrédients avec une quantité de 0
            Object.keys(ingredients).forEach(name => {
                if (ingredients[name] === 0) {
                    delete ingredients[name];
                }
            });

            localStorage.setItem('ingredients', JSON.stringify(ingredients));

            updateIngredientOptions();
            $('#burgerForm')[0].reset();
            showNotification(`Burger "${burgerName}" créé avec : ${ingredient1}, ${ingredient2}, ${ingredient3}.`);
        });
    }

    // ==========================
    // Requête API pour "Qui sommes-nous ?"
    // ==========================
    const infoContainer = document.getElementById('infoContainer');

    if (infoContainer) {
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
                    <p>Nous travaillons avec des produits locaux provenant de la ferme bio numéro 
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
            notification.classList.add('error');
        }
        notification.textContent = message;

        notificationsContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
});