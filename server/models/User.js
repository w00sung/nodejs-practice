const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10 // salt가 몇글자니 ? ( 10자리인 salt를 만들게 )
const jwt = require('jsonwebtoken')


const userSchema = mongoose.Schema({
    name : {
        type : String,
        maxlength : 50
    },
    email : {
        type : String,
        trim : true,    // 빈칸을 trim 시킨다.
        unique : 1  // unique 해야한다.
    },
    password :{ 
        type : String,
        minlength : 5   /*minimum , not maximum! */
    },
    lastname: {
        type:String,
        maxlength:50
    },
    role:{  // 권한
        type : Number,
        default : 0
    },
    image:String,
    token:{ // 유효성 검증
        type : String
    },
    tokenExp:{
        type : Number
    }
})

// user 모델에 스키마를 'save'하기 전에 할 함수를 작성한다.
// mongoose 메소드 !
userSchema.pre('save', function( next ){

    var user = this // 위를 가리킨다.

    // 비밀번호를 바꿀 때만 !!! ( 다른 요소 바꿀 때는 사용하지 않는다. )
    if(user.isModified('password')){

        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) {
                console.log("bcrypt err")
                return next(err)    // 에러가 나면 바로 다음으로
            }
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) {
                    console.log("HASH err")
                    return next(err)
                }
                user.password = hash // 기존 password(plain password)를 hash 암호화 값으로 변경
                next ()
            })
        })
    }
    else{
        /* 비밀번호를 바꾸는 상황이 아니면 다음으로 넘어간다. */
        next()
    }
})

// 해당 스키마 내 메소드의 comparePassword는 다음과 같다.
userSchema.methods.comparePassword = function(plainPassword, cb){

    // 입력받은 PW -> 암호화 // DB 내 비밀번호
                                                // call back function ?
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err)
        cb(null, isMatch)   // err가 없으면, isMatch : true

    })

}

userSchema.methods.generateToken = function(cb){
    
    var user = this;

    // jsonwebtoken을 이용하여 token 생성

    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)

        cb(null, user) // 에러가 아니면
    })

}

userSchema.statics.findByToken = function(token , cb){

    var user = this

    // token 디코딩!                                // decode 된 녀석은 user id 일 것이다.
    jwt.verify(token, 'secretToken', function(err, decoded){

        // 유저 아이디를 이용하여 유저를 찾는다.
        // 이후 클라이언트에서 가져온 token과 DB 토큰이 일치하는가 확인
        user.findOne({"_id" : decoded, "token" : token}, function(err,user){

            if(err) return cb(err)
            // 에러가 없으면, 에러는 X user 정보를 전달한다.
            cb(null, user)
        })
    })
}




// Model은 스키마를 감싸준다
const User = mongoose.model('User', userSchema) 
module.exports = {User} // 다른 폴더에서도 사용할 수 있게 한다.