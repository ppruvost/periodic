// ===============================
        const div = document.createElement("div");
        div.className = "element";

        div.innerHTML = `
            <div class="numero">${el.numero}</div>
            <div class="symbole">${el.symbole}</div>
            <div class="masse">${el.masse} g·mol⁻¹</div>
        `;

        div.style.gridColumn = el.colonne;
        div.style.gridRow = el.ligne;

        div.onclick = () => {

            const shellConfig = formatShellConfiguration(el.numero);
            const spdfConfig = getElectronConfig(el.numero);
            const lewis = generateLewisAdvanced(el.symbole, valence);
            const charges = getIonCharges(el);

            let ionsHTML = "";

            charges.forEach(charge => {
                if (charge === 0) return;

                const ionSymbol = formatIonDisplay(el.symbole, charge);
                const ionType = charge > 0 ? "cation" : "anion";
                const ionClass = charge > 0 ? "cation" : "anion";

                ionsHTML += `
                    <div class="ion-line ${ionClass}">
                        ${ionSymbol}
                        <div class="ion-config">
                            ${ionType}
                        </div>
                    </div>
                `;
            });

            document.getElementById("info").innerHTML = `
                <strong style="font-size:28px;">${el.nom}</strong><br>
                Numéro atomique : ${el.numero}<br>
                Masse atomique : ${el.masse}<br><br>

                <strong>Électrons de valence :</strong> ${valence ?? "—"}<br><br>

                <strong>Structure de Lewis :</strong><br>
                ${lewis}<br><br>

                <div class="config-electronique">
                    <strong>Couches électroniques :</strong>
                    <div class="couches">${shellConfig}</div>
                </div>

                <div class="spdf-config">
                    <strong>Structure électronique :</strong>
                    <div class="spdf-line">${spdfConfig}</div>
                </div>

                <div class="ion-box">
                    <strong>Ions probables :</strong>
                    ${ionsHTML || "—"}
                </div>
            `;
        };

        table.appendChild(div);
    });
});
