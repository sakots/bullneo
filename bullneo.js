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
  const LINK_TEXT = "\u624b\u66f8\u304d(NEO)";
  const FORM_SELECTOR = "form, div, section, td";
  const FILE_NAME_CANDIDATES = ["upfile", "up"];
  const DEBUG = /[?&]bullneo_debug(?:=1)?(?:&|$)/.test(location.search);

  const existing = window.BullNeo;
  if (existing && typeof existing.install === "function") {
    existing.install();
    return;
  }

  const state = {
    baseUrl: detectBaseUrl(),
    targetForm: null,
    neoReady: false,
    mounted: false,
    observers: [],
  };

  function detectBaseUrl() {
    const currentScript = document.currentScript;
    if (currentScript && currentScript.src) {
      return new URL(".", currentScript.src).href;
    }
    if (window.BULLNEO_BASE_URL) {
      return new URL(".", window.BULLNEO_BASE_URL).href;
    }
    throw new Error(
      "bullneo.js \u306e\u914d\u7f6eURL\u3092\u7279\u5b9a\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002",
    );
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
      script.charset = "UTF-8";
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
        () => {
          reject(
            new Error(
              src +
                " \u306e\u8aad\u307f\u8fbc\u307f\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002",
            ),
          );
        },
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

#${PANEL_ID} button {
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
#${PANEL_ID} button:hover {
  background: #fff2cd;
}

#${STATUS_ID} {
  min-height: 1.4em;
  color: #5e4a2f;
}

#${MOUNT_ID} {
  min-height: 520px;
}

a.${OPEN_BUTTON_CLASS} {
  color: #0645ad;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.5em;
}
`;
    document.head.appendChild(style);
  }

  function getAccessibleDocuments() {
    const docs = [];
    const visited = new Set();

    function visit(win) {
      if (!win || visited.has(win)) return;
      visited.add(win);

      let doc = null;
      try {
        doc = win.document;
      } catch (_error) {
        return;
      }
      if (!doc) return;
      docs.push(doc);

      let frames = null;
      try {
        frames = win.frames;
      } catch (_error) {
        frames = null;
      }
      if (!frames) return;

      for (let i = 0; i < frames.length; i += 1) {
        visit(frames[i]);
      }
    }

    try {
      visit(window.top);
    } catch (_error) {
      visit(window);
    }
    visit(window);

    return docs;
  }

  function findTargetFormInDocument(doc) {
    const activeForm = doc.activeElement && doc.activeElement.closest
      ? doc.activeElement.closest("form")
      : null;
    if (activeForm && activeForm.querySelector(FILE_INPUT_SELECTOR)) {
      return activeForm;
    }

    const forms = Array.from(doc.forms || []).filter((form) =>
      form.querySelector(FILE_INPUT_SELECTOR),
    );

    return (
      forms.find((form) => form.querySelector("textarea")) ||
      forms[0] ||
      null
    );
  }

  function findPseudoFormInDocument(doc) {
    const fileInputs = Array.from(doc.querySelectorAll(FILE_INPUT_SELECTOR));
    for (const input of fileInputs) {
      const container =
        input.closest("form") ||
        input.closest("table") ||
        input.closest("div") ||
        input.parentElement;
      if (container) {
        return container;
      }
    }
    return null;
  }

  function findTargetForm() {
    const docs = getAccessibleDocuments();
    for (const doc of docs) {
      const form = findTargetFormInDocument(doc);
      if (form) return form;
      const pseudoForm = findPseudoFormInDocument(doc);
      if (pseudoForm) return pseudoForm;
    }
    return null;
  }

  function findFileInput(form) {
    if (!form) return null;
    const inputs = Array.from(form.querySelectorAll(FILE_INPUT_SELECTOR));
    return (
      inputs.find((input) =>
        FILE_NAME_CANDIDATES.includes((input.name || "").toLowerCase()),
      ) ||
      inputs[0] ||
      null
    );
  }

  function findImageNoneCheckbox(form) {
    if (!form) return null;
    const candidates = Array.from(
      form.querySelectorAll('input[type="checkbox"]'),
    );
    return (
      candidates.find((input) => /image|img|file/i.test(input.name || "")) ||
      candidates.find((input) =>
        /\u753b\u50cf\u306a\u3057/i.test(input.value || ""),
      ) ||
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
          <button type="button" data-bullneo-close="true">\u9589\u3058\u308b</button>
        </div>
        <div class="bullneo-controls">
          <label>\u6a2a <input id="${WIDTH_ID}" type="number" min="100" max="2000" value="400"></label>
          <label>\u7e26 <input id="${HEIGHT_ID}" type="number" min="100" max="2000" value="400"></label>
          <button type="button" data-bullneo-action="rerender">\u3053\u306e\u5927\u304d\u3055\u3067\u958b\u304d\u76f4\u3059</button>
          <button type="button" data-bullneo-action="apply">\u753b\u50cf\u306b\u53cd\u6620</button>
          <button type="button" data-bullneo-action="clear">\u30af\u30ea\u30a2</button>
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
        setStatus(
          "\u30ad\u30e3\u30f3\u30d0\u30b9\u3092\u30af\u30ea\u30a2\u3057\u307e\u3057\u305f\u3002",
        );
      });

    document.body.appendChild(modal);
    return modal;
  }

  function ensureOpenButton(form) {
    if (!form || form.querySelector(`.${OPEN_BUTTON_CLASS}`)) return;
    const fileInput = findFileInput(form);
    if (!fileInput) return;

    const link = document.createElement("a");
    link.href = "#";
    link.className = OPEN_BUTTON_CLASS;
    link.textContent = LINK_TEXT;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      state.targetForm = form;
      open().catch((error) => {
        setStatus(error.message, true);
      });
    });

    const imageNone = findImageNoneCheckbox(form);
    if (imageNone && imageNone.parentNode) {
      imageNone.parentNode.insertAdjacentElement("afterend", link);
      return;
    }

    fileInput.insertAdjacentElement("afterend", link);
  }

  function installLinks(root = document) {
    let forms = Array.from(root.querySelectorAll(FORM_SELECTOR)).filter((form) =>
      findFileInput(form),
    );
    if (forms.length === 0 && root.nodeType === 9) {
      const pseudoForm = findPseudoFormInDocument(root);
      if (pseudoForm) forms = [pseudoForm];
    }
    debugLog("forms with file input: " + forms.length);
    forms.forEach((form) => ensureOpenButton(form));
    if (!state.targetForm) {
      state.targetForm = findTargetForm();
    }
  }

  function observeForms(targetDocument) {
    if (
      state.observers.some((entry) => entry.targetDocument === targetDocument)
    ) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches?.(FORM_SELECTOR) || node.querySelector?.(FORM_SELECTOR)) {
            installLinks(targetDocument);
          }
        }
      }
    });

    if (!targetDocument.body) return;
    observer.observe(targetDocument.body, {
      childList: true,
      subtree: true,
    });
    state.observers.push({ targetDocument, observer });
  }

  function setStatus(message, isError) {
    const status = document.getElementById(STATUS_ID);
    if (!status) return;
    status.textContent = message || "";
    status.style.color = isError ? "#a12727" : "#5e4a2f";
  }

  function debugLog(message) {
    if (!DEBUG) return;
    console.log("[BULLNEO]", message);
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
      throw new Error(
        "PaintBBS NEO \u306e\u521d\u671f\u5316\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002",
      );
    }

    window.Neo.start(false);

    const submitButton = document.getElementById("neo-submit");
    if (submitButton) {
      submitButton.textContent = "\u753b\u50cf\u306b\u53cd\u6620";
      submitButton.onmouseup = () => {
        applyImageToForm().catch((error) => {
          setStatus(error.message, true);
        });
      };
    }

    setStatus(
      "\u63cf\u304d\u7d42\u308f\u3063\u305f\u3089\u300c\u753b\u50cf\u306b\u53cd\u6620\u300d\u3067\u6dfb\u4ed8\u30d5\u30a1\u30a4\u30eb\u6b04\u3078\u623b\u3057\u307e\u3059\u3002",
    );
    state.mounted = true;
  }

  async function applyImageToForm() {
    const form = state.targetForm || findTargetForm();
    const fileInput = findFileInput(form);
    if (!form || !fileInput) {
      throw new Error(
        "\u753b\u50cf\u3092\u5dee\u3057\u8fbc\u3080\u6295\u7a3f\u30d5\u30a9\u30fc\u30e0\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002",
      );
    }
    if (!window.Neo || !window.Neo.painter) {
      throw new Error(
        "NEO \u306e\u30ad\u30e3\u30f3\u30d0\u30b9\u304c\u307e\u3060\u6e96\u5099\u3067\u304d\u3066\u3044\u307e\u305b\u3093\u3002",
      );
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

    setStatus(
      "PNG \u3092\u6dfb\u4ed8\u6b04\u3078\u53cd\u6620\u3057\u307e\u3057\u305f\u3002\u3042\u3068\u306f\u901a\u5e38\u3069\u304a\u308a\u6295\u7a3f\u3067\u304d\u307e\u3059\u3002",
    );
    close();
  }

  async function open() {
    state.targetForm = state.targetForm || findTargetForm();
    if (!state.targetForm) {
      throw new Error(
        "\u3075\u305f\u3070\u306e\u6295\u7a3f\u30d5\u30a9\u30fc\u30e0\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002",
      );
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
    ensureInlineStyle();
    state.targetForm = findTargetForm();
    debugLog("boot url: " + location.href);
    debugLog("frame: " + (window.top === window ? "top" : "child"));
    const docs = getAccessibleDocuments();
    debugLog("documents: " + docs.length);
    for (const doc of docs) {
      installLinks(doc);
      if (doc.body) {
        observeForms(doc);
      }
    }
    if (!state.targetForm) {
      console.warn("[BULLNEO] target form not found on this document");
      if (DEBUG) {
        alert(
          "BULLNEO: target form not found\nurl=" +
            location.href +
            "\nframe=" +
            (window.top === window ? "top" : "child"),
        );
      }
    } else {
      debugLog("target form detected");
    }
  }

  window.BullNeo = {
    install: boot,
    open,
    close,
    renderEditor,
    applyImageToForm,
  };

  boot();
})();
