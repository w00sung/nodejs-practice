const { User } = require('../models/User') // 모델 갖고 오기 경로 잘봐~~


// 미들웨어!
let auth = (req, res, next) =>{

    // 인증 처리 진행

    // Get Token From Client's cookie
    let token = req.cookies.x_auth

    // Encode Token and find the user
    User.findByToken(token, (err, user) => {
        if(err) throw err
        if(!user) return res.json({isAuth : false, error : true})
        

        /* 이렇게 넣어 줌으로써, 서버에서 token과 user에 접근 가능하다!!!! */
        req.token = token
        req.user = user
        next()  /* middle이니까 다음 녀석으로 반드시 간다. */
    })
    // if success : OK

}

module.exports = {auth}