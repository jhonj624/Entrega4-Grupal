//=======================
//    PUERTO
//=======================
process.env.PORT = process.env.PORT || 3000;

//=======================
//    ENTORNO
//=======================
process.env.NODE_ENV = process.env.NODE_ENV || "dev"; // bien

//=======================
//    BASE DE DATOS
//=======================
let urlDB;
if (process.env.NODE_ENV === "dev") {
    urlDB = "mongodb://localhost:27017/Education";
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;
console.log(urlDB);

//=======================
//    SENDGRID_API_KEY
//=======================
let sg_key;

if (process.env.NODE_ENV === "dev") {
    require("./sg_key");
    sg_key = process.env.SG_KEY;
} else {
    sg_key = process.env.SG_KEY;
}
process.env.SENDGRID_API_KEY = sg_key;

console.log("sendgrid key:" + process.env.SENDGRID_API_KEY);