// Skrypt do aktualizacji wyświetlanych wartości suwaków
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("gripForm");
    const advancedToggle = document.getElementById("advancedToggle");
    const advancedOptions = document.getElementById("advancedOptions");

    // Obsługa przełącznika zaawansowanych opcji
    if (advancedToggle && advancedOptions) {
        advancedToggle.addEventListener("change", () => {
            advancedOptions.style.display = advancedToggle.checked ? "block" : "none";
        });
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Pobranie podstawowych wartości z formularza
        const L_p2 = parseFloat(document.getElementById("L_p2").value);  // długość LP2 (cm)
        const L_p3 = parseFloat(document.getElementById("L_p3").value);  // długość LP3 (cm)
        const C_joint = parseFloat(document.getElementById("C_joint").value);  // obwód stawu DIP (cm)
        const weight = parseFloat(document.getElementById("weight").value);  // masa ciała (kg)

        // Pobranie zaawansowanych opcji (jeśli dostępne)
        let pipAngle = 90; // Domyślny kąt zgięcia PIP (stopnie)
        let dipAngle = 0;  // Domyślny kąt zgięcia DIP (stopnie)
        let trainingLevel = 1; // Domyślny poziom wytrenowania (1-5)

        // Sprawdzenie czy zaawansowane opcje są dostępne i pobieranie ich wartości
        if (document.getElementById("pipAngle")) {
            pipAngle = parseFloat(document.getElementById("pipAngle").value);
        }
        if (document.getElementById("dipAngle")) {
            dipAngle = parseFloat(document.getElementById("dipAngle").value);
        }
        if (document.getElementById("trainingLevel")) {
            trainingLevel = parseFloat(document.getElementById("trainingLevel").value);
        }

        // Obliczenia podstawowe
        const L_lever = L_p2 + L_p3; // Całkowita długość dźwigni (cm)
        const BGI = (L_lever ** 2) / C_joint; // Biomechanical Grip Index

        // Obliczenie średnicy stawu na podstawie obwodu (zakładając kształt okręgu)
        const jointDiameter = C_joint / Math.PI;

        // Obliczenie przybliżonej powierzchni przekroju ścięgna (mm²)
        // Zakładamy, że powierzchnia przekroju ścięgna jest proporcjonalna do kwadratu średnicy stawu
        const tendonArea = Math.PI * ((jointDiameter * 2.5) ** 2); // Współczynnik 2.5 to przybliżenie

        // Konwersja kątów na radiany
        const pipRadians = pipAngle * Math.PI / 180;
        const dipRadians = dipAngle * Math.PI / 180;

        // Obliczenie efektywnej długości dźwigni uwzględniając kąty zgięcia
        // W half crimpie, PIP jest zgięty ~90°, a DIP może być lekko zgięty lub wyprostowany
        const effectiveL_p2 = L_p2 * Math.sin(pipRadians);
        const effectiveL_p3 = L_p3 * Math.sin(dipRadians);
        const effectiveLever = effectiveL_p2 + effectiveL_p3;

        // Obliczenie momentu siły działającego na staw PIP (Nm)
        // Zakładamy, że siła ciężkości działa na końcu palca
        const forceNewtons = weight * 9.81; // Konwersja kg na N
        const leverMeters = L_lever / 100; // Konwersja cm na m
        const moment = forceNewtons * leverMeters;

        // Obliczenie naprężenia w ścięgnie (MPa)
        // Zakładamy, że siła w ścięgnie jest proporcjonalna do momentu siły
        // i odwrotnie proporcjonalna do efektywnego ramienia dźwigni
        const tendonForce = moment / (effectiveLever / 100); // N
        const tendonStress = tendonForce / tendonArea; // N/mm² = MPa

        // Obliczenie współczynnika siły w oparciu o mechanikę dźwigni
        // Współczynnik k jest odwrotnie proporcjonalny do długości dźwigni
        // i proporcjonalny do obwodu stawu (który wpływa na przekrój ścięgna)
        const k = C_joint / L_lever;

        // Współczynniki dla różnych poziomów wytrenowania
        // Wartości bazują na literaturze dotyczącej siły chwytu wspinaczy
        const trainingFactors = {
            untrained: 0.6,  // Osoba nietrenująca
            beginner: 0.9,   // Początkujący wspinacz (< 1 rok)
            intermediate: 1.2, // Średnio zaawansowany (1-3 lata)
            advanced: 1.6,   // Zaawansowany (3-5 lat)
            elite: 2.0       // Elitarny wspinacz (> 5 lat)
        };

        // Wybór współczynnika treningu na podstawie poziomu treningowego
        let trainingFactor;
        if (trainingLevel <= 1) trainingFactor = trainingFactors.untrained;
        else if (trainingLevel <= 2) trainingFactor = trainingFactors.beginner;
        else if (trainingLevel <= 3) trainingFactor = trainingFactors.intermediate;
        else if (trainingLevel <= 4) trainingFactor = trainingFactors.advanced;
        else trainingFactor = trainingFactors.elite;

        // Obliczenie maksymalnej siły chwytu w kg
        // Zakładamy, że maksymalna siła jest proporcjonalna do wagi ciała, 
        // współczynnika k i poziomu wytrenowania
        const maxGripForce = weight * k * trainingFactor;

        // Obliczenie obciążenia stawów PIP i DIP
        const pipJointLoad = tendonForce * 0.85; // 85% siły ścięgna
        const dipJointLoad = tendonForce * 0.65; // 65% siły ścięgna

        // Obliczenie ryzyka kontuzji
        // Ryzyko rośnie wraz ze wzrostem naprężenia w ścięgnie i maleje z treningiem
        const injuryRiskFactor = tendonStress / (trainingFactor * 10);
        let injuryRisk;

        if (injuryRiskFactor < 0.5) injuryRisk = "Niskie";
        else if (injuryRiskFactor < 1.0) injuryRisk = "Umiarkowane";
        else if (injuryRiskFactor < 1.5) injuryRisk = "Podwyższone";
        else injuryRisk = "Wysokie";

        // Wyświetlanie wyników na stronie
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = `
<h3>Wyniki analizy half crimpu</h3>

<div class="result-section">
<h4>Podstawowe parametry</h4>
<p><strong>BGI (Biomechanical Grip Index):</strong> ${BGI.toFixed(2)}</p>
<p><strong>Współczynnik siły (k):</strong> ${k.toFixed(4)}</p>
<p><strong>Całkowita długość dźwigni:</strong> ${L_lever.toFixed(1)} cm</p>
<p><strong>Efektywna długość dźwigni:</strong> ${effectiveLever.toFixed(1)} cm</p>
</div>

<div class="result-section">
<h4>Parametry biomechaniczne</h4>
<p><strong>Przybliżona powierzchnia przekroju ścięgna:</strong> ${tendonArea.toFixed(1)} mm²</p>
<p><strong>Moment siły działający na palce:</strong> ${moment.toFixed(1)} Nm</p>
<p><strong>Siła działająca na ścięgno:</strong> ${tendonForce.toFixed(1)} N</p>
<p><strong>Naprężenie w ścięgnie:</strong> ${tendonStress.toFixed(1)} MPa</p>
</div>

<div class="result-section">
<h4>Obciążenie stawów</h4>
<p><strong>Obciążenie stawu PIP:</strong> ${pipJointLoad.toFixed(1)} N</p>
<p><strong>Obciążenie stawu DIP:</strong> ${dipJointLoad.toFixed(1)} N</p>
</div>

<div class="result-section">
<h4>Szacowana maksymalna siła chwytu (halfcrimp)</h4>
<p><strong>Przy obecnym poziomie treningu:</strong> ${maxGripForce.toFixed(1)} kg</p>
<p><strong>Szacowane ryzyko kontuzji:</strong> <span class="risk-${injuryRisk.toLowerCase()}">${injuryRisk}</span></p>
</div>

<div class="result-section">
<h4>Porównanie z różnymi poziomami treningowymi</h4>
<ul>
  <li><strong>Nietrenujący:</strong> ${(weight * k * trainingFactors.untrained).toFixed(1)} kg</li>
  <li><strong>Początkujący:</strong> ${(weight * k * trainingFactors.beginner).toFixed(1)} kg</li>
  <li><strong>Średniozaawansowany:</strong> ${(weight * k * trainingFactors.intermediate).toFixed(1)} kg</li>
  <li><strong>Zaawansowany:</strong> ${(weight * k * trainingFactors.advanced).toFixed(1)} kg</li>
  <li><strong>Elitarny:</strong> ${(weight * k * trainingFactors.elite).toFixed(1)} kg</li>
</ul>
</div>
`;
    });
});