// ── CONTROLE DE RÓTULOS ────────────────────────────────────────────────────────

let totalRotulos = 0;

function criarBlocoRotulo(index) {
  const bloco = document.createElement('div');
  bloco.className = 'rotulo-bloco';
  bloco.id = `rotulo-${index}`;

  bloco.innerHTML = `
    <div class="rotulo-header">
      <span class="rotulo-titulo">Rótulo ${index + 1}</span>
      <button type="button" class="btn-remove" onclick="removerRotulo(${index})">Remover</button>
    </div>

    <div class="grid-3" style="margin-bottom:16px;">
      <div class="field">
        <label>Material</label>
        <input type="text" name="nome_material_${index}" placeholder="Ex: Bopp Brilho" required />
      </div>
      <div class="field">
        <label>Tipo de Impressão</label>
        <input type="text" name="tipo_impressao_${index}" placeholder="Ex: Impressão UV CMYK" />
      </div>
      <div class="field"></div>
    </div>

    <div class="grid-4" style="margin-bottom:16px;">
      <div class="field">
        <label>Qtd. Rótulos</label>
        <input type="text" name="qtd_rotulo_${index}" placeholder="Ex: 1000 un" />
      </div>
      <div class="field">
        <label>Qtd. Artes</label>
        <input type="number" name="qtd_artes_${index}" placeholder="Ex: 3" min="1" />
      </div>
      <div class="field">
        <label>Valor Total</label>
        <input type="text" name="val_tt_${index}" placeholder="Ex: R$ 350,00" />
      </div>
      <div class="field">
        <label>Valor por Unidade</label>
        <input type="text" name="val_und_${index}" placeholder="Ex: R$ 0,35" />
      </div>
    </div>

    <div class="field" style="margin-bottom:16px;">
      <label>Observações da Arte</label>
      <textarea name="obs_arte_${index}" placeholder="Ex: Arte enviada pelo cliente via e-mail..."></textarea>
    </div>

    <!-- Artes com tamanhos individuais -->
    <div class="field">
      <label>Artes</label>
      <div id="artes-container-${index}"></div>
      <button type="button" class="btn-add-arte" onclick="adicionarArte(${index})">
        + Adicionar Arte
      </button>
    </div>
  `;

  return bloco;
}

function adicionarRotulo() {
  const container = document.getElementById('rotulos-container');
  const bloco = criarBlocoRotulo(totalRotulos);
  container.appendChild(bloco);
  adicionarArte(totalRotulos); // começa com 1 arte
  totalRotulos++;
  atualizarTitulosRotulos();
}

function removerRotulo(index) {
  const bloco = document.getElementById(`rotulo-${index}`);
  if (bloco) {
    bloco.style.opacity = '0';
    bloco.style.transform = 'translateY(-6px)';
    bloco.style.transition = 'opacity 0.15s, transform 0.15s';
    setTimeout(() => { bloco.remove(); renumerarRotulos(); }, 150);
  }
}

function renumerarRotulos() {
  const blocos = document.querySelectorAll('.rotulo-bloco');
  totalRotulos = blocos.length;
  blocos.forEach((bloco, novoIdx) => {
    bloco.id = `rotulo-${novoIdx}`;
    const btnRem = bloco.querySelector('.btn-remove');
    if (btnRem) btnRem.setAttribute('onclick', `removerRotulo(${novoIdx})`);
    bloco.querySelectorAll('input, textarea').forEach(el => {
      if (el.name) el.name = el.name.replace(/_\d+(_|$)/, `_${novoIdx}$1`);
    });
  });
  atualizarTitulosRotulos();
}

function atualizarTitulosRotulos() {
  document.querySelectorAll('.rotulo-titulo').forEach((t, i) => {
    t.textContent = `Rótulo ${i + 1}`;
  });
}

// ── ARTES POR RÓTULO ──────────────────────────────────────────────────────────

const artesPorRotulo = {}; // { rotulo_idx: [ { file, larg, alt }, ... ] }

function adicionarArte(rotulo_idx) {
  if (!artesPorRotulo[rotulo_idx]) artesPorRotulo[rotulo_idx] = [];
  const arte_idx = artesPorRotulo[rotulo_idx].length;
  artesPorRotulo[rotulo_idx].push({ file: null, larg: '', alt: '' });
  renderizarArtes(rotulo_idx);
}

function removerArte(rotulo_idx, arte_idx) {
  if (artesPorRotulo[rotulo_idx]) {
    artesPorRotulo[rotulo_idx].splice(arte_idx, 1);
    renderizarArtes(rotulo_idx);
  }
}

function renderizarArtes(rotulo_idx) {
  const container = document.getElementById(`artes-container-${rotulo_idx}`);
  if (!container) return;
  container.innerHTML = '';

  const artes = artesPorRotulo[rotulo_idx] || [];

  artes.forEach((arte, arte_idx) => {
    const div = document.createElement('div');
    div.className = 'arte-bloco';
    div.innerHTML = `
      <div class="arte-header">
        <span class="arte-label">Arte ${arte_idx + 1}</span>
        ${artes.length > 1 ? `<button type="button" class="btn-remove-arte" onclick="removerArte(${rotulo_idx}, ${arte_idx})">✕</button>` : ''}
      </div>
      <div class="arte-row">
        <div class="field arte-medidas">
          <label>Largura (cm)</label>
          <input type="text" name="larg_${rotulo_idx}_${arte_idx}"
            placeholder="Ex: 10"
            value="${arte.larg}"
            oninput="artesPorRotulo[${rotulo_idx}][${arte_idx}].larg = this.value" />
        </div>
        <div class="field arte-medidas">
          <label>Altura (cm)</label>
          <input type="text" name="alt_${rotulo_idx}_${arte_idx}"
            placeholder="Ex: 5"
            value="${arte.alt}"
            oninput="artesPorRotulo[${rotulo_idx}][${arte_idx}].alt = this.value" />
        </div>
        <div class="field arte-upload">
          <label>Imagem</label>
          <div class="upload-mini" id="upload-mini-${rotulo_idx}-${arte_idx}">
            <input type="file" name="imagem_${rotulo_idx}_${arte_idx}"
              accept="image/*"
              onchange="onArteImagem(this, ${rotulo_idx}, ${arte_idx})" />
            ${arte.file
              ? `<img src="${arte.preview}" class="arte-thumb" />`
              : `<span class="upload-mini-text">📎 Escolher</span>`
            }
          </div>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

function onArteImagem(input, rotulo_idx, arte_idx) {
  const file = input.files[0];
  if (!file) return;

  artesPorRotulo[rotulo_idx][arte_idx].file = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    artesPorRotulo[rotulo_idx][arte_idx].preview = e.target.result;
    // Atualiza só o preview sem rerenderizar tudo (mantém o input com o arquivo)
    const uploadMini = document.getElementById(`upload-mini-${rotulo_idx}-${arte_idx}`);
    if (uploadMini) {
      const existing = uploadMini.querySelector('.arte-thumb');
      if (existing) existing.remove();
      const span = uploadMini.querySelector('.upload-mini-text');
      if (span) span.remove();
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'arte-thumb';
      uploadMini.appendChild(img);
    }
  };
  reader.readAsDataURL(file);
}

// ── TOGGLE ENDEREÇO ───────────────────────────────────────────────────────────

function toggleEndereco(mesmo) {
  document.getElementById('bloco-unificado').style.display = mesmo ? '' : 'none';
  document.getElementById('bloco-separado').style.display  = mesmo ? 'none' : '';
  document.getElementById('input-mesmo-endereco').value    = mesmo ? 'sim' : 'nao';
  document.getElementById('btn-mesmo').classList.toggle('active', mesmo);
  document.getElementById('btn-dif').classList.toggle('active', !mesmo);
}

// ── INIT ──────────────────────────────────────────────────────────────────────

document.getElementById('btn-add-rotulo').addEventListener('click', adicionarRotulo);
adicionarRotulo(); // começa com 1 rótulo aberto