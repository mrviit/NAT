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
    public sayHi(name: string): void {
        console.log("Model say hi " + name);
    }
}