import { DevObj, DivObject, Empty, Grid, Solid } from "../WorldFatherAX/wf_Objects.js";
import { Scene } from "../WorldFatherAX/wf_Scene.js";
import { Utils } from "../WorldFatherAX/wf_Utils.js";
import { baseEnemy, statBar, levelPlayer, verticalStatBar, playerReloadBar } from "./LWF_Objects.js";

export class BaseLevel extends Scene
{
	constructor()
	{
		super();
		this.backgroundColor = "#000000";
		this.enemySpawnDelay = 5000;
		this.lastEnemySpawn = this.enemySpawnDelay;
	}

	onSetup()
	{
		//Testing
		this.addObject(new Solid({ color: "#ff00ff11", width: this.engine.fullScreenWidth, height: this.engine.fullScreenHeight }), { layer: "back1"});
		this.addObject(new Empty({ scaleX: 0.75 , scaleY: 0.75}), { name: "cameraTarget" });

		//Player
		this.addObject(new levelPlayer({dDraw: true, ddCross: true}), { name:"player" });

		//Camera
		//this.addObject(new Empty(), { name: "cameraTarget" });
		this.engine.addCamera("baseLevelCam");
		this.engine.swapCamera("baseLevelCam");
		this.engine.currentCamera.follow(this.importantObjs["cameraTarget"]);

		//StatGrid
		this.addObject(new Grid({
			gridRows: ["1fr", "1fr"],
			gridColumns: ["1fr"],
			gridGap: 20,
			width: 300,
			height: 180,
			positionX: -this.engine.halfScreenWidth + 170,
			positionY: -this.engine.halfScreenHeight + 110
		}), {name: "statGrid"}, { layer: "ui1" });

		//WeaponGrid
		this.addObject(new Grid({
			gridRows: ["1fr"],
			gridColumns: ["1", "1fr", "5fr", "10fr", "5fr", "1fr", "1"],
			gridGap: 10,
			useParentSize: true,
			padding: 10
		}), {name: "weaponGrid"});
		this.importantObjs["statGrid"].getCellReference(1,0).adoptChild(this.importantObjs["weaponGrid"]);

		this.addObject(new DivObject({
			useBackground: true,
			backgroundColor: "#00FFEE1a",
			borderColor: "#00FFEE5a",
			borderWidth: 5,
			borderRadius: 15,
			useParentSize: true
		}), { name: "weaponBackground", layer: "ui2" });
		this.importantObjs["weaponGrid"].adoptChild(this.importantObjs["weaponBackground"]);

		//HealthGrid
		this.addObject(new Grid({
			gridRows: ["1fr", "3fr"],
			gridColumns: ["1", "1fr", "1"],
			gridGap: 10,
			padding: 10,
			useParentSize: true
		}), { name: "healthShieldGrid" });
		this.importantObjs["statGrid"].getCellReference(0,0).adoptChild(this.importantObjs["healthShieldGrid"]);

		this.addObject(new DivObject({
			useBackground: true,
			backgroundColor: "#00FFEE1a",
			borderColor: "#00FFEE5a",
			borderWidth: 5,
			borderRadius: 15,
			useParentSize: true
		}), { name: "statBackground", layer: "ui1" });
		this.importantObjs["statGrid"].getCellReference(0,0).adoptChild(this.importantObjs["statBackground"]);

		this.addObject(new statBar({
			useParentSize: true,
			color: "lime"
		}), { name: "healthBar", layer: "ui3" })
		this.importantObjs["healthShieldGrid"].getCellReference(1,1).adoptChild(this.importantObjs["healthBar"]);
		
		this.addObject(new Solid(
		{
			color: "red",
			useParentSize: true
		}), { name: "healthBarBack", layer: "ui2" })
		this.importantObjs["healthShieldGrid"].getCellReference(1,1).adoptChild(this.importantObjs["healthBarBack"]);

		this.addObject(new statBar(
		{
			useParentSize: true,
			color: "cyan"
		}), { name: "shieldBar", layer: "ui3" })
		this.importantObjs["healthShieldGrid"].getCellReference(0,1).adoptChild(this.importantObjs["shieldBar"]);

		this.addObject(new Solid(
		{
			color: "blue",
			useParentSize: true
		}), { name: "shieldBarBack", layer: "ui2" })
		this.importantObjs["healthShieldGrid"].getCellReference(0,1).adoptChild(this.importantObjs["shieldBarBack"]);

		this.addObject(new Solid(
		{
			color: "cyan",
			useParentSize: true
		}), { name: "weapon1Icon", layer: "ui2" });
		this.importantObjs["weaponGrid"].getCellReference(0,3).adoptChild(this.importantObjs["weapon1Icon"]);

		this.addObject(new Solid(
		{
			color: "red",
			useParentSize: true
		}), { name: "weapon2Icon", layer: "ui2" });
		this.importantObjs["weaponGrid"].getCellReference(0,4).adoptChild(this.importantObjs["weapon2Icon"]);

		this.addObject(new Solid(
		{
			color: "lime",
			useParentSize: true
		}), { name: "weapon3Icon", layer: "ui2" });
		this.importantObjs["weaponGrid"].getCellReference(0,2).adoptChild(this.importantObjs["weapon3Icon"]);
		

		//ReloadBars
		this.addObject(new verticalStatBar(
		{
			useParentSize: true,
			color: "yellow",
			isInverted: true
		}), { name: "reloadBar1", layer: "ui3" })
		this.importantObjs["weaponGrid"].getCellReference(0,1).adoptChild(this.importantObjs["reloadBar1"]);

		this.addObject(new verticalStatBar(
		{
			useParentSize: true,
			color: "yellow",
			isInverted: true
		}), { name: "reloadBar2", layer: "ui3" })
		this.importantObjs["weaponGrid"].getCellReference(0,5).adoptChild(this.importantObjs["reloadBar2"]);

		//PlayerReloadBars
		this.addObject(new playerReloadBar(
		{
			color: "yellow",
			isInverted: true,
			parentAsReference: true,
			initialHeight: 25,
			height: 25,
			width: 5,
			xBias: -20,
			yBias: -6
		}), { name: "playerReloadBar1", layer: "ui3" })
		this.importantObjs["player"].adoptChild(this.importantObjs["playerReloadBar1"]);

		this.addObject(new playerReloadBar(
		{
			color: "yellow",
			isInverted: true,
			parentAsReference: true,
			initialHeight: 25,
			height: 25,
			width: 5,
			xBias: 20,
			yBias: -6
		}), { name: "playerReloadBar2", layer: "ui3" })
		this.importantObjs["player"].adoptChild(this.importantObjs["playerReloadBar2"]);
		
	}

	swapWeaponIcons(curNum)
	{
		this.importantObjs["weapon1Icon"].leaveParent();
		this.importantObjs["weapon2Icon"].leaveParent();
		this.importantObjs["weapon3Icon"].leaveParent();
		this.importantObjs["weaponGrid"].getCellReference(0, Utils.forceMod(1 - curNum, 3)+2).adoptChild(this.importantObjs["weapon1Icon"]);
		this.importantObjs["weaponGrid"].getCellReference(0, Utils.forceMod(2 - curNum, 3)+2).adoptChild(this.importantObjs["weapon2Icon"]);
		this.importantObjs["weaponGrid"].getCellReference(0, Utils.forceMod(0 - curNum, 3)+2).adoptChild(this.importantObjs["weapon3Icon"]);
		
	}

	update()
	{
		if (Utils.timeSince(this.lastEnemySpawn) > this.enemySpawnDelay)
		{
			this.lastEnemySpawn = Date.now();
			const spawn = this.getSpawnLocation();
			this.addObject(new baseEnemy({ positionX: spawn.x, positionY: spawn.y, rotation: 90 }))
		}
	}

	getSpawnLocation(zone = 0)
	{
		switch(zone)
		{
			case 0:
				return {x: Utils.getRandomFloat(-this.engine.halfScreenWidth + 100, this.engine.halfScreenWidth - 100), y: -this.engine.halfScreenHeight - 250};
		}
	}
}