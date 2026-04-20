// ===============================
// 1. Chargement du JSON
// ===============================
fetch("elements.json")
    .then(response => response.json())
    .then(data => {

        const table = document.getElementById("table");

        // ===============================
        // 2. Fonction : calcul des électrons de valence
        // ===============================
        function getValence(colonne) {

    // Groupes principaux
    if (colonne === 1) return 1;
    if (colonne === 2) return 2;
    if (colonne >= 13 && colonne <= 18) return colonne - 10;

    // Métaux de transition (approximation pédagogique)
    if (colonne >= 3 && colonne <= 12) {
        return Math.min(colonne, 8);
    }

    return null;
}

        // ===============================
        // 3. Génération SVG simple (structure Lewis)
        // ===============================
        function generateLewisSVG(symbole, valence) {

            const positions = [
                [50, 10],  // haut
                [90, 50],  // droite
                [50, 90],  // bas
                [10, 50],  // gauche
                [75, 25],  // diagonales
                [75, 75],
                [25, 75],
                [25, 25]
            ];

            let dots = "";

            for (let i = 0; i < valence; i++) {
                const [x, y] = positions[i];
                dots += `<circle cx="${x}" cy="${y}" r="3" fill="black"/>`;
            }

            return `
            <svg viewBox="0 0 100 100" width="120">
                <text x="50" y="55" text-anchor="middle" font-size="20">${symbole}</text>
                ${dots}
            </svg>`;
        }

        // ===============================
        // 4. Génération avancée (doublets + célibataires)
        // ===============================
        function generateLewisAdvanced(symbole, valence) {

            const positions = [
                [50,10],[90,50],[50,90],[10,50]
            ];

            const offsets = [
                [0,-5],[5,0],[0,5],[-5,0]
            ];

            let svgDots = "";
            let electrons = valence;

            // --- Étape 1 : électrons célibataires (max 4)
            const singles = Math.min(4, electrons);
            for (let i = 0; i < singles; i++) {
                const [x,y] = positions[i];
                svgDots += `<circle cx="${x}" cy="${y}" r="3"/>`;
            }

            electrons -= singles;

            // --- Étape 2 : formation des doublets
            for (let i = 0; i < electrons; i++) {
                const [x,y] = positions[i % 4];
                const [dx,dy] = offsets[i % 4];
                svgDots += `<circle cx="${x+dx}" cy="${y+dy}" r="3"/>`;
            }

            return `
            <svg viewBox="0 0 100 100" width="120">
                <text x="50" y="55" text-anchor="middle" font-size="20">${symbole}</text>
                ${svgDots}
            </svg>`;
        }

        // ===============================
        // 5. Boucle principale + enrichissement
        // ===============================
        data.forEach(el => {

            // --- calcul valence
            let valence = getValence(el.colonne);

            // Limite à 8 électrons (règle de l’octet simplifiée)
            if (valence !== null) {
                valence = Math.min(valence, 8);
            }

            // --- génération Lewis (si possible)
            const lewis = valence !== null
                ? generateLewisAdvanced(el.symbole, valence)
                : "<em>Pas de représentation de Lewis simple</em>";

            // ===============================
            // Création de la case élément
            // ===============================
            const div = document.createElement("div");
            div.className = "element";

            div.innerHTML = `
                <div class="numero">${el.numero}</div>
                <div class="symbole">${el.symbole}</div>
                <div class="masse">${el.masse}</div>
            `;

            // ===============================
            // Affichage du détail au clic
            // ===============================
            div.onclick = () => {
                document.getElementById("info").innerHTML =
                    `<strong>${el.nom}</strong><br>
                     Numéro atomique : ${el.numero}<br>
                     Masse atomique : ${el.masse}<br>
                     Électrons de valence : ${valence ?? "—"}<br><br>
                     <strong>Structure de Lewis :</strong><br>
                     ${lewis}`;
            };

            // ===============================
            // Positionnement dans la grille
            // ===============================
            div.style.gridColumn = el.colonne;
            div.style.gridRow = el.ligne;

            table.appendChild(div);
        });
    });
