export class Camera
{
	constructor(name, inherited = {})
	{
		this.name = name;
		this.positionX = inherited.positionX ?? 0;
		this.positionY = inherited.positionY ?? 0;
		this.rotation = inherited.rotation ?? 0;
		this.zoomX = inherited.zoomX ?? 1;
		this.zoomY = inherited.zoomY ?? 1;
		this.following = false;
	}

	update()
	{
		if(this.following)
		{
			this.positionX = this.following.positionX;
			this.positionY = this.following.positionY;
			this.rotation = this.following.rotation;
			this.zoomX = this.following.scaleX;
			this.zoomY = this.following.scaleY;
		}
	}

	follow(obj)
	{
		this.following = obj;
	}
}