// appneo.js
// Starts PaintBBS NEO from a futaba drawing page.
(() => {
  "use strict";

  const APPNEO_ID = "appneo-root";
  const DEFAULT_APPLET_WIDTH = 400;
  const DEFAULT_APPLET_HEIGHT = 460;
  const DEFAULT_CANVAS_SIZE = 300;

  const state = {
    loading: null,
    fitManager: null,
    paletteManager: null,
  };

  const DEFAULT_PALETTES = [
    "No.01 Red, FFDFDF,FFBFBF,FF9F9F,FF7F7F,FF5F5F,FF3F3F,FF0000,DF0000,BF0000,9F0000,7F0000,5F0000,FF1F1F,3F0000",
    "No.02 Tobi, FFE7DF,FFCFBF,FFB79F,FF9F7F,FF875F,FF6F3F,FF3F00,DF3700,BF2F00,9F2700,7F1F00,5F1700,FF571F,3F0F00",
    "No.03 Yamabuki, FFEFDF,FFDFBF,FFCF9F,FFBF7F,FFAF5F,FF9F3F,FF7F00,DF6F00,BF5F00,9F4F00,7F3F00,5F2F00,FF8F1F,3F1F00",
    "No.04 Gold, FFF7DF,FFEFBF,FFE79F,FFDF7F,FFD75F,FFCF3F,FFBF00,DFA700,BF8F00,9F7700,7F5F00,5F4700,FFC71F,3F2F00",
    "No.05 Yellow, FFFFDF,FFFFBF,FFFF9F,FFFF7F,FFFF5F,FFFF3F,FFFF00,DFDF00,BFBF00,9F9F00,7F7F00,5F5F00,FFFF1F,3F3F00",
    "No.06 Wakame, F7FFDF,EFFFBF,E7FF9F,DFFF7F,D7FF5F,CFFF3F,BFFF00,A7DF00,8FBF00,779F00,5F7F00,475F00,C7FF1F,2F3F00",
    "No.07 Moegi, EFFFDF,DFFFBF,CFFF9F,BFFF7F,AFFF5F,9FFF3F,7FFF00,6FDF00,5FBF00,4F9F00,3F7F00,2F5F00,8FFF1F,1F3F00",
    "No.08 Wakaba, E7FFDF,CFFFBF,B7FF9F,9FFF7F,87FF5F,6FFF3F,3FFF00,37DF00,3FBF00,279F00,1F7F00,175F00,57FF1F,0F3F00",
    "No.09 Green, DFFFDF,BFFFBF,9FFF9F,7FFF7F,5FFF5F,3FFF3F,00FF00,00DF00,00BF00,009F00,007F00,005F00,1FFF1F,003F00",
    "No.10 Seiji, DFFFE7,BFFFCF,9FFFB7,7FFF9F,5FFF87,3FFF6F,00FF3F,00DF37,00BF3F,009F27,007F1F,005F17,1FFF57,003F0F",
    "No.11 Tokiwa, DFFFEF,BFFFDF,9FFFCF,7FFFBF,5FFFAF,3FFF9F,00FF7F,00DF6F,00BF5F,009F4F,007F3F,005F2F,1FFF8F,003F1F",
    "No.12 Asagi, DFFFF7,BFFFEF,9FFFE7,7FFFDF,5FFFD7,3FFFCF,00FFBF,00DFA7,00BF8F,009F77,007F5F,005F47,1FFFC7,003F2F",
    "No.13 Aqua, DFFFFF,BFFFFF,9FFFFF,7FFFFF,5FFFFF,3FFFFF,00FFFF,00DFDF,00BFBF,009F9F,007F7F,005F5F,1FFFFF,003F3F",
    "No.14 Sky, DFF7FF,BFEFFF,9FE7FF,7FDFFF,5FD7FF,3FCFFF,00BFFF,00A7DF,008FBF,00779F,005F7F,00475F,1FC7FF,002F3F",
    "No.15 Sea, DFEFFF,BFDFFF,9FCFFF,7FBFFF,5FAFFF,3F9FFF,007FFF,006FDF,005FBF,004F9F,003F7F,002F5F,1F8FFF,001F3F",
    "No.16 Bluegrass, DFE7FF,BFCFFF,9FB7FF,7F9FFF,5F87FF,3F6FFF,003FFF,0037DF,003FBF,00279F,001F7F,00175F,1F57FF,000F3F",
    "No.17 Blue, DFDFFF,BFBFFF,9F9FFF,7F7FFF,5F5FFF,3F3FFF,0000FF,0000DF,0000BF,00009F,00007F,00005F,1F1FFF,00003F",
    "No.18 Kikyo, E7DFFF,CFBFFF,B79FFF,9F7FFF,875FFF,6F3FFF,3F00FF,3700DF,3F00BF,27009F,1F007F,17005F,571FFF,0F003F",
    "No.19 Fuji, EFDFFF,DFBFFF,CF9FFF,BF7FFF,AF5FFF,9F3FFF,7F00FF,6F00DF,5F00BF,4F009F,3F007F,2F005F,8F1FFF,1F003F",
    "No.20 Grape, F7DFFF,EFBFFF,E79FFF,DF7FFF,D75FFF,CF3FFF,BF00FF,A700DF,8F00BF,77009F,5F007F,47005F,C71FFF,2F003F",
    "No.21 Purple, FFDFFF,FFBFFF,FF9FFF,FF7FFF,FF5FFF,FF3FFF,FF00FF,DF00DF,BF00BF,9F009F,7F007F,5F005F,FF1FFF,3F003F",
    "No.22 Dark Purple, FFDFF7,FFBFEF,FF9FE7,FF7FDF,FF5FD7,FF3FCF,FF00BF,DF00A7,BF008F,9F0077,7F005F,5F0047,FF1FC7,3F002F",
    "No.23 Plum, FFDFEF,FFBFDF,FF9FCF,FF7FBF,FF5FAF,FF3F9F,FF007F,DF006F,BF005F,9F004F,7F003F,5F002F,FF1F8F,3F001F",
    "No.24 Madder, FFDFE7,FFBFCF,FF9FB7,FF7F9F,FF5F87,FF3F6F,FF003F,DF0037,BF003F,9F0027,7F001F,5F0017,FF1F57,3F000F",
    "No.25 Mono, F0F0F0,E0E0E0,D0D0D0,C0C0C0,B0B0B0,A0A0A0,808080,707070,606060,505050,404040,303030,909090,202020",
    "No.26 Skin, FFF2E1,FFEED7,FFE9CD,FFE5C3,FFE1B9,FFDCAF,FFEDE1,FFE7D7,FFE1CD,FFDBC3,FFD5B9,FFCFAF,FFD8A5,FFC9A5",
    "No.27 Brown, ECDBCC,E2C6AE,D7B291,CD9D73,C18957,AE7542,916137,744E2C,573A21,3A2716,1D130D,120800,FCECE2,F9DDCF",
    "No.28 Pale, FFC3C3,FDFFC3,C3FFC7,C3F9FF,CBC3FF,FFC3F4,FFE2C3,DEFFC3,C3FFE6,C3DAFF,EBC3FF,FFC3D5,FCECE2,F9DDCF",
    "No.29 Standard, 000000,B47575,FA9696,FFB6FF,25C7C9,E7962D,FFFFFF,888888,C096C0,8080FF,E7E58D,99CB7B,FCECE2,F9DDCF",
  ];

  const getScriptBase = () => {
    const script = document.currentScript || [...document.scripts].find((s) => {
      return s.src && /(?:^|\/)appneo\.js(?:[?#].*)?$/.test(s.src);
    });

    if (script && script.src) {
      return new URL(".", script.src).href;
    }

    return new URL("./", location.href).href;
  };

  const APP_BASE = window.APPNEO_BASE || getScriptBase();
  const NEO_BASES = window.APPNEO_NEO_BASE
    ? [window.APPNEO_NEO_BASE]
    : [
        new URL("neo/dist/", APP_BASE).href,
        new URL("dist/", APP_BASE).href,
        APP_BASE,
      ];

  const toNumber = (value, fallback) => {
    const number = parseInt(value, 10);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  };

  const findOekakiButton = () => {
    const controls = [...document.querySelectorAll("input, button, a")];
    return controls.find((control) => {
      const label = control.value || control.textContent || control.title || "";
      return /\u304a\u7d75(?:\u304b|\u63cf)\u304d\u3059\u308b/.test(label);
    });
  };

  const findSizeInputs = (button) => {
    const inputs = [...document.querySelectorAll("input")];
    const numberLikes = inputs.filter((input) => {
      const value = input.value || input.getAttribute("value") || "";
      return /^\d{2,4}$/.test(value);
    });

    const nearButton = button
      ? numberLikes
          .map((input) => ({
            input,
            distance: Math.abs(
              input.getBoundingClientRect().top - button.getBoundingClientRect().top,
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
          .map((item) => item.input)
      : numberLikes;

    return {
      canvasWidth: nearButton[0],
      canvasHeight: nearButton[1],
    };
  };

  const getSizes = (button) => {
    const { canvasWidth, canvasHeight } = findSizeInputs(button);
    const width = toNumber(canvasWidth && canvasWidth.value, DEFAULT_CANVAS_SIZE);
    const height = toNumber(canvasHeight && canvasHeight.value, DEFAULT_CANVAS_SIZE);

    return {
      appletWidth: Math.max(width + 100, DEFAULT_APPLET_WIDTH),
      appletHeight: Math.max(height + 160, DEFAULT_APPLET_HEIGHT),
      canvasWidth: width,
      canvasHeight: height,
    };
  };

  const getBoardUrl = (filename, query = "") => {
    return filename + query;
  };

  const parsePaletteName = (entry, index) => {
    const match = String(entry).match(/^\s*([^,\n]+)/);
    return match ? match[1].trim() : `Palette ${index + 1}`;
  };

  const formatColors = (source) => {
    return (String(source).match(/#?[0-9a-fA-F]{6}\b/g) || [])
      .slice(0, 14)
      .map((color) => "#" + color.replace("#", "").toUpperCase())
      .join("\n");
  };

  const hex = (value) => {
    const number = Math.max(0, Math.min(255, parseInt(value, 10) || 0));
    return number.toString(16).padStart(2, "0").toUpperCase();
  };

  const getBright = (color) => {
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    return Math.max(r, g, b) < 128 ? "#FFFFFF" : "#000000";
  };

  const createOptions = (count, selectedIndex = -1) => {
    return Array.from({ length: count }, (_, index) => {
      return `<option${index === selectedIndex ? " selected" : ""}>${index + 1}</option>`;
    }).join("");
  };

  class AppNeoFitManager {
    constructor(sizes) {
      this.originalWidth = sizes.appletWidth;
      this.originalHeight = sizes.appletHeight;
      this.isExpanded = false;
      this.bindGlobals();
    }

    bindGlobals() {
      window.appFit = (mode) => {
        if (mode) this.compress();
        else this.expand();
      };
    }

    refreshTargets() {
      this.target = document.getElementById("neo-pageView");
      this.neoContainer = document.getElementById("neo-container");
      this.palette = document.getElementById("appneo-dyntools");
      this.fitExp = document.getElementById("appneo-fit-exp");
      this.fitComp = document.getElementById("appneo-fit-comp");
    }

    getClientWidth() {
      const client = document.compatMode && document.compatMode !== "BackCompat"
        ? document.documentElement
        : document.body;
      return client.clientWidth || window.innerWidth;
    }

    getClientHeight() {
      const client = document.compatMode && document.compatMode !== "BackCompat"
        ? document.documentElement
        : document.body;
      return client.clientHeight - 10;
    }

    getExpandedWidth() {
      this.refreshTargets();
      const paletteWidth = this.palette ? this.palette.getBoundingClientRect().width : 0;
      const availableWidth = this.getClientWidth() - paletteWidth - 48;
      return Math.max(this.originalWidth, Math.floor(availableWidth));
    }

    setAppletSize(width, height) {
      this.refreshTargets();
      const appletWidth = parseInt(width, 10);
      const appletHeight = parseInt(height, 10);

      if (window.Neo && Neo.config) {
        Neo.config.applet_width = appletWidth;
        Neo.config.applet_height = appletHeight;
      }

      if (this.target) {
        this.target.style.width = `${appletWidth}px`;
        this.target.style.height = `${appletHeight}px`;
      }

      if (this.neoContainer) {
        this.neoContainer.style.width = `${appletWidth}px`;
        this.neoContainer.style.height = `${appletHeight}px`;
      }
    }

    resetZoom() {
      if (window.Neo && Neo.painter) {
        Neo.painter.setZoom(1);
        Neo.resizeCanvas();
        Neo.painter.updateDestCanvas();
      }
    }

    expand() {
      if (this.isExpanded) return;

      const width = this.getExpandedWidth();
      const height = Math.max(this.originalHeight, this.getClientHeight());
      this.setAppletSize(width, height);

      if (this.fitExp) this.fitExp.style.display = "none";
      if (this.fitComp) this.fitComp.style.display = "block";
      this.isExpanded = true;
      this.resetZoom();
    }

    compress() {
      if (!this.isExpanded) return;

      this.setAppletSize(this.originalWidth, this.originalHeight);
      if (this.fitExp) this.fitExp.style.display = "block";
      if (this.fitComp) this.fitComp.style.display = "none";
      this.isExpanded = false;
      this.resetZoom();
    }
  }

  class AppNeoPaletteManager {
    constructor() {
      this.DynamicColor = 1;
      this.customP = 0;
      this.entries = DEFAULT_PALETTES.map((entry, index) => ({
        name: parsePaletteName(entry, index),
        colors: formatColors(entry),
      }));
      this.Palettes = [""].concat(this.entries.map((entry) => entry.colors));
      this.bindGlobals();
      this.syncOptions();
      this.PaletteListSetColor();
    }

    bindGlobals() {
      window.setPalette = this.setPalette.bind(this);
      window.PaletteSave = this.PaletteSave.bind(this);
      window.PaletteNew = this.PaletteNew.bind(this);
      window.PaletteRenew = this.PaletteRenew.bind(this);
      window.PaletteDel = this.PaletteDel.bind(this);
      window.P_Effect = this.P_Effect.bind(this);
      window.PaletteMatrixGet = this.PaletteMatrixGet.bind(this);
      window.PaletteMatrixSet = this.PaletteMatrixSet.bind(this);
      window.PaletteMatrixHelp = this.PaletteMatrixHelp.bind(this);
      window.GetPalette = this.GetPalette.bind(this);
      window.ChangeGrad = this.ChangeGrad.bind(this);
      window.Change_ = this.Change_.bind(this);
    }

    get select() {
      return document.Palette && document.Palette.select;
    }

    syncOptions() {
      const select = this.select;
      if (!select) return;

      while (select.options.length > 1) select.options[1] = null;
      this.entries.forEach((entry) => {
        select.options[select.options.length] = new Option(entry.name);
      });
      select.size = Math.min(select.options.length, 30);
    }

    async setPalette() {
      const select = this.select;
      if (!document.paintbbs || !select) return;

      const colors = this.Palettes[select.selectedIndex];
      if (colors) document.paintbbs.setColors(colors);
      await this.GetPalette();
    }

    async PaletteSave() {
      if (!document.paintbbs) return;
      this.Palettes[0] = String(await document.paintbbs.getColors());
      this.PaletteListSetColor();
    }

    async PaletteNew() {
      if (!document.paintbbs || !this.select) return;

      const colors = String(await document.paintbbs.getColors());
      const name = prompt("Palette name", "Palette " + ++this.customP);
      if (!name) {
        this.customP--;
        return;
      }

      this.Palettes.push(colors);
      this.select.options[this.select.length] = new Option(name);
      this.select.size = Math.min(this.select.length, 30);
      this.PaletteListSetColor();
    }

    async PaletteRenew() {
      if (!document.paintbbs || !this.select || this.select.selectedIndex < 0) return;
      this.Palettes[this.select.selectedIndex] = String(await document.paintbbs.getColors());
      this.PaletteListSetColor();
    }

    PaletteDel() {
      if (!this.select || this.select.selectedIndex <= 0) return;
      const index = this.select.selectedIndex;
      if (!confirm(this.select.options[index].text + " delete?")) return;
      this.select.options[index] = null;
      this.Palettes.splice(index, 1);
      this.select.size = Math.min(this.select.length, 30);
    }

    async P_Effect(value) {
      if (!document.paintbbs) return;

      const v = parseInt(value, 10);
      const invert = v === 255;
      const colors = String(await document.paintbbs.getColors()).split("\n");
      const next = colors.map((color) => {
        const r0 = parseInt(color.substring(1, 3), 16);
        const g0 = parseInt(color.substring(3, 5), 16);
        const b0 = parseInt(color.substring(5, 7), 16);
        const r = invert ? 255 - r0 : r0 + v;
        const g = invert ? 255 - g0 : g0 + v;
        const b = invert ? 255 - b0 : b0 + v;
        return `#${hex(r)}${hex(g)}${hex(b)}`;
      }).join("\n");

      document.paintbbs.setColors(next);
      this.PaletteListSetColor();
    }

    async PaletteMatrixGet() {
      if (!document.Palette) return;

      const mode = document.Palette.m_m.selectedIndex;
      const textarea = document.Palette.setr;
      if (mode === 1) {
        textarea.value = `!Palette\n${String(await document.paintbbs.getColors())}\n!Matrix`;
        return;
      }

      const select = this.select;
      const lines = [];
      for (let i = 0; i < this.Palettes.length; i++) {
        if (select.options[i] && this.Palettes[i]) {
          lines.push(`!${select.options[i].text}\n${this.Palettes[i]}`);
        }
      }
      textarea.value = `${lines.join("\n")}\n!Matrix`;
    }

    PaletteMatrixSet() {
      if (!document.Palette) return;

      const text = document.Palette.setr.value;
      const entries = text
        .split(/\n(?=!)/)
        .map((entry, index) => ({
          name: parsePaletteName(entry.replace(/^!/, ""), index),
          colors: formatColors(entry),
        }))
        .filter((entry) => entry.colors);

      if (!entries.length) {
        alert("No matrix data.");
        return;
      }

      if (document.Palette.m_m.selectedIndex === 1) {
        document.paintbbs.setColors(entries[0].colors);
        return;
      }

      if (document.Palette.m_m.selectedIndex !== 2) {
        this.Palettes = [this.Palettes[0] || ""];
        while (this.select.options.length > 1) this.select.options[1] = null;
      }

      entries.forEach((entry) => {
        if (entry.name === "Palette") {
          document.paintbbs.setColors(entry.colors);
        } else {
          this.Palettes.push(entry.colors);
          this.select.options[this.select.length] = new Option(entry.name);
        }
      });
      this.PaletteListSetColor();
    }

    PaletteMatrixHelp() {
      alert("PALETTE MATRIX\nPut !PaletteName followed by 14 #RRGGBB colors.\nGET exports palettes, SET imports them.");
    }

    async GetPalette() {
      if (!document.paintbbs || !document.grad) return;

      const colors = String(await document.paintbbs.getColors()).split("\n");
      const start = document.grad.p_st.selectedIndex;
      const end = document.grad.p_ed.selectedIndex;
      if (colors[start]) document.grad.pst.value = colors[start].substring(1);
      if (colors[end]) document.grad.ped.value = colors[end].substring(1);
      this.PaletteListSetColor();
    }

    Change_() {}

    ChangeGrad() {
      if (!document.grad || !document.paintbbs) return;

      const start = formatColors(document.grad.pst.value).split("\n")[0];
      const end = formatColors(document.grad.ped.value).split("\n")[0];
      if (!start || !end) return;

      const sr = parseInt(start.substring(1, 3), 16);
      const sg = parseInt(start.substring(3, 5), 16);
      const sb = parseInt(start.substring(5, 7), 16);
      const er = parseInt(end.substring(1, 3), 16);
      const eg = parseInt(end.substring(3, 5), 16);
      const eb = parseInt(end.substring(5, 7), 16);

      const colors = Array.from({ length: 14 }, (_, index) => {
        const ratio = index / 13;
        return `#${hex(sr + (er - sr) * ratio)}${hex(sg + (eg - sg) * ratio)}${hex(sb + (eb - sb) * ratio)}`;
      }).join("\n");

      document.paintbbs.setColors(colors);
      this.PaletteListSetColor();
    }

    PaletteListSetColor() {
      const select = this.select;
      if (!select) return;

      for (let i = 1; i < select.options.length; i++) {
        const colors = (this.Palettes[i] || "").split("\n");
        const background = colors[4] || colors.find(Boolean);
        if (!background) continue;
        select.options[i].style.background = background;
        select.options[i].style.color = getBright(background);
      }
    }
  }

  const loadStyle = (href) => {
    const existing = [...document.styleSheets].some((sheet) => sheet.href === href);
    if (existing) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = () => {
        link.remove();
        reject(new Error("Failed to load " + href));
      };
      document.head.appendChild(link);
    });
  };

  const loadScript = (src) => {
    if (window.Neo) return Promise.resolve();

    const existing = [...document.scripts].find((script) => script.src === src);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.charset = "UTF-8";
      script.onload = resolve;
      script.onerror = () => {
        script.remove();
        reject(new Error("Failed to load " + src));
      };
      document.head.appendChild(script);
    });
  };

  const loadNeoFrom = async (base) => {
    await loadStyle(new URL("neo.css", base).href);
    await loadScript(new URL("neo.js", base).href);
    if (!window.Neo) throw new Error("Neo was not defined by " + base + "neo.js");
  };

  const ensureNeo = () => {
    if (!state.loading) {
      state.loading = (async () => {
        const errors = [];
        for (const base of NEO_BASES) {
          try {
            await loadNeoFrom(base);
            return;
          } catch (error) {
            errors.push(base + " : " + (error && error.message ? error.message : error));
          }
        }
        throw new Error("Could not load neo.js/neo.css.\n" + errors.join("\n"));
      })();
    }
    return state.loading;
  };

  const removeCurrentNeo = () => {
    const oldRoot = document.getElementById(APPNEO_ID);
    if (oldRoot) oldRoot.remove();

    const oldNeo = document.getElementById("NEO");
    if (oldNeo) oldNeo.remove();

    if (window.Neo) {
      Neo.painter = null;
      Neo.container = null;
      Neo.canvas = null;
      Neo.toolsWrapper = null;
      Neo.tools = null;
      Neo.center = null;
      Neo.applet = null;
      Neo.viewer = false;
      Neo.colorTips = [];
      Neo.toolTips = [];
      Neo.toolButtons = [];
      Neo.reserveControls = [];
    }

    state.fitManager = null;
    state.paletteManager = null;
  };

  const createPalettePanel = () => {
    return `
      <div class="appneo-palette" id="appneo-dyntools">
        <form name="Palette">
          <fieldset id="appneo-fit-exp">
            <legend>FIT!</legend>
            <input class="appneo-button" type="button" value="← FIT →" onclick="appFit(0)">
          </fieldset>
          <fieldset id="appneo-fit-comp" style="display:none;">
            <legend>FIT!</legend>
            <input class="appneo-button" type="button" value="→ FIT ←" onclick="appFit(1)">
          </fieldset>
          <fieldset>
            <legend>TOOL</legend>
            <input class="appneo-button" type="button" value="Left" onclick="Neo.setToolSide(true)">
            <input class="appneo-button" type="button" value="Right" onclick="Neo.setToolSide(false)">
            Stabilizer
            <select onchange="Neo.setStabilizeLevel(this.value)">
              <option value="0">0</option>
              <option value="1" selected>1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </fieldset>
          <fieldset>
            <legend>PALETTE</legend>
            <select class="appneo-select" name="select" size="13" onchange="setPalette()">
              <option>Temporary</option>
            </select><br>
            <input class="appneo-button" type="button" value="Save" onclick="PaletteSave()"><br>
            <input class="appneo-button" type="button" value="New" onclick="PaletteNew()">
            <input class="appneo-button" type="button" value="Update" onclick="PaletteRenew()">
            <input class="appneo-button" type="button" value="Delete" onclick="PaletteDel()"><br>
            <input class="appneo-button" type="button" value="Light+" onclick="P_Effect(10)">
            <input class="appneo-button" type="button" value="Light-" onclick="P_Effect(-10)">
            <input class="appneo-button" type="button" value="Invert" onclick="P_Effect(255)">
          </fieldset>
          <fieldset>
            <legend>MATRIX</legend>
            <select class="appneo-select" name="m_m">
              <option value="0">All</option>
              <option value="1">Current</option>
              <option value="2">Append</option>
            </select>
            <input type="button" class="appneo-button" value="GET" onclick="PaletteMatrixGet()">
            <input type="button" class="appneo-button" value="SET" onclick="PaletteMatrixSet()">
            <input type="button" class="appneo-button" value=" ? " onclick="PaletteMatrixHelp()"><br>
            <textarea class="appneo-textarea" name="setr" rows="2" cols="16" onmouseover="this.select()"></textarea>
          </fieldset>
        </form>
        <form name="grad">
          <fieldset>
            <legend>GRADATION</legend>
            <input type="button" class="appneo-button" value=" OK " onclick="ChangeGrad()">
            <br>
            <select class="appneo-select" name="p_st" onchange="GetPalette()">
              ${createOptions(14)}
            </select>
            <input class="appneo-text" type="text" name="pst" size="8" oninput="Change_()"><br>
            <select class="appneo-select" name="p_ed" onchange="GetPalette()">
              ${createOptions(14, 11)}
            </select>
            <input class="appneo-text" type="text" name="ped" size="8" oninput="Change_()">
          </fieldset>
        </form>
        <p class="appneo-credit">DynamicPalette &copy;NoraNeko</p>
      </div>
    `;
  };

  const createApplet = (sizes) => {
    const root = document.createElement("section");
    root.id = APPNEO_ID;
    root.style.margin = "12px auto";
    root.style.width = "fit-content";

    root.innerHTML = `
      <style>
        #${APPNEO_ID} .appneo-container {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 12px;
        }
        #${APPNEO_ID} .appneo-stage {
          flex: 0 0 auto;
        }
        #${APPNEO_ID} .appneo-palette {
          flex: 0 0 auto;
          max-width: 190px;
          text-align: center;
          font-size: 12px;
        }
        #${APPNEO_ID} fieldset {
          margin: 0 0 6px;
          padding: 4px;
        }
        #${APPNEO_ID} .appneo-button {
          width: auto;
          min-width: 2.8em;
          margin: 1px;
          font-size: 12px;
        }
        #${APPNEO_ID} .appneo-select,
        #${APPNEO_ID} .appneo-text,
        #${APPNEO_ID} .appneo-textarea {
          max-width: 165px;
          font-size: 12px;
        }
        #${APPNEO_ID} .appneo-credit {
          margin: 4px 0 0;
          font-size: 11px;
        }
      </style>
      <div class="appneo-container">
        <div class="appneo-stage" id="appneo-appletdummy">
          <div id="appneo-status" style="margin:8px 0;color:#800;font-weight:bold;">Loading PaintBBS NEO...</div>
          <applet-dummy name="paintbbs" width="${sizes.appletWidth}" height="${sizes.appletHeight}">
            <param name="image_width" value="${sizes.canvasWidth}">
            <param name="image_height" value="${sizes.canvasHeight}">
            <param name="thumbnail_type" value="animation">
            <param name="neo_show_right_button" value="true">
            <param name="neo_disable_grid_touch_move" value="true">
            <param name="neo_disable_turn_original_glitch" value="true">
            <param name="neo_enable_zoom_out" value="true">
            <param name="neo_emulation_mode" value="2.04">
            <param name="url_save" value="${getBoardUrl("paintpost.php")}">
            <param name="url_exit" value="${getBoardUrl("futaba.php", "?mode=paintcom")}">
          </applet-dummy>
        </div>
        ${createPalettePanel()}
      </div>
    `;

    return root;
  };

  const setStatus = (message) => {
    const status = document.getElementById("appneo-status");
    if (status) status.textContent = message;
  };

  const startNeo = async (button, options = {}) => {
    const sizes = getSizes(button);
    removeCurrentNeo();

    const root = createApplet(sizes);
    const anchor = button ? button.closest("form, table, center") : null;
    if (anchor) {
      anchor.insertAdjacentElement("afterend", root);
    } else {
      document.body.insertBefore(root, document.body.firstChild);
    }

    setStatus("Loading PaintBBS NEO files...");
    await ensureNeo();
    setStatus("Initializing PaintBBS NEO...");

    if (window.Neo && Neo.init()) {
      Neo.start();
      state.fitManager = new AppNeoFitManager(sizes);
      state.paletteManager = new AppNeoPaletteManager();
      state.paletteManager.GetPalette();
      setStatus("");
      root.scrollIntoView({ block: "start", behavior: "smooth" });
    } else {
      setStatus("Failed to start PaintBBS NEO.");
    }
  };

  const bind = () => {
    window.appneoStart = () => startNeo(findOekakiButton());

    if (!/^https:\/\/.*\.2chan\.net\/[^/?#]+\/(?:futaba|\d+)\.htm(?:[?#].*)?$/.test(location.href)) {
      return;
    }

    const button = findOekakiButton();
    if (!button || button.dataset.appneoBound === "true") return;

    button.dataset.appneoBound = "true";
    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        startNeo(button).catch((error) => {
          console.error(error);
          alert("Failed to load PaintBBS NEO.\n" + error);
        });
      },
      true,
    );

    if (window.APPNEO_AUTO_START === true) {
      startNeo(button).catch((error) => {
        console.error(error);
        alert("Failed to load PaintBBS NEO.\n" + error);
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }
})();
