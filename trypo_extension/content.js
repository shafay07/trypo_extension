/*
Extensions that read or write to web pages utilize a content script.
The content script contains JavaScript that executes in the contexts of a page 
that has been loaded into the browser.Content scripts read and modify the DOM of 
web pages the browser visits.
*/


//once the webpage loads execute main
window.onload = (function main() {
    console.log("content.js loaded");
    imgs = document.getElementsByTagName('img');
     for (i = 0; i < imgs.length; i++) {
        imgs[i].style.filter = 'blur(50px)' //for all static webpage images
    }
    imgs = load_imgs(debug = 'static');
    console.log(imgs);
    for (i = 0; i < imgs[0].length; i++) {
        source = imgs[0][i];
        elem = imgs[1][i];
        back_request(source, elem);
    }
    //observe for additional loading images
    mutation_obsv();

});


//to load images
function load_imgs(debug) {
    //for onload images of a webpage
    if (debug == 'static') {
        imgs = document.getElementsByTagName('img');
        var imgSrcs = [];
        var img_elem = [];
        for (var i = 0; i < imgs.length; i++) {
            imgSrcs.push(imgs[i].src);
            img_elem.push(imgs[i]);

        }
        return [imgSrcs, img_elem];
    }
}

//send request to background script,takes image elem ref as input
function back_request(elem_ref,elem) {
    chrome.runtime.sendMessage({
        get_predict: "predict",
        img_src: elem_ref
    }, function (response) {
        //console.log('callback called');
        predict = response.prediction_model;
        console.log(predict);
        if(predict === 'normal'){
            elem.style.filter = 'blur(0px)';
        }
    });
}

//mutationObserver for dynamic image loading
function mutation_obsv() {
    obs = new window.MutationObserver(function (mutations, observer) {
        for (var mutation of mutations) {
            if (mutation.addedNodes.length) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var nodek = mutation.addedNodes[i];
                    if (nodek.getElementsByTagName) {
                        for (var img of nodek.getElementsByTagName('img')) {
                            //console.log("mutattion_obsv called");
                            img.style.filter = 'blur(50px)';
                            img_source = img.dataset.src;
                            //console.log('img source', img_source);
                            back_request(img_source, img);
                        }
                    }
                }
            }
        }
    })
    // have the observer observe foo for changes in children
    obs.observe(document.body, {childList: true,subtree: true})
}