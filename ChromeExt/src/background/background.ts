import {MyServices} from "../services/MyServices"
import {MyModel} from "../models/MyModel"

function polling() {
    console.log('background');
    setTimeout(polling, 1000 * 30);
	MyServices.sayHello("Hello");
	MyModel.getInstance().sayHi();
}

polling();

