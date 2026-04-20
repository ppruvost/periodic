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
        function getValence(colonne, numero) {
            const exceptions = {
                21: 3,  22: 4,  23: 5,  24: 6,  25: 7,  26: 2,  27: 2,  28: 2,  29: 1,
                30: 2,  40: 2,  41: 3,  42: 6,  43: 7,  44: 8,  45: 9,  46: 1,  47: 1,  48: 2
            };
            if (exceptions[numero] !== undefined) return exceptions[numero];
            if (colonne === 1) return 1;
            if (colonne === 2) return 2;
            if (colonne >= 13 && colonne <= 18) return colonne - 10;
            if (colonne >= 3 && colonne <= 12) return Math.min(colonne, 8);
            return null;
        }

        // ===============================
        // 3. Génération SVG (doublets + célibataires)
        // ===============================
        function generateLewisAdvanced(symbole, valence) {
            if (valence === null) {
                return "<em>Pas de représentation de Lewis simple</em>";
            }

            valence = Math.min(valence, 8);

            const sides = [
                { x: 50, y: 10 },  // haut
                { x: 90, y: 50 },  // droite
                { x: 50, y: 90 },  // bas
                { x: 10, y: 50 }   // gauche
            ];

            const offset = 5;
            let electronsPerSide = [0, 0, 0, 0];
            let remaining = valence;

            // Placement des célibataires
            for (let i = 0; i < 4 && remaining > 0; i++) {
                electronsPerSide[i]++;
                remaining--;
            }

            // Formation des doublets
            let i = 0;
            while (remaining > 0) {
                if (electronsPerSide[i] === 1) {
                    electronsPerSide[i]++;
                    remaining--;
                }
                i = (i + 1) % 4;
            }

            let svgDots = "";
            electronsPerSide.forEach((count, idx) => {
                const { x, y } = sides[idx];
                if (count === 1) {
                    svgDots += `<circle cx="${x}" cy="${y}" r="3" fill="black"/>`;
                }
                if (count === 2) {
                    if (idx === 0 || idx === 2) {
                        svgDots += `<circle cx="${x - offset}" cy="${y}" r="3" fill="black"/>`;
                        svgDots += `<circle cx="${x + offset}" cy="${y}" r="3" fill="black"/>`;
                    } else {
                        svgDots += `<circle cx="${x}" cy="${y - offset}" r="3" fill="black"/>`;
                        svgDots += `<circle cx="${x}" cy="${y + offset}" r="3" fill="black"/>`;
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
        // 4. Génération SVG (couches concentriques)
        // ===============================
        function generateLewisConcentric(symbole, valence) {
            if (valence === null) {
                return "<em>Pas de représentation de Lewis simple</em>";
            }

            valence = Math.min(valence, 8);
            const radii = [15, 25, 25, 35, 35, 35, 45, 45];
            let svgDots = "";

            for (let i = 0; i < valence; i++) {
                const angle = (i * 45) * (Math.PI / 180);
                const radius = radii[i];
                const x = 50 + radius * Math.cos(angle);
                const y = 50 + radius * Math.sin(angle);
                svgDots += `<circle cx="${x}" cy="${y}" r="3" fill="black"/>`;
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
            let valence = getValence(el.colonne, el.numero);
            if (valence !== null) {
                valence = Math.min(valence, 8);
            }

            const div = document.createElement("div");
            div.className = "element";

            div.innerHTML = `
                <div class="numero">${el.numero}</div>
                <div class="symbole">${el.symbole}</div>
                <div class="masse">${el.masse}</div>
            `;

            div.onclick = () => {
                const lewisDoublets = generateLewisAdvanced(el.symbole, valence);
                const lewisConcentric = generateLewisConcentric(el.symbole, valence);

                document.getElementById("info").innerHTML =
                    `<strong>${el.nom}</strong><br>
                     Numéro atomique : ${el.numero}<br>
                     Masse atomique : ${el.masse}<br>
                     Électrons de valence : ${valence ?? "—"}<br><br>
                     <strong>Structure de Lewis (doublets) :</strong><br>
                     ${lewisDoublets}<br><br>
                     <strong>Structure de Lewis (couches) :</strong><br>
                     ${lewisConcentric}`;
            };

            div.style.gridColumn = el.colonne;
            div.style.gridRow = el.ligne;

            table.appendChild(div);
        });
    });
