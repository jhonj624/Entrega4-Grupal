process.env.PORT = process.env.PORT || 3000;

let urlDB;
if (process.env.NODE_ENV === "local") {
    urlDB = "mongodb://localhost:27017/Education";
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

/* process.env.SENDGRID_API_KEY =
    "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"; */