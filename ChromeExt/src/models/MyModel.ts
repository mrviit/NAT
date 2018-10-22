export class MyModel {
    private static instance: MyModel;
    private constructor() {
    }
    static getInstance() {
        if (!MyModel.instance) {
            MyModel.instance = new MyModel();
        }
        return MyModel.instance;
    }
    public sayHi(): void {
        console.log("Model say hi");
    }
}