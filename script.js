document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("gripForm");
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const L_p1 = parseFloat(document.getElementById("L_p1").value);
      const L_p2 = parseFloat(document.getElementById("L_p2").value);
      const L_p3 = parseFloat(document.getElementById("L_p3").value);
      const C_joint = parseFloat(document.getElementById("C_joint").value);
      const weight = parseFloat(document.getElementById("weight").value);
  
      const L_total = L_p1 + L_p2 + L_p3;
  
      const BGI = (L_total ** 2) / C_joint;
      const k = BGI / weight;
  
      // Surowa siła biomechaniczna (współczynnik razy masa)
      const maxPotentialForce = k * weight;
  
      // Oszacowanie wagi na jednej ręce w half crimpie (wartości heurystyczne)
      const maxTrained = maxPotentialForce * 1.7;     // zaawansowany wspinacz
      const maxUntrained = maxPotentialForce * 0.8;   // osoba nietrenująca
  
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = `
        <p><strong>BGI:</strong> ${BGI.toFixed(2)}</p>
        <p><strong>k:</strong> ${k.toFixed(4)}</p>
        <p><strong>Szacowana siła (obie ręce):</strong></p>
        <ul>
          <li>Nietrenujący: ${maxUntrained.toFixed(1)} kg</li>
          <li>Trenujący: ${maxTrained.toFixed(1)} kg</li>
        </ul>
      `;
    });
  });
  