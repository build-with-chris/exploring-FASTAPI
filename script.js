const recipeForm = document.querySelector('.recipe-form');
const recipeCollection = document.querySelector('.recipe-collection');
let recipes = [];

async function loadRecipes() {
    try {
        const response = await fetch('http://localhost:8000/recipes')
        if (!response.ok) throw new Error("loading unsuccessful");
        const data = await response.json();
        recipes = data;
        renderRecipes();
    } catch (err) {
        alert("Something went wrong")
        console.log(err)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
    recipeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const title       = document.getElementById('title').value.trim();
      const ingredients = document.getElementById('ingredients').value.trim();
      const steps       = document.getElementById('steps').value.trim();
      const recipeImage = document.getElementById('recipeImage').value.trim();
  
      if (!title || !ingredients || !steps || !recipeImage) {
        alert('Fill out all fields');
        return;
      }  
  
      try {
        const response = await fetch('http://localhost:8000/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: title, 
            ingredients: ingredients.split(',').map(i => i.trim()),
            steps: steps, 
            recipeImage: recipeImage 
        })
        });
        if (!response.ok) throw new Error('error while adding');
        const newRecipe = await response.json();
        recipes.push(newRecipe);
        renderRecipes();
        recipeForm.reset();
        alert('Added recipe successfully');
      } catch (err) {
        console.log(err);
        alert('error while adding new recipe');
      }
    });  
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
        btn.addEventListener('click', async () => {
            const idx = Number(btn.dataset.index);
            const recipeId = recipes[idx].id;
        
        try {
            const response = await fetch(`http://localhost:8000/recipes/${recipeId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error while deleting recipe.');
            recipes.splice(idx, 1);
            renderRecipes();
            alert("Recipe deleted")

        } catch (err) {
            console.log(err)
            alert('Something went wrong')
        }
    });
});
}

