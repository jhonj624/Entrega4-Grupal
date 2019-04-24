process.env.PORT = process.env.PORT || 3002;

if (!process.env.URLDB) {
    process.env.URLDB = "mongodb://localhost:27017/Education";
}

process.env.SENDGRID_API_KEY =
    "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";