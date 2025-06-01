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


async function addRecipe(recipeData) {
  const response = await fetch('http://localhost:8000/recipes', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(recipeData)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'error while adding');
  }
  return await response.json();
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
      };  
      const recipeData = {
        title,
        ingredients: ingredients.split(',').map(i => i.trim()),
        steps,
        recipeImage
      };
      try {
        const newRecipe = await addRecipe(recipeData)
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

    // Container leeren
    recipeCollection.innerHTML = '';
  
    recipes.forEach((r, i) => {
      const ingString = Array.isArray(r.ingredients)
        ? r.ingredients.join(', ')
        : r.ingredients;
  
      const cardHTML = `
        <div class="recipe-card">
          <!-- Anzeige-Modus -->
          <div class="recipe-view">
            <h3>${r.title}</h3>
            <p><strong>Ingredients:</strong> ${ingString}</p>
            <p><strong>Steps:</strong> ${r.steps}</p>
            <img src="${r.recipeImage}" class="recipe-image" alt="Image of ${r.title}">
            <div class="change">
              <button type="button" class="delete" data-index="${i}">❌</button>
              <button type="button" class="edit" data-index="${i}">✏️ Edit</button>
            </div>
          </div>
  
          <!-- Bearbeiten-Modus (initial versteckt) -->
          <form class="edit-form" data-index="${i}" style="display: none; margin-top: 10px;">
            <div>
              <label for="editTitle-${i}">Titel:</label>
              <input
                type="text"
                id="editTitle-${i}"
                name="editTitle"
                value="${r.title}"
              />
            </div>
            <div>
              <label for="editIngredients-${i}">Ingredients:</label>
              <input
                type="text"
                id="editIngredients-${i}"
                name="editIngredients"
                value="${ingString}"
              />
            </div>
            <div>
              <label for="editSteps-${i}">Steps:</label>
              <textarea
                id="editSteps-${i}"
                name="editSteps"
              >${r.steps}</textarea>
            </div>
            <div>
              <label for="editImage-${i}">Image URL:</label>
              <input
                type="url"
                id="editImage-${i}"
                name="editImage"
                value="${r.recipeImage}"
              />
            </div>
            <button type="submit" class="save-edit">Save</button>
            <button type="button" class="cancel-edit">Cancel</button>
          </form>
        </div>
      `;
      recipeCollection.insertAdjacentHTML('beforeend', cardHTML);
    });
  
    deleteRecipe();
    attachEditListeners();
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


function attachEditListeners() {
  document.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index;
      const form = document.querySelector(`.edit-form[data-index="${idx}"]`);
      form.style.display = 'block';
      form.querySelector('input[name="editTitle"]').focus();
    });
  });

  document.querySelectorAll('.cancel-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = btn.closest('form.edit-form');
      form.style.display = 'none';
    });
  });

  document.querySelectorAll('.edit-form').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault(); 

      const idx = Number(form.dataset.index);
      const recipeId = recipes[idx].id;

      const newTitle = form.querySelector('input[name="editTitle"]').value.trim();
      const ingString = form.querySelector('input[name="editIngredients"]').value.trim();
      const newSteps = form.querySelector('textarea[name="editSteps"]').value.trim();
      const newImage = form.querySelector('input[name="editImage"]').value.trim();

      const updatedRecipe = {
        title: newTitle,
        ingredients: ingString.split(',').map(i => i.trim()),
        steps: newSteps,
        recipeImage: newImage
      };

      try {
        const response = await fetch(`http://localhost:8000/recipes/${recipeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedRecipe)
        });
        if (!response.ok) throw new Error('Server-Fehler beim Bearbeiten');

        const data = await response.json();
        recipes[idx] = data;

        renderRecipes();
        alert('Recipe has been edited successfully');
      } catch (err) {
        console.log(err);
        alert('Something went wrong');
      }
    });
  })
}
  
