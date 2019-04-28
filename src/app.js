// Requires
require("./config/config");
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
//### Para usar las variables de sesión
const session = require("express-session");

const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true
            //cookie: { secure: true }
    })
);

//Paths
const dirPublic = path.join(__dirname, "../public");
const dirNode_modules = path.join(__dirname, "../node_modules");
app.use("/js", express.static(dirNode_modules + "/bootstrap/dist/js"));
app.use("/css", express.static(dirNode_modules + "/bootstrap/dist/css"));

//Static
app.use(express.static(dirPublic));
app.use("/js", express.static(dirNode_modules + "/jquery/dist"));
app.use("/js", express.static(dirNode_modules + "/popper.js/dist"));

app.use((req, res, next) => {
    if (req.session.rol === "admin") {
        res.locals.sesion = true;
        res.locals.usuario = req.session.usuario;
    } else if (req.session.rol === "aspirante") {
        res.locals.sesion2 = true;
        res.locals.usuario = req.session.usuario;
    } else if (req.session.rol === "docente") {
        res.locals.sesion3 = true;
        res.locals.usuario = req.session.usuario;
    }
    next();
});

//BodyParser
app.use(bodyParser.urlencoded({ extended: false }));

//Routes
app.use(require("./routes/index"));

mongoose.connect(
    process.env.URLDB, { useNewUrlParser: true },
    (err, result) => {
        if (err) {
            return console.log(err);
        }
        console.log("Conectado");
    }
);
//===============================
//           CONFIG CHAT
//===============================

// contador de usuarios conectados
//let contador = 0;
const { Usuarios } = require("./../src/models/usuariosChat");
const usuarios = new Usuarios();

// socket.io use
io.on("connection", client => {
    console.log("Un usuario se ha conectado");

    client.on("usuarioNuevo", usuario => {
        let listado = usuarios.agregarUsuario(client.id, usuario);
        console.log(listado);
        let texto = `Se ha conectado ${usuario}`;
        // se emite a todos los conectados
        io.emit("usuarioNuevo", texto);
    });

    client.on("disconnect", () => {
        let usuarioBorrado = usuarios.borrarUsuario(client.id);
        let mensaje = `Se ha desconectado ${usuarioBorrado.nombre}`;
        io.emit("usuarioDesconectado", mensaje);
    });

    client.on("texto", (text, callback) => {
        console.log(text);
        io.emit("texto", text);
        callback();
    });

    ///----- Mensaje privado -----///
    client.on("textoPrivado", (text, callback) => {
        let usuario = usuarios.getUsuario(client.id);
        let texto = `${usuario.nombre}: ${text.mensajePrivado} `;
        console.log("mensaje" + texto);
        console.log("destinatario:" + text.destinatario);
        // se envia solo a la persona
        // con broadcast se envia a todos menos a mi
        //client.broadcast.emit("textoPrivado", texto);
        // con broadcast.to se envia a la persona en especifico
        let destinatario = usuarios.getDestinatario(text.destinatario);
        client.broadcast.to(destinatario.id).emit("textoPrivado", texto);
        callback();
    });
});

// se cambia app a server (http)
server.listen(process.env.PORT, () => {
    console.log("Escuchando en el puerto" + process.env.PORT);
});