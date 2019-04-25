require("../config/config");
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const Aspirante = require("./../models/aspirante");
const Curso = require("./../models/curso");
const Inscrito = require("./../models/inscrito");
const bcrypt = require("bcrypt");
const multer = require("multer");
const session = require("express-session");

// require para enviar correos
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const dirViews = path.join(__dirname, "../../template/views");
const dirPartials = path.join(__dirname, "../../template/partials");

require("./../helpers/helpers");

//hbs
app.set("view engine", "hbs");
app.set("views", dirViews);
hbs.registerPartials(dirPartials);

app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true
            //cookie: { secure: true }
    })
);

app.set("view engine", "hbs");

app.get("/", (req, res) => res.render("index", { nombre: req.session.nombre }));

app.get("/registro", (req, res) =>
    res.render("registro", { nombre: req.session.nombre, rol: req.session.rol })
);

app.post("/registrar", (req, res) => {
    let aspirante = new Aspirante({
        nombre: req.body.nombre,
        documento: req.body.id,
        email: req.body.email,
        telefono: req.body.tel
    });

    aspirante.save((err, result) => {
        if (err) {
            return res.render("registropost", {
                mensaje: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> ${err} </h4><hr></div>`,
                nombre: req.session.nombre,
                rol: req.session.rol
            });
        }
        const msg = {
            to: req.body.email,
            from: "isamuor90@gmail.com",
            subject: "Bienvenido a plataforma virtual",
            text: "Bienvenido",
            html: `<h1><strong>Bienvenido a la plataforma de cursos virtuales</strong></h1> <br><br> 
                            <h2>Ahora puede inscribirse en los cursos disponibles</h2><br><br>
                            <h3>Datos de registro</h3>
                            <ul>
                            <li type="circle">Nombre: ${req.body.nombre} </li>
                            <li type="circle">Identificación: ${
                              req.body.id
                            } </li>
                            <li type="circle">Email: ${req.body.email} </li*/>
                            <li type="circle">Telefono: ${req.body.tel} </li>
                            </ul>`
        };
        sgMail.send(msg);
        res.render("registropost", {
            mensaje: `<div class = 'alert-success'\
            role = 'alert'> <h4 class="alert-heading"> <br> Registro realizado con éxito </h4><hr></div>`,
            nombre: req.session.nombre,
            rol: req.session.rol
        });
    });
});

app.post("/formularioCrear", (req, res) => {
    Curso.find({}).exec((err, respuesta) => {
        if (err) {
            texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
        }
        res.render("formularioCrear", {
            listaCursos: respuesta,
            nombre: req.session.nombre,
            rol: req.session.rol
        });
    });
});

var upload = multer({
    // Validación del archivo del lado del cliente
    limits: {
        filesize: 1000000 // 1MB
    },

    fileFilter(req, file, cb) {
        // Validación del formato de archivo del lado del servidor
        if (!file.originalname.match(/\.(pdf)$/)) {
            return cb(new Error("No es un archivo válido"));
        }
        // To accept the file pass `true`, like so:
        cb(null, true);
    }
});

app.post("/crear", upload.single("archivo"), (req, res) => {
    let curso = new Curso({
        nombre: req.body.nombre,
        id: req.body.id,
        valor: req.body.valor,
        descripcion: req.body.descripcion,
        modalidad: req.body.modalidad,
        intensidad: req.body.intensidad,
        programa: req.file.buffer
    });

    curso.save((err, result) => {
        if (err) {
            texto = `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> ${err} </h4><hr></div>`;
            return Curso.find({}).exec((err, respuesta) => {
                if (err) {
                    texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
                }
                res.render("crear", {
                    texto,
                    listaCursos: respuesta,
                    nombre: req.session.nombre,
                    rol: req.session.rol
                });
            });
        }
        texto = `<div class = 'alert-success'\
        role = 'alert'> <h4 class="alert-heading"> <br> El curso fue creado con éxito </h4><hr></div>`;
        Curso.find({}).exec((err, respuesta) => {
            if (err) {
                texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
            }
            res.render("crear", {
                texto,
                listaCursos: respuesta,
                nombre: req.session.nombre,
                rol: req.session.rol
            });
        });
    });
});

app.post("/ver", (req, res) => {
    Curso.find({}).exec((err, respuesta) => {
        if (err) {
            texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
        }
        res.render("ver", {
            listaCursos: respuesta,
            nombre: req.session.nombre,
            rol: req.session.rol
        });
    });
});

app.post("/inscribir", (req, res) => {
    Curso.find({ estado: "disponible" }).exec((err, respuesta) => {
        if (err) {
            texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
        }
        res.render("inscribir", {
            listaCursos: respuesta,
            nombre: req.session.nombre,
            rol: req.session.rol
        });
    });
});

app.post("/inscritos", (req, res) => {
    Aspirante.findOne({ documento: req.session.usuario }, (err, usuario) => {
        if (err) {
            return console.log(err);
        }
        Inscrito.find({ documento: usuario.documento, nombreCurso: req.body.nombreCurso },
            (err, resultados) => {
                if (resultados.length == 0) {
                    inscrito = new Inscrito({
                        nombre: usuario.nombre,
                        documento: usuario.documento,
                        email: usuario.email,
                        telefono: usuario.telefono,
                        nombreCurso: req.body.nombreCurso
                    });
                    inscrito.save((err, result) => {
                        if (err) {
                            return console.log(err);
                        }
                        res.render("inscritos", {
                            bandera: true,
                            texto: `<div class = 'alert-success px-4'
                        role = 'alert'> <h4 class="alert-heading"> <br> Inscripción Exitosa </h4><hr></div>`,
                            est: {
                                documento: usuario.documento,
                                nombre: usuario.nombre,
                                nombreCurso: req.body.nombreCurso
                            },
                            nombre: req.session.nombre,
                            rol: req.session.rol
                        });
                    });
                } else {
                    texto = `<div class = 'alert alert-danger px-4'
        role = 'alert'><h4 class="alert-heading"> <br> Ya se encuentra inscrito al curso </h4><hr></div>`;

                    res.render("inscritos", {
                        bandera: false,
                        texto,
                        nombre: req.session.nombre,
                        rol: req.session.rol
                    });
                }
            }
        );
    });
});

app.post("/verMisCursos", (req, res) => {
    cambia = req.body.curso_nombre;

    if (!!cambia) {
        Inscrito.findOneAndDelete({ nombreCurso: cambia, documento: req.session.usuario },
            (err, resultados) => {
                if (err) {
                    return console.log(err);
                }
                return Inscrito.find({ documento: req.session.usuario }).exec(
                    (err, respuesta) => {
                        if (err) {
                            texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> ${err} </h4><hr></div>`;
                        }
                        if (respuesta.length == 0) {
                            res.render("verMisCursos", {
                                texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No se encuentra inscrito en ningún curso </h4><hr></div>`,
                                nombre: req.session.nombre,
                                rol: req.session.rol
                            });
                        } else {
                            res.render("verMisCursos", {
                                bandera: true,
                                texto: `<div class = 'alert alert-success' role = 'alert'><h4 class="alert-heading"> <br> Inscripción eliminada con éxito </h4><hr></div>`,
                                nombre: req.session.nombre,
                                rol: req.session.rol,
                                informacion: respuesta
                            });
                        }
                    }
                );
            }
        );
    } else {
        Inscrito.find({ documento: req.session.usuario }).exec((err, respuesta) => {
            if (err) {
                texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> ${err} </h4><hr></div>`;
            }
            if (respuesta.length == 0) {
                res.render("verMisCursos", {
                    texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No se encuentra inscrito en ningún curso </h4><hr></div>`,
                    nombre: req.session.nombre,
                    rol: req.session.rol
                });
            } else {
                res.render("verMisCursos", {
                    bandera: true,
                    nombre: req.session.nombre,
                    rol: req.session.rol,
                    informacion: respuesta
                });
            }
        });
    }
});

app.post("/verInscritos", (req, res) => {
    cambia = req.body.gridRadios;

    if (!cambia) {
        Curso.find({}).exec((err, respuesta) => {
            if (err) {
                texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
            }
            Inscrito.find({}).exec((err, respuesta2) => {
                if (err) {
                    texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
                }
                res.render("verInscritos", {
                    listaCursos: respuesta,
                    listaInscritos: respuesta2,
                    nombre: req.session.nombre,
                    rol: req.session.rol
                });
            });
        });
    } else {
        Curso.findOneAndUpdate({ nombre: cambia }, { estado: "cerrado" }, { new: true, runValidators: true, context: "query" },
            (err, resultados) => {
                if (err) {
                    console.log(err);
                }
                Aspirante.find({ rol: "docente" }, (err, respuesta) => {
                    if (err) {
                        console.log(err);
                    }
                    res.render("asignarDocente", {
                        bandera: true,
                        nombre: req.session.nombre,
                        rol: req.session.rol,
                        Nombre_Curso: cambia,
                        docentes: respuesta
                    });
                });
                /*   Curso.find({}).exec((err, respuesta) => {
                                    if (err) {
                                        texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
                                    }
                                    Inscrito.find({}).exec((err, respuesta2) => {
                                        if (err) {
                                            texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
                                        }
                                        res.render("verInscritos", {
                                            listaCursos: respuesta,
                                            listaInscritos: respuesta2,
                                            nombre: req.session.nombre,
                                            rol: req.session.rol
                                        });
                                    });
                                }); */
            }
        );
    }
});

app.post("/docenteAsignado", (req, res) => {
    cursoModifica = req.body.nombreCurso;
    docenteAsigna = req.body.nombreDocente;
    fechaInicio = req.body.fechaInicio;

    Curso.findOneAndUpdate({ nombre: cursoModifica }, { docente: docenteAsigna, fechaInicio: fechaInicio }, { new: true, runValidators: true, context: "query" },
        (err, resultados) => {
            if (err) {
                console.log(err);
            }
            // busco el correo del docente
            Aspirante.findOne({ nombre: docenteAsigna, rol: "docente" },
                (err, docente) => {
                    if (err) {
                        console.log("No hay docente asociado");
                    }
                    correo = docente.email;
                    console.log(correo);
                    // envio el correo al docente
                    // Estructura para envio de mensaje electronico
                    const msg = {
                        to: correo,
                        from: "jhonvelasquezudea@gmail.com",
                        subject: "Asignación de curso",
                        text: `Estimado(a) ${docenteAsigna},
                        Su curso ${cursoModifica} ha sido cerrado y comienza el día ${fechaInicio}`
                    };
                    sgMail.send(msg); // Se envia el mensaje al mail
                }
            );
            res.render("asignarDocente", {
                bandera: false,
                nombre: req.session.nombre,
                rol: req.session.rol,
                mensaje: `<div class = 'alert alert-success' role = 'alert'><h4 class="alert-heading"> <br> Docente asignado </h4><hr></div>`
            });
        }
    );
});

app.post("/eliminarInscritos", (req, res) => {
    Curso.find({ estado: "disponible" }).exec((err, respuesta) => {
        if (err) {
            texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
        }
        res.render("eliminarInscritos", {
            listaCursos: respuesta,
            nombre: req.session.nombre,
            rol: req.session.rol
        });
    });
});

app.post("/eliminado", (req, res) => {
    idElimina = req.body.id;
    cursoElimina = req.body.nombreCurso;
    Inscrito.findOneAndDelete({ nombreCurso: cursoElimina, documento: idElimina },
        (err, resultados) => {
            if (err) {
                return console.log(err);
            }
            if (!resultados) {
                return res.render("eliminado", {
                    bandera: false,
                    mensaje: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> Usuario no econtrado </h4><hr></div>`,
                    nombre: req.session.nombre,
                    rol: req.session.rol
                });
            }
            Inscrito.find({ nombreCurso: cursoElimina }).exec((err, respuesta) => {
                if (err) {
                    return console.log(err);
                }
                if (respuesta.length == 0) {
                    res.render("eliminado", {
                        bandera: false,
                        mensaje: (texto = `<div class = 'alert alert-success' role = 'alert'><h4 class="alert-heading"> <br> No quedan usuarios inscritos </h4><hr></div>`),
                        nombre: req.session.nombre,
                        rol: req.session.rol
                    });
                } else {
                    res.render("eliminado", {
                        bandera: true,
                        mensaje: (texto = `<div class = 'alert alert-success' role = 'alert'><h4 class="alert-heading"> <br> El usuario fue eliminado con éxito </h4><hr></div>`),
                        InscritosCursoInteres: respuesta,
                        nombre: req.session.nombre,
                        rol: req.session.rol
                    });
                }
            });
        }
    );
});

app.post("/editarPerfiles", (req, res) => {
    id_verifica = req.body.id;
    console.log(id_verifica);
    if (!id_verifica) {
        res.render("editarPerfiles", {
            nombre: req.session.nombre,
            rol: req.session.rol
        });
    } else {
        Aspirante.findOne({ documento: id_verifica }, (err, respuesta) => {
            if (err) {
                return console.log(err);
            }
            if (!respuesta) {
                return res.render("editarPerfiles", {
                    mensaje: `<div class = 'alert alert-success' role = 'alert'><h4 class="alert-heading"> <br> El usuario no se encuentra registrado </h4><hr></div>`,
                    nombre: req.session.nombre,
                    rol: req.session.rol
                });
            }
            res.render("editarPerfiles", {
                nombre: req.session.nombre,
                rol: req.session.rol,
                mensaje: "<h2> Información del usuario </h2>",
                Formulario: `<div class="container px-5">
                    <form action="/editado" method="post">
                        <div class="form-row px-5 my-5 border border-dark">
                            <div class="form-group col-md-4 mt-5">
                                Identificación del usuario:
                                <input type="number" class="form-control" size="50" maxlength="50" value="${
                                  respuesta.documento
                                }" name="id" required>
                            </div>
        
                            <div class="form-group col-md-4 mt-5">
                                Nombre del Usuario:
                                <input type="text" class="form-control" size="50" maxlength="50" value="${
                                  respuesta.nombre
                                }" name="nombre" required>
                            </div>
                            <div class="form-group col-md-4 mt-5">
                                Email:
                                <input type="text" class="form-control" size="50" maxlength="50" value="${
                                  respuesta.email
                                }" name="email" required>
                            </div>
                            <div class="form-group col-md-4 mt-5">
                                Telefono:
                                <input type="number" class="form-control" size="50" maxlength="50" value="${
                                  respuesta.telefono
                                }" name="tel" required>
                            </div>
                            <div class="form-group col-md-6 mt-5">
                                Seleccione el rol:
                                <select class="form-control" name="perfil" required>
                                <option>aspirante</option>
                                <option>docente</option>
                                </select>
                            </div>
                            <div class="form-group col-md-6 mt-4 ">
                                <button class="btn btn-dark mx-auto"> Enviar </button>
                            </div>
                            
                    </form>
                </div>`
            });
        });
    }
});

app.post("/editado", (req, res) => {
    datos = {
        nombre: req.body.nombre,
        documento: req.body.id,
        email: req.body.email,
        tel: req.body.tel,
        rol: req.body.perfil
    };
    Aspirante.findOneAndUpdate({ documento: datos.documento },
        datos, { new: true, runValidators: true, context: "query" },
        (err, resultados) => {
            if (err) {
                return console.log(err);
            }

            res.render("editado", {
                mensaje: `<div class = 'alert alert-success' role = 'alert'><h4 class="alert-heading"> <br> El usuario se ha modificado </h4><hr></div>`,
                infoUsuario: datos,
                nombre: req.session.nombre,
                rol: req.session.rol
            });
        }
    );
});

app.post("/verMisCursosDocente", (req, res) => {
    Curso.find({ docente: req.session.nombre }).exec((err, respuesta) => {
        if (err) {
            texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
        }
        Inscrito.find({}).exec((err, respuesta2) => {
            if (err) {
                texto: `<div class = 'alert alert-danger' role = 'alert'><h4 class="alert-heading"> <br> No hay cursos creados </h4><hr></div>`;
            }
            res.render("verMisCursosDocente", {
                listaCursos: respuesta,
                listaInscritos: respuesta2,
                nombre: req.session.nombre,
                rol: req.session.rol
            });
        });
    });
});

app.post("/ingresar", (req, res) => {
    Aspirante.findOne({ documento: req.body.documento }, (err, resultados) => {
        if (err) {
            return console.log(err);
        }
        if (!resultados) {
            return res.render("ingresar", {
                mensaje: "Usuario no encontrado"
            });
        }

        //Para crear las variables de sesión
        req.session.usuario = resultados.documento;
        req.session.nombre = resultados.nombre;
        req.session.rol = resultados.rol;

        if (req.session.rol === "admin") {
            return res.render("ingresar", {
                mensaje: "Bienvenido " + resultados.nombre,
                nombre: req.session.nombre,
                rol: req.session.rol,
                id: req.session.usuario,
                sesion: true
            });
        } else if (req.session.rol === "aspirante") {
            return res.render("ingresar", {
                mensaje: "Bienvenido " + resultados.nombre,
                nombre: req.session.nombre,
                rol: req.session.rol,
                id: req.session.usuario,
                sesion2: true
            });
        } else if (req.session.rol === "docente") {
            return res.render("ingresar", {
                mensaje: "Bienvenido " + resultados.nombre,
                nombre: req.session.nombre,
                rol: req.session.rol,
                id: req.session.usuario,
                sesion3: true
            });
        }
    });
});

app.get("/salir", (req, res) => {
    req.session.destroy(err => {
        if (err) return console.log(err);
    });
    res.redirect("/");
});

module.exports = app;