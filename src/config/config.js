process.env.PORT = process.env.PORT || 3000;

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || "dev"; // bien

let urlDB;
if (process.env.NODE_ENV === "dev") {
    urlDB = "mongodb://localhost:27017/Education";
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;
console.log(urlDB);
/* process.env.SENDGRID_API_KEY =
    "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"; */
process.env.SENDGRID_API_KEY = process.env.SG_KEY;
console.log("sendgrid key:" + process.env.SENDGRID_API_KEY);