# Android README

## 개요

 서버와 통신하여 클라이언트가 스마트키를 제어할 수 있도록 하는 앱이다. 
 <br/>
<br/>
<br/>

## 기능별 액티비티 분류
<br/>

### 서버와의 통신을 위한 설정
- Retrofit_service<br/>
- Retrofit_Interface<br/>
- Retrofit_DataClass<br/>
- CookieHandler<br/>
- SharedPrefApp<br/>

### 회원가입
- Register_login<br/>

### 로그인
- MainActivity<br/>

### 스마트키 메인
- SmartkeyMain<br/>
- RecyclerAdapter<br/>

### 스마트키 제어
- SamrtkeyDetail - lock/unlock/log/delete<br/>
- SmartkeyPwDialog

### 스마트키 이력 보기
- SmartkeyLog<br/>
<br/>
<br/>
<br/>

# 서버와의 통신을 위한 설정

## Retrofit_service<br/>
서버와의 http 통신을 위한 싱글톤 오브젝트 작성<br/>
통신은 Base url + 경로로 이루어지기 때문에 이것을 기반으로 계속 사용함<br/>
json 자동 파싱 포함
```Kotlin
package com.example.smartkey_ver10

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object Retrofit_service {

    private const val baseUrl = "http://~~"
    private val retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val service = retrofit.create(Retrofit_Interface::class.java)

}
```

## Retrofit_DataClass<br/>
Rest API로 받아올 앱 내에서 사용할 DTO/POJO 클래스 정의
```Kotlin
package com.example.smartkey_ver10


//회원가입 정보
data class RegisterUserInfo(
    var userEmail: String = "",
    var userPwd: String = "",
    var userName: String = "",
    var userBirth: String ="",
)
//로그인
data class LoginInfo(
    val userEmail: String,
    val userPwd: String,
)

//인증번호
data class CheckAuth(
    var inputAuth: String,
)

//키get
data class GetKeyInfo(
    var code: String,
    var message: List<KeyInfo>
)
data class KeyInfo(
    var SerialNum: String,
    var KeyName: String,
    var KeyState: String,
    var UserID: String,
    var Shared: String
)

//등록키 post
data class RegiserKeyInfo(
    var serialNum: String,
    var keyName: String,
    var smartPwd: String,
)

//키 open, close
data class P_op_cl(
    var serialNum: String,
    var GPSLong:String,
    var GPSLat:String
)

//키 인증
data class PostSmartPw(
    var serialNum: String,
    var smartPwd: String
)
//키 삭제
data class PostserialNum(
    var serialNum: String
)

//키 이력관리 갯
data class GetKeyrecord(
    var code: String,
    var message: List<KeyLog>
)
data class KeyLog(
    var SerialNum: String,
    var Time: String,
    var KeyState: String,
    var GPSLat: String,
    var GPSLong: String,
    var Method: String
)

//리사이클러뷰 아이템
data class ViewItem(
    var img : String,
    var id : String,
    val name : String
)
```

## Retrofit_Interface<br/>
Retrofit2 라이브러리를 사용하기 위한 인터페이스 정의<br/>
경로와 기능에 따라 정의하여 필요에 맞게 사용할 메소드<br/>
포스트의 경우, url에 request 내용을 유출하지 않기위해 HashMap형태의 데이터를 FromUrlEncoded를 통해 포스트하였다.
```Kotlin
package com.example.smartkey_ver10

import retrofit2.Call
import retrofit2.http.*

interface Retrofit_Interface {

    /*---------------------Post------------------------*/
    //로그인
    @FormUrlEncoded
    @POST("user/login/")
    fun postLogin(@FieldMap fields: HashMap<String, String>): Call<LoginInfo>

    //회원가입
    @FormUrlEncoded
    @POST("user/join/email-verification/")
    fun postUserInfo(@FieldMap fields: HashMap<String, String>): Call<RegisterUserInfo>

    //회원가입 시 이메일 인증
    @FormUrlEncoded
    @POST("user/join/join_success/")
    fun postCheckAuth(@Header("Cookie") cookieid: String,
                   @FieldMap fields: HashMap<String, String>): Call<CheckAuth>

    //스마트키 등록
    @FormUrlEncoded
    @POST("main/register_key")
    fun postKeyInfo(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<RegiserKeyInfo>

    //스마트키 open
    @FormUrlEncoded
    @POST("main/open_key/")
    fun postOpen(@Header("Cookie") cookieid: String,
                 @FieldMap fields: HashMap<String, String>): Call<P_op_cl>

    //스마트키 close
    @FormUrlEncoded
    @POST("main/close_key/")
    fun postClose(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<P_op_cl>

    //스마트키 비밀번호 인증
    @FormUrlEncoded
    @POST("main/key_pw/")
    fun postSmartPw(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<PostSmartPw>

    //등록된 스마트키 삭제
    @FormUrlEncoded
    @POST("main/delete_key/")
    fun postDelserialNum(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<PostserialNum>


    /*----------------------Get-----------------------*/
    //스마트키 리스트 불러오기
    @GET("main/view_keylist/")
    fun GetKeyList(@Header("Cookie") cookieid: String): Call<GetKeyInfo>

    //스마트키 사용이력 불러오기
    @GET("main/view_keyrecord/")
    fun GetKeyLog(@Header("Cookie") cookieid: String,
                  @Query("serialNum", encoded = true) sernum:String): Call<GetKeyrecord>

}
```

## CookieHandler<br/>
로그인 이후, 쿠키를 사용하여 세션에 접근 하는 방식으로 로그인한 사용자로 구분한다. 이를 위해 Header에 cookie를 설정하는 클래스이다.
```Kotlin
package com.example.smartkey_ver10

import android.app.Application
import android.content.Context
import android.content.SharedPreferences

class SharedPrefApp: Application() {
    companion object{
        lateinit var storj: PreferenceUtil
    }

    override fun onCreate() {
        storj = PreferenceUtil(applicationContext)
        super.onCreate()
    }
}


class PreferenceUtil(context: Context){
    private val prefs: SharedPreferences =
        context.getSharedPreferences("shared", Context.MODE_PRIVATE)

    fun getString(key:String, defValue:String):String{
        return prefs.getString(key, defValue).toString()
    }

    fun setString(key:String, str:String){
        prefs.edit().putString(key, str).apply()
    }
}
```

## SharedPrefApp<br/>
 앱 내에서 간단한 저장소를 사용할 필요가 있어 sharedpreference를 사용하였다. 이는 CookieHandler에서 사용한다.
```Kotlin
package com.example.smartkey_ver10

import android.app.Application
import android.content.Context
import android.content.SharedPreferences

class SharedPrefApp: Application() {
    companion object{
        lateinit var storj: PreferenceUtil
    }

    override fun onCreate() {
        storj = PreferenceUtil(applicationContext)
        super.onCreate()
    }
}


class PreferenceUtil(context: Context){
    private val prefs: SharedPreferences =
        context.getSharedPreferences("shared", Context.MODE_PRIVATE)

    fun getString(key:String, defValue:String):String{
        return prefs.getString(key, defValue).toString()
    }

    fun setString(key:String, str:String){
        prefs.edit().putString(key, str).apply()
    }
}
```
<br/>
<br/>

# 회원가입
## Register_login<br/>
회원가입을 위한 액티비티이다. 회원 정보 입력 후 회원 정보를 서버로 포스트하며 서버에 성공적으로 포스트가 되면, 입력한 이메일로 인증번호가 수신된다.<br/> 인증번호를 입력한 뒤 버튼을 누르면 인증번호가 포스트되고, 이메일 인증이 완료되면 회원정보가 서버에 저장된다. Rest Api에 따라 200은 성공적인 리스폰스를 가르킨다.
```Kotlin
package com.example.smartkey_ver10

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class Register_login : AppCompatActivity() {

    var isExistBlank = false
    var isPWSame = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_login)

        val Login_intent = Intent(this, MainActivity::class.java)
        val PostRegister = Retrofit_service.service
        val btn_ForCheck = findViewById<Button>(R.id.btn_register)
        var btn_Check = findViewById<Button>(R.id.btn_check)


        //회원정보 입력 후 인증번호 받는 이벤트
        btn_ForCheck.setOnClickListener {

            val id = findViewById<EditText>(R.id.edit_id).text.toString()
            val pw = findViewById<EditText>(R.id.edit_pw).text.toString()
            val pw_re = findViewById<EditText>(R.id.edit_pw_re).text.toString()
            val birth = findViewById<EditText>(R.id.edit_birth).text.toString()
            val naMe = findViewById<EditText>(R.id.edit_name).text.toString()

            //유저가 항목을 다 채우지 않았을 경우
            if(id.isEmpty() || pw.isEmpty() || pw_re.isEmpty()){
                isExistBlank = true
            }
            else{
                if(pw==pw_re){isPWSame=true}
            }
            if(!isExistBlank &&isPWSame){ //전부 맞춰서 보냈을 경우

                var input = HashMap<String,String>()
                input.put("userEmail", id)
                input.put("userPwd", pw)
                input.put("userName", naMe)
                input.put("userBirth", birth)

                PostRegister.postUserInfo(input).enqueue(object : Callback<RegisterUserInfo> {
                    override fun onResponse(call: Call<RegisterUserInfo>, response: Response<RegisterUserInfo>) {
                        if(response.isSuccessful()){
                            var R_data =response.raw()
                            if(R_data.code == 200){
                                CookieHandler().getCookie(response.headers().toMap())
                                //put log
                                Log.d("Test실패","success")
                            }
                        }
                    }
                    override fun onFailure(call: Call<RegisterUserInfo>, t: Throwable) {
                        Log.d("Test실패","t"+t.message)
                    }
                })
            }
        }//end of btn_forcheck

        //인증번호 확인하는 이벤트
        btn_Check.setOnClickListener {

            var vernum = findViewById<EditText>(R.id.edit_AuthNum).text.toString()
            var AuthNumInput = HashMap<String, String>()
            AuthNumInput.put("inputAuth",vernum)

            var cookie = CookieHandler().setCookie()
            PostRegister.postCheckAuth(cookieid = cookie, AuthNumInput).enqueue(object:
                Callback<CheckAuth> {
                override fun onResponse(Call: Call<CheckAuth>, response: Response<CheckAuth>) { //통신성공시
                    if(response.isSuccessful()) {
                        var R_code = response.raw().code
                        if(R_code==200){
                            Log.d("EmailTest","success")
                            startActivity(Login_intent)
                            finish()
                            //test finish
                        }
                        else Log.d("EmailTest","fail")
                    }
                }
                override fun onFailure(call: Call<CheckAuth>, t: Throwable) {  //아예 통신도 안될 때
                    Log.d("EmailTest","t"+t.message)
                }
            })
        }//end of btn_check

    }
}
```
<br/>
<br/>

# 로그인
## MainActivity<br/>
가입한 이메일과 비밀번호를 서버에 포스트하여 로그인한다.
리스폰스로 코드 200을 받으면 세션유지를 위한 쿠키세팅도 진행 한다. 
```Kotlin
package com.example.smartkey_ver10

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val Register_intent = Intent(this, Register_login::class.java)
        val goMain = Intent(this, SmartkeyMain::class.java)
        //val Mainpage_intent = Intent(this, Mainpage::class.java)

        val PostLogin = Retrofit_service.service

        //로그인 버튼
        val btn_login = findViewById<Button>(R.id.btn_login)
        val btn_register = findViewById<Button>(R.id.btn_register)


        btn_login.setOnClickListener{
            //edit text로부터 입력된 값 받아온다.
            var id = findViewById<EditText>(R.id.edit_id).text.toString()
            var pw = findViewById<EditText>(R.id.edit_pw).text.toString()

            var loginInput = HashMap<String, String>()
            loginInput.put("userEmail", id)
            loginInput.put("userPwd", pw)

            PostLogin.postLogin(loginInput).enqueue(object : Callback<LoginInfo> {
                override fun onResponse(call: Call<LoginInfo>, response: Response<LoginInfo>) {

                    if(response.isSuccessful()){
                        var L_code =response.raw()
                        if(L_code.code == 200){
                            Log.d("Test","Post 성공")
                            CookieHandler().getCookie(response.headers().toMap())
                            startActivity(goMain)
                            finish()
                        }
                    }
                }

                override fun onFailure(call: Call<LoginInfo>, t: Throwable) {
                    Log.d("Test실패","t"+t.message)
                }
            })
            Log.d("Test","Test종료")
        }


        btn_register.setOnClickListener{
            startActivity(Register_intent)
        }
    }
}
```
# 스마트키 메인
## SmartkeyMain<br/>
서버로부터 회원이 등록한 키 리스트를 get하여 리사이클러뷰로 게시한다. <br/>클릭 이벤트로는 해당 기기의 시리얼 번호와 이름을 다음 액티비티인 SmartkeyDetail로 넘겨준다.<br/>
SmartkeyDetail로 넘어가기 전, Dialog를 통해 해당 smartkey비밀번호를 한번 더 확인한다.


```Kotlin
package com.example.smartkey_ver10

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SmartkeyMain : AppCompatActivity() {

    val GetService = Retrofit_service.service
    val cookie = CookieHandler().setCookie()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_main)

        //쿠키세팅

        //리사이클러뷰
        val vlist = ArrayList<ViewItem>()

        lateinit var keyList : List<KeyInfo>
        var listSize: Int = 0


        //키 받아오기
        GetService.GetKeyList(cookieid = cookie).enqueue(object : Callback<GetKeyInfo> {
            override fun onResponse(call: Call<GetKeyInfo>, response: Response<GetKeyInfo>) {
                if(response.code()==200){
                    keyList = response.body()!!.message
                    listSize = keyList.size-1
                    Log.d("Test","Get 성공" + response.raw().toString())

                    //리사이클러뷰 아이템 생성
                    for(i in 0..listSize){
                        var keynum = keyList[i].SerialNum
                        var keyname = keyList[i].KeyName
                        vlist.add(ViewItem("","$keynum" , "$keyname"))
                    }
                    val adapter = RecyclerUserAdapter(vlist, {data->adapterOnClick(data)})
                    findViewById<RecyclerView>(R.id.recycleView).adapter = adapter
                }
                else Log.d("Test", "Get 실패")
            }
            override fun onFailure(call: Call<GetKeyInfo>, t: Throwable) {
                Log.d("getTest실패","t"+t.message)
            }
        })
    }

    //클릭 이벤트
    private fun adapterOnClick(data: ViewItem){
        val nexintent = Intent(this, SmartkeyDetailAct::class.java)
        nexintent.putExtra("serialnum", data.id)
        nexintent.putExtra("keyname", data.name)

        //다이얼로그 띄우기
        val dialog = SmartkeyPwDailog(this)
        dialog.Checkdialog()

        //다이얼로그 입력후 클릭 시
        dialog.setOnClickListener(object : SmartkeyPwDailog.OnDialogClickListener{
            override fun onClicked(smartpw: String) {

                var inputkey = HashMap<String, String>()
                inputkey.put("smartPwd", smartpw)
                inputkey.put("serialNum", data.id)

                //삭제 전 smartpw 인증
                GetService.postSmartPw(cookieid = cookie, inputkey).enqueue(object : Callback<PostSmartPw> {
                    override fun onResponse(call: Call<PostSmartPw>, response: Response<PostSmartPw>) {
                        var rescode = response.raw().code
                        if (rescode == 200) {
                            Log.d("SmartPwd인증", "인증 성공")
                            Log.d("response", response.raw().toString())
                            startActivity(nexintent)
                        }
                        else {
                            Log.d("response", response.raw().toString())
                            Toast.makeText(this@SmartkeyMain, "비밀번호가 틀렸습니다.",Toast.LENGTH_SHORT).show()}
                    }
                    override fun onFailure(call: Call<PostSmartPw>, t: Throwable) {
                        Log.d("SmartPwd실패","t"+t.message)
                    }
                })//postSmartPw 끝
            }
        })//다이얼로그 클릭이벤트 끝
    }
}
```
## RecyclerAdapter<br/>
리사이클러 뷰를 펼치기 위한 어댑터 클래스
```Kotlin
package com.example.smartkey_ver10

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class RecyclerUserAdapter(private val items: ArrayList<ViewItem>
                          , private val onClick: (ViewItem) -> Unit)
    : RecyclerView.Adapter<RecyclerUserAdapter.ViewHolder>() {

    override fun getItemCount(): Int {return items.size}

    override fun onBindViewHolder(holder: RecyclerUserAdapter.ViewHolder, position: Int) {

        val item = items[position]
        val listener = View.OnClickListener {
            item.let{
                onClick(item)
            }
        }
        holder.apply {
            bind(listener, item)
            itemView.tag = item
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val inflatedView = LayoutInflater.from(parent.context).inflate(R.layout.item_view, parent, false)
        return RecyclerUserAdapter.ViewHolder(inflatedView)
    }

    // 각 항목에 필요한 기능을 구현
    class ViewHolder(v: View) : RecyclerView.ViewHolder(v) {
        private var view: View = v
        fun bind(listener: View.OnClickListener, item: ViewItem) {
            view.findViewById<TextView>(R.id.txtUser_id).text = item.id
            view.findViewById<TextView>(R.id.txtUser_name).text = item.name
            view.setOnClickListener(listener)
        }
    }
}
```
### 스마트키 제어

## SamrtkeyDetail - lock/unlock/log/delete<br/>
SmartkeyMain에서 넘겨받은 시리얼번호를 가진 스마트키를 제어하는 액티비티로, 한 액티비티에 버튼클릭리스너로 lock/unlock과 delete정보를 포스트하도록 구현하였다.<br/>lock/unlock시 포스트하는 위치정보는 아직 구현하지 않아 임의의 값을 보냈다.<br/> log는 다른 액티비티에서 실행한다.
```Kotlin
package com.example.smartkey_ver10

import android.app.AlertDialog
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SmartkeyDetailAct : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_detail)

        val keynum = intent.getStringExtra("serialnum") //선택한 key의 serialnum
        val keyname = intent.getStringExtra("keyname") // 선택한 key의 이름

        findViewById<TextView>(R.id.nameSmartkey).text = keyname

        val btn_lock = findViewById<Button>(R.id.btn_Lock)
        val btn_unlock = findViewById<Button>(R.id.btn_Unlock)
        val btn_log = findViewById<Button>(R.id.btn_Log)
        //val btn_sharing = findViewById<Button>(R.id.btn_Sharing)
        val btn_Delete = findViewById<Button>(R.id.btn_Delete)

        //쿠키세팅
        var cookie = CookieHandler().setCookie()
        val service = Retrofit_service.service


        //잠금
        btn_lock.setOnClickListener {
            var Keyinput = HashMap<String, String>()
            Keyinput.put("serialNum", keynum!!)
            Keyinput.put("GPSLong", "8")
            Keyinput.put("GPSLat", "5")

            service.postClose(cookieid = cookie, Keyinput).enqueue(object : Callback<P_op_cl> {
                override fun onResponse(call: Call<P_op_cl>, response: Response<P_op_cl>) {
                    var rescode = response.raw().code
                    if(rescode == 200){
                        Log.d("Test","클로즈 성공")
                        Log.d("response", response.raw().toString())
                    } else {
                        Toast.makeText(this@SmartkeyDetailAct, "이미 닫혀있습니다.",Toast.LENGTH_SHORT).show()
                        Log.d("UnlockPost","이미 닫혀있음")
                    }
                }
                override fun onFailure(call: Call<P_op_cl>, t: Throwable) {
                    Log.d("postTest실패","t"+t.message)
                }
            })
        }//잠금 끝

        //열림
        btn_unlock.setOnClickListener {
            var Keyinput = HashMap<String, String>()
            Keyinput.put("serialNum", keynum!!)
            Keyinput.put("GPSLong", "8")
            Keyinput.put("GPSLat", "5")

            service.postOpen(cookieid = cookie, Keyinput).enqueue(object : Callback<P_op_cl> {
                override fun onResponse(call: Call<P_op_cl>, response: Response<P_op_cl>) {
                    var rescode = response.raw().code
                    if(rescode == 200){
                        Log.d("Test","오픈 성공")
                        Log.d("response", response.raw().toString())
                    } 
                    else {
                        Toast.makeText(this@SmartkeyDetailAct, "이미 열려있습니다.",Toast.LENGTH_SHORT).show()
                        Log.d("UnlockPost","이미열려있음")
                    }
                }
                override fun onFailure(call: Call<P_op_cl>, t: Throwable) {
                    Log.d("postTest실패","t"+t.message)
                }
            })
        }//열림 끝

        //이력
        btn_log.setOnClickListener {
            val log_intent = Intent(this, SmartkeyLogAct::class.java)
            log_intent.putExtra("serialnum", keynum)
            log_intent.putExtra("keyname", keyname)
            startActivity(log_intent)
        }

        //키 삭제하기
        btn_Delete.setOnClickListener {
            //다이얼로그 띄우기
            val main_intent = Intent(this, SmartkeyMain::class.java)
            val dialog = SmartkeyPwDailog(this)
            dialog.Checkdialog()

            //다이얼로그 입력후 클릭 시
            dialog.setOnClickListener(object : SmartkeyPwDailog.OnDialogClickListener{
                override fun onClicked(smartpw: String) {

                    var inputkey = HashMap<String, String>()
                    inputkey.put("smartPwd", smartpw)
                    inputkey.put("serialNum", keynum!!)

                    //삭제 전 smartpw 인증
                    service.postSmartPw(cookieid = cookie, inputkey).enqueue(object : Callback<PostSmartPw> {
                        override fun onResponse(call: Call<PostSmartPw>, response: Response<PostSmartPw>) {
                            var rescode = response.raw().code
                            if(rescode == 200){
                                Log.d("SmartPwd인증","인증 성공")
                                Log.d("response", response.raw().toString())

                                //인증 성공 시, 삭제 포스트
                                var inputserNum = HashMap<String, String>()
                                inputserNum.put("serialNum", keynum!!)

                                service.postDelserialNum(cookieid = cookie, inputserNum).enqueue(object :
                                    Callback<PostserialNum> {
                                    override fun onResponse(call: Call<PostserialNum>, response: Response<PostserialNum>) {
                                        var rescode = response.raw().code
                                        if(rescode == 200) {
                                            Log.d("Delete키", "삭제 성공")
                                            Log.d("response", response.raw().toString())
                                            startActivity(main_intent)
                                            Toast.makeText(this@SmartkeyDetailAct, "$keyname 가 삭제되었습니다.",Toast.LENGTH_SHORT).show()
                                            finish()
                                        }
                                        else Log.d("Delete키","삭제 실패")
                                    }

                                    override fun onFailure(call: Call<PostserialNum>, t: Throwable) {
                                        Log.d("Delete 키 실패","t"+t.message)
                                    }
                                })//postDelKey 끝

                            }
                            else {Log.d("SmartPwd","인증실패")
                                Toast.makeText(this@SmartkeyDetailAct, "비밀번호가 틀렸습니다.",Toast.LENGTH_SHORT).show()}
                        }

                        override fun onFailure(call: Call<PostSmartPw>, t: Throwable) {
                            Log.d("SmartPwd실패","t"+t.message)
                        }
                    })//postSmartPw 끝
                }
            })//다이얼로그 클릭이벤트 끝
        }//키 삭제버튼 끝
    }
}
```
## SmartkeyPwDialog
스마트키 비밀번호 포스트를 위한 다이얼로그 클래스이다.<br/>
SmartkeyMain->SmartkeyDetail<br/>
SmartkeyDetail->Delete<br/>
총 두 곳에서 사용한다.
```Kotlin
package com.example.smartkey_ver10

import android.app.Dialog
import android.content.Context
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText

//액티비티 없이 비밀번호 간단 인증을 위한 다이얼로그 클래스
class SmartkeyPwDailog(context: Context) {

    private val dialog = Dialog(context)
    private lateinit var onClickListener: OnDialogClickListener

    fun setOnClickListener(listener: OnDialogClickListener)
    {
        onClickListener = listener
    }


    fun Checkdialog(){
        dialog.setContentView(R.layout.dialog_smartkey_pw)
        dialog.window!!.setLayout(WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT)
        dialog.setCanceledOnTouchOutside(true)
        dialog.setCancelable(true)
        dialog.show()


        val btn_check = dialog.findViewById<Button>(R.id.btn_smartpw_check)
        val btn_cancel = dialog.findViewById<Button>(R.id.btn_smartpw_cancel)

        btn_cancel.setOnClickListener { dialog.dismiss() }

        btn_check.setOnClickListener {
            var smartpw = dialog.findViewById<EditText>(R.id.edit_SmartKeyPw).text.toString()
            onClickListener.onClicked(smartpw)
            dialog.dismiss()
        }

    }
     interface OnDialogClickListener{
         fun onClicked(smartpw: String)
     }

}
```
# 스마트키 이력 보기
## SmartkeyLog<br/>
서버로부터 DB에 저장된 lock/unlock 기록을 갯하여 테이블레이아웃으로 펼쳐준다.
```Kotlin
package com.example.smartkey_ver10

import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.widget.Button
import android.widget.TableLayout
import android.widget.TableRow
import android.widget.TextView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SmartkeyLogAct : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_log)

        val btn_finish = findViewById<Button>(R.id.btn_finish)
        val getservice = Retrofit_service.service
        var cookie = CookieHandler().setCookie()

        val keynum = intent.getStringExtra("serialnum")
        val keyname = intent.getStringExtra("keyname")
        Log.d("keynum",keynum!!)

        lateinit var logtable : List<KeyLog>
        var tablesize: Int = 0

        findViewById<TextView>(R.id.tabletitle).text = keyname


        getservice.GetKeyLog(cookieid = cookie, sernum = keynum!!).enqueue(object : Callback<GetKeyrecord> {
            override fun onResponse(call: Call<GetKeyrecord>, response: Response<GetKeyrecord>) {
                if(response.isSuccessful()){
                    var rescode = response.raw().code
                    if(rescode == 200){
                        Log.d("Test","테이블 갯 성공")
                        logtable = response.body()!!.message
                        tablesize = logtable.size-1
                        for(i in 0..tablesize){
                            var time_text = TextView(this@SmartkeyLogAct)
                            time_text.gravity = Gravity.LEFT
                            var state_text = TextView(this@SmartkeyLogAct)
                            state_text.gravity = Gravity.LEFT
                            var method_text = TextView(this@SmartkeyLogAct)
                            state_text.gravity = Gravity.LEFT


                            time_text.text = logtable[i].Time
                            state_text.text = logtable[i].KeyState
                            method_text.text = logtable[i].Method


                            var tableLayout = findViewById<TableLayout>(R.id.table_layout)
                            var tableRow = TableRow(this@SmartkeyLogAct)

                            tableRow.addView(time_text)
                            tableRow.addView(state_text)
                            tableRow.addView(method_text)

                            tableLayout.addView(tableRow)
                        }
                    }
                }
            }
            override fun onFailure(call: Call<GetKeyrecord>, t: Throwable) {
                Log.d("postTest실패","t"+t.message)
            }
        })



        btn_finish.setOnClickListener {
            finish()
        }
    }

```
