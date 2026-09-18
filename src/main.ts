/** POC for https://github.com/abi83/interns/ **/
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./canvas";
import { renderMaze } from "./render";

const canvas = document.querySelector<HTMLCanvasElement>("#game");

if (!canvas) {
  throw new Error("Missing #game canvas element");
}

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const context = canvas.getContext("2d");

if (!context) {
  throw new Error("Could not get 2D context for #game canvas");
}

renderMaze(context);
