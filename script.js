document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("gripForm");
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      // Pobranie wartości z formularza
      const L_p1 = parseFloat(document.getElementById("L_p1").value);
      const L_p2 = parseFloat(document.getElementById("L_p2").value);
      const L_p3 = parseFloat(document.getElementById("L_p3").value);
      const C_joint = parseFloat(document.getElementById("C_joint").value);
      const weight = parseFloat(document.getElementById("weight").value);
  
      // Obliczanie całkowitej długości palca (sumowanie długości poszczególnych paliczków)
      const L_total = L_p1 + L_p2 + L_p3;
  
      // Obliczenie BGI (Biomechanical Grip Index) na podstawie długości palca i obwodu stawu
      const BGI = (L_total ** 2) / C_joint;
  
      // Korekta współczynnika siły: Zmiana - krótsze paliczki = wyższa siła
      const k = 1 / (L_total / C_joint);  // Przyjmujemy, że dźwignia jest odwrotnie proporcjonalna do L_total
  
      // Siła potencjalna (przyjmujemy różne wartości dla osób trenujących i nietrenujących)
      const maxPotentialForce = k * weight;
  
      // Zakładając, że osoba trenująca ma siłę większą o ~70% w porównaniu do osoby nietrenującej:
      const maxTrained = maxPotentialForce * 1.7;     // Trenujący (wyższa siła)
      const maxUntrained = maxPotentialForce * 0.8;   // Nietrenujący (niższa siła)
  
      // Wyświetlanie wyników na stronie
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = `
        <p><strong>BGI:</strong> ${BGI.toFixed(2)}</p>
        <p><strong>Współczynnik siły (k):</strong> ${k.toFixed(4)}</p>
        <p><strong>Szacowana siła chwytu (obie ręce):</strong></p>
        <ul>
          <li><strong>Nietrenujący:</strong> ${maxUntrained.toFixed(1)} kg</li>
          <li><strong>Trenujący:</strong> ${maxTrained.toFixed(1)} kg</li>
        </ul>
      `;
    });
  });
  