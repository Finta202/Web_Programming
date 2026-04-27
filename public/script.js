let sviFilmovi = [];
let kosarica = [];

fetch("movies.csv")
    .then(res => res.text())
    .then(csv => {
        const rezultat = Papa.parse(csv, {
            header: true,
            skipEmptyLines: true
        });

        sviFilmovi = rezultat.data.map(film => ({
            naslov: film.Naslov || "Nepoznato",
            zanr: film.Zanr || "Nepoznato",
            godina: Number(film.Godina) || 0,
            trajanje: Number(film.Trajanje_min) || 0,
            ocjena: Number(film.Ocjena) || 0,
            zemlja: film.Zemlja_porijekla || "Nepoznato"
        }));

        popuniZanrove();
        prikaziTablicu(sviFilmovi);
    })
    .catch(err => {
        console.error("Greška pri dohvaćanju CSV datoteke:", err);
    });

function prikaziTablicu(filmovi) {
    const tbody = document.querySelector("#filmovi-tablica tbody");
    tbody.innerHTML = "";

    if (filmovi.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">Nema filmova za odabrane filtere.</td>
            </tr>
        `;
        return;
    }

    filmovi.forEach(film => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${film.naslov}</td>
            <td>${film.zanr}</td>
            <td>${film.godina}</td>
            <td>${film.trajanje} min</td>
            <td>${film.zemlja}</td>
            <td>${film.ocjena}</td>
            <td><button class="dodaj-btn">Dodaj</button></td>
        `;

        row.querySelector(".dodaj-btn").addEventListener("click", function () {
            dodajUKosaricu(film);
        });

        tbody.appendChild(row);
    });
}

function popuniZanrove() {
    const select = document.getElementById("filter-zanr");
    const zanrovi = new Set();

    sviFilmovi.forEach(film => {
        film.zanr.split(",").forEach(z => {
            zanrovi.add(z.trim());
        });
    });

    Array.from(zanrovi).sort().forEach(zanr => {
        const option = document.createElement("option");
        option.value = zanr.toLowerCase();
        option.textContent = zanr;
        select.appendChild(option);
    });
}

function filtrirajFilmove() {
    const naslov = document.getElementById("filter-naslov").value.toLowerCase();
    const zanr = document.getElementById("filter-zanr").value.toLowerCase();
    const godinaOd = Number(document.getElementById("filter-godina-od").value);
    const godinaDo = Number(document.getElementById("filter-godina-do").value);
    const trajanje = document.querySelector('input[name="filter-trajanje"]:checked').value;
    const minimalnaOcjena = Number(document.getElementById("filter-ocjena").value);

    const filtrirani = sviFilmovi.filter(film => {
        const naslovMatch = film.naslov.toLowerCase().includes(naslov);
        const zanrMatch = zanr === "" || film.zanr.toLowerCase().includes(zanr);
        const godinaOdMatch = !godinaOd || film.godina >= godinaOd;
        const godinaDoMatch = !godinaDo || film.godina <= godinaDo;
        const ocjenaMatch = film.ocjena >= minimalnaOcjena;

        let trajanjeMatch = true;

        if (trajanje === "kratki") {
            trajanjeMatch = film.trajanje < 90;
        } else if (trajanje === "srednji") {
            trajanjeMatch = film.trajanje >= 90 && film.trajanje <= 120;
        } else if (trajanje === "dugi") {
            trajanjeMatch = film.trajanje > 120;
        }

        return naslovMatch &&
               zanrMatch &&
               godinaOdMatch &&
               godinaDoMatch &&
               trajanjeMatch &&
               ocjenaMatch;
    });

    prikaziTablicu(filtrirani);
}

document.getElementById("filter-naslov").addEventListener("input", filtrirajFilmove);
document.getElementById("filter-zanr").addEventListener("change", filtrirajFilmove);
document.getElementById("filter-godina-od").addEventListener("input", filtrirajFilmove);
document.getElementById("filter-godina-do").addEventListener("input", filtrirajFilmove);
document.getElementById("filter-ocjena").addEventListener("change", filtrirajFilmove);

document.querySelectorAll('input[name="filter-trajanje"]').forEach(radio => {
    radio.addEventListener("change", filtrirajFilmove);
});

document.getElementById("reset-filtera").addEventListener("click", function () {
    document.getElementById("filter-naslov").value = "";
    document.getElementById("filter-zanr").value = "";
    document.getElementById("filter-godina-od").value = "";
    document.getElementById("filter-godina-do").value = "";
    document.getElementById("filter-ocjena").value = "0";
    document.querySelector('input[name="filter-trajanje"][value=""]').checked = true;

    prikaziTablicu(sviFilmovi);
});

function dodajUKosaricu(film) {
    const vecPostoji = kosarica.some(item => item.naslov === film.naslov);

    if (vecPostoji) {
        document.getElementById("poruka-kosarice").textContent = "Film je već u košarici.";
        return;
    }

    kosarica.push(film);
    osvjeziKosaricu();
    document.getElementById("poruka-kosarice").textContent = "";
}

function osvjeziKosaricu() {
    const lista = document.getElementById("lista-kosarice");
    lista.innerHTML = "";

    if (kosarica.length === 0) {
        lista.innerHTML = "<li>Košarica je prazna.</li>";
        return;
    }

    kosarica.forEach((film, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <span>${film.naslov} (${film.godina})</span>
            <button class="ukloni-btn">Ukloni</button>
        `;

        li.querySelector(".ukloni-btn").addEventListener("click", function () {
            ukloniIzKosarice(index);
        });

        lista.appendChild(li);
    });
}

function ukloniIzKosarice(index) {
    kosarica.splice(index, 1);
    osvjeziKosaricu();
}

document.getElementById("potvrdi-kosaricu").addEventListener("click", function () {
    const poruka = document.getElementById("poruka-kosarice");

    if (kosarica.length === 0) {
        poruka.textContent = "Košarica je prazna.";
        return;
    }

    poruka.textContent = `Uspješno ste dodali ${kosarica.length} filmova u svoju košaricu za vikend maraton!`;

    kosarica = [];
    osvjeziKosaricu();
});