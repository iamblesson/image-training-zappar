const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const pino = require("express-pino-logger")();
const train = require("@zappar/imagetraining");
const fs = require("fs/promises");
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(pino);

app.get("/check", function (req, res) {
  res.send("working");
  //    res.sendFile("logo.png", { root: "public" });
  // res.download('./public/logo.png')
});

// configuring the DiskStorage engine.
const storage = multer.diskStorage({
  destination: "public/",
  filename: function (req, file, cb) {
    cb(null, file.originalname+'.png');
  },
});
const upload = multer({ storage: storage });

//POST method route for uploading file
app.post("/train_target", upload.single("file"), function (req, res) {
  res.setHeader("Content-Type", "application/json");
  //send file to zappar training
 perform(req.file.path, req.file.filename, res);
});

async function perform(path, name, res) {
  var filename = name.match(/^.*?([^\\/.]*)[^\\/]*$/)[1];

  let png = await fs.readFile(path);
  let target = await train.train(png);
  await fs.writeFile("public/" + filename + ".zpt", target);
  fs.unlink(path);

  res.sendFile(filename+'.zpt',{root: "public"});
  // res.send({
  //     path:'http://localhost:4001/public/'+filename+".zpt"
  // })
}

const port = process.env.PORT || 4001;
const server = app.listen(port, () => {
  console.log("Connected to port " + port);
});
