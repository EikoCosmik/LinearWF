import { Scene } from "../wf_Scene.js";
import { Utils } from "../wf_Utils.js";
import * as objects from "../wf_Objects.js";

export class DefaultScene extends Scene
{
	constructor()
	{
		super();
		this.backgroundColor = "#2a0909";
	}

	onSetup()
	{
		this.addObject(new objects.Grid({
			gridColumns: ["1fr"],
			gridRows: ["3fr", "4fr"],
			width: this.engine.fullScreenWidth,
			height: this.engine.fullScreenHeight,
			padding: 50,
			gridGap: 25
		}), { layer: "grids", name: "menuGrid" });

		//Logo
		this.addObject(new objects.ImageObject({
			aspectRatio: 1,
			imageSrc: "./libs/WorldFatherAX/wf_InternalData/LogoWhite_Large.png",
			useParentSize: true
		}), { name: "logoImage", layer: "ui2" });
		this.importantObjs["menuGrid"].getCellReference(0, 0).adoptChild(this.importantObjs["logoImage"]);

		//Text Div Background
		this.addObject(new objects.DivObject({
			useParentSize: true,
			backgroundColor: "#0a0a0a",
			borderColor: "#9a2121",
			borderWidth: 10,
			borderRadius: 15
		}), { name: "background", layer: "ui1" });
		this.importantObjs["menuGrid"].getCellReference(1, 0).adoptChild(this.importantObjs["background"]);

		//Text Div Grid
		this.addObject(new objects.Grid({
			drawCells: false,
			gridColumns: ["1fr"],
			gridRows: ["75", "25", "1fr"],
			useParentSize: true,
			padding: 10,
			gridGap: 15
		}), { layer: "ui2", name: "textGrid" });
		this.importantObjs["background"].adoptChild(this.importantObjs["textGrid"]);

		//Text Title
		this.addObject(new objects.TextObject({
			useParentSize: true,
			text: "WorldFather2D Javascript Rendering Engine",
			fontSize: 30
		}), { name: "title", layer: "ui2" });
		this.importantObjs["textGrid"].getCellReference(0, 0).adoptChild(this.importantObjs["title"]);
		
		//Text Description
		this.addObject(new objects.TextObject({
			useParentSize: true,
			textAlign: "left",
			text: "This is some text for the description of WorldFather2D."
		}), { name: "desc", layer: "ui2" });
		this.importantObjs["textGrid"].getCellReference(1, 0).adoptChild(this.importantObjs["desc"]);
	}
}