process.env.PORT = process.env.PORT || 3000;


if (!process.env.URLDB) {

    process.env.URLDB = 'mongodb://localhost:27017/Education'

}

//Clave de API de sendGRID (Isa)
process.env.SENDGRID_API_KEY = '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'