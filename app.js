const express = require('express');
const upload = require("express-fileupload");
const fs = require('fs');
const path = require('path');
var docxConverter = require('docx-pdf');
const hbs = require("hbs");
var nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

require('dotenv').config();

const app = express();
app.use(upload())
app.set('view engine', 'hbs');
app.use(express.static(__dirname + "/public"));

const extend_pdf = '.pdf'
const extend_docx = '.docx'
var down_name;

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

app.post('/upload', function(req, res) {  
  if(req.files.upfile){
    var file = req.files.upfile;
    
    name = file.name;
    name = name.replace(/ /g,'');
    type = file.mimetype;
   if(type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
     return res.render('warning.hbs');
   }

    var uploadpath = __dirname + "/uploads/" + name;

    const First_name = name.split('.')[0];

    down_name = First_name;

    file.mv(uploadpath, function (err){
      if(err){

        console.log(err);
        console.log("prva");
      }
      else{
        var initialPath = path.join(__dirname, `./uploads/${First_name}${extend_docx}`);
        var uploadPath = path.join(__dirname, `./uploads/${First_name}${extend_pdf}`);

        docxConverter(initialPath, uploadPath, function (err, result){
          if(err){
            console.log(err);
            console.log("druga");
          }
          console.log('result'+result);
          var mailOptions = {
                 from: 'milos.osto11@gmail.com',
                 to: req.body.email,
               subject: 'Sending Email using Node.js',
                attachments: [
                     {
                       path: uploadPath
                    }
                 ]
               };
            
               transporter.sendMail(mailOptions, function(error, info){
                 if (error) {
                   console.log(error);
                 } else {
                   console.log('Email sent: ' + info.response);
                   transport.close();
                 }
               });
          res.sendFile(__dirname+'/down_html.html')
        });
      }
    });

  }else{
    res.send("No File selected !");
    res.end();
  }
})

app.get('/download', (req,res) =>{
  //This will be used to download the converted file
  res.download(__dirname +`/uploads/${down_name}${extend_pdf}`,`${down_name}${extend_pdf}`,(err) =>{
    if(err){
      res.send(err);
    }else{
      //Delete the files from uploads directory after the use
      console.log('Files deleted');
      const delete_path_doc = process.cwd() + `/uploads/${down_name}${extend_docx}`;
      const delete_path_pdf = process.cwd() + `/uploads/${down_name}${extend_pdf}`;
      try {
        fs.unlinkSync(delete_path_doc)
        fs.unlinkSync(delete_path_pdf)
        //file removed
      } catch(err) {
        console.error(err)
      }
    }
  })
})

app.get('/thankyou',(req,res) => {
  res.sendFile(__dirname+'/thankyou.html')
})

app.listen(PORT);