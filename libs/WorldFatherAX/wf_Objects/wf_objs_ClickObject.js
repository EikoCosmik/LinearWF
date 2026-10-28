import { Dynamic } from "./wf_objs_Dynamic.js";
import { Empty } from "./wf_objs_Empty.js";

export class ClickObject extends Dynamic
{
	constructor(inherited)
	{
		super(inherited);
		this.tag = "_ClickObject";
		this.isLive = false;
		this.canCollide = true;
	}

	collidedWith(collidedObject)
	{
		this.scene.lastClicked = collidedObject;
	}
}