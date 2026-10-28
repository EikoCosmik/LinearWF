import { Scene } from "./wf_Scene.js";
import { DefaultScene } from "./wf_InternalData/wf_DefaultScene.js";
import { Camera } from "./wf_Camera.js"
import * as objects from "./wf_Objects.js";
import { Utils } from "./wf_Utils.js";

export class WorldFather 
{
	constructor(containerID, screenWidth = 1440, screenHeight = 1080, screenRatio = 4 / 3)
	{
		this.container = document.getElementById(containerID);

		const canvasElement = document.createElement("canvas");
		canvasElement.id = containerID + "Canvas";
		canvasElement.style.width = "100%";
		canvasElement.style.height = "100%";
		canvasElement.style.display = "block";
		this.container.appendChild(canvasElement);

		this.canvas = this.container.querySelector("#" + containerID + "Canvas");
		this.context = this.canvas.getContext("2d");

		this.resizer = new ResizeObserver(e =>
		{
			this.resize();
		});
		this.resizer.observe(this.container);

		this.requestId = null;

		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.screenRatio = screenRatio;
		this.ratioChord = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);

		this.origin = { x: 0, y: 0 };
		this.lastTime = 0;

		this.camera = null;

		this.fullScreenHeight = this.screenHeight;
		this.fullScreenWidth = this.screenWidth;
		this.halfScreenHeight = this.screenHeight * 0.5;
		this.halfScreenWidth = this.screenWidth * 0.5;

		this.globalData = {};

		//Scenes
		this.scenes = {};
		this.currentScene = null;

		//Cameras
		this.cameras = {};
		this.currentCamera = null;

		//CollisionDetection
		this.neighbours = [];

		//InputDetection
		this.keysPressed = {};

		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);

		//MouseDetection
		this.canvas.addEventListener('click', this.onClick);
		this.currentClickObj = false;

		// Setup
		this.addScene("DefaultScene", new DefaultScene());
		this.swapScene("DefaultScene");
		this.addCamera("Default");
		this.swapCamera("Default");

		// DebugDraws (NonObjects)
		this.ddCollisionGrid = false;
		this.ddActiveCollisionCells = false;
		this.ddSceneCenterRings = false;
	}

	// Canvas

	resize()
	{
		let canvasBoundingBox = this.canvas.getBoundingClientRect();

		this.width = canvasBoundingBox.width;
		this.height = canvasBoundingBox.height;

		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.scaleMod = Math.sqrt(this.width * this.width + this.height * this.height) / this.ratioChord;
		this.screenCenter = { x: this.width * 0.5, y: this.height * 0.5 };

		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
	}

	// Rendering
	
	start()
	{
		if (!this.requestId)
		{
			this.resize();
			this.requestId = requestAnimationFrame((t) => this.renderLoop(t));
		}
		else
		{
			this.stop();
			this.start();
		}
	}

	stop()
	{
		if (this.requestId)
		{
			cancelAnimationFrame(this.requestId);
			this.requestId = null;
		}
	}

	renderLoop = (t) =>
	{
		const deltaTime = (t - this.lastTime) / 1000;
		this.lastTime = t;

		const currentScene = this.currentScene;
		const currentCamera = this.currentCamera;
		currentCamera.update();

		this.context.fillStyle = this.currentScene.backgroundColor;
		this.context.fillRect(-10, -10, this.width + 10, this.height + 10);

		this.context.save();

		this.setupGlobalCamera();

		currentScene._updateDrawObjects(deltaTime, this.context);
		//currentScene.draw(this.context);

		this.context.restore();

		this.requestId = requestAnimationFrame((t) => this.renderLoop(t));
	}

	setupGlobalCamera()
	{	
		this.context.translate(this.screenCenter.x, this.screenCenter.y);
		this.context.scale((this.currentCamera.zoomX) * this.scaleMod, (this.currentCamera.zoomY) * this.scaleMod);
		this.context.rotate(Utils.getRadians(-this.currentCamera.rotation));
		this.context.translate(-this.currentCamera.positionX, -this.currentCamera.positionY);
	}

	// Scenes

	addScene(name, scene)
	{
		scene.engine = this;
		this.scenes[name] = scene;
		scene.onSetup();
	}

	swapScene(name)
	{
		this.currentScene = this.scenes[name];
	}

	// Cameras

	addCamera(name, ovr = {})
	{
		this.cameras[name] = new Camera(name, ovr);
	}

	swapCamera(name)
	{
		this.currentCamera = this.cameras[name];
	}

	// Systems
	
	addSystem(system)
	{
		system.engine = this;
		this[system.name] = system;
		this[system.name].onSetup();
	}

	removeSystem(systemName)
	{
		this[systemName].onDeath();
		delete this[systemName];
	}

	// Input Handler

	isKeyDown(keycode)
	{
		return this["KeyInputs"].keysPressed[keycode] ?? false;
	}
}