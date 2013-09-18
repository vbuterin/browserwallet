var wls = window.localStorage,
    el = function(id) { return document.getElementById(id) }

window.onload = function() {

el("send").onkeypress = function() {
    alert("Sending transaction");
}
el("price").onkeypress = function() {
    if (el("price").value) lastprice = wls.price = el("price").value || "";
}

el("address").onkeypress = function() {
    if (el("address").value) lastaddress = wls.address = el("address").value || "";
}

var lastaddress, lastprice;

console.log(123);
chrome.runtime.onMessage.addListener(function(request) {
    el("wallet").style.display = 'block';
    if (lastaddress != request.address) {
        el("address").value = request.address || "";
        lastaddress = request.address;
    }
    if (lastprice != request.price) {
        el("price").value = request.price || "";
        lastprice = request.price;
    }
});

}
