var canvas, plat1; // deklariramo dve novi spremenljivki za platno ("canvas") in kontekst ctx -> plat1
var agentiTabela = []; // spremenljivka s tabelo ("Array") agentov

var številoAgentov = 100; // spremenljivka za število ljudi v populaciji
var čas = 0; // spremenljivka, ki predstavlja čas
var števecOkuženih = 100; // števec okuženih agentov
var števecDovzetnih = 10; // števec dovzetnih agentov
var graf0; // spremenljivka za objekt grafa za več črt
var graf1; // spremenljivka za objekt grafa
var graf2; // spremenljivka za objekt grafa
var graf3; // spremenljivka za objekt grafa
var graf4; // spremenljivka za objekt grafa
var številoTrkovVkoraku = 0; // število trkov v koraku ne glede na barvo
var številoTrkovDovzetnegaZOkuženimVKoraku = 0; // štejemo le trke okužen-dovzeten
var aktiven; // za kontrolo izvedbe zanke start/stop
var stikaloKoračniZagon = 0;
var stopČas = 10000; // prekinitveni čas
var gumbStartPritisnjen = 0; // da onemogočimo večkratni zagon časovnika (setTimeout)

// "boilerplate" koda za platno
canvas = document.getElementById("platno1"); // v html delu poiščemo planto1; spr. canvas sedaj predstavlja platno1
plat1 = canvas.getContext("2d"); // od tu dalje delamo s spremenljivko plat1 (za izris)
plat1.fillStyle = "#C33763"; // določimo barvo kot polnilo, hex oblika #RRGGBB

// iz zveznega modela ZAČETEK
var dt = 1; // časovni korak, delta t pri Eulerjevi numerični integracijski metodi
var levelArray = new Array(); // polje za stanja ("Level")
var rateArray = new Array(); // polje za pretoke ("Rate")
var auxiliaryArray = new Array(); // polje za pomožne spremenljivke ("Auxiliary")

class Level { // razred stanj
    constructor(value){
        this.value = value; // začetno vrednost prenesemo iz argumenta konstruktorske funkcije
        levelArray.push(this); // celotni objekt potisnemo v polje, skupaj s funkcijama updateFn in update
    }

    updateFn(){}; // za začetek prazna funkcija, kot enačba; ob definiciji modela tu vpišemo enačbo

    update(){
        this.value = this.value + dt * this.updateFn(); // izvedemo integracijo po Eulerjevi metodi
    }
}

class Rate{ // razred za pretoke
    constructor(value){
        this.value = value; // začetno vrednost prenesemo iz konstruktorske funkcije
        rateArray.push(this); // celotni objekt potisnemo v polje, skupaj s funkcijami
    }

    updateFn(){}; // za začetek prazna funkcija, kot enačba; ob definiciji modela tu vpišemo enačbo

    update(){
        this.value = this.updateFn(); // tu je funkcija drugačna kot pri "Level", brez dt
    }
}

class Auxiliary{ // razred za pomožno spremenljivko
    constructor(value){
        this.value = value; // začetno vrednost prenesemo iz konstruktorske funkcije
        auxiliaryArray.push(this); // celotni objekt potisnemo v polje, skupaj s funkcijami
    }

    updateFn(){}; // za začetek prazna funkcija, kot enačba; ob definiciji modela tu vpišemo enačbo

    update(){
        this.value = this.updateFn(); // tu je funkcija drugačna kot pri "Level", brez dt
    }
}

// ****************************************************************************************************
// Definicija modela ZAČETEK
// ****************************************************************************************************

// Vrstni red spremenljivk je pomemben, da gredo v polju po vrsti, da jih lahko ob "update"
// preračunamo. Na začetku so inicializrana le stanja (Level) in lahko določimo le tiste
// Aux in Rate elemente, ki so vezani na stanja. Zaporedje je določeno z "Level"

var številoDovzetnih = new Level(1500); // št. dovzetnih
var številoOkuženih = new Level(1); // na začetku imamo enega okuženega agenta
var prehod = new Rate(); // ustvarimo objekt pretoka, t.j. "Rate" prehod od dovzetnih k okuženim;
var populacija = new Auxiliary(); // pomožna spremenljikva
var širjenjeOkužbe = new Auxiliary(); // pomožna spremenljivka
var koncentracijaDovzetnih = new Auxiliary(); // pomožna spremenljivka
var socialniFaktor = 0.19; // število kontaktov v določenem časovnem obdobju
var verjetnostOkužbe = 0.05; // kolikšen delež od kontaktov se okuži

// Auxiliary ~ definicije za Aux. elemente, t.j. pomožni elementi
populacija.updateFn = function() {return številoDovzetnih.value + številoOkuženih.value};
širjenjeOkužbe.updateFn = function() {return socialniFaktor * številoOkuženih.value};
koncentracijaDovzetnih.updateFn = function() {return številoDovzetnih.value / populacija.value};

// Rate ~ tu zapišemo kodo za pretoke ("Rate")
prehod.updateFn = function() {return verjetnostOkužbe * širjenjeOkužbe.value * koncentracijaDovzetnih.value};

// Level ~ tu zapišemo kodo za elemente stanj ("Level")
številoDovzetnih.updateFn = function() {return -prehod.value};
številoOkuženih.updateFn = function() {return prehod.value};

// ****************************************************************************************************
// Definicija modela KONEC
// ****************************************************************************************************

// ****************************************************************************************************
// Funkcija inicializacije
// ****************************************************************************************************

function init(){

    for(var i = 0; i < auxiliaryArray.length; i++) { // najprej gremo po polju auxiliaryArray
        auxiliaryArray[i].update(); // vse vrednosti ažuriramo
    }

    for(var i = 0; i < rateArray.length; i++){ // gremo po polju rateArray
        rateArray[i].update(); // vse vrednosti ažuriramo
    }

    graf1.izriši(števecOkuženih); // izrišemo vrednost stanja na graf
    graf0.plot([levelArray[1].value, števecOkuženih]); // izrišemo več črt
}

// iz zveznega modela KONEC

class Agent {
    constructor(x, y, radius, startAngle, endAngle, anticlockwise, xVel, yVel, barva) { // konstruktorska funkcija
        this.x = x; // spremenljivka za x koordinato
        this.y = y; // spremenljivka za y koordinato
        this.xVel = xVel; // sprememba x koordinate (dx - diferenca x-a, hitrost v smeri x)
        this.yVel = yVel; // sprememba y koordinate (dy - diferenca y-a, hitrost v smeri y)
        this.barva = barva; // določimo barvo agenta
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.anticlockwise = anticlockwise;
        this.trk = 0; // predvidimo, da je atribut trka na začetku enak 0
    }
    osveži() { // članska funkcija (ker je zapisana znotraj razreda) - enaka za vse agente
        this.x = this.x + this.xVel; // pozicija x se spremeni glede na hitrost v smeri x, t.j. x vel
        this.y = this.y + this.yVel; // pozicija y se spremeni glede na hitrost v smeri y, t.j. y vel
        if (this.x > canvas.width - 10 || this.x < 0) { // če smo na desni ali levi strani na robu platna
            this.xVel = -this.xVel; // obrnemo smer, če pridemo do konca platna na desni ali levi
        }
        if (this.y > canvas.height - 10 || this.y < 0) { // če smo izven platna po y koordinati
            this.yVel = -this.yVel; // obrnemo smer, če pridemo do konca platna zgoraj ali spodaj
        }
        // če je x manjši od 0 ga postavimo na 0 (da se agent ne potopi v steno)
        if(this.x < 0){this.x = 0};
        // če je y manjši od 0 ga postavimo na 0 (da se agent ne potopi v steno)
        if (this.y < 0){this.y = 0};
        // podobno na drugem koncu platna, če je koordinata bvečja od širine oz. višine
        if(this.x > canvas.width - 10){this.x = canvas.width - 10}; // 10 je širina ag.
        if(this.y > canvas.height - 10){this.y = canvas.height - 10}; // 10 je višina ag.
    }
}

class Graf {
    constructor(idPlatna, maxGrafX, maxGrafY) { // pri konstruktorju moramo podati ID platna, ki ga sicer ustvarimo v html-ju
        // "boilerplate" koda za platno
        this.canvas = document.getElementById(idPlatna); // v html delu poiščemo platno z id "idPlatna"
        this.plat1 = this.canvas.getContext("2d"); // od tu dalje delamo s spremenljivko plat1 (za izris)
        this.plat1.strokeStyle = "#C33763"; // določimo rdečo barvo za izris objektov na platnu
        this.x = new Array(); // ustvarimo novo tabelo x, lahko bi zapisali tudi var x = []; (spremenljivka tipa Array)
        this.y = new Array(); // ustvarimo novo tabelo y, lahko bi zapisali tudi var y = []; (spremenljivka tipa Array)
        this.širinaPlatna = this.canvas.width;
        this.višinaPlatna = this.canvas.height;
        this.maxGrafX = maxGrafX;
        this.maxGrafY = maxGrafY;

        // napolnimo polje x
        for(var i=0; i<this.maxGrafX+1; i++) { // graf bo vseboval maxGrafX+1 točk
           this.x[i] =  i; // za x zapišemo [0, 1, 2, ...], t.j. vrednost i-ja
        }
    }

    dodajVrednostAliBrišiInDodaj(yVrednost){
        if (this.y.length == this.maxGrafX + 1) { // če je platno veliko 10x10 imamo 11x11 točk, začnemo z 0
        this.y.splice(0, 1); // na mestu 0 v tabeli y brišemo eno vrednost
        this.y[this.maxGrafX] = yVrednost; // novo vrednost dodamo na koncu polja
        }
        else {
            this.y.push(yVrednost); // če tabela y še ni polna potisnemo novo vrednost v polje
        }  
    }

    izriši(yVrednost){
        this.dodajVrednostAliBrišiInDodaj(yVrednost);
        this.plat1.clearRect(0, 0, this.širinaPlatna, this.višinaPlatna); // brišemo platno

        this.plat1.beginPath(); // začetek izrisa

        for(var i = 0; i < this.y.length; i++) {
            this.plat1.lineTo(this.x[i]/this.maxGrafX*this.širinaPlatna, (this.višinaPlatna - (this.y[i]/this.maxGrafY)*this.višinaPlatna)); // upoštevamo maxX, maxY grafa
        }                                     
        this.plat1.stroke(); // za prikaz črte

        this.plat1.font = "11px Arial";
        this.plat1.fillText(this.maxGrafY, 5, 10); // besedilo, x-koordinata, y-koordinata
        this.plat1.fillText("0", 5, this.višinaPlatna-5);        

    }
}

class GrafPovprečja {
    constructor(idPlatna, maxGrafX, maxGrafY, dolžinaOkna) { // pri konstruktorju moramo podati ID platna, ki ga sicer ustvarimo v html-ju
        // "boilerplate" koda za platno (naslednji dve vrstici)
        this.canvas = document.getElementById(idPlatna); // v html delu poiščemo platno z id "idPlatna"
        this.plat1 = this.canvas.getContext("2d"); // od tu dalje delamo s spremenljivko plat1 (za izris)
        this.plat1.strokeStyle = "#C33763"; // določimo rdečo barvo za izris objektov na platnu
        this.x = new Array(); // ustvarimo novo tabelo x, lahko bi zapisali tudi var x = []; (spremenljivka tipa Array)
        this.y = new Array(); // ustvarimo novo tabelo y, lahko bi zapisali tudi var y = []; (spremenljivka tipa Array)
        this.širinaPlatna = this.canvas.width; // spremenljivka za širino platna
        this.višinaPlatna = this.canvas.height; // višina platna
        this.maxGrafX = maxGrafX;
        this.maxGrafY = maxGrafY;
        this.yOkno = new Array(); // polje ("Array") za okno y vrednosti za izračun drsečega povprečja
        this.povprečnaVrednost = 0; // povprečna vrednost v oknu
        this.dolžinaOkna = dolžinaOkna; // povprečje preračunavamo za določeno število vrednosti

        // napolnimo polje x
        for(var i=0; i<this.maxGrafX+1; i++) { // platno vel. 10x10px ima 11x11 točk
           this.x[i] =  i; // za x zapišemo [0, 1, 2, ...], t.j. vrednost i-ja
        }
    }

    dodajVrednostAliBrišiInDodaj(yVrednost){

        this.yOkno.push(yVrednost); // vrednost, ki jo dobimo prek argumenta potisnemo v polje

        if (this.yOkno.length == this.dolžinaOkna + 1) { // če je platno veliko 10x10 imamo 11x11 točk, začnemo z 0
            this.yOkno.splice(0, 1); // na mestu 0 v tabeli y brišemo eno vrednost
            this.povprečnaVrednost = this.yOkno.reduce(function(a, b){return a + b})/this.dolžinaOkna; // izračunamo povrečje
        }
        else {
            this.povprečnaVrednost = 0; // do zapolnitve dolžine okna, t.j. npr. dokler ne dobimo prvih npr. 50 vrednosti je povp. = 0
        }

        if (this.y.length == this.maxGrafX + 1) { // če je platno veliko 10x10 imamo 11x11 točk, začnemo z 0
        this.y.splice(0, 1); // na mestu 0 v tabeli y brišemo eno vrednost
        this.y[this.maxGrafX] = this.povprečnaVrednost; // novo vrednost dodamo na koncu polja
        }
        else {
            this.y.push(this.povprečnaVrednost); // če tabela y še ni polna potisnemo novo vrednost v polje
        }  
    }

    izriši(yVrednost){
        this.dodajVrednostAliBrišiInDodaj(yVrednost);
        this.plat1.clearRect(0, 0, this.širinaPlatna, this.višinaPlatna); // brišemo platno

        this.plat1.beginPath(); // začetek izrisa

        for(var i = 0; i < this.y.length; i++) {
            this.plat1.lineTo(this.x[i]/this.maxGrafX*this.širinaPlatna, this.višinaPlatna - (this.y[i]/this.maxGrafY)*this.višinaPlatna); // za vrednosti y pomnožimo naklj. vrednost
        }                                      // z višino platna, npr. 0.25*100=25

        this.plat1.stroke(); // za prikaz črte

        this.plat1.font = "11px Arial";
        this.plat1.fillText(this.maxGrafY, 5, 10); // besedilo, x-koordinata, y-koordinata
        this.plat1.fillText("0", 5, 95);                

    }
}

class GrafDiskretnihVrednosti {
    constructor(idPlatna, maxGrafX, maxGrafY) { // pri konstruktorju moramo podati ID platna, ki ga sicer ustvarimo v html-ju
        // "boilerplate" koda za platno
        this.canvas = document.getElementById(idPlatna); // v html delu poiščemo platno z id "idPlatna"
        this.plat1 = this.canvas.getContext("2d"); // od tu dalje delamo s spremenljivko plat1 (za izris)
        this.plat1.strokeStyle = "#C33763"; // določimo rdečo barvo za izris objektov na platnu
        this.x = new Array(); // ustvarimo novo tabelo x, lahko bi zapisali tudi var x = []; (spremenljivka tipa Array)
        this.y = new Array(); // ustvarimo novo tabelo y, lahko bi zapisali tudi var y = []; (spremenljivka tipa Array)
        this.širinaPlatna = this.canvas.width;
        this.višinaPlatna = this.canvas.height;
        this.maxGrafX = maxGrafX;
        this.maxGrafY = maxGrafY;

        // napolnimo polje x
        for(var i=0; i<this.maxGrafX+1; i++) { // graf bo vseboval maxGrafX+1 točk
           this.x[i] =  i; // za x zapišemo [0, 1, 2, ...], t.j. vrednost i-ja
        }
    }

    dodajVrednostAliBrišiInDodaj(yVrednost){
        if (this.y.length == this.maxGrafX + 1) { // če je platno veliko 10x10 imamo 11x11 točk, začnemo z 0
        this.y.splice(0, 1); // na mestu 0 v tabeli y brišemo eno vrednost
        this.y[this.maxGrafY] = yVrednost; // novo vrednost dodamo na koncu polja
        }
        else {
            this.y.push(yVrednost); // če tabela y še ni polna potisnemo novo vrednost v polje
        }  
    }

    izriši(yVrednost){
        this.dodajVrednostAliBrišiInDodaj(yVrednost);
        this.plat1.clearRect(0, 0, this.širinaPlatna, this.višinaPlatna); // brišemo platno

        this.plat1.beginPath(); // začetek izrisa

        for(var i = 0; i < this.y.length; i++) {

            this.plat1.beginPath(); // začetek izrisa
            this.plat1.lineTo(this.x[i], this.višinaPlatna); // 100 je ničla
            this.plat1.lineTo(this.x[i], this.višinaPlatna - (this.y[i]/this.maxGrafY)*this.višinaPlatna); // druga točka na platnu
            this.plat1.stroke(); // za prikaz črte
        }                                     

        //this.plat1.stroke(); // za prikaz črte
    }
}


// funkcija, ki preveri bližino agentov
// preverimo razdaljo vsakega agenta z vsakim agentom
// v primeru trka izvedemo funkcijo trk
function preveriBližinoAgentov() {
    številoTrkovVkoraku = 0; // števec postavimo na 0 - ob vsakem koraku ga ponastavimo
    številoTrkovDovzetnegaZOkuženimVKoraku = 0; // ponastavitev števca rdeč-zelen

    agentiTabela.forEach(function(agent){
        agent.trk = 0; // atribut trka za vse agente postavimo na 0
    });

    for(var i=0; i<številoAgentov; i++) {
        var A = agentiTabela[i];

        for(var j=i+1; j<številoAgentov; j++) {
            var B = agentiTabela[j];

            // izračunamo razlike koordinat
            var dx = B.x - A.x;
            var dy = B.y - A.y;
            var dist = Math.sqrt(dx*dx + dy*dy);

            // če je razlika v razdalji med agentoma manjša od 10 izvedemo trk
            if (dist < 10) { // če je pogoj, da sta agenta dovolj blizu izpolnjen
                A.trk = 1; // atribut trka prvega postavimo na 1
                B.trk = 1; // atribut trka drugega postavimo na 1 
                številoTrkovVkoraku++; // povečamo števec za 1
                izvediTrk(i, j); // izvedemo trk med agentoma z indeksoma i in j
            }
        }
    }
    return številoTrkovVkoraku;
}

// funkcija, ki izvede trk med agentoma z indeksoma i in j
function izvediTrk (indeksPrvega, indeksDrugega) {
    var x1 = agentiTabela[indeksPrvega].x;
    var y1 = agentiTabela[indeksPrvega].y;
    var x2 = agentiTabela[indeksDrugega].x;
    var y2 = agentiTabela[indeksDrugega].y;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var razdaljaOdboja = 6; // spr., ki določa za koliko se agenta ob trku odbijeta

    // izračunamo normalo razdalje
    var normalaX = dx/dist;
    var normalaY = dy/dist;

    // določimo sredinsko točko
    var sredinskaTočkaX = (x1 + x2)/2;
    var sredinskaTočkaY = (y1 + y2)/2;

    // določimo nove pozicije
    agentiTabela[indeksPrvega].x = sredinskaTočkaX - normalaX * razdaljaOdboja;
    agentiTabela[indeksPrvega].y = sredinskaTočkaY - normalaY * razdaljaOdboja;
    agentiTabela[indeksDrugega].x = sredinskaTočkaX + normalaX * razdaljaOdboja;
    agentiTabela[indeksDrugega].y = sredinskaTočkaY + normalaY * razdaljaOdboja;

    // izmenjamo hitrosti
    var tempX = agentiTabela[indeksPrvega].xVel;
    var tempY = agentiTabela[indeksPrvega].yVel;
    agentiTabela[indeksPrvega].xVel = agentiTabela[indeksDrugega].xVel;
    agentiTabela[indeksPrvega].yVel = agentiTabela[indeksDrugega].yVel;
    agentiTabela[indeksDrugega].xVel = tempX;
    agentiTabela[indeksDrugega].yVel = tempY;

    // če trčita zeleni in rdeči, rdeči postane zelen
    // če je prvi rdeč (barva=0) in drugi zelen (barva=1)
    if(agentiTabela[indeksPrvega].barva == 0 && agentiTabela[indeksDrugega].barva == 1){
        agentiTabela[indeksPrvega].barva = 1; // prvega agenta, ki je bil prej rdeč(0) prebarvamo na zeleno(1)
        številoTrkovDovzetnegaZOkuženimVKoraku++;
    }
    // če je prvi zelen (1) in drugi rdeč (0)
    if(agentiTabela[indeksPrvega].barva == 1 && agentiTabela[indeksDrugega].barva == 0){
        agentiTabela[indeksDrugega].barva = 1; // drugega, ki je bil prej rdeč(0) prebarvamo na zeleno
        številoTrkovDovzetnegaZOkuženimVKoraku++;
    }

}



function izrišiAgente (agenti){
   
    agenti.forEach(function(agent){
        if(agent.barva == 1) {
            plat1.fillStyle = "#f2f2f2"; // določimo zeleno barvo
            števecOkuženih++;
        }
        else {
            plat1.fillStyle = "#990033"; // določimo rdečo barvo
            števecDovzetnih++;
        }
        plat1.beginPath();
        plat1.arc(agent.x, agent.y, 30, 0, 2 * Math.PI, agent.anticlockwise, agent.xVel, agent.yVel, agent.barva);
        plat1.fill();
        plat1.lineWidth = 3;
        plat1.strokeStyle = '#003300';
        plat1.stroke();; // x zg. L kot, y zg. L kot, širina, višina

        if(agent.trk == 1) {
            // izrišemo modri okvir v primeru, da je zaznan trk
            plat1.beginPath();
            plat1.arc(agent.x, agent.y, 30, 0, 2 * Math.PI, agent.anticlockwise, agent.xVel, agent.yVel, agent.barva);
            plat1.fillStyle = 'red';
            plat1.fill();
            plat1.lineWidth = 3;
            plat1.strokeStyle = '#003300';
            plat1.stroke();
        }

    });
}

function zanka() {

    števecOkuženih = 0;
    števecDovzetnih = 0;
    plat1.clearRect(0, 0, canvas.width, canvas.height); // brišemo celotno platno

    //preveriBližinoAgentov();
    var številoTrkov = preveriBližinoAgentov();
    document.getElementById("število-trkov").value=številoTrkov;

    for(var i=0; i<številoAgentov; i++) {
        agentiTabela[i].osveži(); // osvežimo agenta (z indeksom i)
    }

    izrišiAgente(agentiTabela); // izrišemo agente

    graf1.izriši(števecOkuženih);
    graf2.izriši(številoTrkovDovzetnegaZOkuženimVKoraku);
    graf3.izriši(številoTrkovVkoraku);
    
    čas++; // čas povečamo za 1

    for(var i = 0; i < levelArray.length; i++) { // gremo po polju stanj
        levelArray[i].update();
    }

    for(var i = 0; i < auxiliaryArray.length; i++) { // najprej gremo po polju auxiliaryArray
        auxiliaryArray[i].update(); // vse vrednosti ažuriramo
    }

    for(var i = 0; i < rateArray.length; i++){ // gremo po polju rateArray
        rateArray[i].update(); // vse vrednosti ažuriramo
    } 

    graf4.izriši(levelArray[1].value); // izrišemo vrednost stanja na graf
    graf0.plot([levelArray[1].value, števecOkuženih]); // izrišemo vrednost stanja na graf    

    document.getElementById("polje-s-časom").value = čas; // izpišemo časovni korak
    document.getElementById("število-okuženih").value = števecOkuženih; // izpišemo št. rdečih
    document.getElementById("število-dovzetnih").value = števecDovzetnih; // izpišemo št. zelenih

    if (stikaloKoračniZagon == 1) { // če smo v modusu koračne izvedbe
        clearTimeout(aktiven);
    }
}

function load(){
    // v tabelo agentov vpišemo agente z naključnimi koordinatami in hitrostmi
    // pri tem upoštevamo, da se na začetku med seboj agenti ne dotikajo
    // oz., da je razdalja med njimi večja kot 10

    agentiTabela[0] = new Agent(Math.random() * (canvas.width - 10), Math.random() * (canvas.height - 10), 30, 0, Math.PI * 2, false, 1 * Math.random() - 0.5, 1 * Math.random() - 0.5, 0);
   
    var kandidatkaZaXkoordinato; // kandidatka za x koordinato
    var kandidatkaZaYkoordinato; // kandidatka za y koordinato
    var preblizu; // zastavica, ki signalizira, da sta dve novi kandidatki preblizu
                  // že obstoječim kandidatkam, torej gre za trk

    for (var i=1; i<številoAgentov; i++){
        kandidatkaZaXkoordinato = Math.random()*(canvas.width-10); // kand. za x koord.
        kandidatkaZaYkoordinato = Math.random()*(canvas.height-10); // kand. za y koord.

        do { // delamo dokler ne generiramo takšnih kandidatk za koordinate, ki jih v polju
            // z agenti še ni
            preblizu = false;
            agentiTabela.forEach(function(agent){
                var dx = agent.x - kandidatkaZaXkoordinato; // razdalja med ag. po x koord.
                var dy = agent.y - kandidatkaZaYkoordinato; // razdalja med ag. po y koord.
                if (Math.sqrt(dx*dx + dy*dy) < 10) { // če smo preblizu
                    preblizu = true; // "true", če so predlagane koordinate preblizu že obstoječim agentom
                    kandidatkaZaXkoordinato = Math.random()*(canvas.width-10); // kand. za x koord.
                    kandidatkaZaYkoordinato = Math.random()*(canvas.height-10); // kand. za y koord.
                }
            });
        } // "do" ponavljamo dokler so predlagane kandidatke koordinat preblizu
        while (preblizu == true);

        // na koncu shranimo agenta z neprekrivajočimi se koordinatami v polje
        agentiTabela[i] = new Agent(kandidatkaZaXkoordinato, kandidatkaZaYkoordinato, 30, 0, Math.PI * 2, false, 1 * Math.random() - 0.5, 1 * Math.random() - 0.5, 0);
    }

    agentiTabela[0].barva = 1; // za agenta z indeksom [0] določimo, da je barva 1, t.j. zelena
    agentiTabela[0].x = 500;
    agentiTabela[0].y = 500;
    

    graf1 = new Graf("platno-graf-1", 5000, 1500); // ustvarimo nov objekt za graf
    graf2 = new GrafPovprečja("platno-graf-2", 5000, 5, 300); // povp. graf
                                                                // arg.: platnoID, maks. po x, maks. po y
    graf3 = new Graf("platno-graf-3", 100, 100);
    graf4 = new Graf("platno-graf-4", 5000, 1500);

    // graf z več črtami
    // argumenti: Arg1: canvasId, Arg2: maxX, Arg3: maxY, Arg4: [vektor barv]; this determines the size of yValue matrix (if we state one color as eg. ["red"], we assume only one time series, ["red", "green", "blue"] -> three time series) 
    graf0 = new GraphMulti("platno-graf-0", 0, 5000, 0, 1500, ["red", "green"], ["anal.", "agenti"], ["0", "5000", "0", "1500"]);

    init(); // inicializiramo R(0), A(0); L(0) je sicer že inicializiran ob definiciji modela L(0)=10   
}

// funkcija, ki preverja ali je bil gumb Štart že enkrat pritisnjen
// če je bil že pritisnjen prerečimo ponoven zagon časovnika
function startGumb(){
    stopČas = document.getElementById("stop-čas").value; // prekinitveni čas preberemo iz uporabniškega vmesnik
    if(gumbStartPritisnjen==0){ // če gumb še ni bil pritisnjen
        gumbStartPritisnjen=1; // postavimo vrednost na 1 - da je bil pritisnjen
        start(); // poženemo zanko
    }
}

// funkcija za zagon modela
function start(){
    if (čas >= stopČas){ // če presežemo čas prekinitve
        stikaloKoračniZagon = 1;
        clearTimeout(aktiven);
    }
    else {
        zanka();
        aktiven = setTimeout("start();", 1); // na 10 kličemo funkcijo start
    }
}

// funkcija za zaustavitev modela
function stop(){
    if(aktiven) clearTimeout(aktiven);
    gumbStartPritisnjen=0; // povemo, da gumb Štart ni več aktiven, lahko ga ponovno pritisnemo
}

// funkcija za koračni zagon
function koračniZagon(){
    if(aktiven) clearTimeout(aktiven);
    stikaloKoračniZagon = 1;
    zanka(); // poženemo izvedbo glavne zanke
}


class GraphMulti {
    constructor(canvasId, minGraphX, maxGraphX, minGraphY, maxGraphY, color, legend, axisDescription) { // pri konstruktorju moramo podati ID platna, ki ga sicer ustvarimo v html-ju
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.canvasWidth = this.canvas.width; // glej veliki W pri Width
        this.canvasHeight = this.canvas.height; // glej veliki H pri Height
        this.x = new Array(); // ustvarimo novo polje x
        this.y = new Array();
        this.rangeX = maxGraphX - minGraphX;
        this.rangeY = maxGraphY - minGraphY;
        
        // ustvarimo y polje (velikost) glede na barvni vektor (lahko imamo več vrstice, i.e. 2d)
        for( var i=0; i<color.length; i++ ) {
            this.y.push([]); // primer s tremi vrsticami pri inicializaciji polje bi bil this.y = [[],[],[]];
        }

        this.minGraphX = minGraphX;
        this.maxGraphX = maxGraphX;
        this.minGraphY = minGraphY;
        this.maxGraphY = maxGraphY;
        this.color = color; // barva grafa
        
        this.legend = legend;
        this.axisDescription = axisDescription;
        
        // napolnimo x vektor, vektor y je določen v realnem času, t.j. sproti
        for (var i=0; i<this.maxGraphX+1; i++) {
            this.x[i] = i; // vrednosti za x koordinate: 0, 1, 2, ...
        }
    }
    
    addValueOrCutAndAdd(yValue) {
        if (this.y[0].length == this.maxGraphX+1) { // če je platno velikosti 10x10 imamo 11x11 točk (začnemo z 0 in končamo z 10)
            for (var i = 0; i < yValue.length; i++) { // v zanki gremo po polju yInput in na mestu 0 eno vrednost odrežemo, na koncu pa eno mesto dodamo - zapišemo novo vrednost yInput
                this.y[i].splice(0, 1); // na poziciji 0 v vektorju y odrežemo eno vrednost
                this.y[i][this.maxGraphX] = yValue[i]; // na koncu polja eno vrednost dodamo
            }
        }
        else {
            for (var i = 0; i < yValue.length; i++) { // z zanko gremo po vseh vrsticah za matrike y
                this.y[i].push(yValue[i]); // če polje še ni polno potisnemo novo vrednost v polje / vrednost v oklepaju [] t.j. index je za ena večji; npr., če imamo eno vrednost je indeks [0], length pa 1
            }
        }
    }
    
    plot(yValue) {
        this.addValueOrCutAndAdd(yValue);
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight); // brišemo platno
        
        for (var i=0; i < yValue.length; i++) { // zanka, ki gre po vrsticah y matrike
        this.ctx.strokeStyle = this.color[i]; // določimo barvo
        this.ctx.beginPath(); // za začetek črte
            for (var j=0; j<this.y[0].length; j++) {
                this.ctx.lineTo(this.x[j]/this.rangeX*this.canvasWidth, (this.canvasHeight - ((this.y[i][j]-this.minGraphY)/this.rangeY) * this.canvasHeight)); // za y vrednosti zadevo pomnožimo z višino platna, e.g. 0.25 * 100 = 25
            }
        this.ctx.stroke();
        }
        
        // dodamo legendo
        for(var i=0; i<this.legend.length; i++ ) { // legend-a in barva, t.j. color morata biti iste dimenzije
            this.ctx.font = "11px Arial";
            this.ctx.fillText(this.legend[i], 49+i*54, 10);
            this.ctx.strokeStyle = this.color[i];
            this.ctx.beginPath(); // začetek kratke črte za legendo
            this.ctx.lineTo(37+i*54, 6);
            this.ctx.lineTo(46+i*54, 6);
            this.ctx.stroke();
        }
        
        // dodamo opis osi
        this.ctx.fillText("<-" + this.axisDescription[0] + "|" + this.axisDescription[1] + "->", this.canvasWidth-60, this.canvasHeight-5)
        this.ctx.fillText(this.axisDescription[2], 5, this.canvasHeight-5);
        this.ctx.fillText(this.axisDescription[3], 5, 11); 
    }
}