var addressRegexp = /1[0-9A-Za-z]{20,34}/

var priceRegexp = /[\.]?[0-9][0-9\.]*/

var lexTextnode = function(el) {
    var nodes = [],
        pos = 0,
        tc = el.textContent;
    while (1) {
        var nextaddr = tc.substring(pos).match(addressRegexp),
            napos = nextaddr ? tc.indexOf(""+nextaddr[0],pos) : tc.length,
            nextprice = tc.substring(pos).match(priceRegexp),
            nppos = nextprice ? tc.indexOf(""+nextprice[0],pos) : tc.length,
            npos = Math.min(napos,nppos);
        nodes.push(document.createTextNode(tc.substring(pos,npos)));
        if (npos == tc.length) break;
        else if (npos == napos) {
            var t = document.createTextNode(""+nextaddr[0]),
                a = document.createElement('span');
            a.onclick = function() { window.localStorage.address = a.innerText; }
            a.className += " btcwallet btcwallet-address";
            a.appendChild(t);
            nodes.push(a);
            pos = npos + (""+nextaddr[0]).length;
        }
        else if (npos == nppos) {
            var t = document.createTextNode(""+nextprice[0]),
                a = document.createElement('span');
            a.className += " btcwallet btcwallet-price";
            a.onclick = function() { window.localStorage.price = a.innerText; }
            a.appendChild(t);
            nodes.push(a);
            pos = npos + (""+nextprice[0]).length;
        }
    }
    return nodes;
}


var mkactive = function(el,depth) {
    if (depth < 0) return [];
    if (el.nodeType == 3) {
        var nodes = lexTextnode(el);
        if (nodes.length > 1) {
            var p = el.parentNode;
            for (var i = 0; i < nodes.length; i++) {
                p.insertBefore(nodes[i],el);
            }
            p.removeChild(el);
            return Array.prototype.slice.call(nodes);
        }
        return [el];
    }
    else if (el.nodeType == 1) {
        if (el.className.indexOf("btcwallet") > -1) {
            var target = el.className.indexOf("btcwallet-address") > -1 
                            ? 'address'
                            : 'price';
            el.old_onclick = el.onclick;
            el.onclick = function(t) { 
                return function() { window.localStorage[t] = el.innerText; }
            }(target);
            el.oldBackground = el.style.background;
            el.style.background = "#fff";
            return [el];
        }
        else { 
            var r = Array.prototype.slice.call(el.childNodes)
                 .map(function(nd) { return mkactive(nd,depth-1) })
                 .reduce(function(a,b) { return a.concat(b); },[]);
            return r;
        }
    }
    else return [];
}
var mkdormant = function(el) {
    if (el.nodeType != 1) return;
    if (el.className.indexOf("btcwallet") >= 0) {
        el.onclick = el.old_onclick;
        el.style.background = el.oldBackground;
    }
}

var oldmousemove = document.onmousemove || function(){};
var lastNode = null,
    lastChangedNodes = [];
document.onmousemove = function(e) {
    if (e.target !== lastNode) {
        lastChangedNodes.map(mkdormant);
        lastChangedNodes = mkactive(e.target,2);
        lastNode = e.target;
    }
    oldmousemove(e);
}

var wls = window.localStorage,
    el = function(id) { return document.getElementById(id) }

delete wls.price;
delete wls.address;

var inWallet = '<table><tr><td colspan="2"><input type="text" id="address"></input></td></tr><tr><td><input type="text" style="width:100px" id="price"></input></td><td><input type="button" id="send" class="btn" style="position: relative; top: -4px; color: #000" value="Send"></input></td></tr></table>';

var wallet = window.wallet = document.createElement('div');
wallet.style.position = "fixed";
wallet.style.zIndex = 1000;
wallet.style.top = 0;
wallet.style.right = 0;
wallet.style.height = '80px';
wallet.style.width = '220px';
wallet.style.display = 'none';
wallet.id = 'wallet';
wallet.innerHTML = inWallet;
document.body.appendChild(wallet);

var lastaddress, lastprice;

el("send").onkeypress = function() {
    alert("Sending transaction");
}
el("price").onkeypress = function() {
    if (el("price").value) lastprice = wls.price = el("price").value || "";
}

el("address").onkeypress = function() {
    if (el("address").value) lastaddress = wls.address = el("address").value || "";
}


setInterval(function() {
    if (wls.address || wls.price) {
        wallet.style.display = 'block';
    }
    if (lastaddress != wls.address) {
        el("address").value = wls.address || "";
        lastaddress = wls.address;
    }
    if (lastprice != wls.price) {
        el("price").value = wls.price || "";
        lastprice = wls.price;
    }

},100);


