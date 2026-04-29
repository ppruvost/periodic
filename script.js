// ===============================
// 1. Chargement du JSON
// ===============================
fetch("elements.json")
    .then(response => response.json())
    .then(data => {

        const table = document.getElementById("table");

        // ===============================
        // 2. Électrons de valence
        // ===============================
        function getValence(colonne, numero) {
            const exceptions = {
                21: 3, 22: 4, 23: 5, 24: 6, 25: 7,
                26: 2, 27: 2, 28: 2, 29: 1, 30: 2
            };

            if (exceptions[numero] !== undefined) return exceptions[numero];

            if (colonne === 1) return 1;
            if (colonne === 2) return 2;
            if (colonne >= 13 && colonne <= 18) return colonne - 10;

            if (colonne >= 3 && colonne <= 12) return Math.min(colonne, 8);

            return null;
        }

        // ===============================
        // 3. Lewis (doublets réels)
        // ===============================
        function generateLewisAdvanced(symbole, valence) {

            if (valence === null) {
                return "<em>Pas de représentation de Lewis simple</em>";
            }

            valence = Math.min(valence, 8);

            const sides = [
                { x: 50, y: 10 },
                { x: 90, y: 50 },
                { x: 50, y: 90 },
                { x: 10, y: 50 }
            ];

            const offset = 5;
            let electronsPerSide = [0, 0, 0, 0];
            let remaining = valence;

            // célibataires
            for (let i = 0; i < 4 && remaining > 0; i++) {
                electronsPerSide[i]++;
                remaining--;
            }

            // doublets
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
                    svgDots += `<circle cx="${x}" cy="${y}" r="3"/>`;
                }

                if (count === 2) {
                    if (idx === 0 || idx === 2) {
                        svgDots += `<circle cx="${x - offset}" cy="${y}" r="3"/>`;
                        svgDots += `<circle cx="${x + offset}" cy="${y}" r="3"/>`;
                    } else {
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
        // 4. Configuration électronique
        // ===============================
        function getElectronConfig(Z) {

            const orbitals = [
                { n: 1, l: "s", max: 2 },
                { n: 2, l: "s", max: 2 },
                { n: 2, l: "p", max: 6 },
                { n: 3, l: "s", max: 2 },
                { n: 3, l: "p", max: 6 },
                { n: 4, l: "s", max: 2 },
                { n: 3, l: "d", max: 10 },
                { n: 4, l: "p", max: 6 },
                { n: 5, l: "s", max: 2 },
                { n: 4, l: "d", max: 10 },
                { n: 5, l: "p", max: 6 },
                { n: 6, l: "s", max: 2 },
                { n: 4, l: "f", max: 14 },
                { n: 5, l: "d", max: 10 },
                { n: 6, l: "p", max: 6 },
                { n: 7, l: "s", max: 2 }
            ];

            let electrons = Z;
            let config = [];

            for (let orb of orbitals) {
                if (electrons <= 0) break;

                const fill = Math.min(orb.max, electrons);
                config.push(`${orb.n}${orb.l}${fill}`);
                electrons -= fill;
            }

            return config.join(" ");
        }

        // exceptions connues
        const exceptionsConfig = {
            24: "1s2 2s2 2p6 3s2 3p6 3d5 4s1",   // Cr
            29: "1s2 2s2 2p6 3s2 3p6 3d10 4s1", // Cu
            41: "1s2 2s2 2p6 3s2 3p6 4d4 5s1",  // Nb
            42: "1s2 2s2 2p6 3s2 3p6 4d5 5s1"   // Mo
        };

        // ===============================
        // GAZ NOBLES (abréviation)
        // ===============================
        const nobleGases = [
            { Z: 2, symbol: "He", config: "1s2" },
            { Z: 10, symbol: "Ne", config: "1s2 2s2 2p6" },
            { Z: 18, symbol: "Ar", config: "1s2 2s2 2p6 3s2 3p6" },
            { Z: 36, symbol: "Kr", config: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6" },
            { Z: 54, symbol: "Xe", config: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6" }
        ];

        // ===============================
        // CONFIG ABRÉGÉE [Gaz noble]
        // ===============================
        function shortenConfig(config) {

            const nobleGases = [
                { Z: 2,  symbol: "He", config: "1s2" },
                { Z: 10, symbol: "Ne", config: "1s2 2s2 2p6" },
                { Z: 18, symbol: "Ar", config: "1s2 2s2 2p6 3s2 3p6" },
                { Z: 36, symbol: "Kr", config: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6" },
                { Z: 54, symbol: "Xe", config: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6" }
            ];

            let best = null;

            // on cherche le plus grand cœur possible
            for (let noble of nobleGases) {
                if (config.startsWith(noble.config)) {
                    best = noble;
                }
            }

            if (!best) return config;

            let rest = config.slice(best.config.length).trim();

            return `[${best.symbol}] ${rest}`;
        }

        // ===============================
        // TRI AFFICHAGE (ordre scolaire)
        // ===============================
        function reorderForDisplay(config) {

            let parts = config.split(" ");

            return parts.sort((a, b) => {

                const ma = a.match(/(\d+)([spdf])/);
                const mb = b.match(/(\d+)([spdf])/);

                const na = parseInt(ma[1]);
                const nb = parseInt(mb[1]);

                const order = { s: 1, p: 2, d: 3, f: 4 };

                // priorité au niveau n
                if (na !== nb) return na - nb;

                // puis type orbital
                return order[ma[2]] - order[mb[2]];
            }).join(" ");
        }

        // ===============================
        // FORMATAGE SPDF (avec exposants)
        // ===============================
        function formatConfig(config) {

            // 1. gaz noble
            let coreMatch = config.match(/^\[(.*?)\]/);

            let core = "";
            let rest = config;

            if (coreMatch) {
                core = coreMatch[0]; // ex [Ar]
                rest = config.replace(core, "").trim();
            }

            // 2. nettoyage : on garde juste les orbitales restantes
            let parts = rest.split(" ").filter(Boolean);

            // 3. IMPORTANT : ne PAS trier (sinon tu casses l’ordre chimique réel)

            // 4. exposants
            let formatted = parts.map(p => {
                return p.replace(/(\d+)([spdf])(\d+)/, (m, n, t, e) => {
                    return `${n}${t}<sup>${e}</sup>`;
                });
            });

            // 5. assemblage propre
            return core ? `${core} ${formatted.join(" ")}` : formatted.join(" ");
        }

        // ===============================
        // 5. Charges ioniques
        // ===============================
        function getIonCharges(el) {

    // ===============================
    // 1. GROUPES PRINCIPAUX
    // ===============================

    if (el.colonne === 1) return [+1];
    if (el.colonne === 2) return [+2];
    if (el.colonne === 13) return [+3]; // B, Al, Ga, In
    if (el.colonne === 14) return [+4]; // C, Si, Ge, Sn
    if (el.colonne === 15) return [-3];
    if (el.colonne === 16) return [-2];
    if (el.colonne === 17) return [-1];

    // ===============================
    // 2. MÉTAUX DE TRANSITION (étendus)
    // ===============================

    const transitionIons = {

        // Bloc Y → Zn (période 4)
        21: [+3],             // Sc
        22: [+4],             // Ti
        23: [+3, +5],         // V
        24: [+2, +3, +6],     // Cr
        25: [+2, +4, +7],     // Mn
        26: [+2, +3],         // Fe
        27: [+2, +3],         // Co
        28: [+2],             // Ni
        29: [+1, +2],         // Cu
        30: [+2],             // Zn

        // Période suivante (ce que tu n'avais pas)
        39: [+3],             // Y
        40: [+4],             // Zr
        41: [+3, +5],         // Nb
        42: [+4, +6],         // Mo
        43: [+4, +7],         // Tc
        44: [+3, +4],         // Ru
        45: [+3],             // Rh
        46: [+2, +4],         // Pd
        47: [+1],             // Ag
        48: [+2]              // Cd
    };

    return transitionIons[el.numero] || [0];
}

        // ===============================
        // 6. Ionisation réelle
        // ===============================
        function ionizeConfig(config, charge) {

            // 1. détecter cœur gaz noble
            let coreMatch = config.match(/^\[(.*?)\]/);

            let core = "";
            let rest = config;

            if (coreMatch) {
                core = coreMatch[0]; // ex [Ar]
                rest = config.replace(core, "").trim();
            }

            // 2. transformer le reste en liste exploitable
            let orbitals = rest
                .split(" ")
                .filter(Boolean)
                .map(o => {
                    let m = o.match(/(\d+)([spdf])(\d+)/);
                    return {
                        n: parseInt(m[1]),
                        type: m[2],
                        e: parseInt(m[3])
                    };
                });

            const order = { s: 1, p: 2, d: 3, f: 4 };

            // ======================
            // CAS CATION (+)
            // ======================
            if (charge > 0) {

                let toRemove = charge;

                while (toRemove > 0) {

                    // on enlève toujours les électrons les plus externes
                    let orbital = orbitals
                        .filter(o => o.e > 0)
                        .sort((a, b) =>
                            (b.n - a.n) || (order[b.type] - order[a.type])
                        )[0];

                    if (!orbital) break;

                    orbital.e--;
                    toRemove--;
                }
            }

            // ======================
            // CAS ANION (-)
            // ======================
            if (charge < 0) {

                let toAdd = Math.abs(charge);

                while (toAdd > 0) {

                    // on remplit la couche externe disponible
                    let orbital = orbitals
                        .filter(o => o.e < (o.type === "s" ? 2 : o.type === "p" ? 6 : o.type === "d" ? 10 : 14))
                        .sort((a, b) =>
                            (a.n - b.n) || (order[a.type] - order[b.type])
                        )[0];

                    if (!orbital) break;

                    orbital.e++;
                    toAdd--;
                }
            }

            // 3. reconstruction propre
            let result = orbitals
                .filter(o => o.e > 0)
                .map(o => `${o.n}${o.type}${o.e}`)
                .join(" ");

            // 4. si tout est vidé → ion noble
            if (!result) return core;

            return `${core} ${result}`.trim();
        }

        // ===============================
        // 7. Boucle principale
        // ===============================
        data.forEach(el => {

            let valence = getValence(el.colonne, el.numero);
            if (valence !== null) valence = Math.min(valence, 8);

            const div = document.createElement("div");
            div.className = "element";

            div.innerHTML = `
                <div class="numero">${el.numero}</div>
                <div class="symbole">${el.symbole}</div>
                <div class="masse">${el.masse}</div>
            `;

            div.onclick = () => {

                const charges = getIonCharges(el);
                const baseConfig = exceptionsConfig[el.numero] || getElectronConfig(el.numero);

                let ionsHTML = "";

                charges.forEach(charge => {

                    if (charge === 0) return;

                    let ionConfig;

                    if (charge > 0) {
                        // cation → enlever électrons
                        ionConfig = ionizeConfig(baseConfig, charge);
                    } else {
                        // anion → recalcul complet avec électrons en plus
                        const newZ = el.numero + Math.abs(charge);
                        ionConfig = getElectronConfig(newZ);
                    }

                    ionsHTML += `
                    ${el.symbole}${charge > 0 ? "+" + charge : charge} :<br>
                    → ${formatConfig(ionConfig)}<br><br>`;
                });

                const lewis = generateLewisAdvanced(el.symbole, valence);

                document.getElementById("info").innerHTML =
                    `<strong>${el.nom}</strong><br>
                     Numéro atomique : ${el.numero}<br>
                     Masse atomique : ${el.masse}<br><br>

                     <strong>Configuration électronique :</strong><br>
                     ${formatConfig(baseConfig)}<br><br>

                     <strong>Électrons de valence :</strong> ${valence ?? "—"}<br><br>

                     <strong>Structure de Lewis :</strong><br>
                     ${lewis}<br><br>

                     <strong>Ions possibles :</strong><br>
                     ${ionsHTML || "—"}`;
            };

            div.style.gridColumn = el.colonne;
            div.style.gridRow = el.ligne;

            table.appendChild(div);
        });
    });
