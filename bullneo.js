(() => {
  "use strict";

  const FILE_INPUT_SELECTOR = 'input[type="file"]';
  const MODAL_ID = "bullneo-modal";
  const PANEL_ID = "bullneo-panel";
  const MOUNT_ID = "bullneo-mount";
  const STATUS_ID = "bullneo-status";
  const WIDTH_ID = "bullneo-width";
  const HEIGHT_ID = "bullneo-height";
  const OPEN_BUTTON_CLASS = "bullneo-open";
  const INLINE_STYLE_ID = "bullneo-inline-style";
  const ASSET_MARKER = "data-bullneo-asset";

  const existing = window.BullNeo;
  if (existing && typeof existing.open === "function") {
    existing.open();
    return;
  }

  const state = {
    baseUrl: detectBaseUrl(),
    targetForm: null,
    neoReady: false,
    mounted: false,
  };

  function detectBaseUrl() {
    const currentScript = document.currentScript;
    if (currentScript && currentScript.src) {
      return new URL(".", currentScript.src).href;
    }
    if (window.BULLNEO_BASE_URL) {
      return new URL(".", window.BULLNEO_BASE_URL).href;
    }
    throw new Error("bullneo.js の配置URLを特定できませんでした。");
  }

  function resolveAsset(path) {
    return new URL(path, state.baseUrl).href;
  }

  function loadScriptOnce(src) {
    const found = document.querySelector(
      `script[${ASSET_MARKER}="${src}"]`,
    );
    if (found) {
      if (found.dataset.loaded === "true") return Promise.resolve();
      return new Promise((resolve, reject) => {
        found.addEventListener("load", () => resolve(), { once: true });
        found.addEventListener("error", () => reject(new Error(src)), {
          once: true,
        });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute(ASSET_MARKER, src);
      script.addEventListener(
        "load",
        () => {
          script.dataset.loaded = "true";
          resolve();
        },
        { once: true },
      );
      script.addEventListener(
        "error",
        () => reject(new Error(`${src} の読み込みに失敗しました。`)),
        { once: true },
      );
      document.head.appendChild(script);
    });
  }

  function loadStyleOnce(href) {
    if (document.querySelector(`link[${ASSET_MARKER}="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(ASSET_MARKER, href);
    document.head.appendChild(link);
  }

  function ensureInlineStyle() {
    if (document.getElementById(INLINE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = INLINE_STYLE_ID;
    style.textContent = `
#${MODAL_ID} {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(20, 24, 34, 0.6);
}

#${MODAL_ID}.is-open {
  display: flex;
}

#${PANEL_ID} {
  width: min(92vw, 960px);
  max-height: 92vh;
  overflow: auto;
  box-sizing: border-box;
  background: #f6f2e8;
  color: #2f2417;
  border: 1px solid #9f8c70;
  border-radius: 10px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
  padding: 16px;
  font-family: sans-serif;
}

#${PANEL_ID} .bullneo-toolbar,
#${PANEL_ID} .bullneo-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

#${PANEL_ID} .bullneo-toolbar {
  justify-content: space-between;
  margin-bottom: 10px;
}

#${PANEL_ID} .bullneo-controls {
  margin-bottom: 12px;
}

#${PANEL_ID} .bullneo-title {
  font-weight: 700;
  font-size: 16px;
}

#${PANEL_ID} label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

#${PANEL_ID} input[type="number"] {
  width: 90px;
}

#${PANEL_ID} button,
.${OPEN_BUTTON_CLASS} {
  appearance: none;
  border: 1px solid #8f7757;
  background: #fffaf0;
  color: #2f2417;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font: inherit;
}

#${PANEL_ID} button:hover,
.${OPEN_BUTTON_CLASS}:hover {
  background: #fff2cd;
}

#${STATUS_ID} {
  min-height: 1.4em;
  color: #5e4a2f;
}

#${MOUNT_ID} {
  min-height: 520px;
}
`;
    document.head.appendChild(style);
  }

  function findTargetForm() {
    const activeForm = document.activeElement && document.activeElement.closest
      ? document.activeElement.closest("form")
      : null;
    if (activeForm && activeForm.querySelector(FILE_INPUT_SELECTOR)) {
      return activeForm;
    }

    const forms = Array.from(document.forms).filter((form) =>
      form.querySelector(FILE_INPUT_SELECTOR),
    );

    return (
      forms.find((form) => form.querySelector("textarea")) ||
      forms[0] ||
      null
    );
  }

  function findFileInput(form) {
    return form ? form.querySelector(FILE_INPUT_SELECTOR) : null;
  }

  function findImageNoneCheckbox(form) {
    if (!form) return null;
    const candidates = Array.from(
      form.querySelectorAll('input[type="checkbox"]'),
    );
    return (
      candidates.find((input) => /image|img|file/i.test(input.name || "")) ||
      candidates.find((input) => /画像なし/i.test(input.value || "")) ||
      null
    );
  }

  function getWidthInput() {
    return document.getElementById(WIDTH_ID);
  }

  function getHeightInput() {
    return document.getElementById(HEIGHT_ID);
  }

  function getRequestedCanvasSize() {
    const width = clampNumber(getWidthInput()?.value, 100, 2000, 400);
    const height = clampNumber(getHeightInput()?.value, 100, 2000, 400);
    return { width, height };
  }

  function clampNumber(value, min, max, fallback) {
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) return fallback;
    return Math.max(min, Math.min(max, num));
  }

  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.innerHTML = `
      <div id="${PANEL_ID}">
        <div class="bullneo-toolbar">
          <div class="bullneo-title">BULLNEO</div>
          <button type="button" data-bullneo-close="true">閉じる</button>
        </div>
        <div class="bullneo-controls">
          <label>横 <input id="${WIDTH_ID}" type="number" min="100" max="2000" value="400"></label>
          <label>縦 <input id="${HEIGHT_ID}" type="number" min="100" max="2000" value="400"></label>
          <button type="button" data-bullneo-action="rerender">この大きさで開き直す</button>
          <button type="button" data-bullneo-action="apply">画像に反映</button>
          <button type="button" data-bullneo-action="clear">クリア</button>
        </div>
        <div id="${STATUS_ID}"></div>
        <div id="${MOUNT_ID}"></div>
      </div>
    `;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });

    modal
      .querySelector('[data-bullneo-close="true"]')
      .addEventListener("click", close);

    modal
      .querySelector('[data-bullneo-action="rerender"]')
      .addEventListener("click", () => {
        renderEditor().catch((error) => {
          setStatus(error.message, true);
        });
      });

    modal
      .querySelector('[data-bullneo-action="apply"]')
      .addEventListener("click", () => {
        applyImageToForm().catch((error) => {
          setStatus(error.message, true);
        });
      });

    modal
      .querySelector('[data-bullneo-action="clear"]')
      .addEventListener("click", () => {
        if (!window.Neo || !window.Neo.painter) return;
        window.Neo.painter.clearCanvas();
        setStatus("キャンバスをクリアしました。");
      });

    document.body.appendChild(modal);
    return modal;
  }

  function ensureOpenButton(form) {
    if (!form || form.querySelector(`.${OPEN_BUTTON_CLASS}`)) return;
    const fileInput = findFileInput(form);
    if (!fileInput) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = OPEN_BUTTON_CLASS;
    button.textContent = "BULLNEO";
    button.addEventListener("click", () => {
      state.targetForm = form;
      open().catch((error) => {
        setStatus(error.message, true);
      });
    });

    fileInput.insertAdjacentElement("afterend", button);
  }

  function setStatus(message, isError) {
    const status = document.getElementById(STATUS_ID);
    if (!status) return;
    status.textContent = message || "";
    status.style.color = isError ? "#a12727" : "#5e4a2f";
  }

  async function ensureAssets() {
    loadStyleOnce(resolveAsset("neo/dist/neo.css"));
    await loadScriptOnce(resolveAsset("neo/dist/neo.js"));
    state.neoReady = true;
  }

  function buildAppletMarkup(width, height) {
    const appletWidth = Math.max(width + 140, 520);
    const appletHeight = Math.max(height + 170, 540);
    return `
      <applet-dummy name="paintbbs" width="${appletWidth}" height="${appletHeight}">
        <param name="image_width" value="${width}">
        <param name="image_height" value="${height}">
        <param name="neo_show_right_button" value="true">
        <param name="neo_disable_grid_touch_move" value="true">
        <param name="neo_enable_zoom_out" value="true">
        <param name="neo_confirm_unload" value="true">
      </applet-dummy>
    `;
  }

  async function renderEditor() {
    await ensureAssets();
    const modal = ensureModal();
    const mount = modal.querySelector(`#${MOUNT_ID}`);
    const { width, height } = getRequestedCanvasSize();

    mount.innerHTML = buildAppletMarkup(width, height);

    const neoRoot = document.getElementById("NEO");
    if (neoRoot && neoRoot.parentNode && neoRoot.parentNode !== mount) {
      neoRoot.parentNode.removeChild(neoRoot);
    }

    if (!window.Neo || !window.Neo.init()) {
      throw new Error("PaintBBS NEO の初期化に失敗しました。");
    }

    window.Neo.start(false);

    const submitButton = document.getElementById("neo-submit");
    if (submitButton) {
      submitButton.textContent = "画像に反映";
      submitButton.onmouseup = () => {
        applyImageToForm().catch((error) => {
          setStatus(error.message, true);
        });
      };
    }

    setStatus("描き終わったら「画像に反映」で添付ファイル欄へ戻します。");
    state.mounted = true;
  }

  async function applyImageToForm() {
    const form = state.targetForm || findTargetForm();
    const fileInput = findFileInput(form);
    if (!form || !fileInput) {
      throw new Error("画像を差し込む投稿フォームが見つかりませんでした。");
    }
    if (!window.Neo || !window.Neo.painter) {
      throw new Error("NEO のキャンバスがまだ準備できていません。");
    }

    const blob = window.Neo.painter.getPNG();
    const file = new File([blob], `bullneo-${Date.now()}.png`, {
      type: "image/png",
    });

    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    const imageNone = findImageNoneCheckbox(form);
    if (imageNone && imageNone.checked) {
      imageNone.checked = false;
      imageNone.dispatchEvent(new Event("change", { bubbles: true }));
    }

    setStatus("PNG を添付欄へ反映しました。あとは通常どおり投稿できます。");
    close();
  }

  async function open() {
    state.targetForm = state.targetForm || findTargetForm();
    if (!state.targetForm) {
      throw new Error("ふたばの投稿フォームが見つかりませんでした。");
    }

    ensureInlineStyle();
    ensureOpenButton(state.targetForm);
    const modal = ensureModal();
    modal.classList.add("is-open");

    if (!state.mounted) {
      await renderEditor();
    }
  }

  function close() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.classList.remove("is-open");
    }
  }

  function boot() {
    state.targetForm = findTargetForm();
    if (state.targetForm) {
      ensureInlineStyle();
      ensureOpenButton(state.targetForm);
      open().catch((error) => {
        setStatus(error.message, true);
      });
    }
  }

  window.BullNeo = {
    open,
    close,
    renderEditor,
    applyImageToForm,
  };

  boot();
})();
