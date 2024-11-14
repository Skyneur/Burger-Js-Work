const images = [
    { src: 'burger1.png', name: 'Burger 1' },
    { src: 'burger2.png', name: 'Burger 2' },
    { src: 'burger3.png', name: 'Burger 3' }
];

let currentIndex = 0;
const imageElement = document.getElementById('slideshow-image');
const burgerNameElement = document.getElementById('burger-name');

function showNextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    imageElement.src = `assets/${images[currentIndex].src}`;
}

function showBurgerName() {
    burgerNameElement.textContent = images[currentIndex].name;
}

imageElement.addEventListener('click', showBurgerName);

setInterval(showNextImage, 10000);

// Initial image setup
imageElement.src = `assets/${images[currentIndex].src}`;

document.addEventListener('DOMContentLoaded', function() {
    const ingredientForm = document.getElementById('ingredient-form');
    const ingredientList = document.getElementById('ingredient-list');
    const errorMessage = document.getElementById('error-message');

    const burgerForm = document.getElementById('burger-form');
    const burgerErrorMessage = document.getElementById('burger-error-message');
    const ingredientSelects = [
        document.getElementById('ingredient1'),
        document.getElementById('ingredient2'),
        document.getElementById('ingredient3')
    ];

    const ingredients = new Map();

    ingredientForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const name = document.getElementById('ingredient-name').value.trim();
        const quantity = parseInt(document.getElementById('ingredient-quantity').value.trim(), 10);
        
        if (!name || quantity <= 0) {
            errorMessage.textContent = 'Veuillez entrer un nom valide et une quantité supérieure à 0.';
            return;
        }
        
        const option = document.createElement('option');
        option.value = name;
        option.textContent = `${name} (${quantity})`;
        
        ingredientSelects.forEach(select => {
            const optionClone = option.cloneNode(true);
            select.appendChild(optionClone);
        });
        
        ingredients.set(name, quantity);
        
        errorMessage.textContent = '';
        ingredientForm.reset();
    });

    burgerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const burgerName = document.getElementById('burger-name').value.trim();
        const ingredient1 = document.getElementById('ingredient1').value;
        const ingredient2 = document.getElementById('ingredient2').value;
        const ingredient3 = document.getElementById('ingredient3').value;
        
        if (!burgerName || !ingredient1 || !ingredient2 || !ingredient3) {
            burgerErrorMessage.textContent = 'Veuillez remplir tous les champs.';
            return;
        }
        
        const selectedIngredients = [ingredient1, ingredient2, ingredient3];
        
        for (const ingredient of selectedIngredients) {
            if (!ingredients.has(ingredient) || ingredients.get(ingredient) <= 0) {
                burgerErrorMessage.textContent = `L'ingrédient ${ingredient} n'est pas disponible en quantité suffisante.`;
                return;
            }
        }
        
        selectedIngredients.forEach(ingredient => {
            ingredients.set(ingredient, ingredients.get(ingredient) - 1);
        });
        
        burgerErrorMessage.textContent = '';
        burgerForm.reset();
    });
});
