export class BaseSystem
{
	constructor(name)
	{
		this.name = name ?? "BaseSystem";
	}

	onSetup() { }
	onDeath() { }
}