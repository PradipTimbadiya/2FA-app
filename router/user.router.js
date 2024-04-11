const { Router } = require('express');
const UserContoller = require('../controller/user.controller');
const router = Router();

router.get('/sign-up',(req,res)=>{
    res.render('signup',{msg:req.flash("msg"),errormsg:req.flash("errormsg")});
});
router.get('/sign-in',(req,res)=>{
    res.render('signin',{msg:req.flash("msg"),errormsg:req.flash("errormsg")});
});
router.get('/enable-2fa',(req,res)=>{
    res.render('enable2fa',{msg:req.flash("msg"),errormsg:req.flash("errormsg")});
});
router.get('/verify-2fa',(req,res)=>{
    res.render('verify2fa',{msg:req.flash("msg"),errormsg:req.flash("errormsg")});
});
router.get('/home',(req,res)=>{
    res.render('home',{msg:req.flash("msg")});
})

router.get('*',(req,res)=>{
    res.render('pagenotfound');
})

router.post('/sign-up',UserContoller.signUp);
router.post('/sign-in',UserContoller.signIn);
router.post('/enable-2fa',UserContoller.enable2FA);
router.post('/verify-2fa',UserContoller.verify2FA);


module.exports = router;
