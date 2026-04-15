fetch("elements.json")
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById("table");

        data.forEach(el => {
            const div = document.createElement("div");
            div.className = "element";

            div.innerHTML = `
                <div class="numero">${el.numero}</div>
                <div class="symbole">${el.symbole}</div>
                <div class="masse">${el.masse}</div>
            `;

            div.onclick = () => {
                document.getElementById("info").innerHTML =
                    `<strong>${el.nom}</strong><br>
                     Numéro atomique : ${el.numero}<br>
                     Masse atomique : ${el.masse}`;
            };

            // Positionnement dans la grille
            div.style.gridColumn = el.colonne;
            div.style.gridRow = el.ligne;

            table.appendChild(div);
        });
    });
