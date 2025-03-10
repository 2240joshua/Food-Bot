import React, { useState } from "react";
import { getRecipes } from "./api";

function App() {
    const [ingredients, setIngredients] = useState("");
    const [cuisine, setCuisine] = useState("");
    const [diet, setDiet] = useState("");
    const [maxTime, setMaxTime] = useState(30);
    const [recipes, setRecipes] = useState([]);

    const fetchRecipes = async () => {
        const data = await getRecipes(ingredients, cuisine, diet, maxTime);
        setRecipes(data.recipes);
    };

    return (
        <div>
            <h1>Food Recommendation Bot</h1>
            <input type="text" placeholder="Ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            <input type="text" placeholder="Cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
            <input type="text" placeholder="Diet" value={diet} onChange={(e) => setDiet(e.target.value)} />
            <input type="number" placeholder="Max Time" value={maxTime} onChange={(e) => setMaxTime(e.target.value)} />
            <button onClick={fetchRecipes}>Get Recipes</button>

            <ul>
                {recipes.map((recipe, index) => (
                    <li key={index}>
                        <img src={recipe.image} alt={recipe.title} width="100" />
                        <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">{recipe.title}</a>
                        <p>Ready in {recipe.readyInMinutes} mins - Serves {recipe.servings}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
