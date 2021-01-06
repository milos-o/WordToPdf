const express = require('express');
const upload = require("express-fileupload");
const replaceExt = require('replace-ext');
const fs = require('fs');
const path = require('path');
var docxConverter = require('docx-pdf');
const hbs = require("hbs");
const libre = require('libreoffice-convert');
var nodemailer = require('nodemailer');



process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

require('dotenv').config();

const app = express();
app.use(upload())
app.set('view engine', 'hbs');
app.use(express.static(__dirname + "/public"));

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'milos.osto11@gmail.com',
      pass: process.env.PASSWORD
    }
  });
  


app.get('/', function(req, res) {
  res.render("home.hbs");
})

let numberOfConverted = 0;
app.post('/upload', function(req, res) {
  
  if(req.files.upfile){
    const file = req.files.upfile;
    
    let name = file.name;
    let type = file.mimetype;
    console.log(type)
    if(type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && type !== 'application/msword'){
      res.send("We only accept docx or doc files!");
    }
  
    const uploadpath = __dirname + '/uploads/' + file.name;
    const filePosiljka = __dirname + '/output.pdf';
    docxConverter(uploadpath,'./output.pdf',function(err,result){
      if(err){
        console.log(err);
      }
      console.log('result'+result);
    });
  
    var mailOptions = {
        from: 'milos.osto11@gmail.com',
        to: 'milos.gemini@gmail.com',
        subject: 'Sending Email using Node.js',
        attachments: [ 
            {
                path: 'output.pdf'
            }
        ]
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

    file.mv(uploadpath, function(err){
      if(err){
        console.log("File Upload Failed",name,err);
        res.send("Error Occured!")
      }
      else {
        numberOfConverted++;
          //res.setHeader('Content-Length', file.size);
         // res.setHeader("Content-Type", "application/pdf; charset=utf-8");
         // res.setHeader("Content-Disposition", `inline; filename=output.pdf`);
        //  res.send(`<a href=${filePosiljka} download=output.pdf>Download</a>`);
        res.download(filePosiljka);
        fs.unlink(uploadpath, (err) => {
          if (err) {
            console.log(err);
          }
          console.log('FILE [' + file.name + '] REMOVED!');
        });
        //res.render("home.hbs", {
         // path: filePosiljka,
       //   numberOfConverted
     //   });
      }
    });
  }
  else {
    res.send("No File selected !");
    res.end();
  };
})


app.listen(3000); 

/*  fs.unlink(filePosiljka, (err) => {
          if (err) {
            console.log(err);
          }
          console.log('FILE [' + file.name + '] REMOVED!');
        });*/