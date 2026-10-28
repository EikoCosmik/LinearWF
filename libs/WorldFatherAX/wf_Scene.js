import { ClickObject } from "./wf_Objects.js";

export class Scene
{
	constructor()
	{
		this.importantObjs = {};
		this.layers = 
		{
			grids: [],
			back1: [],
			back2: [],
			hind: [],
			main: [],
			fore: [],
			ui1: [],
			ui2: [],
			ui3: []
		}
		this.collisionGrid = {};
		this.gridSize = 100;
		this.startTime = Date.now();
		this.backgroundColor = "#ff00ff";
		this.unresolvedClick = false;
		this.curClick = false;
		this.lastClicked = false;
	}

	addObject(obj, opts)
	{
		obj.scene = this;
		obj.engine = this.engine;
		const {layer = "main", name = false} = {} = opts ?? {};
		if(name != false)
		{
			this.importantObjs[name] = obj;
			obj.importantName = name;
		}
		this.layers[layer].push(obj);
		obj.onSetup();
	}

	_updateDrawObjects(dt, ctx)
	{
		this.update(dt, ctx);

		if(this.engine.ddCollisionGrid)
		{
			ctx.strokeStyle = "white";
			const gridsLength = 1000;

			for(let i = 0; i < 10; i++)
			{
				ctx.beginPath();
				ctx.moveTo(this.gridSize * i, gridsLength);
				ctx.lineTo(this.gridSize * i, -gridsLength);
				ctx.moveTo(-this.gridSize * i, gridsLength);
				ctx.lineTo(-this.gridSize * i, -gridsLength);
				ctx.moveTo(gridsLength, this.gridSize * i);
				ctx.lineTo(-gridsLength, this.gridSize * i);
				ctx.moveTo(gridsLength, -this.gridSize * i);
				ctx.lineTo(-gridsLength, -this.gridSize * i);				
				ctx.stroke();
			}
		}

		if (this.engine.ddSceneCenterRings)
		{
			const count = 15;
			const colChange = 255 / count;

			for (let i = 1; i <= count; i++)
			{
				const curColStep = colChange * i;
				ctx.strokeStyle = `#${(255 - curColStep).toString(16)}${curColStep.toString(16)}ff`;
				ctx.beginPath();
				ctx.arc(0, 0, (this.gridSize * i) - 50, 0, 2 * Math.PI);
				ctx.stroke();
			}
		}

		if (this.engine.ddSceneCenter)
		{
			ctx.fillStyle = "cyan";
			ctx.beginPath();
			ctx.arc(0,0,25,0,2*Math.PI);
			ctx.fill();
		}

		this.collisionGrid = {}; 
		if (this.importantObjs["_ClickObject"]) this.engine.CollisionDetection.updateCollisionGrid?.(this.importantObjs["_ClickObject"], this.collisionGrid)
		for (let key in this.layers)
		{
			for (let i = this.layers[key].length - 1; i > -1; i--)
			{
				const object = this.layers[key][i];
				if (!object._update(dt))
				{
					this.layers[key].splice(i, 1);
					if(this.importantObjs[object.importantName]) delete this.importantObjs[object.importantName];
					object.onDeath();
					continue;
				}
				if (object.canCollide) this.engine.CollisionDetection.updateCollisionGrid?.(object, this.collisionGrid);
				object._draw(ctx);
			};
		}
		if (this.collisionGrid != {}) this.engine.CollisionDetection.testCollisionGrid?.(this.collisionGrid);
		this.lastClicked.onClicked?.();
		this.lastClicked = false;
	}

	update() { }

	onSetup() { }

	onClick(coords)
	{
		this.addObject(new ClickObject({ positionX: coords.x, positionY: coords.y, width: 1, height: 1 }), { name: "_ClickObject" });
	}
}