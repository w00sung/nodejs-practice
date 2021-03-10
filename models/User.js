const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name : {
        type : String,
        maxlength : 50
    },
    email : {
        type : String,
        trim : true,    // 빈칸을 trim 시킨다.
        unique : 1
    },
    password :{ 
        type : String,
        maxlength : 50
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

// Model은 스키마를 감싸준다
const User = mongoose.model('User', userSchema) 
module.exports = {User} // 다른 폴더에서도 사용할 수 있게 한다.