const express = require("express")
const fs = require("fs")
const PizZip = require("pizzip")
const Docxtemplater = require("docxtemplater")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.post("/generate", (req, res) => {

  const { eventName, date, members } = req.body

  try {

    const content = fs.readFileSync("template.docx", "binary")

    const zip = new PizZip(content)
    const doc = new Docxtemplater(zip)

    doc.setData({
      event_name: eventName,
      date: date,
      members: members.join("\n")   // each member new line
    })

    doc.render()

    const buffer = doc.getZip().generate({ type: "nodebuffer" })

    fs.writeFileSync("output.docx", buffer)

    res.download("output.docx")

  } catch (error) {
    console.error(error)
    res.status(500).send("Error generating document")
  }

})

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})