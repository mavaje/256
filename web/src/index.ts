import {WebMain} from "../main";

WebMain.ready().then(async () => {
    const canvas = document.createElement('canvas');
    document.body.append(canvas);

    const main = new WebMain(canvas);

    main.start();

});
