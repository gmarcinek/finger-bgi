from flask import Flask, request, render_template_string

app = Flask(__name__)

template = """
<!doctype html>
<title>Grip Strength Estimator</title>
<h2>Oblicz maksymalną siłę chwytu (half crimp, 2 ręce)</h2>
<form method=post>
  Długość palca (mm): <input type=number step=0.1 name=l_total><br>
  Obwód stawu palca (mm): <input type=number step=0.1 name=c_joint><br>
  Masa ciała (kg): <input type=number step=0.1 name=w_body><br>
  Maksymalne utrzymane obciążenie (kg): <input type=number step=0.1 name=max_now><br>
  Życiowe maksymalne obciążenie (kg): <input type=number step=0.1 name=max_ever><br>
  <input type=submit value=Oblicz>
</form>

{% if results %}
  <h3>Wyniki:</h3>
  <ul>
    <li>BoneGripIndex (BGI): {{ results.bgi }}</li>
    <li>Aktualny współczynnik k: {{ results.k_now }}</li>
    <li>Życiowy współczynnik k: {{ results.k_max }}</li>
    <li>Siła teraz: {{ results.f_now }} kg</li>
    <li>Potencjał po latach treningu: {{ results.f_max }} kg</li>
    <li>Potencjał bez treningu: {{ results.f_untrained }} kg</li>
  </ul>
{% endif %}
"""

def bone_grip_index(c_joint_mm: float, l_total_mm: float) -> float:
    return (c_joint_mm ** 2) * l_total_mm

def grip_strength_2hands(c_joint_mm: float, l_total_mm: float, k: float) -> float:
    c_cm = c_joint_mm / 10
    l_cm = l_total_mm / 10
    return 8 * k * (c_cm ** 2) * l_cm

def estimate_k(current_total_mass: float, c_joint_mm: float, l_total_mm: float) -> float:
    c_cm = c_joint_mm / 10
    l_cm = l_total_mm / 10
    return current_total_mass / (8 * (c_cm ** 2) * l_cm)

@app.route('/', methods=['GET', 'POST'])
def index():
    results = None
    if request.method == 'POST':
        l_total = float(request.form['l_total'])
        c_joint = float(request.form['c_joint'])
        w_body = float(request.form['w_body'])
        max_now = float(request.form['max_now'])
        max_ever = float(request.form['max_ever'])

        k_pro = 0.07
        k_untrained = 0.02

        bgi = round(bone_grip_index(c_joint, l_total))
        k_now = round(estimate_k(max_now, c_joint, l_total), 4)
        k_max = round(estimate_k(max_ever, c_joint, l_total), 4)
        f_now = round(grip_strength_2hands(c_joint, l_total, k_now), 1)
        f_max = round(grip_strength_2hands(c_joint, l_total, k_pro), 1)
        f_untrained = round(grip_strength_2hands(c_joint, l_total, k_untrained), 1)

        results = {
            'bgi': bgi,
            'k_now': k_now,
            'k_max': k_max,
            'f_now': f_now,
            'f_max': f_max,
            'f_untrained': f_untrained,
        }

    return render_template_string(template, results=results)

if __name__ == '__main__':
    app.run(debug=True)
