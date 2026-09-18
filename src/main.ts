/** POC for https://github.com/abi83/interns/ **/
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./canvas";

const canvas = document.querySelector<HTMLCanvasElement>("#game");

if (!canvas) {
  throw new Error("Missing #game canvas element");
}

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
