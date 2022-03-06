const express = require("express");
const app = express();
const path = require("path");
const hbs= require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");


require("./db/conn");
const Register = require("./models/registers");
const { json } = require("express");


const port = process.env.PORT || 3000; 
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));


// console.log(path.join(__dirname,"../public"));
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);
// console.log(process.env.SECRET_KEY);





app.get("/index" , (req, res)=>{
    res.render("index")
})
app.get("/secret" , (req, res) => {
    console.log(`this is the cookie awesome ${req.cookies.jwt}`);
    res.render("secret")
})


app.get("/register" , (req, res)=>{
    res.render("register")
})
app.get("/login" , (req, res)=>{
    res.render("login")
})
      

app.post("/register" , async (req, res)=>{
   try { 
      const password = req.body.password; 
      const cpassword= req.body.confirmpassword;

       if(password === cpassword ){
          const registerEmployee = new Register({
            firstname : req.body.firstname,
            lastname : req.body.lastname,
            email : req.body.email,
            gender  : req.body. gender ,
            phone : req.body. phone,
            age: req.body.age,
            password: req.body.password,
            confirmpassword: req.body.confirmpassword
          })
        //   Generate Token
          console.log("the success part" + registerEmployee);
          const token = await registerEmployee.generateAuthToken();
          console.log("the token part" + token);

        //   add token in cookies
          res.cookie("jwt", token);
          console.log(cookie);

         const registerd = await registerEmployee.save();
         res.status(201).render("index");

       }else{
           res.send("password are not matching")
       }      
   } catch (error) {
       res.status(400).send(error);
        
   }
})


app.post("/login" , async(req, res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;        
        const useremail = await Register.findOne({email:email});
        
        // secure password
        const isMatch =  await bcrypt.compare(password, useremail.password);

        // generate token
        const token = await useremail.generateAuthToken();
        console.log("the token part" + token);

        // cookies part
        res.cookie("jwt",token);

         if(isMatch){
             res.status(201).render("index");
         }else{
             res.send("invalid password details");
         }


    } catch (error) {
        res.status(400).send("invalid login details")
    }
})








// listen port
app.listen(port ,()=>{ 
    console.log(`server running at the port  ${port}`);
}); 