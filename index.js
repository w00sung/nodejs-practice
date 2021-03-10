const express = require('express')
const app = express()
const port = 5000
const  { User } = require('./models/User') // 모델 갖고 오기
const config = require('./config/key')


const bodyParser = require('body-parser')
// encoding application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true}))

// encoding application/json
app.use(bodyParser.json())


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser:true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify: false
}).then(()=> console.log('MongoDB connected ...'))
.catch(err => console.log(err))



app.get('/', (req, res) => {
    res.send('Hello World!') 
})

app.post('/register', (req,res) => {

     // 회원 가입 시 필요한 정보들 client에서 get
     // User 모델을 사용한다.
     const user = new User(req.body)
     
     // DB에 삽입
    user.save((err, userInfo) => {
        // error가 있다면?! -> 클라이언트에게 "success : fals && err msg"를 json 형식으로 전달
        if(err) return res.json({ success : false, err})

        // status는 200 (성공) / json 형식으로 true값을 보내준다.
        return res.status(200).json({
            success: true
        })
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})