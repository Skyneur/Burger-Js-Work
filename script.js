// Variables globales
const burgerImages = [
    { src: 'classicburger.png', name: 'Classique Burger' },
    { src: 'original.png', name: 'l\'Original' },
    { src: 'bbqbacon.png', name: 'BbqBacon' }
];

let currentBurgerIndex = 0;
const carouselImageElement = document.getElementById('carouselImage');
const burgerLabelElement = document.getElementById('burgerLabel');

// Fonction pour changer l'image
function updateBurgerImage() {
    currentBurgerIndex = (currentBurgerIndex + 1) % burgerImages.length;
    carouselImageElement.src = `assets/${burgerImages[currentBurgerIndex].src}`;
    burgerLabelElement.textContent = burgerImages[currentBurgerIndex].name;
}

// Intervalle pour changer l'image
setInterval(updateBurgerImage, 10000);
carouselImageElement.addEventListener('click', updateBurgerImage);

// Gestion des formulaires
document.addEventListener('DOMContentLoaded', function() {
    const ingredientForm = document.getElementById('ingredientForm');
    const burgerForm = document.getElementById('burgerForm');
    const ingredientOneSelect = document.getElementById('ingredientOne');
    const ingredientTwoSelect = document.getElementById('ingredientTwo');
    const ingredientThreeSelect = document.getElementById('ingredientThree');

    const ingredients = [];

    // Fonction pour mettre à jour les options des listes déroulantes
    function updateIngredientOptions() {
        const selects = [ingredientOneSelect, ingredientTwoSelect, ingredientThreeSelect];
        selects.forEach(select => {
            select.innerHTML = '';
            ingredients.forEach(ingredient => {
                select.innerHTML += `<option value="${ingredient}">${ingredient}</option>`;
            });
        });
    }

    ingredientForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('ingredientInput').value.trim();
        const quantity = document.getElementById('quantityInput').value;

        if (!name || quantity <= 0) {
            document.getElementById('ingredientError').textContent = 'Veuillez entrer des valeurs valides.';
            return;
        }

        ingredients.push(name);
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

        // Retirer les ingrédients utilisés
        [ingredient1, ingredient2, ingredient3].forEach(ingredient => {
            const index = ingredients.indexOf(ingredient);
            if (index > -1) {
                ingredients.splice(index, 1);
            }
        });

        // Mettre à jour les options des listes déroulantes
        updateIngredientOptions();

        alert(`Burger "${burgerName}" créé avec : ${ingredient1}, ${ingredient2}, ${ingredient3}`);
        burgerForm.reset();
    });
});