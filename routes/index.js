const express = require('express');
const nodemailer = require('nodemailer');
const cache = require('memory-cache');
const formidable = require('formidable');
const rand = require("../rand.js");

const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('main');
});

router.post('/', (req, res, next) => {
  let email = req.body.email;
  const vaildTime = 180000; //유효시간 3분
  const authNumber = rand.authNo(6); //랜덤한 인증번호 생성 6자리
  console.log(authNumber);
  if (cache.get(email)) {
    cache.del(email);
    //유저가 인증번호 받은 이후에 다시 새롭게 인증번호 요청한 
    //경우가 있을 수 있으므로 기존의 인증번호는 삭제.
  }
  cache.put(email, authNumber, vaildTime);
  res.send(vaildTime.toString());
  //email 전송
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_SEND_EMAILID, //사용할 gmail 아이디 입력
      pass: process.env.NODEMAILER_SEND_EMAILPASSWORD  //사용할 gmail 비밀번호 입력
    }
  });
  mailOptions = {
    from: process.env.NODEMAILER_SEND_EMAILID + '@gmail.com',//발송이메일 입력.
    to: email,
    subject: '인증번호',
    html: "안녕하세요 ,<br> 인증코드를 입력하세요.<br>" + cache.get(email)
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.end("error");
    }
    else {
      console.log('Email sent: ' + info.response);
      res.end('sent');
    }
  });
});

router.post('/verify', (req, res, next) => {
  var form = new formidable.IncomingForm();
  form.parse(req, (err, body) => {
    let email = body.email;
    let authNumber = body.authNumber;

    if (!cache.get(email)) {
      console.log("time out");
      res.end("<h1>Time out</h1>");
    }
    else if (cache.get(email) == authNumber) {
      console.log('sucess verified');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end("인증완료");
    }
    else {
      console.log("not verified");
      res.end("<h1>Bad Request</h1>");
    }
  });
});

module.exports = router;
