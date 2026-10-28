import { BaseSystem } from "./wf_sys_BaseSystem.js";
import { Utils } from "../wf_Utils.js";

export class CollisionDetection extends BaseSystem
{
	constructor()
	{
		super("CollisionDetection");
	}

	updateCollisionGrid(object, collisionGrid)
	{
		const objectCells = object.getGridCells();

		for (let j = 0; j < objectCells.length; j++)
		{
			let cellString = `${objectCells[j]}`;
			if (!collisionGrid[cellString]) collisionGrid[cellString] = [objectCells[j], [object]];
			else if (!collisionGrid[cellString].includes(object)) collisionGrid[cellString][1].push(object);
		}
	}

	testCollisionGrid(collisionGrid)
	{
		for (let key in collisionGrid)
		{
			const cellPosition = collisionGrid[key][0];
			const neighbours = this.getCollisionNeighbours(cellPosition, collisionGrid);

			if (neighbours.length > 1)
			{
				this.testNeighbourCells(neighbours)
			}
		}
	}

	getCollisionNeighbours(cellPosition, collisionGrid)
	{
		const tempNeightbours = [];

		for (let i = -1; i < 2; i++)
		{
			const neighbourX = cellPosition[0] + i;
			for (let j = -1; j < 2; j++)
			{
				const neighbourY = cellPosition[1] + j;
				const neighbourCellKey = `${[neighbourX, neighbourY]}`;
				const neighbourCell = collisionGrid[neighbourCellKey];

				this.engine.context.fillStyle = "magenta";

				if (neighbourCell)
				{
					this.engine.context.fillStyle = "cyan";
					for (let k = 0; k < neighbourCell[1].length; k++)
					{
						const object = neighbourCell[1][k];
						if (!tempNeightbours.includes(object)) tempNeightbours.push(object);
					}
				}

				if (this.engine.ddActiveCollisionCells)
				{
					const posX = neighbourX * this.engine.currentScene.gridSize + 50;
					const posY = neighbourY * this.engine.currentScene.gridSize + 50;
					this.engine.context.beginPath();
					this.engine.context.arc(posX, posY, this.engine.currentScene.gridSize * 0.25, 0, 2 * Math.PI);
					this.engine.context.fill();
				}
			}
		}

		return tempNeightbours;
	}

	testNeighbourCells(neighbours)
	{
		for (let i = 0; i < neighbours.length; i++)
		{
			for (let j = 0; j < neighbours.length; j++)
			{
				const object1 = neighbours[i];
				const object2 = neighbours[j];
				if (object1.id == object2.id) continue;
				if (object1.collisionTestedAgainst.includes(object2)) continue;
				const isColliding = this.isColliding([object1, object2]);
				object1.collisionTestedAgainst.push(object2);
				object2.collisionTestedAgainst.push(object1);
				if (isColliding) 
				{
					object1.collidedWith?.(object2);
					object2.collidedWith?.(object1);
				}
			}
		}
	}

	isColliding(objectPair)
	{
		if (!objectPair[0].isEllipse && !objectPair[1].isEllipse)
		{
			for (let i = 0; i < 2; i++)
			{
				for (let j = 0; j < objectPair[i].normals.length; j++)
				{
					let max = [-Infinity, -Infinity];
					let min = [Infinity, Infinity];
					let normal = [...objectPair[i].normals[j]];

					for (let k = 0; k < objectPair.length; k++)
					{
						for (const vertex of objectPair[k].verticies)
						{
							let dotProduct = normal[0] * vertex[0] + normal[1] * vertex[1];
							if (dotProduct > max[k]) max[k] = dotProduct;
							if (dotProduct < min[k]) min[k] = dotProduct;
						};
					}
					if (!(max[0] >= min[1] && max[1] >= min[0])) return false;
				}
			}
			return true;
		}
		else
		{
			const bothEllipse = objectPair[0].isEllipse && objectPair[1].isEllipse;
			const ellipse = objectPair[0].isEllipse ? objectPair[0] : objectPair[1];
			const box = objectPair[0].isEllipse ? objectPair[1] : objectPair[0];
			const verticies = (box.isEllipse) ? Utils.getPointsOnEllipsis(box, 16) : box.verticies;
			
			const inverseRadiusX = 1 / (ellipse.width * 0.5);
			const inverseRadiusY = 1 / (ellipse.height * 0.5);

			let inside = false;

			for (let i = 0, j = verticies.length - 1; i < verticies.length; j = i++)
			{
				const x1 = (bothEllipse) ? (verticies[i][0] - ellipse.globalPositionX) + box.globalPositionX : (verticies[i][0] - ellipse.globalPositionX);
				const y1 = (bothEllipse) ? (verticies[i][1] - ellipse.globalPositionY) + box.globalPositionY : (verticies[i][1] - ellipse.globalPositionY);
				const x2 = (bothEllipse) ? (verticies[j][0] - ellipse.globalPositionX) + box.globalPositionX : (verticies[j][0] - ellipse.globalPositionX);
				const y2 = (bothEllipse) ? (verticies[j][1] - ellipse.globalPositionY) + box.globalPositionY : (verticies[j][1] - ellipse.globalPositionY);
				const xi = (x1 * ellipse.cos + y1 * ellipse.sin) * inverseRadiusX;
				const yi = (y1 * ellipse.cos - x1 * ellipse.sin) * inverseRadiusY;
				const xj = (x2 * ellipse.cos + y2 * ellipse.sin) * inverseRadiusX;
				const yj = (y2 * ellipse.cos - x2 * ellipse.sin) * inverseRadiusY;
				const dx1 = xj - xi;
				const dy1 = yj - yi;

				if ((yi > 0 !== yj > 0) && (0 < dx1 * -yi / dy1 + xi)) inside = !inside;

				const t = Math.max(0, Math.min(1, (-xi * dx1 + -yi * dy1) / (dx1 * dx1 + dy1 * dy1)));
				const dx2 = xi + dx1 * t;
				const dy2 = yi + dy1 * t;

				if (dx2 * dx2 + dy2 * dy2 <= 1) return true;
			}

			return inside;
		}
	}
}