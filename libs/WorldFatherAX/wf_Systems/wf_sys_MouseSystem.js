import { BaseSystem } from "./wf_sys_BaseSystem.js";

export class MouseSystem extends BaseSystem
{
	constructor()
	{
		super("MouseSystem");
	}

	onSetup()
	{
		this.engine.canvas.addEventListener('click', this.onClick);
	}
	
	onClick = (e) =>
	{
		const x = (((e.offsetX / this.engine.scaleMod) - ((this.engine.width * 0.5) / this.engine.scaleMod)) + this.engine.currentCamera.positionX) / (this.engine.currentCamera.zoomX);
		const y = (((e.offsetY / this.engine.scaleMod) - ((this.engine.height * 0.5) / this.engine.scaleMod)) + this.engine.currentCamera.positionY) / (this.engine.currentCamera.zoomY);
		const coords = { x, y };
		this.engine.currentScene.onClick?.(coords);

		const gridSize = this.engine.currentScene.gridSize;
		const gridX = Math.floor(x / gridSize);
		const gridY = Math.floor(y / gridSize);
	}

	onDeath()
	{
		this.engine.canvas.removeEventListener('click', this.onClick);
	}
}