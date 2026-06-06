from flask import Flask, request, send_file, render_template
from gerador import gerar_ordem
import io, os, tempfile

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/gerar", methods=["POST"])
def gerar():

    mesmo_endereco = request.form.get("mesmo_endereco") == "sim"

    dados_gerais = {
        "nome_cliente":  request.form.get("nome_cliente", ""),
        "data_atend":    request.form.get("data_atend", ""),
        "nome_vendedor": request.form.get("nome_vendedor", ""),
        "tipo_envio":    request.form.get("tipo_envio", ""),
        "d7uteis":       request.form.get("d7uteis", ""),
        "d10uteis":      request.form.get("d10uteis", ""),
        "d3uteis":       request.form.get("d3uteis", ""),
        "d5uteis":       request.form.get("d5uteis", ""),
        "mesmo_endereco": mesmo_endereco,
        "nm_NF":  request.form.get("nm_NF",""),  "ID_NF":  request.form.get("ID_NF",""),
        "cep_NF": request.form.get("cep_NF",""),  "rua_NF": request.form.get("rua_NF",""),
        "num_end_NF": request.form.get("num_end_NF",""), "comp_NF": request.form.get("comp_NF",""),
        "bairro_NF": request.form.get("bairro_NF",""), "local_NF": request.form.get("local_NF",""),
        "nm_ENT":  request.form.get("nm_ENT",""),  "ID_ENT":  request.form.get("ID_ENT",""),
        "cep_ENT": request.form.get("cep_ENT",""),  "rua_ENT": request.form.get("rua_ENT",""),
        "num_end_ENT": request.form.get("num_end_ENT",""), "comp_ENT": request.form.get("comp_ENT",""),
        "bairro_ENT": request.form.get("bairro_ENT",""), "local_ENT": request.form.get("local_ENT",""),
        "nm_ENF":  request.form.get("nm_ENF",""),  "ID_ENF":  request.form.get("ID_ENF",""),
        "cep_ENF": request.form.get("cep_ENF",""),  "rua_ENF": request.form.get("rua_ENF",""),
        "num_end_ENF": request.form.get("num_end_ENF",""), "comp_ENF": request.form.get("comp_ENF",""),
        "bairro_ENF": request.form.get("bairro_ENF",""), "local_ENF": request.form.get("local_ENF",""),
    }

    # ── RÓTULOS ───────────────────────────────────────────────────────────────
    rotulos = []
    temporarios = []
    idx_rotulo = 0

    while f"nome_material_{idx_rotulo}" in request.form:

        # Artes deste rótulo: cada arte tem imagem + larg + alt
        artes = []
        idx_arte = 0

        while True:
            key_img  = f"imagem_{idx_rotulo}_{idx_arte}"
            key_larg = f"larg_{idx_rotulo}_{idx_arte}"
            key_alt  = f"alt_{idx_rotulo}_{idx_arte}"

            # Para quando não há mais artes
            if key_larg not in request.form and key_img not in request.files:
                break

            larg = request.form.get(key_larg, "")
            alt  = request.form.get(key_alt, "")
            img  = request.files.get(key_img)

            img_path = ""
            if img and img.filename:
                ext = os.path.splitext(img.filename)[1] or ".png"
                tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext, dir=UPLOAD_FOLDER)
                img.save(tmp.name)
                img_path = tmp.name
                temporarios.append(tmp.name)

            artes.append({"larg": larg, "alt": alt, "imagem": img_path})
            idx_arte += 1

        rotulos.append({
            "nome_material":  request.form.get(f"nome_material_{idx_rotulo}", ""),
            "tipo_impressao": request.form.get(f"tipo_impressao_{idx_rotulo}", ""),
            "qtd_rotulo":     request.form.get(f"qtd_rotulo_{idx_rotulo}", ""),
            "qtd_artes":      request.form.get(f"qtd_artes_{idx_rotulo}", ""),
            "val_tt":         request.form.get(f"val_tt_{idx_rotulo}", ""),
            "val_und":        request.form.get(f"val_und_{idx_rotulo}", ""),
            "obs_arte":       request.form.get(f"obs_arte_{idx_rotulo}", ""),
            "artes":          artes,
        })
        idx_rotulo += 1

    # ── GERA WORD ─────────────────────────────────────────────────────────────
    tmp_docx = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
    tmp_docx.close()
    gerar_ordem(dados_gerais, rotulos, tmp_docx.name)

    with open(tmp_docx.name, "rb") as f:
        buffer = io.BytesIO(f.read())
    buffer.seek(0)

    os.unlink(tmp_docx.name)
    for p in temporarios:
        try: os.unlink(p)
        except: pass

    nome = dados_gerais.get("nome_cliente", "cliente").replace(" ", "_")
    return send_file(buffer, as_attachment=True,
                     download_name=f"ordem_{nome}.docx",
                     mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document")


if __name__ == "__main__":
    app.run(debug=True)