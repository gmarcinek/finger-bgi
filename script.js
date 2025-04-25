document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("gripForm");
    const advancedToggle = document.getElementById("advancedToggle");
    const advancedOptions = document.getElementById("advancedOptions");
    
    if (advancedToggle && advancedOptions) {
        advancedToggle.addEventListener("change", () => {
            advancedOptions.style.display = advancedToggle.checked ? "block" : "none";
        });
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Pobranie podstawowych wartości z formularza
        const L_p2 = parseFloat(document.getElementById("L_p2").value);  // długość LP2 (cm)
        const C_joint = parseFloat(document.getElementById("C_joint").value);  // obwód stawu DIP (cm)
        const weight = parseFloat(document.getElementById("weight").value);  // masa ciała (kg)
        
        // Dane dla małego palca (opcjonalne)
        let smallFingerL_p2 = L_p2;
        let smallFingerC_joint = C_joint;
        
        // Jeśli podano osobne dane dla małego palca, użyj ich
        if (document.getElementById("smallFingerL_p2") && document.getElementById("smallFingerC_joint")) {
            smallFingerL_p2 = parseFloat(document.getElementById("smallFingerL_p2").value);
            smallFingerC_joint = parseFloat(document.getElementById("smallFingerC_joint").value);
        }

        // KLUCZOWE WSKAŹNIKI
        // 1. Współczynnik half crimpu dla każdego palca
        const mainFingerRatio = C_joint / L_p2;
        const smallFingerRatio = smallFingerC_joint / smallFingerL_p2;
        
        // 2. Siła pojedynczych palców
        // Zakładamy, że siła palca rośnie z kwadratem obwodu i maleje liniowo z długością
        const mainFingerStrength = (C_joint * C_joint) / L_p2;
        const smallFingerStrength = (smallFingerC_joint * smallFingerC_joint) / smallFingerL_p2;
        
        // 3. Względna siła każdego palca (standaryzacja)
        const fingerStrengthRatio = [0.9, 1.0, 0.9, 0.7]; // wskazujący, środkowy, serdeczny, mały
        
        // 4. Całkowita teoretyczna siła chwytu (obie ręce, 8 palców)
        // Dwie ręce × (wsk + środ + serd + [mały osobno wyliczony lub standardowy])
        let totalBaseStrength;
        
        if (document.getElementById("smallFingerL_p2") && document.getElementById("smallFingerC_joint")) {
            // Jeśli podano dane małego palca, używamy ich do obliczenia jego siły
            const oneHandStrength = (
                mainFingerStrength * fingerStrengthRatio[0] + 
                mainFingerStrength * fingerStrengthRatio[1] + 
                mainFingerStrength * fingerStrengthRatio[2] + 
                smallFingerStrength * fingerStrengthRatio[3]
            );
            totalBaseStrength = oneHandStrength * 2; // obie ręce
        } else {
            // Jeśli nie podano danych małego palca, używamy danych palca środkowego z korektą
            const oneHandStrength = mainFingerStrength * (
                fingerStrengthRatio[0] + 
                fingerStrengthRatio[1] + 
                fingerStrengthRatio[2] + 
                fingerStrengthRatio[3]
            );
            totalBaseStrength = oneHandStrength * 2; // obie ręce
        }
        
        // 5. Współczynniki kalibracyjne dla skalowania wyników do realnych wartości
        // Kalibracja na podstawie rzeczywistych danych (107kg przy LP2=2.4cm, C_joint=6cm)
        const calibrationFactor = 1.1; // Współczynnik kalibracyjny
        const baseStrengthCalibrated = totalBaseStrength * calibrationFactor;
        
        // 6. Uwzględnienie treningu
        // Tylko dwa poziomy: BAZA (bez treningu) i ZAAWANSOWANY
        const baseTrainingFactor = 0.6;  // bazowy poziom (bez treningu)
        const advancedTrainingFactor = 1.5;  // zaawansowany wspinacz (skorygowany empirycznie)
        
        // 7. Obliczenie maksymalnego udźwigu
        const maxBaseWeight = baseStrengthCalibrated * baseTrainingFactor;
        const maxAdvancedWeight = baseStrengthCalibrated * advancedTrainingFactor;
        
        // 8. Stosunek maksymalnego udźwigu do masy ciała
        const baseWeightRatio = maxBaseWeight / weight;
        const advancedWeightRatio = maxAdvancedWeight / weight;
        
        // 9. Interpretacja wyników
        let baseCapability, advancedCapability;
        let baseCapabilityClass, advancedCapabilityClass;
        
        // Interpretacja dla poziomu bazowego
        if (baseWeightRatio < 0.8) {
            baseCapability = "Krytycznie niska - nie utrzyma się";
            baseCapabilityClass = "critical";
        } else if (baseWeightRatio < 1.0) {
            baseCapability = "Bardzo niska - prawdopodobnie nie utrzyma się";
            baseCapabilityClass = "very-low";
        } else if (baseWeightRatio < 1.2) {
            baseCapability = "Niska - może utrzymać się krótko";
            baseCapabilityClass = "low";
        } else if (baseWeightRatio < 1.5) {
            baseCapability = "Przeciętna - powinien utrzymać się";
            baseCapabilityClass = "average";
        } else if (baseWeightRatio < 2.0) {
            baseCapability = "Dobra - pewne utrzymanie";
            baseCapabilityClass = "good";
        } else {
            baseCapability = "Doskonała - bardzo silny chwyt";
            baseCapabilityClass = "excellent";
        }
        
        // Interpretacja dla poziomu zaawansowanego
        if (advancedWeightRatio < 0.8) {
            advancedCapability = "Krytycznie niska - nie utrzyma się";
            advancedCapabilityClass = "critical";
        } else if (advancedWeightRatio < 1.0) {
            advancedCapability = "Bardzo niska - prawdopodobnie nie utrzyma się";
            advancedCapabilityClass = "very-low";
        } else if (advancedWeightRatio < 1.2) {
            advancedCapability = "Niska - może utrzymać się krótko";
            advancedCapabilityClass = "low";
        } else if (advancedWeightRatio < 1.5) {
            advancedCapability = "Przeciętna - powinien utrzymać się";
            advancedCapabilityClass = "average";
        } else if (advancedWeightRatio < 2.0) {
            advancedCapability = "Dobra - pewne utrzymanie";
            advancedCapabilityClass = "good";
        } else {
            advancedCapability = "Doskonała - bardzo silny chwyt";
            advancedCapabilityClass = "excellent";
        }
        
        // 10. Analiza scenariusza redukcji masy ciała
        const minHealthyWeight = Math.max(weight * 0.7, 45); // Min. 70% obecnej wagi, nie mniej niż 45kg
        const advancedWeightRatioAfterLoss = maxAdvancedWeight / minHealthyWeight;
        
        let weightLossAnalysis;
        if (advancedWeightRatio < 1.0 && advancedWeightRatioAfterLoss >= 1.0) {
            weightLossAnalysis = `Redukcja masy ciała do ${minHealthyWeight.toFixed(1)} kg mogłaby pozwolić na utrzymanie się na half crimpie nawet przy zaawansowanym treningu.`;
        } else if (advancedWeightRatio < 1.0 && advancedWeightRatioAfterLoss < 1.0) {
            weightLossAnalysis = `Nawet po maksymalnej bezpiecznej redukcji masy ciała do ${minHealthyWeight.toFixed(1)} kg i zaawansowanym treningu, anatomiczne ograniczenia nadal uniemożliwiają efektywny half crimp.`;
        } else {
            weightLossAnalysis = "Przy zaawansowanym treningu, aktualna masa ciała jest odpowiednia dla Twojej zdolności chwytu.";
        }
        
        // 11. Profil anatomiczny
        const averageHalfCrimpRatio = 2.2; // Przeciętny współczynnik half crimpu
        const percentileFromAverage = (mainFingerRatio / averageHalfCrimpRatio) * 100;
        
        let anatomyProfile;
        if (percentileFromAverage < 70) {
            anatomyProfile = "Anatomia bardzo niekorzystna dla half crimpu (cienkie palce względem długości)";
        } else if (percentileFromAverage < 90) {
            anatomyProfile = "Anatomia nieco niekorzystna dla half crimpu";
        } else if (percentileFromAverage < 110) {
            anatomyProfile = "Anatomia przeciętna dla half crimpu";
        } else if (percentileFromAverage < 130) {
            anatomyProfile = "Anatomia korzystna dla half crimpu";
        } else {
            anatomyProfile = "Anatomia bardzo korzystna dla half crimpu (grube palce względem długości)";
        }

        // Wyświetlanie wyników na stronie
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = `
        <h3>Analiza anatomicznych limitów half crimpu</h3>
        
        <div class="result-section">
            <h4>Kluczowe wskaźniki</h4>
            <p><strong>Współczynnik half crimpu (C_joint/LP2):</strong> ${mainFingerRatio.toFixed(2)}</p>
            <p><strong>Szacowana siła uchwytu (bez treningu):</strong> ${maxBaseWeight.toFixed(1)} kg</p>
            <p><strong>Szacowana siła uchwytu (zaawansowany):</strong> ${maxAdvancedWeight.toFixed(1)} kg</p>
        </div>
        
        <div class="result-section">
            <h4>Interpretacja wyników</h4>
            <p><strong>Zdolność utrzymania (bez treningu):</strong> <span class="capability-${baseCapabilityClass}">${baseCapability}</span></p>
            <p><strong>Zdolność utrzymania (zaawansowany):</strong> <span class="capability-${advancedCapabilityClass}">${advancedCapability}</span></p>
            <p><strong>Profil anatomiczny:</strong> ${anatomyProfile}</p>
        </div>
        
        <div class="result-section highlight-box">
            <h4>Dowód tezy</h4>
            <p>${weightLossAnalysis}</p>
            <p><strong>Teoretyczny limit masy ciała dla half crimpu (bez treningu):</strong> ${(maxBaseWeight).toFixed(1)} kg</p>
            <p><strong>Teoretyczny limit masy ciała dla half crimpu (zaawansowany):</strong> ${(maxAdvancedWeight).toFixed(1)} kg</p>
        </div>
        
        <div class="result-section">
            <h4>Analiza porównawcza</h4>
            <ul>
                <li><strong>Bez treningu:</strong> ${maxBaseWeight.toFixed(1)} kg (${baseWeightRatio.toFixed(2)} × masa ciała)</li>
                <li><strong>Zaawansowany wspinacz:</strong> ${maxAdvancedWeight.toFixed(1)} kg (${advancedWeightRatio.toFixed(2)} × masa ciała)</li>
            </ul>
        </div>
        `;
    });
});