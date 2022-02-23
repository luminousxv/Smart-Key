# Share Register/Delete 관련 API 모음집
## 개요
스마트키 소유자가 계정에 등록되어 있는 사람에게 키를 공유하거나 공유를 끊고 싶을 때 호출하는 API이다. </br>
공유자 이메일 등록 및 삭제관련 API이고 공유자가 제어 할 때는 소유자와 마찬가지로 제어 API를 호출한다.</br>
공유자는 공유 받은 스마트키에 대해 open/close만 권한을 줘서 이력관리 및 해당 스마트키 삭제는 불가하게 했다. </br>
## url
/Smart-Key/main/share_key/register

/Smart-Key/main/share_key/delete

## Share Register API
클라이언트(앱)에서 공유할 스마트키를 선택후, 공유 할 계정의 이메일을 입력 받은 후, 스마트키의 시리얼번호와 공유 할 이메일을 서버로 리퀘스트한다.</br>
다음과 같이 클라이언트(앱)은 서버로 요청한다.
~~~jsx
{
    "serialNum" : "0000001",
    "shareEmail": "lsitnt@naver.com"
}
~~~
그럼 서버에서는 해당 시리얼 번호가 존재 하는지 확인하고, 입력받은 이메일이 존재하는지부터 확인을 한다.</br>
존재하지 않는다면 400 에러코드를 보내 다시 입력 받게 하고, 존재 한다면, 일단 시리얼 번호로 등록된 키가 공유 된 상태인지 확인한다.</br>
스마트키는 한 키당 한개의 공유 계정을 가질 수 있다. 그러므로 이미 공유가 걸린 상태라면 또 다른 계정으로 공유 못하게 한다.</br>
공유 조건에 맞으면 서버는 KeyInfo 테이블에 Share 값을 1 (true)로, SharedID를 입력 받은 이메일로 기록한다.</br>
해당 스마트키 이력에도 누구에게 공유를 했는지 DB에 기록을 한다.</br>
그리고 클라이언트(앱)으로 다음과 같이 리스폰스를 한다.</br>
~~~jsx
{
    "code": 200,
    "message": "공유가 완료 되었습니다."
}
~~~
만약 권한이 없는 계정이 API를 호출하면 다음과 같이 리스폰스를 한다.</br>
~~~jsx
{
    "code": 401,
    "message": "허가 받지 않는 계정입니다."
}
~~~
Share Register API 코드이다.</br>
~~~jsx
router.post('/main/share_key/register', function (req, res){
    let serialNum = req.body.serialNum;
    let shareEmail = req.body.shareEmail;

    let sql1 = 'select * from Key_Authority where SerialNum = ?';

    let sql2 = 'update KeyInfo set Shared = ?, SharedID = ? where SerialNum = ?';
    let params2 = [1, shareEmail, serialNum];
    
    let sql3 = 'update Key_Authority set ShareID = ? where SerialNum = ?';
    let params3 = [shareEmail, serialNum];

    let sql4 = 'select * from Users where UserEmail = ?';

    let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
    let sql5 = 'insert into KeyRecord (SerialNum, Time, Method, Email) values (?, ?, ?, ?)';
    let params5 = [serialNum, time, shareEmail + ' 에게 공유', req.session.login.Email];

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }
    else{
        connection.query(sql1, serialNum, function (err, result1){
            if (err) {
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if (result1.length === 0){
                res.status(404).json ({
                    'code': 404,
                    'message': '해당 스마트키가 존재하지 않습니다.'
                })
            }
            else if (result1[0].ShareID != null){
                res.status(400).json ({
                    'code': 400,
                    'message': '이미 공유 받은 계정이 존재합니다.'
                })
            }
            else if (result1[0].OwnerID != req.session.login.Email) {
                res.status(401).json ({
                    'code': 400,
                    'message': '허가 받지 않는 계정입니다.'
                })
            }
            else{
                connection.query(sql4, shareEmail, function (err, result4){
                    if (err) {
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                    }
                    else if (result4.length === 0){
                        res.status(400).json ({
                            'code': 400,
                            'message': '공유 받을 계정이 존재하지 않습니다.'
                        })
                    }
                    else{
                        connection.query(sql2, params2, function (err, result2){
                            if (err) {
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                            }
                            else{
                                connection.query(sql3, params3, function (err, result3){
                                    if (err) {
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                    }
                                    else{
                                        connection.query(sql5, params5, function(err, result5){
                                            if (err) {
                                                res.status(500).json ({
                                                    'code': 500,
                                                    'message': 'DB 오류가 발생했습니다.'
                                                })
                                            }
                                            else{
                                                res.status(200).json ({
                                                    'code': 200,
                                                    'message': '공유가 완료 되었습니다.'
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})
~~~
## Share Delete API
스마트키의 사용자가 공유를 끊고 싶을때 호출하는 API이다. </br>
공유 계정 등록과 마찬가지로 소유자만 가능하고, 공유 계정의 권한을 삭제함으로 접근이 불가능하게 한다.</br>
이력또한 '공유 삭제'라고 DB에 기록이 된다.</br>
클라이언트(앱)에선 공유 기능을 끊고 싶은 스마트키의 시리얼번호를 서버로 리퀘스트 한다.
~~~jsx
{
    "serialNum": "0000001"
}
~~~
공유 등록과 마찬가지로 권한이 없는 계정에게는 401 에러코드를 리스폰스 해주고, 공유 계정이 없는 상태인데 공유 삭제를 하려고 한다면 400 에러코드를 리스폰스한다.</br>
서버는 클라이언트(앱)에게 다음과 같이 리스폰스를 해누다.
~~~jsx
{
    "code" : 200,
    "message": "공유 계정을 삭제했습니다."
}
~~~
Share Delete API 코드이다.</br>
~~~jsx
router.post('/main/share_key/delete', function (req, res){
    let serialNum = req.body.serialNum;

    let sql1 = 'select * from Key_Authority where SerialNum = ?';

    let sql2 = 'update Key_Authority set ShareID = ? where SerialNum = ?';
    let params2 = [null, serialNum];

    let sql3 = 'update KeyInfo set Shared = ?, SharedID = ? where SerialNum = ?';
    let params3 = [0, null, serialNum];

    let time  = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
    let sql4 = 'insert into KeyRecord (SerialNum, Time, Method, Email) values (?, ?, ?, ?)';
    let params4 = [serialNum, time, '공유 삭제', req.session.login.Email];

    if (req.session.login === undefined) {
        let resultCode = 404;
        let message = '세션이 만료되었습니다. 다시 로그인 해주세요';

        res.status(resultCode).json ({
            'code': resultCode,
            'message': message
        });
    }
    else{
        connection.query(sql1, serialNum, function (err, result1){
            if (err) {
                console.log(err);
                res.status(500).json ({
                    'code': 500,
                    'message': 'DB 오류가 발생했습니다.'
                })
            }
            else if (result1.length === 0){
                res.status(400).json ({
                    'code': 400,
                    'message': '해당 스마트키가 존재하지 않습니다.'
                })
            }
            else if (result1[0].OwnerID != req.session.login.Email) {
                res.status(401).json ({
                    'code': 401,
                    'message': '허가 받지 않은 계정입니다.'
                })
            }
            else if (result1[0].ShareID == null) {
                res.status(400).json ({
                    'code': 400,
                    'message': '공유 받은 계정이 존재하지 않습니다.'
                })
            }
            else{
                connection.query(sql2, params2, function (err, result2){
                    if (err) {
                        console.log(err);
                        res.status(500).json ({
                            'code': 500,
                            'message': 'DB 오류가 발생했습니다.'
                        })
                    }
                    else{
                        connection.query(sql3, params3, function (err, result3){
                            if (err) {
                                console.log(err);
                                res.status(500).json ({
                                    'code': 500,
                                    'message': 'DB 오류가 발생했습니다.'
                                })
                            }
                            else{
                                connection.query(sql4, params4, function (err, result4){
                                    if (err) {
                                        console.log(err);
                                        res.status(500).json ({
                                            'code': 500,
                                            'message': 'DB 오류가 발생했습니다.'
                                        })
                                    }
                                    else{
                                        res.status(200).json ({
                                            'code': 200,
                                            'message': '공유 계정을 삭제했습니다.'
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})
~~~