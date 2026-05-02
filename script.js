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
        function getValence(colonne, numero, config = "") {

        // éléments des groupes principaux
        const exceptions = {
            21: 3, 22: 4, 23: 5, 24: 6, 25: 7,
            26: 8, 27: 9, 28: 10, 29: 11, 30: 12
        };

        if (exceptions[numero] !== undefined) {
            return null; // on traitera autrement
        }

        if (colonne === 1) return 1;
        if (colonne === 2) return 2;
        if (colonne >= 13 && colonne <= 18) return colonne - 10;

        return null;
    }
        function getValenceTransition(config, numero) {

            // Cas particuliers importants
            const exceptions = {
                24: 1, // Cr : [Ar] 3d5 4s1
                29: 1, // Cu : [Ar] 3d10 4s1
                41: 1, // Nb
                42: 1,  // Mo
                57: 3 // La
            };

            if (exceptions[numero] !== undefined) {
        return exceptions[numero];
            }

            // On prend surtout les électrons ns externes
            const matchS = config.match(/([4-7])s(\d)/);

            if (matchS) {
        return parseInt(matchS[2]);
            }

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
            42: "1s2 2s2 2p6 3s2 3p6 4d5 5s1",   // Mo
            57: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 5d1 6s2", // La
        };

        // ===============================
        // GAZ NOBLES (abréviation)
        // ===============================
        const nobleGases = [
            { Z: 2, symbol: "He", config: "1s2" },
            { Z: 10, symbol: "Ne", config: "1s2 2s2 2p6" },
            { Z: 18, symbol: "Ar", config: "1s2 2s2 2p6 3s2 3p6" },
            { Z: 36, symbol: "Kr", config: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6" },
            { Z: 54, symbol: "Xe", config: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6" },
            { Z: 86, symbol: "Rn", config: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6" }
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
                { Z: 54, symbol: "Xe", config: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6" },
                { Z: 86, symbol: "Rn", config: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6" }
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

            // ===============================
            // 1. Détection gaz noble
            // ===============================

            let coreMatch = config.match(/^\[(.*?)\]/);

            let core = "";
            let rest = config;

            if (coreMatch) {
                core = coreMatch[0];
                rest = config.replace(core, "").trim();
            }

            // ===============================
            // 2. Séparation orbitales
            // ===============================

            let parts = rest
                .split(" ")
                .filter(Boolean);

            // ===============================
            // 3. TRI AFFICHAGE SCOLAIRE
            // ex : 3d avant 4s
            // ===============================

            parts.sort((a, b) => {

                const ma = a.match(/(\d+)([spdf])/);
                const mb = b.match(/(\d+)([spdf])/);

                if (!ma || !mb) return 0;

                const na = parseInt(ma[1]);
                const nb = parseInt(mb[1]);

                const order = {
                    s: 1,
                    p: 2,
                    d: 3,
                    f: 4
                };

                // règle spéciale :
                // 3d avant 4s
                if (a.startsWith("3d") && b.startsWith("4s")) return -1;
                if (a.startsWith("4s") && b.startsWith("3d")) return 1;

                if (a.startsWith("4d") && b.startsWith("5s")) return -1;
                if (a.startsWith("5s") && b.startsWith("4d")) return 1;

                if (a.startsWith("4f") && b.startsWith("6s")) return -1;
                if (a.startsWith("6s") && b.startsWith("4f")) return 1;

                if (a.startsWith("5d") && b.startsWith("6s")) return -1;
                if (a.startsWith("6s") && b.startsWith("5d")) return 1;

                // sinon tri normal
                if (na !== nb) return na - nb;

                return order[ma[2]] - order[mb[2]];
            });

            // ===============================
            // 4. Exposants HTML
            // ===============================

            let formatted = parts.map(p => {
                return p.replace(
                    /(\d+)([spdf])(\d+)/,
                    (m, n, t, e) => `${n}${t}<sup>${e}</sup>`
                );
            });

            // ===============================
            // 5. Retour final
            // ===============================

            return core
                ? `${core} ${formatted.join(" ")}`
                : formatted.join(" ");
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
        // Famille chimique
        // ===============================
        function getChemicalFamily(el) {

            if (el.colonne === 1) return "Alcalin";
            if (el.colonne === 2) return "Alcalino-terreux";
            if (el.colonne === 17) return "Halogène";
            if (el.colonne === 18) return "Gaz noble";

            if ([6,7,8,15,16].includes(el.numero)) {
                return "Non-métal";
            }

            if (el.colonne >= 3 && el.colonne <= 12) {
                return "Métal de transition";
            }

            if ([13,26,29,30,47,79,82].includes(el.numero)) {
                return "Métal";
            }

            return "Métal";
        }

        // ===============================
        // Tendance RedOx
        // ===============================
        function getRedoxTendency(el) {

            if ([8,17].includes(el.numero)) {
                return "gagne des électrons → oxydant";
            }

            if ([1,15,16].includes(el.numero)) {
                return "peut gagner des électrons";
            }

            if (
                [3,11,19,4,12,20,13,26,29,30].includes(el.numero)
            ) {
                return "perd des électrons → réducteur";
            }

            return "variable";
        }

        // ===============================
        // Couples RedOx Bac Pro
        // ===============================
        function getRedoxCouples(el) {

            const couples = {
                26: "Fe²⁺ / Fe ; Fe³⁺ / Fe²⁺",
                29: "Cu²⁺ / Cu",
                30: "Zn²⁺ / Zn",
                13: "Al³⁺ / Al",
                8:  "O₂ / H₂O",
                17: "Cl₂ / Cl⁻",
                1:  "H⁺ / H₂"
            };

            return couples[el.numero] || "—";
        }

        // ===============================
        // Couleur fond Lewis
        // ===============================
        function getLewisBackground(el) {

            if ([8].includes(el.numero)) return "#FFE5E5"; // rouge pâle
            if ([17].includes(el.numero)) return "#E8FFE8"; // vert pâle
            if ([26,29,30,13].includes(el.numero)) return "#FFF1E0"; // orange pâle
            if ([18,2,10].includes(el.numero)) return "#EAFBFF"; // noble
            if ([1].includes(el.numero)) return "#E8F4FF"; // H

            return "#FFFFFF";
        }

        // ===============================
        // 6. Ionisation réelle
        // ===============================
        function ionizeConfig(config, charge) {

    // sécurité : si config complète → on abrège d'abord
    config = shortenConfig(config);

    let coreMatch = config.match(/^\[(.*?)\]/);

    let core = "";
    let rest = config;

    if (coreMatch) {
        core = coreMatch[0];
        rest = config.replace(core, "").trim();
    }

    let orbitals = rest
        .split(" ")
        .filter(Boolean)
        .map(o => {
            let m = o.match(/(\d+)([spdf])(\d+)/);

            if (!m) return null;

            return {
                n: parseInt(m[1]),
                type: m[2],
                e: parseInt(m[3]),
                max:
                    m[2] === "s" ? 2 :
                    m[2] === "p" ? 6 :
                    m[2] === "d" ? 10 : 14
            };
        })
        .filter(Boolean);

    const order = { s: 1, p: 2, d: 3, f: 4 };

    // =====================
    // CATION
    // =====================
    if (charge > 0) {

        let toRemove = charge;

        while (toRemove > 0) {

            // règle réelle :
            // on enlève d'abord ns avant (n-1)d

            let orbital = orbitals
                .filter(o => o.e > 0)
                .sort((a, b) => {

                    // priorité aux orbitales s externes
                    if (a.type === "s" && b.type !== "s" && a.n >= b.n) return -1;
                    if (b.type === "s" && a.type !== "s" && b.n >= a.n) return 1;

                    return (b.n - a.n) || (order[b.type] - order[a.type]);
                })[0];

            if (!orbital) break;

            orbital.e--;
            toRemove--;
        }
    }

    // =====================
    // ANION
    // =====================
    if (charge < 0) {

        let toAdd = Math.abs(charge);

        while (toAdd > 0) {

            let orbital = orbitals
                .filter(o => o.e < o.max)
                .sort((a, b) =>
                    (a.n - b.n) || (order[a.type] - order[b.type])
                )[0];

            if (!orbital) break;

            orbital.e++;
            toAdd--;
        }
    }

    let result = orbitals
        .filter(o => o.e > 0)
        .sort((a, b) => {

            if (a.n !== b.n) return a.n - b.n;
            return order[a.type] - order[b.type];
        })
        .map(o => `${o.n}${o.type}${o.e}`)
        .join(" ");

    if (!result) return core;

    return `${core} ${result}`.trim();
}

// ===============================
// 7. Boucle principale (CORRIGÉE)
// ===============================
data.forEach(el => {

    let valence;

    if (el.colonne >= 3 && el.colonne <= 12) {
        const fullConfig = exceptionsConfig[el.numero] || getElectronConfig(el.numero);
        valence = getValenceTransition(fullConfig, el.numero);
    } else {
        valence = getValence(el.colonne, el.numero);
    }

    if (valence !== null) {
        valence = Math.min(valence, 8);
    }

    // ===============================
// Couleurs Bac Pro (programme)
// ===============================

    const bacProColors = {

        // Non-métaux importants
        1:  "#E8F4FF", // H
        6:  "#909090", // C
        7:  "#3050F8", // N
        8:  "#FF0D0D", // O
        15: "#FF8000", // P
        16: "#FFFF30", // S
        17: "#1FF01F", // Cl

        // Gaz nobles
        2:  "#D9FFFF", // He
        10: "#D9FFFF", // Ne
        18: "#D9FFFF", // Ar

        // Alcalins / alcalino-terreux
        3:  "#CC80FF", // Li
        11: "#CC80FF", // Na
        19: "#CC80FF", // K

        4:  "#C2FF00", // Be
        12: "#C2FF00", // Mg
        20: "#C2FF00", // Ca

        // Métaux courants
        13: "#BFA6A6", // Al
        14: "#F0C8A0", // Si
        26: "#E06633", // Fe
        29: "#C88033", // Cu
        30: "#7D80B0", // Zn
        47: "#C0C0C0", // Ag
        79: "#FFD123", // Au
        82: "#575961"  // Pb
    };

    const div = document.createElement("div");
    div.className = "element";

    if (bacProColors[el.numero]) {
        div.style.backgroundColor = bacProColors[el.numero];
    }

    div.innerHTML = `
        <div class="numero">${el.numero}</div>
        <div class="symbole">${el.symbole}</div>
        <div class="masse">${el.masse}</div>
    `;

    // ===============================
    // Placement dans le tableau
    // ===============================
let col = Number(el.colonne);
let row = Number(el.ligne);

// ===============================
// Exceptions actinides
// ===============================

    // Actinium
    if (el.numero === 89) {
        col = 3;
        row = 7;
    }

    // Thorium → Lawrencium
    if (el.numero >= 90 && el.numero <= 103) {
        col = col - 1;   // on décale d'une colonne vers la gauche
    }

    div.style.gridColumn = col;
    div.style.gridRow = row;

    // ===============================
    // Clic sur un élément
    // ===============================
    div.onclick = () => {

        const charges = getIonCharges(el);

        // ===============================
        // Type d’ions possibles
        // ===============================

        let hasCation = charges.some(c => c > 0);
        let hasAnion = charges.some(c => c < 0);

        let ionType = "";

        if (hasCation && hasAnion) {
            ionType = "anion, cation";
        }
        else if (hasCation) {
            ionType = "cation";
        }
        else if (hasAnion) {
            ionType = "anion";
        }
        else {
            ionType = "—";
        }

        const fullConfig =
            exceptionsConfig[el.numero] || getElectronConfig(el.numero);

        const baseConfig = shortenConfig(fullConfig);

        let ionsHTML = "";

        charges.forEach(charge => {

            if (charge === 0) return;

            let ionConfig;

            // ---------------------------
            // CATION
            // ---------------------------
            if (charge > 0) {
                ionConfig = ionizeConfig(baseConfig, charge);
            }

            // ---------------------------
            // ANION
            // ---------------------------
            else {
                const newZ = el.numero + Math.abs(charge);
                const fullAnionConfig = getElectronConfig(newZ);
                ionConfig = shortenConfig(fullAnionConfig);
            }

            let chargeDisplay = "";

            if (charge > 0) {
                // cations : Fe²⁺, Cr³⁺
                chargeDisplay = `<sup>${charge === 1 ? "" : charge}+</sup>`;
            } else {
                // anions : Cl⁻, O²⁻
                const absCharge = Math.abs(charge);
                chargeDisplay = `<sup>${absCharge === 1 ? "" : absCharge}−</sup>`;
            }

ionsHTML += `
    ${el.symbole}${chargeDisplay} :<br>
    → ${formatConfig(ionConfig)}<br><br>
`;
        });

        const lewis = `
        <div style="
            background:${getLewisBackground(el)};
            padding:10px;
            border-radius:8px;
            display:inline-block;
        ">
            ${generateLewisAdvanced(el.symbole, valence)}
        </div>
        `;

        const family = getChemicalFamily(el);
        const tendency = getRedoxTendency(el);
        const redoxCouples = getRedoxCouples(el);

        document.getElementById("info").innerHTML = `
            <strong>${el.nom}</strong><br>
            Numéro atomique : ${el.numero}<br>
            Masse atomique : ${el.masse}<br><br>

            <strong>Configuration électronique :</strong><br>
            ${formatConfig(baseConfig)}<br><br>

            <strong>Électrons de valence :</strong>
            ${valence ?? "—"}<br><br>

            <strong>Structure de Lewis :</strong><br>
            ${lewis}<br><br>

            <strong>Ions possibles :</strong> ${ionType}<br><br>
            ${ionsHTML || "—"}
        `;
    };

    // ===============================
    // Ajout dans le tableau
    // ===============================
    table.appendChild(div);

    });
});
