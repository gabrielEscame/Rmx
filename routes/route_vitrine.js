const color = require("chalk")
const router = require("./route_raiz.js")
const util = require("util")
const project = require("../models/schemaProject.js")


//FUNCÕES
//Função para cria o tutorial
async function createProject(reqs) {
  let foundProject = project.create(reqs).then((s) => {console.log(s)}).catch((e) => console.log(e))
  return foundProject
} 

//GET ROUTE
//Tutorial do visitante, sem permissão de editar
router.get("/vitrine", async (req, res) => { // 1
  console.log( color.red(">>> To no vitrine get \n") )
  //vemos se o usuario ta logado
  let idUserOwner = (req.cookies.Connection !== undefined) ? req.cookies.Connection.id : null
  if(idUserOwner !== null) {
    //PRECISAMOS MEXER AQUI, PARA QUE QUANDO ELE TIVER LOGADO O QUE ELE PODERA FAZER?
    var allProject = await project.find().populate("userId") // array de todos os documentos achado
    // console.log(allProject)
    // console.log(idUserOwner)
  }
  else{ var allProject = await project.find().populate("userId") }//DEFAULT MOSTRAMOS A QUEM PERTENCE O TEXTO
  res.render("vitrine/vitrine.hbs", {allProject} )
})

//Routa que leva a permitir cria o tutorial
router.get("/vitrine/create", (req, res) => { //3
  res.render("vitrine/vitrine-create.hbs")
})

router.get("/vitrine/editView", (req,res) => {
  console.log( color.red("to no get edit view" + req.query.id ))
  res.render("vitrine/vitrine-edit.hbs", {id: req.query.id})
})

//POST
//pegamos o id do render sucess na rote_login
router.post("/vitrine/edit", async(req, res) => { // 2
  console.log( color.red(">>> To no vitrine post edit \n" + req.query.id ) );
  req.body.userId = (req.cookies.Connection !== undefined) ? req.cookies.Connection.id : null//colocamos o id do user para o objeto req.body

  const findProject = await project.findById(req.query.id).then((s)=> {return (s)})
  const enableEdit = (findProject.userId == req.body.userId)

  if((req.body.text !== "") && (req.body.title !== "") && (enableEdit) && (req.body.userId !== null))//criando
  {
    req.body.Project = await project.findByIdAndUpdate(req.query.id, req.body)//criando o tutorial se ele ta em texto e logado
    res.redirect("/vitrine") //mandamos para o hbs o objeto para manipular
  } else { //erro
    res.render("vitrine/vitrine-edit.hbs", { error: "Falha ao criar o projeto, preencha os campo corretamente" }) 
  }
})

router.post("/vitrine/create", async(req, res) => {
  console.log( color.red(">>> To no vitrine post create \n" + req.query.id ) );
  req.body.userId = (req.cookies.Connection !== undefined) ? req.cookies.Connection.id : null//colocamos o id do user para o objeto req.body
  if((req.body.text !== "") && (req.body.title !== "") && (req.body.userId !== null))//criando
  {
    await createProject(req.body)//criando o tutorial se ele ta em texto e logado
    res.redirect("/vitrine") //mandamos para o hbs o objeto para manipular
  } else { //erro
    res.render("vitrine/vitrine-create.hbs", { error: "Falha ao criar o projeto, preencha os campo corretamente" }) 
  }
})

//AQUI SÓ VEMOS O RESULTADO ESPECIFICO, VINDO DE ALL TUTORIALs
router.post("/vitrine/owner", async (req, res) => { // 2
  console.log( color.red(">>> To no vitrine owner \n" + req.query.id ) );
  req.body.Project = await project.findById(req.query.id).populate("userId")
  res.render("vitrine/vitrine-owner.hbs", req.body) //mandamos para o hbs o objeto para manipular
})

//delete
router.post("/vitrine/remove" , async (req, res) => {
  let idVitrineRemove = req.query.id
  console.log( "to na routa post remove Vitrine " + idVitrineRemove)
  req.body.userId = (req.cookies.Connection !== undefined) ? req.cookies.Connection.id : null

  const findProject = await project.findById(idVitrineRemove)
  const enableRemove = (findProject.userId == req.body.userId)

  if(idVitrineRemove && enableRemove) {
    project.findByIdAndRemove(idVitrineRemove)
    .then((s) => console.log(s))
    .catch((e) => console.log(e))
  }

  res.redirect("/vitrine")
})