const recipeForm = document.querySelector('.recipe-form');
const recipeCollection = document.querySelector('.recipe-collection');
let recipes = [];

if (localStorage.getItem('recipes')) {
    recipes = JSON.parse(localStorage.getItem('recipes'));
    renderRecipes();
}

recipeForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('title').value.trim();
    const ingredients = document.getElementById('ingredients').value.trim();
    const steps = document.getElementById('steps').value.trim();
    const recipeImage = document.getElementById('recipeImage').value.trim();

    if (!title || !ingredients || !steps || !recipeImage) {
        alert('Fill out all fields');
        return;
    }
    recipes.push({ title, ingredients, steps, recipeImage });
    localStorage.setItem('recipes', JSON.stringify(recipes));

    renderRecipes();
    recipeForm.reset();
});

function renderRecipes() {
    recipeCollection.innerHTML = recipes.map( (r, i) => `
    <div class="recipe-card">
    <h3>${r.title}</h3>
    <p><strong>Ingredientes:</strong> ${r.ingredients}</p>
    <p><strong>Steps:</strong> ${r.steps}</p>
    <img src="${r.recipeImage}" class="recipe-image">
    
    <div>
    <button type="button" class="delete" data-index="${i}">❌</button>
    </div></div>
`).join('');
    deleteRecipe();
}

function deleteRecipe() {
    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.index);
            recipes.splice(idx, 1);
            renderRecipes();
        })
    })

}