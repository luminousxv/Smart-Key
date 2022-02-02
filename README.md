# IoT 기반 스마트 키

2022 컴퓨터공학부 종합설계 IoT 기반 스마트 키 Github 입니다.

## 파일 구성 (2022.02.02 수정)

- Server
    - src
        
        app.js (main server program)
        
        - routes
            
            join.js (Join API)
            
            login.js (Login API)

            resetPW.js (reset_pw API)

            keylist.js (view keylist API)

            register_key.js (register new key API)

            delete_key.js (delete key API)

            keyrecord.js (view keyrecord API)
            
        - database
            
            dbconnection.js (Database Connection Configuration)
