function evalDoesntLikeStrictMode(v,eq) {
    let info = "";
    try { eval("with (v) { info = (" + eq + ")}"); } 
    catch(e) { info = undefined; } 
    finally { return info; }
}

"use strict";

let APP = {};
APP.tab = [];
APP.buttons = [];
APP.textOfElements = [];
APP.tabMemo = [];
APP.tabMemoValues = {};
APP.query = ""; 
APP.editingMode = true;
APP.tabOn = -1;
APP.section = document.querySelector("section");
APP.div = document.querySelectorAll("div");
APP.timer = null;
APP.interval = 200;
APP.sending = false;
APP.events = {
    control: ["keyup","keydown"],
    load: ["load"],
    edit: ["click", "input","keyup"]
};
APP.editFunctions = ["gpio", "equation","typ", "id", "key", "event", "change", "range"];
APP.typ = ["onOf", "read", "servo"];
APP.change = ["onOf","fade"];
APP.textOfElements[0] = [["span","x"],["input",["GPIO","equation","typ"]],["span",""]];
APP.textOfElements[1] = [["span","x"],["input",["id","key", "event","change behaviour", "range"]],["span",""]];

APP.firesThisProgram = function() { APP.addEvents(); };
APP.insertNavigationButtons = function() {
    [0,0,1,2].forEach((e,i)=> {
        APP.buttons.push( insert({prt: APP.div[e], typ: "button", text: i? "add" : "save" }));
    });
    APP.buttons.forEach((e,i)=>{ (i-1)? (e.style.display = "none") : true; });
};
APP.addEvents = function() {
    for(let i in APP.events) {
        if(!APP.events.hasOwnProperty(i)) return;
        APP.events[i].forEach(e => {(e === "load"? window : document).addEventListener(e, window[i], true);});
    }
}; 
APP.startAjax = function() {
    APP.timer = setInterval(APP.ajax,APP.interval);        
}   
APP.ajax = function() {
    function call() {
        APP.sending = true;

        return new Promise((a,b)=>{
            let response = [];
            try {
              /*  let xhr = new XMLHttpRequest();
                xhr.ontimeout = function () {
                    response[3] = "times out"
                };
                xhr.onreadystatechange = function(e) {
                    if(e.readyState === 4) {
                        if(e.status === 200) response[0] = e.responseText; //ex: 13w233x12w5x4w0... so: GPIOwVALUExGPIOwVALUE...
                        else response[3] = e.statusText;  
                    }
                };
                xhr.timeout = 2000;
                xhr.open("POST","website",true);
                xhr.send(APP.query); // ex. Sgp1weonOfgp2wereadgp3wereadgp4weonOf... so: SgpGPIOweVALUEgpGPIOweVALUE
                */
                response[0] = "2w" + Math.floor(Math.random() *100) + "x3w" + Math.floor(Math.random() *100);
            } catch(e) {
                response[1] = "error";
            } finally {
                if(response[1] !== "error" || !!response[0]) a(response);
                else b("failed");
            }
        });                
    }
    if(!APP.sending) {
        call().then(e=>{
            APP.sending = false;
            setTimeout(writeScreen(e[0],calculate()),0);
            APP.query = "";
        }).catch(e=>{
            APP.sending = false;
        });
    } else {
        // fire call() or do nothing ;)
    }
};

function load(e) { 
    APP.insertNavigationButtons(); 
}
function control(e) {
    if(APP.editingMode) return;
    APP.tabMemo[1].forEach(ef=>{
        if(ef[1].toUpperCase() === String.fromCharCode(e.which) && ef[2] === e.type)    
            window[ef[3]](ef);  
    });
 }
function edit(e) {
    click(e);
    if(!APP.editingMode) return;
    input(e);
}
function input(e) {
    if(e.type !== "input") return;
    let attr = e.target.getAttribute("placeholder").toLowerCase();
    window[APP.editFunctions.find(ev=> attr.indexOf(ev) + 1 )](e.target);   
}
function gpio(t) {
    t.value = t.value.replace(/[^0-9]/g, '');
    if(t.value.length > 2) t.value = t.value.slice(0, -1);
    if(t.value[0] === "0") t.value = t.value.substr(1);
    if(t.value === ""){
        t.className = "red";
        return false;
    } else {
        t.className = "green";
        return t.value;
    } 
}
function equation(t,vars) {
    vars = vars || APP.tab[APP.tabOn].event.reduce((x,el)=>{x[el[2].value] = 1; return x;},{});
    let holdMe = evalDoesntLikeStrictMode(vars,t.value.trim());
    if( holdMe !== undefined) {
         t.className = "green";
         return t.value.trim();
    } else {
        t.className = "red";
        return false;
    }
}
function id(t) {
    t.value = t.value.replace(/[^a-z]/g, '');
    if(t.value.length > 1) t.value = t.value[1];
    if(t.value === "") {
        t.className = "red"; 
        return false;
    } else {
        t.className = "green";       
        return t.value;
    }
}
function key(t) { 
    return id(t); 
}
function event(t) {
    let holdMe = APP.events.control.find(ev=> t.value.indexOf(ev)+1)  
    if(holdMe) {
        t.className = "green";
        return holdMe;
    } else { 
        t.className = "red";
        return false;
    }
}
function change(t) {
    let tri = t.value.trim();
    if(APP.change.indexOf(tri)+1) {
        t.className = "green";
        return tri;
    } else {
        t.className = "red";
        return false;
    }
}
function range(t) {
    t.value = t.value.replace(/[^0-9 ]/g, '');
    let crazy = t.value.trim().replace(/\s\s+/g, " ").split(" ").map(e=> parseInt(e)).filter(e=> !isNaN(e));
    if(crazy[0] === "" || crazy[0] === crazy[1]) {
        t.className = "red";
        return false;
    } else {
        t.className = "green";
        return crazy;
    }
}
function typ(t) {
    let tri = t.value.trim();
    if(APP.typ.indexOf(tri)+1) {
        t.className = "green";
        return tri;
    } else {
        t.className = "red";
        return false;
    }
}
function click(e) {
    if(e.target === APP.buttons[0]) {
        if(!APP.timer) clearInterval(APP.timer);
        if(!APP.editingMode) {
            [2,3].forEach(e=> APP.buttons[e].removeAttribute("style"));
        }
        let verify = checkMeIfYouCan(APP.editingMode);
        if(verify) {
            APP.buttons[2].style.display = "none";
            APP.buttons[3].style.display = "none";
            [2,3].forEach(e=> APP.buttons[e].style.display = "none");
            APP.query = "S";
            APP.tabMemo[0].forEach(e=>{
               APP.query += "gp" + e[0] + "we" + e[2];
            });
            APP.startAjax();
        }
    } else if(e.target === APP.buttons[1] && e.type === "click") {
         APP.buttons.forEach((e)=>{ e.removeAttribute("style");});
        APP.tab.push({gpio: [], event: []}); // create new table
        if(APP.tabOn > -1){ 
            clickAdditionalFunction("btn","hidden");
            checkMeIfYouCan(false);
        }
        APP.tabOn = APP.tab.length - 1;

        APP.buttons.push(insert({prt:APP.div[0], bfr: APP.buttons[0],setId:APP.tabOn,typ:"button",text:"tab "+APP.tabOn}));
        [0,1].forEach(e=>{
            APP.tab[APP.tabOn].event.push(addGPIOorEvent(
            insert({
                    prt:APP.div[e+1], 
                    bfr:APP.buttons[e+2],
                    setId: APP.tabOn
            }
            ), APP.textOfElements[e]));
        });

    } else if(e.target === APP.buttons[2] && e.type === "click") {
        let holdMe = addGPIOorEvent(insert({prt:APP.div[1], bfr:APP.buttons[2], setId: APP.tabOn}), APP.textOfElements[0]); 
        APP.tab[APP.tabOn].gpio.push(holdMe);
    }  else if(e.target === APP.buttons[3] && e.type === "click") {
        let  holdMe = addGPIOorEvent(insert({prt:APP.div[2], bfr:APP.buttons[3], setId: APP.tabOn}), APP.textOfElements[1]);  
        APP.tab[APP.tabOn].event.push(holdMe);
    } else if( (APP.buttons.indexOf(e.target,4) + 1) && e.type === "click") {
        if(!APP.editingMode) 
            [2,3].forEach(e=>APP.buttons[e].removeAttribute("style"));
        
        if(APP.tabOn > -1) {
            clickAdditionalFunction("btn","hidden");
            checkMeIfYouCan(false);
            APP.tabOn = APP.buttons.indexOf(e.target,4) - 4;
            clickAdditionalFunction("btn","active");
        }
    } else if(e.target.tagName === "SPAN" && e.type === "click") {
        if(!APP.editingMode) return;
        let elem = null;
        elem = APP.tab[APP.tabOn].gpio.findIndex((ev)=>{return ev[1] === e.target;});
        if(elem + 1){
            APP.tab[APP.tabOn].gpio[elem][0].parentNode.removeChild(APP.tab[APP.tabOn].gpio[elem][0]);
            APP.tab[APP.tabOn].gpio.splice(elem,1);
        }else {
            elem = APP.tab[APP.tabOn].event.findIndex((ev)=>{return ev[1] === e.target;});
            if(elem + 1){
                APP.tab[APP.tabOn].event[elem][0].parentNode.removeChild(APP.tab[APP.tabOn].event[elem][0]);
                APP.tab[APP.tabOn].event.splice(elem,1);
            }
        }
    }
}
function clickAdditionalFunction(what,doWhat) {
    if(what === "btn") {
        APP.tab[APP.tabOn].gpio.forEach((e)=>{e[0].className = doWhat; });
        APP.tab[APP.tabOn].event.forEach((e)=>{e[0].className = doWhat; });
        APP.buttons[4 + APP.tabOn].className = doWhat;
    } else {
        // more cleaning would do
    }
}
function insert({prt = document, bfr = null, setId = null, typ = "div", text = "", attr = null}) {
    let el = document.createElement(typ);
    el.innerHTML = text;
    if(typeof setId === "number") {
        el.dataset.tab = setId;
        el.className = "active";
    }
    if(attr)attr.forEach((e)=>{el.setAttribute(e[0],e[1]);});
    prt.insertBefore(el,bfr);
    return el;
}
function addGPIOorEvent(element, arr) {
    let tmpArr = [];
    tmpArr.push(element);
    arr.reduce((a,b)=>{
        if(typeof b[1] === "string") tmpArr.push(insert({prt: a, typ: b[0], text: b[1]}));
        else b[1].forEach((e)=>{tmpArr.push( insert({prt: a, typ: b[0] , attr: [["placeholder", e]]}) );});
        return a;
    },element);
    return tmpArr;
}

function writeScreen(q,now) {
    let holdMe = now.concat(q);
    holdMe = holdMe.split("x"); // 13w233x12w5 -> [13w233,12w5]
    APP.tabMemo[0].forEach(ef=>{
        holdMe.forEach(e=>{
            if(e && e !== ""){
                let gut = e.split("w");
                if(ef[0] === gut[0].trim()) ef[3].innerHTML = gut[1].trim();
            }
        });
    });
}
function checkMeIfYouCan(whatToDo){
    let go = false;
    let indicate = false;
    let arr = [];
    ["gpio","event"].forEach((name,i)=>{
        APP.tabMemo[i] = [];
        APP.tab[APP.tabOn][name].forEach((e,ii)=>{
            APP.tabMemo[i][ii] = [];
            e.forEach(z=>{
                if(z.tagName === "INPUT"){
                    if(whatToDo) {
                        let holdMe = z.getAttribute("placeholder").toLowerCase();
                        let throwUp = window[APP.editFunctions.find(ev=> holdMe.indexOf(ev) + 1 )](z); 
                        go = !!throwUp;
                        APP.tabMemo[i][ii].push(throwUp);
                    } else z.disabled = false;
                    arr.push(z);
                    if(!go) indicate = true;
                }
                if(z.tagName === "SPAN" && APP.tabMemo[i][ii][0]) APP.tabMemo[i][ii].push(z);  
            });
        });
    });
    if(indicate) go = false;
    if(go) {
        APP.editingMode = false;
        APP.buttons[0].innerHTML = "edit";
        arr.forEach(e=> { e.disabled = true; e.className = ""; });
        return true;
    } else {
        APP.buttons[0].innerHTML = "save";
        APP.editingMode = true;
        return false;
    }
}
function onOf(element) {
    if(element[4][2]) {
        APP.tabMemoValues[element[0]] = element[4][0];
        element[4][2] = false;
    } else {
        APP.tabMemoValues[element[0]] = element[4][1];
        element[4][2] = true;
    }
    element[5].innerHTML = APP.tabMemoValues[element[0]];
    return true;
}
function calculate() {
    let str = "x";
    APP.tabMemo[0].forEach(ef=>{
        if(ef[2] !== "read") {
            let grom = evalDoesntLikeStrictMode(APP.tabMemoValues,ef[1]);
            if(grom) str += ef[0] + "w" + grom + "x";
        }
    });
    return str;
}
APP.firesThisProgram();