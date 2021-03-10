const express = require('express')
const app = express()
const port = 5000
const  { User } = require('./models/User') // 모델 갖고 오기
const config = require('./config/key')
const cookieParser = require('cookie-parser')
const {auth} = require('./middleware/auth')


app.use(cookieParser())


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

app.get('/api/hello',(req,res) => {
    res.send('WHATSUP!')
})

app.post('/register', (req,res) => {

     // 회원 가입 시 필요한 정보들 client에서 get
     // User 모델을 사용한다.

                /* 모든 정보를 모델에 담는다. */
    const user = new User(req.body)
     
     // DB에 삽입
    user.save((err, user) => {
        // error가 있다면?! -> 클라이언트에게 "success : fals && err msg"를 json 형식으로 전달
        if(err) return res.json({ success : false, err})

        // status는 200 (성공) / json 형식으로 true값을 보내준다.
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/login', (req, res) => {
    // 요청한 데이터 DB에 있냐?
                        // email of the request body
    User.findOne({email : req.body.email }, (err, user) => {
        console.log(req.body.email)
        if(!user){
            return res.json({
                loginSucces: false,
                message : "There is no user matching this E-mail"
            })
        }
        // (email DB에 있나? -> ) 비밀번호 맞나? 
                // passwoprd of the request body
        user.comparePassword( req.body.password, (err, isMatch)=>{
            /* 맞는 게 없다면 */
            if(!isMatch)
                return res.json({ loginSuccess : false, message : "Password ERROR"})
            

            // (email DB에 있나? -> 비밀번호 맞나? ->) Token for user  잘 됐나 ?
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err)


                // 토큰을 저장한다! --> 어디에? 쿠키 or 로컬 스토리지 or 세션
                res.cookie("x_auth", user.token)
                .status(200)    // status 200을 뱉는다.
                .json({loginSuccess :true, userId: user._id})   // 괄호 안의 정보들을 json으로 전달한다.
            })
        })
    })
})

                        /* auth : 콜백 function 하기 전에*/
app.get('api/users/auth', auth , (req, res)=>{


    // 여기까지 통과했으면, authetification is true
    res.status(200).json({
        _id : req.user._id,
        isAdmin : req.user.role === 0 ? false : true,
        isAuth : true,

        /* 아래와 같은 정보를 뱉는다. */
        email : req.user.email,
        name : req.user.name,
        lastname: req.user.lastname,
        role : req.user.role,
        image : req.user.image

    })
})


app.get('/api/users/logout', auth, (req, res) => {

                                // request에는 auth에서 넣어줬음
                                // 이 녀석을 찾고.
    User.findOneAndUpdate({_id : req.user._id},
        {token : ""},   // token을 빈 공간으로 덮어쓴다.
        (err, user) => {
            if(err) return res.json({success : false, err})
            return res.status(200).send({
                success:true
            })
        })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})