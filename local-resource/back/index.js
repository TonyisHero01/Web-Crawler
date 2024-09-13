const express = require('express')
const cors = require('cors')
const { createHandler } = require("graphql-http/lib/use/express")
const { buildSchema } = require("graphql")
const schedule = require('node-schedule')
const { db } = require('./db/conn')
const app = express()
const port = 3000


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
  res.send('hello world!').status(200);
})


let job = null

const spawn = require('child_process').spawn;

function run_py(url,depth){
  if(url == null || url === '' || url == 'null'){
    url = "https://webik.ms.mff.cuni.cz/nswi153/"
  }
  if(depth == null || depth == '' || depth == 'null'){
    depth = 3
  }
  const py = spawn('python3', ['./script.py', url, depth])
  let output = ''
  py.stdout.on("data", (data) => {
    output += data.toString()
  })
  py.on("close", () => {
    console.log(output)
  })
}

app.post('/config', async (req, res) => {
  del()
  console.log('层数:' + req.body.depth)
  if(req.body.mode === 0){
    job && job.cancel()
    run_py(req.body.url, req.body.depth)
  }else{
    // 每2分钟执行一次
    job = schedule.scheduleJob('0 * * * * *',()=>{
      console.log(new Date().toISOString())
      run_py(req.body.url, req.body.depth)
    })
  }
  res.json(req.body)
})

async function del(){
    await db.collection("db").deleteMany({});
}

var schema = buildSchema(`
  type Page {
    _id: ID
    url: String
    from: String
    title: String
    time: String
    links: [String]
  }

  type Query {
    pages: [
      Page
    ]
  }
`)


var root = {
  async pages() {
    return await db.collection("db").find().toArray()
  },
}

app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: root,
  })
)

app.use(cors())


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})