import { Utils } from "../wf_Utils.js";
import { Solid } from "./wf_objs_Solid.js";

export class Dynamic extends Solid
{
	constructor(inherited = {})
	{
		super(inherited);

		this.tag = inherited.tag ?? "_Dynamic";

		this.verticies = [];
		this.normals = [];

		this.canCollide = inherited.canCollide ?? false;
		this.collisionGridCells = [];
		this.collisionTestedAgainst = [];
		
		this.ddVerticies = inherited.ddVerticies ?? false;
		this.ddBoundingBox = inherited.ddBoundingBox ?? false;
		this.ddNormals = inherited.ddNormals ?? false;
	}

	_update(dt)
	{
		this.collisionTestedAgainst = [];
		return super._update(dt);
	}

	getGridCells()
	{
		if (this.collisionGridCells.length < 1) this.updateWorldData();
		return this.collisionGridCells;
	}

	updateWorldData()
	{
		super.updateWorldData();
		this.updateWorldShape();
		this.calcCollisionGridCells();
	}
	
	updateWorldShape()
	{
		let verticies = new Array(this.shape.length);
		const normals = [];

		if (this.isEllipse)
		{
			verticies = [this.globalPositionX, this.globalPositionY];
		}
		else
		{
			for (let i = 0; i < this.shape.length; i++)
			{
				// Calculate vertex
				verticies[i] = verticies[i] ?? this.getWorldVertex(this.shape[i]);
				verticies[(i + 1) % verticies.length] = verticies[(i + 1) % verticies.length] ?? this.getWorldVertex(this.shape[(i + 1) % verticies.length]);
				let vertexOne = verticies[i];
				let vertexTwo = verticies[(i + 1) % verticies.length];

				// Calculate normals
				const dx = vertexTwo[0] - vertexOne[0];
				const dy = vertexTwo[1] - vertexOne[1];
				const normalX = -dy;
				const normalY = dx;
				const length = Math.sqrt(normalX * normalX + normalY * normalY);
				normals[i] = [(length > 0) ? normalX / length : normalX, (length > 0) ? normalY / length : normalY];
			}
		}

		this.verticies = verticies;
		this.normals = normals;
	}

	getWorldVertex(shapeIn)
	{
		const scaledX = shapeIn[0] * this.width;
		const scaledY = shapeIn[1] * this.height;
		const rotatedX = (scaledX * this.globalCos) - (scaledY * this.globalSin);
		const rotatedY = (scaledX * this.globalSin) + (scaledY * this.globalCos);
		const outX = rotatedX + this.globalPositionX;
		const outY = rotatedY + this.globalPositionY;
		return [outX, outY];
	}

	calcCollisionGridCells()
	{
		const leftX = Math.floor((this.globalPositionX - this.width * 0.5) / this.scene.gridSize);
		const rightX = Math.floor((this.globalPositionX + this.width * 0.5) / this.scene.gridSize);
		const upY = Math.floor((this.globalPositionY - this.height * 0.5) / this.scene.gridSize);
		const downY = Math.floor((this.globalPositionY + this.height * 0.5) / this.scene.gridSize);

		const distanceX = rightX - leftX;
		const distanceY = downY - upY;

		const gridCells = [];

		for (let i = 0; i < distanceX + 1; i++)
		{
			for (let j = 0; j < distanceY + 1; j++)
			{
				gridCells.push([leftX + i, upY + j]);
			}
		}

		this.collisionGridCells = gridCells;
	}

	collidedWith(collidedObject){}
	
	onClicked(){}
}