import { BaseSystem } from "./wf_sys_BaseSystem.js";

export class KeyInputs extends BaseSystem
{
	constructor()
	{
		super("KeyInputs");
		this.keysPressed = {};
	}

	onSetup()
	{
		this.engine.isKeyDown = (key) =>
		{
			return this.keysPressed[key];
		};

		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
	}

	onKeyDown = (e) =>
	{
		this.keysPressed[e.code] = true;
	}

	onKeyUp = (e) =>
	{
		delete this.keysPressed[e.code];
	}

	onDeath()
	{
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
		delete this.engine.isKeyDown;
	}
}