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

    if (valence === null) {
        return "<em>Pas de représentation de Lewis simple</em>";
    }

    // Limite à 8 électrons (octet)
    valence = Math.min(valence, 8);

    // 4 côtés : haut, droite, bas, gauche
    const sides = [
        { x: 50, y: 10 },  // haut
        { x: 90, y: 50 },  // droite
        { x: 50, y: 90 },  // bas
        { x: 10, y: 50 }   // gauche
    ];

    // Décalage pour faire un doublet
    const offset = 5;

    // Tableau des côtés (nombre d’électrons par côté)
    let electronsPerSide = [0, 0, 0, 0];

    let remaining = valence;

    // ===============================
    // 1. Placement des célibataires
    // ===============================
    for (let i = 0; i < 4 && remaining > 0; i++) {
        electronsPerSide[i]++;
        remaining--;
    }

    // ===============================
    // 2. Formation des doublets
    // ===============================
    let i = 0;
    while (remaining > 0) {
        if (electronsPerSide[i] === 1) {
            electronsPerSide[i]++;
            remaining--;
        }
        i = (i + 1) % 4;
    }

    // ===============================
    // 3. Génération SVG
    // ===============================
    let svgDots = "";

    electronsPerSide.forEach((count, i) => {
        const { x, y } = sides[i];

        if (count === 1) {
            // électron seul
            svgDots += `<circle cx="${x}" cy="${y}" r="3"/>`;
        }

        if (count === 2) {
            // doublet → 2 électrons légèrement décalés
            if (i === 0 || i === 2) {
                // haut / bas → horizontal
                svgDots += `<circle cx="${x - offset}" cy="${y}" r="3"/>`;
                svgDots += `<circle cx="${x + offset}" cy="${y}" r="3"/>`;
            } else {
                // gauche / droite → vertical
                svgDots += `<circle cx="${x}" cy="${y - offset}" r="3"/>`;
                svgDots += `<circle cx="${x}" cy="${y + offset}" r="3"/>`;
            }
        }
    });

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
