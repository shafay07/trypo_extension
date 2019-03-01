/*The background script is the extensions event handler; it contains listeners for browser events 
that are important to the extension. It lies dormant until an event is fired then performs the 
instructed logic. An effective background script is only loaded when it is needed and unloaded when it goes idle.
*/


let model;
var status;
(async function () {
    model = await tf.loadModel('converted_model/mobo_netv2_updt/model.json');
    console.log('model loaded');
})(); //called as soon as declared

//pre process the image
function pre_process(image) {
    tensor = tf.fromPixels(image)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();
    //console.log(tensor);
    return tensor;
}

//create img on html
function create_img(source) {
    return new Promise(resolve => {
        var img = document.createElement('img');
        img.crossOrigin = "anonymous";
        img.onload = function (e) {
            resolve(img);
        }
        img.src = source;
    });
}

//message listner for the prediction
chrome.runtime.onMessage.addListener(
    function handle_msg(request, sender, sendResponse) {
        var result;
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.get_predict == "predict") {
            img_source = request.img_src;
            let image_created = create_img(img_source);
            image_created.then((img_cre) => {
                tensor = pre_process(img_cre);
                let ans = model.predict(tensor).data();
                ans.then((ans) => {
                    console.log("From predict :" + ans);
                    if (ans[0] > ans[1]) {
                        result = 'trypophobic';
                    } 
                    else if (ans[1] > ans[0]) {
                        result = 'normal';
                    }
                    else{
                        result = 'Not predicted';
                    }
                    console.log(result);
                    sendResponse({
                        prediction_model: result
                    });
                });
            });
        }
        return true; //keeps the port open for async call for sendResponse
    });