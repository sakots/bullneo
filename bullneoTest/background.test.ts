// Run on bullneoTest/index.html with the pinned NEO build before loading bullneo.js.
export const neoBase =
  "https://cdn.jsdelivr.net/gh/funige/neo@e6af093d4d06d187208be68eb5eb6c6112a2520c/dist/";

export async function runBackgroundRegression(target: Window = window) {
  // This page has loaded the real NEO and BULLNEO browser APIs.
  const app = target as typeof window & {
    Neo: {
      painter: {
        destCanvas: HTMLCanvasElement;
        canvasCtx: CanvasRenderingContext2D[];
        canvasWidth: number;
        canvasHeight: number;
        updateDestCanvas(
          x: number,
          y: number,
          width: number,
          height: number,
          useTemp: boolean,
        ): void;
      };
    };
    BullNeo: { open(): Promise<void> };
  };
  await app.BullNeo.open();
  const document = target.document;
  const painter = app.Neo.painter;
  const expected = [241, 224, 216, 255];
  const results: { name: string; actual: number[]; expected: number[] }[] = [];
  const check = (
    name: string,
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    color = expected,
  ) => {
    const actual = Array.from(
      canvas.getContext("2d")!.getImageData(x, y, 1, 1).data,
    );
    results.push({ name, actual, expected: color });
  };

  check("new canvas", painter.destCanvas, 20, 20);
  // Draw on the actual NEO layer, exercising compositing rather than mocking it.
  painter.canvasCtx[0].fillStyle = "#ff0000";
  painter.canvasCtx[0].fillRect(40, 40, 8, 8);
  painter.updateDestCanvas(
    0,
    0,
    painter.canvasWidth,
    painter.canvasHeight,
    false,
  );
  check("drawn screen pixel", painter.destCanvas, 44, 44, [255, 0, 0, 255]);

  const submit = document.getElementById("neo-submit")!;
  submit.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  const baseform = document.getElementById("baseform")!;
  const image = new Image();
  image.src = "data:image/png;base64," + baseform.getAttribute("value");
  await image.decode();
  const png = document.createElement("canvas");
  png.width = image.naturalWidth;
  png.height = image.naturalHeight;
  png.getContext("2d")!.drawImage(image, 0, 0);
  check("submitted PNG background", png, 20, 20);
  check("submitted PNG drawing", png, 44, 44, [255, 0, 0, 255]);

  await app.BullNeo.open();
  const clear = Array.from(document.querySelectorAll("button")).find(
    (button) => button.textContent === "クリア",
  )!;
  clear.click();
  check("cleared drawing", painter.destCanvas, 44, 44);
  check("cleared background", painter.destCanvas, 20, 20);

  const failures = results.filter((result) =>
    result.actual.some((value, index) => value !== result.expected[index]),
  );
  if (failures.length) throw new Error(JSON.stringify(failures));
  return results;
}
