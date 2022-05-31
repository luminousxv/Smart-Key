# Android README

## 개요

 서버와 통신하거나 블루투스 통신으로 클라이언트가 스마트키를 제어할 수 있도록 하는 앱이다. 
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

### 블루투스 통신을 위한 설정
- SmartkeyBluetoothSetting<br/>

### 로그인
- MainActivity<br/>

### 회원가입
- Register_login<br/>
- Register_resetPw<br/>

### 스마트키 메인
- SmartkeyMain<br/>
- RecyclerAdapter<br/>
- SmartkeyAddkey<br/>

### 스마트키 제어
- SamrtkeyDetail <br/>
- SmartkeyLogAct<br/>
- SmartkeySharingAct<br/>

### 다이얼로그
- SmartkeyDialog
<br/>
<br/>
<br/>

# 서버와의 통신을 위한 설정

## Retrofit_service<br/>
서버와의 http 통신을 위한 싱글톤 오브젝트 작성<br/>
통신은 Retrofit lib을 사용함<br/>
json 자동 파싱 포함
```Kotlin
package com.example.smartkey_ver10

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object Retrofit_service {

    private const val baseUrl = "URL"
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
    var Shared: String,
    var Mode: String
)

//등록키 post
data class RegisterKeyInfo(
    var serialNum: String,
    var keyName: String,
    var smartPwd: String,
)

//키 open, close
data class P_op_cl(
    var serialNum: String,
    var GPSLong: String,
    var GPSLat: String
)

//키 인증
data class PostSmartPw(
    var serialNum: String,
    var smartPwd: String
)
//키 삭제, 공유삭제, 보안모드
data class PostserialNum(
    var serialNum: String,
    var message: String
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
    var GPSLat: Double,
    var GPSLong: Double,
    var Method: String
)

//키 공유
data class PostSharedInfo(
    var serialNum: String,
    var shareEmail: String
)

//비밀번호 초기화
data class PostForResetInfo(
    var userEmail: String,
    var userName: String,
    var userBirth: String
)
data class PostResetPW(
    var userPwd: String
)

//보안모드사진
data class GetSecuImg(
    var code: String,
    var message: String
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
경로와 기능에 따라 정의했다.<br/>

```Kotlin
interface Retrofit_Interface {

    /*--------------------------------Post--------------------------------------*/
    @FormUrlEncoded
    @POST("user/login/")
    fun postLogin(@FieldMap fields: HashMap<String, String>): Call<LoginInfo>

    @FormUrlEncoded
    @POST("user/join/email-verification/")
    fun postUserInfo(@FieldMap fields: HashMap<String, String>): Call<RegisterUserInfo>

    @FormUrlEncoded
    @POST("user/join/join_success/")
    fun postCheckAuth(@Header("Cookie") cookieid: String,
                   @FieldMap fields: HashMap<String, String>): Call<CheckAuth>

    @FormUrlEncoded
    @POST("main/register_key")
    fun postKeyInfo(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<RegisterKeyInfo>

    @FormUrlEncoded
    @POST("main/open_key/")
    fun postOpen(@Header("Cookie") cookieid: String,
                 @FieldMap fields: HashMap<String, String>): Call<P_op_cl>

    @FormUrlEncoded
    @POST("main/close_key/")
    fun postClose(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<P_op_cl>

    @FormUrlEncoded
    @POST("main/mode/")
    fun postMode(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<PostserialNum>

    @FormUrlEncoded
    @POST("main/key_pw/")
    fun postSmartPw(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<PostSmartPw>

    @FormUrlEncoded
    @POST("main/delete_key/")
    fun postDelserialNum(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<PostserialNum>

    @FormUrlEncoded
    @POST("main/share_key/register/")
    fun postSharedinfo(@Header("Cookie") cookieid: String,
                       @FieldMap fields: HashMap<String, String>): Call<PostSharedInfo>

    @FormUrlEncoded
    @POST("main/share_key/delete/")
    fun postDeleteShared(@Header("Cookie") cookieid: String,
                       @FieldMap fields: HashMap<String, String>): Call<PostserialNum>

    @FormUrlEncoded
    @POST("user/reset/email/")
    fun postForResetUserinfo(@FieldMap fields: HashMap<String, String>): Call<PostForResetInfo>

    @FormUrlEncoded
    @POST("user/reset/verification/")
    fun postForResetCheckAuth(@Header("Cookie") cookieid: String,
                      @FieldMap fields: HashMap<String, String>): Call<CheckAuth>

    @FormUrlEncoded
    @POST("user/reset/change_pw/")
    fun postResetPw(@Header("Cookie") cookieid: String,
                            @FieldMap fields: HashMap<String, String>): Call<PostResetPW>

    /*-----------------------------------Get------------------------------------*/
    @GET("main/view_keylist/")
    fun GetKeyList(@Header("Cookie") cookieid: String): Call<GetKeyInfo>

    @GET("main/view_keyrecord/")
    fun GetKeyLog(@Header("Cookie") cookieid: String,
                  @Query("serialNum", encoded = true) sernum:String): Call<GetKeyrecord>

    @GET("main/view_keyrecord/image/")
    fun GetSecurityImage(@Header("Cookie") cookieid: String,
                        @Query("serialNum") sernum: String,
                        @Query("time") time: String): Call<GetSecuImg>

}
```

## CookieHandler<br/>
로그인 이후, 쿠키를 사용하여 세션에 접근 하는 방식으로 사용자를 구분한다. 이를 위해 쿠키를 받아 sharedpreference를 사용하여 앱에 저장 후 사용하였다. 또한, 이후 최초등록자/공유사용자 구분을 위한 로그인 사용자의 email을 저장하였다.
```Kotlin
class CookieHandler {

    fun getCookie(header : Map<String, String>){

        if(header != null){
            var cookielist = header.get("Set-Cookie").toString()
            var cookstring: List<String> = cookielist.split(";")
            var sessionid: String = cookstring[0]

            SharedPrefApp.storj.setString("cookie",sessionid)
            Log.d("getCookie","getcookie성공")
        }
        else Log.d("getCookie","getcookie실패")
    }

    fun setCookie():String{
        var cookieid: String = SharedPrefApp.storj.getString("cookie","")
        Log.d("setCookie","setcookie성공"+cookieid)
        return cookieid
    }

    fun putUserEmail(Email: String){
        SharedPrefApp.storj.setString("UserEmail", Email)
    }

    fun setUserEmail():String{
        var email = SharedPrefApp.storj.getString("UserEmail","")
        return email
    }

}
```
## SharedPrefApp<br/>
Cookie와 Email을 필요할 때마다 꺼내쓰기 위하여 SharedPreference를 사용했다.
```kotlin
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

# 블루투스 통신을 위한 설정
## SmartkeyBluetoothSetting<br/>
블루투스를 사용하기 위해 필요에 맞게 어댑터를 만들었다. 페어링 목록을 불러오고, 그 중 선택이벤트가 발생하면 연결한다. 필요에 따라 블루투스 소켓통신을 하기위한 메서드도 작성했다.

```Kotlin
class SmartkeyBluetoothSetting(context: Context) {

    val thisCon: Context = context

    var mBluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    var mPairedDevices: Set<BluetoothDevice>? = null
    var mListPairedDevices: MutableList<String>? = null
    var mBluetoothHandler: Handler? = null
    var mThreadConnectedBluetooth : ConnectedBluetoothThread? = null
    var mBluetoothDevice: BluetoothDevice? = null
    var mBluetoothSocket: BluetoothSocket? = null

    fun registSuccess(){
        mThreadConnectedBluetooth!!.write("150")
    }

    fun open(){
        mThreadConnectedBluetooth!!.write(BT_OPEN)
    }

    fun close(){
        mThreadConnectedBluetooth!!.write(BT_CLOSE)
    }


    fun bluetoothOn() {
        if (mBluetoothAdapter == null) {
            Toast.makeText(thisCon, "블루투스를 지원하지 않는 기기입니다.", Toast.LENGTH_LONG).show()
        } else {
            if (mBluetoothAdapter!!.isEnabled) {
                listPairedDevices()
            } else {
                Toast.makeText(thisCon, "블루투스가 활성화 되어 있지 않습니다.", Toast.LENGTH_LONG)
                    .show()
            }
        }
    }

    fun bluetoothOff() {
        if (mBluetoothAdapter!!.isEnabled) {
            mThreadConnectedBluetooth!!.write(BT_DISCONNECT)
            mThreadConnectedBluetooth!!.cancel()
            mBluetoothAdapter!!.disable()
            Toast.makeText(thisCon, "블루투스가 비활성화 되었습니다.", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(thisCon, "블루투스가 이미 비활성화 되어 있습니다.", Toast.LENGTH_SHORT).show()
        }
    }


    fun listPairedDevices() {
        if (mBluetoothAdapter!!.isEnabled) {
            mPairedDevices = mBluetoothAdapter!!.bondedDevices
            if (mPairedDevices!!.size > 0) {
                val builder: AlertDialog.Builder = AlertDialog.Builder(thisCon)
                builder.setTitle("장치 선택")
                mListPairedDevices = ArrayList()
                for (device in mPairedDevices!!) {
                    mListPairedDevices!!.add(device.name)
                    //mListPairedDevices.add(device.getName() + "\n" + device.getAddress());
                }
                val items = mListPairedDevices!!.toTypedArray<CharSequence>()
                mListPairedDevices!!.toTypedArray<CharSequence>()
                builder.setItems(items,
                    DialogInterface.OnClickListener { dialog, item -> connectSelectedDevice(items[item].toString()) })
                val alert: AlertDialog = builder.create()
                alert.show()
            } else {
                Toast.makeText(thisCon, "페어링된 장치가 없습니다.", Toast.LENGTH_LONG).show()
            }
        } else {
            Toast.makeText(thisCon, "블루투스가 비활성화 되어 있습니다.", Toast.LENGTH_SHORT).show()
        }
    }

    fun connectSelectedDevice(selectedDeviceName: String) {
        for (tempDevice in mPairedDevices!!) {
            if (selectedDeviceName == tempDevice.name) {
                mBluetoothDevice = tempDevice
                break
            }
        }
        try {
            mBluetoothSocket = mBluetoothDevice!!.createRfcommSocketToServiceRecord(BT_UUID)
            mBluetoothSocket!!.connect()
            mThreadConnectedBluetooth = ConnectedBluetoothThread(mBluetoothSocket!!)
            mThreadConnectedBluetooth!!.start()
            mBluetoothHandler!!.obtainMessage(BT_CONNECTING_STATUS, 1, -1).sendToTarget()
            mThreadConnectedBluetooth!!.write(BT_CONNECT)
        } catch (e: IOException) {
            Toast.makeText(thisCon, "블루투스 연결 중 오류가 발생했습니다.", Toast.LENGTH_LONG).show()
        }
    }

    inner class ConnectedBluetoothThread(val mmSocket: BluetoothSocket) :
        Thread() {
        private val mmInStream: InputStream?
        private val mmOutStream: OutputStream?
        override fun run() {
            val buffer = ByteArray(1024)
            var bytes: Int
            while (true) {
                while(IsRunning){
                    try {
                        bytes = mmInStream!!.available()
                        if (bytes != 0) {
                            SystemClock.sleep(500)
                            bytes = mmInStream.available()
                            bytes = mmInStream.read(buffer, 0, bytes)
                            mBluetoothHandler!!.obtainMessage(BT_MESSAGE_READ, bytes, -1, buffer)
                                .sendToTarget()
                        }
                    } catch (e: InterruptedException) {
                        break
                    }
                }
            }
        }

        fun write(str: String) {
            val bytes = str.toByteArray()
            try {
                mmOutStream!!.write(bytes)
            } catch (e: IOException) {
                Toast.makeText(thisCon, "데이터 전송 중 오류가 발생했습니다.", Toast.LENGTH_LONG).show()
            }
        }

        fun cancel() {
            try {
                mmSocket.close()
            } catch (e: IOException) {
                Toast.makeText(thisCon, "소켓 해제 중 오류가 발생했습니다.", Toast.LENGTH_LONG).show()
            }
        }

        init {
            var tmpIn: InputStream? = null
            var tmpOut: OutputStream? = null
            try {
                tmpIn = mmSocket.inputStream
                tmpOut = mmSocket.outputStream
            } catch (e: IOException) {
                Toast.makeText(thisCon, "소켓 연결 중 오류가 발생했습니다.", Toast.LENGTH_LONG).show()
            }
            mmInStream = tmpIn
            mmOutStream = tmpOut
        }
    }

    companion object {
        const val BT_REQUEST_ENABLE = 1
        const val BT_MESSAGE_READ = 2
        const val BT_CONNECTING_STATUS = 3
        val BT_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
        const val BT_CONNECT = "100"
        const val BT_OPEN = "200"
        const val BT_CLOSE = "300"
        const val BT_DISCONNECT = "400"
        var IsRunning = true
    }

}
```

# 로그인
## MainActivity<br/>
가입한 이메일과 비밀번호를 서버에 포스트한다.

```Kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val Register_intent = Intent(this, Register_login::class.java)
        val goMain = Intent(this, SmartkeyMain::class.java)
        val goResetpage = Intent(this, Register_resetPw::class.java)

        val PostLogin = Retrofit_service.service

        //로그인 버튼
        val btn_login = findViewById<Button>(R.id.btn_login)
        val btn_register = findViewById<Button>(R.id.btn_register)
        val txt_resetPw = findViewById<TextView>(R.id.txt_resetPw)

        btn_login.setOnClickListener{
            //edit text로부터 입력된 값 받아온다.
            var id = findViewById<EditText>(R.id.edit_id).text.toString()
            var pw = findViewById<EditText>(R.id.edit_pw).text.toString()

            var idEnco = Base64.encodeToString(id.toByteArray(), Base64.NO_WRAP)
            var pwEnco = Base64.encodeToString(pw.toByteArray(), Base64.NO_WRAP)

            var loginInput = HashMap<String, String>()
            loginInput.put("userEmail", idEnco)
            loginInput.put("userPwd", pwEnco)

            PostLogin.postLogin(loginInput).enqueue(object : Callback<LoginInfo> {
                override fun onResponse(call: Call<LoginInfo>, response: Response<LoginInfo>) {
                    if(response.code() == 200){
                        CookieHandler().putUserEmail(id) //공유키 구분위함
                        Log.d("로그인","로그인 post 성공")
                        CookieHandler().getCookie(response.headers().toMap())
                        startActivity(goMain)
                        finish()
                    }
                }
                override fun onFailure(call: Call<LoginInfo>, t: Throwable) {
                    Log.d("로그인","t"+t.message)
                    //dialog("fail")
                }
            })
        }

        txt_resetPw.setOnClickListener{
            startActivity(goResetpage)
        }

        btn_register.setOnClickListener{
            startActivity(Register_intent)
        }
    }
}
```


# 회원가입
## Register_login<br/>
회원가입을 위한 액티비티이다. 회원 정보 입력 후 회원 정보를 서버로 포스트하며 서버에 성공적으로 포스트가 되면, 입력한 이메일로 인증번호가 수신된다.<br/> 인증번호를 입력한 뒤 버튼을 누르면 인증번호가 포스트되고, 이메일 인증이 완료되면 회원정보가 서버에 저장된다.
```Kotlin
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
        var naMe = findViewById<EditText>(R.id.edit_name).text.toString()
        var num_year = findViewById<NumberPicker>(R.id.num_year)
        var num_month = findViewById<NumberPicker>(R.id.num_month)
        var num_day = findViewById<NumberPicker>(R.id.num_day)

        //생년월일 조작
        num_year.wrapSelectorWheel = false
        num_month.wrapSelectorWheel = false
        num_day.wrapSelectorWheel = false
        num_year.descendantFocusability = NumberPicker.FOCUS_BLOCK_DESCENDANTS
        num_month.descendantFocusability = NumberPicker.FOCUS_BLOCK_DESCENDANTS
        num_day.descendantFocusability = NumberPicker.FOCUS_BLOCK_DESCENDANTS
        num_year.minValue = 1950
        num_month.minValue = 1
        num_day.minValue = 1
        num_year.maxValue = 2010
        num_month.maxValue = 12
        num_day.maxValue = 31


        //회원정보 입력 후 인증번호 받기위한 메서드
        btn_ForCheck.setOnClickListener {

            var id = findViewById<EditText>(R.id.edit_id).text.toString()
            var pw = findViewById<EditText>(R.id.edit_pw).text.toString()
            var pw_re = findViewById<EditText>(R.id.edit_pw_re).text.toString()

            var birth = num_year.value.toString() + "." + num_month.value.toString() + "." +
                    num_day.value.toString()

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

                        if(response.code() == 200){
                            CookieHandler().getCookie(response.headers().toMap()) //쿠키 받기
                            //put log
                            Log.d("회원가입post","success")
                        }
                    }
                    override fun onFailure(call: Call<RegisterUserInfo>, t: Throwable) {
                        Log.d("회원가입post","t"+t.message)
                    }
                })
            }
        }//end of btn_forcheck

        //인증번호 확인하는 메서드
        btn_Check.setOnClickListener {

            var vernum = findViewById<EditText>(R.id.edit_AuthNum).text.toString()
            var AuthNumInput = HashMap<String, String>()
            AuthNumInput.put("inputAuth",vernum)

            var cookie = CookieHandler().setCookie()
            PostRegister.postCheckAuth(cookieid = cookie, AuthNumInput).enqueue(object:
                Callback<CheckAuth> {
                override fun onResponse(Call: Call<CheckAuth>, response: Response<CheckAuth>) { //통신성공시

                    if(response.code()==200){
                        Log.d("인증키post","success")
                        startActivity(Login_intent)
                        finish()
                    }
                    else Log.d("인증키post","fail")
                }
                override fun onFailure(call: Call<CheckAuth>, t: Throwable) {  //아예 통신도 안될 때
                    Log.d("EmailTest","t"+t.message)
                }
            })
        }//end of btn_check

    }
}
```
## Register_resetPw<br/>
비밀번호를 초기화하는 액티비티로 로그인 액티비티 비밀번호 edittext 아래 textview를 터치하면 들어올 수 있다. 중간에 스마트키 비밀번호 다이얼로그가 사용된다.

```Kotlin
class Register_resetPw : AppCompatActivity() {
    val PostService = Retrofit_service.service

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_reset_pw)

        val btn_postAuthNum = findViewById<Button>(R.id.btn_authCheck)
        val btn_postInfo = findViewById<Button>(R.id.btn_postInfo)

        btn_postInfo.setOnClickListener {

            var userEmail = findViewById<EditText>(R.id.edt_useremail).text.toString()
            var userName = findViewById<EditText>(R.id.edt_username).text.toString()
            var userBirth = findViewById<EditText>(R.id.edt_userbirth).text.toString()

            var InputInfo = HashMap<String,String>()

            InputInfo.put("userEmail", userEmail)
            InputInfo.put("userName", userName)
            InputInfo.put("userBirth", userBirth)

            PostService.postForResetUserinfo(InputInfo).enqueue(object : Callback<PostForResetInfo> {
                override fun onResponse(call: Call<PostForResetInfo>, response: Response<PostForResetInfo>) {

                    if(response.code() == 200){
                        CookieHandler().getCookie(response.headers().toMap()) //쿠키 받기
                        Log.d("유저정보","전송성공"+response.raw())
                        findViewById<EditText>(R.id.edt_authNum).visibility = View.VISIBLE
                        btn_postAuthNum.visibility = View.VISIBLE
                        btn_postAuthNum.setOnClickListener {
                            var cookie = CookieHandler().setCookie()

                            var authNum = findViewById<EditText>(R.id.edt_authNum).text.toString()
                            Log.d("인증번호",authNum)

                            var InputAuthNum = HashMap<String,String>()
                            InputAuthNum.put("inputAuth", authNum)
                            postAuthNum(cookie, InputAuthNum) //인증번호 전송, 전송 후 비밀번호 변경 다이얼로그까지
                        }//버튼끝
                            Log.d("유저정보","전송완료")
                    }

                    else Log.d("유저정보","전송실패"+response.raw())
                }
                override fun onFailure(call: Call<PostForResetInfo>, t: Throwable) {
                    Log.d("로그인","t"+t.message)
                    //dialog("fail")
                }
            })
        }//버튼 끝
    }


    fun postAuthNum(cookie : String, Input : HashMap<String, String>){

        PostService.postForResetCheckAuth(cookieid = cookie, Input).enqueue(object : Callback<CheckAuth> {
            override fun onResponse(call: Call<CheckAuth>, response: Response<CheckAuth>) {
                if(response.code() == 200){
                    Log.d("인증번호","전송성공"+response.raw())
                    resetPw(cookie) //비밀번호 변경, 포스트 다이얼로그
                }
                else Log.d("인증번호","전송실패"+response.raw())
            }
            override fun onFailure(call: Call<CheckAuth>, t: Throwable) {
                Log.d("인증번호","t"+t.message)
            }
        })
    }//fun postAuthNum 끝


    fun resetPw(cookie : String){

        //다이얼로그 띄우기
        val dialog = SmartkeyDialog(this)
        dialog.Checkdialog_userpw()

        //다이얼로그 입력후 클릭 시
        dialog.setOnClickListener_re(object : SmartkeyDialog.OnDialogClickListener_repw{
            override fun onClicked_repw(reset_pw: String, reset_pw_re: String) {

                if(reset_pw == reset_pw_re && reset_pw.length>8){ //비밀번호 9자, 비번 같을때
                    Toast.makeText(this@Register_resetPw, "비밀번호 변경이 완료되었습니다."
                        , Toast.LENGTH_SHORT).show()

                    var inputkey = HashMap<String, String>()
                    inputkey.put("userPwd", reset_pw)

                    //resetpw 보내기
                    PostService.postResetPw(cookie, inputkey).enqueue(object : Callback<PostResetPW> {
                        override fun onResponse(call: Call<PostResetPW>, response: Response<PostResetPW>) {

                            if(response.code() == 200){
                                Log.d("resetpw","리셋 성공")
                                Toast.makeText(this@Register_resetPw, "비밀번호 변경이 완료되었습니다."
                                    , Toast.LENGTH_SHORT).show()
                                finish() //액티비티 끝내기
                            }
                            else {Log.d("resetpw","리셋 실패")
                                Toast.makeText(this@Register_resetPw, "비밀번호 변경실패."
                                    , Toast.LENGTH_SHORT).show()}
                        }

                        override fun onFailure(call: Call<PostResetPW>, t: Throwable) {
                            Log.d("resetpw","t"+t.message)
                        }
                    })//postSmartPw 끝
                }
                else if(reset_pw.length<9)Toast.makeText(this@Register_resetPw, "비밀번호는 9자 이상이어야 합니다."
                    , Toast.LENGTH_SHORT).show()
                else if(reset_pw != reset_pw_re)Toast.makeText(this@Register_resetPw, "비밀번호가 다릅니다.",
                Toast.LENGTH_SHORT).show()
            }
        })//다이얼로그 클릭이벤트 끝
    }//fun resetPw 끝


}
```
<br/>
<br/>


# 스마트키 메인
## SmartkeyMain<br/>
서버로부터 회원이 등록한 키 리스트를 get하여 리사이클러뷰로 게시한다. 최초등록 키와 공유받은 키로 구분한다. 기기등록 버튼을 누르면 기기등록 액티비티로 이동한다.<br/> 리사이클러뷰 아이템을 선택하면 원격/블루투스 접속을 선택할 수 있으며 선택 후 스마트키 비밀번호 다이얼로그를 띄운뒤, 선택한 스마트키 정보를 SmartkeyDetailAct에 전달한다. <br/>
블루투스로 접속할 시 블루투스 소켓통신으로 스마트키를 조작할 수 있도록 다이얼로그를 띄운다.


```Kotlin
class SmartkeyMain : AppCompatActivity() {

    //쿠키세팅
    val GetService = Retrofit_service.service
    val cookie = CookieHandler().setCookie()
    val UserEmail = CookieHandler().setUserEmail()

    //블루투스 셋팅
    val bluetoothService = SmartkeyBluetoothSetting(this@SmartkeyMain)


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_main)

        //기기추가
        val addkey_intent = Intent(this, SmartkeyAddKey::class.java)
        val btn_addKey = findViewById<Button>(R.id.btn_addkey)
        btn_addKey.setOnClickListener { startActivity(addkey_intent)}

        //리사이클러뷰
        val registered_list = ArrayList<ViewItem>()
        val shared_list = ArrayList<ViewItem>()

        //키리스트
        lateinit var keyList : List<KeyInfo>
        var listSize: Int = 0
        var keyshared = HashMap<String, String>()//키 이름, 공유여부
        var keymode = HashMap<String, String>()//키 이름, 모드
        var keystate = HashMap<String, String>()//키 상태

        //키 받아오기
        GetService.GetKeyList(cookieid = cookie).enqueue(object : Callback<GetKeyInfo> {
            override fun onResponse(call: Call<GetKeyInfo>, response: Response<GetKeyInfo>) {
                if(response.code()==200){
                    keyList = response.body()!!.message
                    listSize = keyList.size-1
                    Log.d("SmartkeyGet","Get 성공" + response.raw().toString())

                    //리사이클러뷰 아이템 생성
                    for(i in 0..listSize){
                        if(keyList[i].UserID == UserEmail){ //직접 등록한 스마트키
                            var keynum = keyList[i].SerialNum
                            var keyname = keyList[i].KeyName
                            keyshared.put(keyList[i].KeyName, keyList[i].Shared)
                            keymode.put(keyList[i].KeyName, keyList[i].Mode)
                            keystate.put(keyList[i].KeyName, keyList[i].KeyState)
                            registered_list.add(ViewItem("","$keynum" , "$keyname"))
                        } else{                             //공유받은 스마트키
                            var keynum = keyList[i].SerialNum
                            var keyname = keyList[i].KeyName
                            keyshared.put(keyList[i].KeyName, keyList[i].Shared)
                            keymode.put(keyList[i].KeyName, keyList[i].Mode)
                            keystate.put(keyList[i].KeyName, keyList[i].KeyState)
                            shared_list.add(ViewItem("","$keynum" , "$keyname"))
                        }
                    }
                }
                else Log.d("SmartkeyGet", "Get 실패")
            }
            override fun onFailure(call: Call<GetKeyInfo>, t: Throwable) {
                Log.d("SmartkeyGet","t"+t.message)
            }
        }) //키받아오기 끝

        //등록 키 클릭 이벤트
        val reg_adapter = RecyclerUserAdapter(registered_list,
            {data->adapterOnClick(data, keyshared.get(data.name), keymode.get(data.name),
                keystate.get(data.name),"0")})
        findViewById<RecyclerView>(R.id.registered_recycleView).adapter = reg_adapter

        //공유 키 클릭 이벤트
        val shared_adapter = RecyclerUserAdapter(shared_list,
            {data->adapterOnClick(data, keyshared.get(data.name), keymode.get(data.name),
                keystate.get(data.name), "1")})
        findViewById<RecyclerView>(R.id.shared_recycleView).adapter = shared_adapter
    }

    //-----------------------------------블루투스 조작--------------------------------------//

    private fun bluetoothControl(DeviceName: String){

        SmartkeyBluetoothSetting.IsRunning = false //메시지 읽기 쓰레드 일시 정지

        val Smartkeydialog = SmartkeyDialog(this)
        Smartkeydialog.Controldialog_BT(DeviceName)
        Smartkeydialog.setOnClickListener_BT(object : SmartkeyDialog.OnDialogClickListener_BT{
            override fun onClicked_BT(openclose:Int) {
                if(openclose == 0){ // 클로즈
                    bluetoothService.close()
                }
                else if(openclose == 1){ //오픈
                    bluetoothService.open()
                }
                else if(openclose == 2){ // 닫기
                    bluetoothService.bluetoothOff()
                }
            }
        })
    }

    fun blueElse(){
        Toast.makeText(this, "선택한 키와 블루투스 키와 정보가 다릅니다",
            Toast.LENGTH_SHORT).show()
    }

    //클릭 이벤트 함수
    private fun adapterOnClick(data: ViewItem, keyshared:String?, keymode:String?, keystate:String?
                               ,registerd: String){
        //등록키 클릭 시
        if(registerd=="0"){
            var serial_Num :String? = null
            val BluOrHttpSelect = AlertDialog.Builder(this)
            BluOrHttpSelect.setTitle("연결 선택")
            var seleclist : MutableList<String> = ArrayList()
            seleclist.add("원격 접속")
            seleclist.add("블루투스 접속")
            val items = seleclist!!.toTypedArray<CharSequence>()

            BluOrHttpSelect.setItems(items,
                DialogInterface.OnClickListener { dialog, item ->
                    //원격접속일 떄
                    if(item == 0){smartPwPost(data, keyshared, registerd, keymode,keystate,
                        items[item].toString())}

                    //---------------블루투스 접속일 때-----------------------
                    if(item == 1){
                        bluetoothService.bluetoothOn() //블루투스 연결

                        //블루투스 연결 되면 기기 확인(시리얼번호 대조)
                        if(serial_Num == null) {
                            if (bluetoothService.mBluetoothAdapter != null) {
                                bluetoothService.mBluetoothHandler = object : Handler() {
                                    override fun handleMessage(msg: Message) {
                                        if (msg.what == SmartkeyBluetoothSetting.BT_MESSAGE_READ) {
                                            var readMessage: String? = null
                                            try {
                                                readMessage = String(msg.obj as ByteArray)
                                            } catch (e: UnsupportedEncodingException) {
                                                e.printStackTrace()
                                            }
                                            var temp_serial_num = readMessage.toString().chunked(6)
                                            serial_Num = temp_serial_num[0]
                                            //시리얼 번호 확인
                                            smartPwPost(data, keyshared, registerd, keymode, keystate,
                                                items[item].toString())
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            val alert: AlertDialog = BluOrHttpSelect.create()
            alert.show()
        }
        //공유키 클릭 시 스마트키 비밀번호 필요없음
        else if(registerd=="1"){
            if(keymode=="0"){//일반 모드 일때
                val Detialintent = Intent(this, SmartkeyDetailAct::class.java)
                Detialintent.putExtra("shared", keyshared)
                Detialintent.putExtra("registerd", registerd)
                Detialintent.putExtra("serialnum", data.id)
                Detialintent.putExtra("keyname", data.name)
                Detialintent.putExtra("keymode", keymode)
                Detialintent.putExtra("keystate", keystate)
                startActivity(Detialintent)
                finish()
            }
            else if(keymode == "1"){//보안모드일 때 접근 불가
                Toast.makeText(this, "보안모드 작동중이므로 접근할 수 없습니다.",Toast.LENGTH_SHORT).show()
            }
        }

    }//클릭이벤트 함수 끝


    //스마트키 비밀번호 포스트함수
    fun smartPwPost(data:ViewItem, keyshared: String? ,registerd: String, keymode: String?,
                    keystate:String?, selection:String){

        val Detialintent = Intent(this, SmartkeyDetailAct::class.java)
        val Smartkeydialog = SmartkeyDialog(this)

        //스마트키 비밀번호 다이얼로그 띄우기
        Smartkeydialog.Checkdialog_smpw()

        //다이얼로그 입력후 클릭 시
        Smartkeydialog.setOnClickListener(object : SmartkeyDialog.OnDialogClickListener{
            override fun onClicked(smartpw: String) {

                var inputkey = HashMap<String, String>()
                inputkey.put("smartPwd", smartpw)
                inputkey.put("serialNum", data.id)

                GetService.postSmartPw(cookieid = cookie, inputkey).enqueue(object : Callback<PostSmartPw> {
                    override fun onResponse(call: Call<PostSmartPw>, response: Response<PostSmartPw>) {
                        if (response.code() == 200) {
                            Log.d("SmartPwd인증", "인증 성공")
                            Log.d("response", response.raw().toString())

                            if(selection == "원격 접속"){
                                Detialintent.putExtra("shared", keyshared)
                                Detialintent.putExtra("registerd", registerd)
                                Detialintent.putExtra("serialnum", data.id)
                                Detialintent.putExtra("keyname", data.name)
                                Detialintent.putExtra("keymode", keymode)
                                Detialintent.putExtra("keystate", keystate)
                                startActivity(Detialintent)
                                finish()
                            }
                            else if(selection == "블루투스 접속"){
                                bluetoothControl(data.name)} // 블루투스 제어 다이얼로그
                        }
                        else {
                            Log.d("response", response.raw().toString())
                            Toast.makeText(this@SmartkeyMain, "비밀번호가 틀렸습니다.",Toast.LENGTH_SHORT).show()}
                    }
                    override fun onFailure(call: Call<PostSmartPw>, t: Throwable) {
                        Log.d("SmartPwd인증","t"+t.message)
                    }
                })//postSmartPw 끝
            } })//다이얼로그 클릭이벤트 끝
    }//스마트키 비밀번호 포스트함수 끝
}
```
## RecyclerAdapter<br/>
리사이클러 뷰를 펼치기 위한 어댑터 클래스
```Kotlin
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
            view.findViewById<TextView>(R.id.txtUser_name).text = item.name
            view.findViewById<TextView>(R.id.txtUser_id).text = item.id
            view.setOnClickListener(listener)
        }
    }
}
```

## SmartkeyAddKey<br/>
블루투스 어댑터를 이용하여 미리 페어링해놓은 스마트키를 찾아 고유 시리얼 넘버를 받아 서버에 스마트키정보를 포스트하여 등록하는 액티비티다.

```kotlin
class SmartkeyAddKey : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_add_key)

        val btn_findDivice = findViewById<Button>(R.id.btn_findDvice)
        val btn_post = findViewById<Button>(R.id.btn_addCheck)
        val btn_addCancel = findViewById<Button>(R.id.btn_addCancel)
        var text_serialNum = findViewById<TextView>(R.id.text_serialnum)
        var serial_Num : String? = null

        //작업 후 메인으로 이동
        val goMain = Intent(this, SmartkeyMain::class.java)


        //블루투스 다룰 객체 생성
        val bluetoothService = SmartkeyBluetoothSetting(this@SmartkeyAddKey)
        //http 통신
        val postService = Retrofit_service.service
        var cookie = CookieHandler().setCookie()

        //블루투스 세팅(페어링 된 기기만 표시 -> 연결할 기기 선택 -> 연결과 동시에 기기에 연결코드 '100' 전송)
        btn_findDivice.setOnClickListener {
            bluetoothService.bluetoothOn()
        }

        btn_post.setOnClickListener {

            Toast.makeText(this@SmartkeyAddKey,
                "serialNum $serial_Num", Toast.LENGTH_SHORT).show()

            var Smartkeyname = findViewById<EditText>(R.id.edit_keyName).text.toString()
            var SmartkeyPw = findViewById<EditText>(R.id.edit_smartPw).text.toString()
            var SmartkeyPwRe = findViewById<EditText>(R.id.edit_smartPwRe).text.toString()

            if(SmartkeyPw == SmartkeyPwRe){
                var keyInfoInput = HashMap<String, String>()
                keyInfoInput.put("serialNum", serial_Num!!)
                keyInfoInput.put("keyName",Smartkeyname)
                keyInfoInput.put("smartPwd",SmartkeyPw)

                postService.postKeyInfo(cookieid = cookie, keyInfoInput).enqueue(object : Callback<RegisterKeyInfo> {
                    override fun onResponse(call: Call<RegisterKeyInfo>, response: Response<RegisterKeyInfo>) {
                        if (response.code() == 200) {
                            Log.d("키등록", "등록 성공")
                            Toast.makeText(this@SmartkeyAddKey,
                                "키 등록을 완료하였습니다.", Toast.LENGTH_SHORT).show()
                            bluetoothService.registSuccess()
                            bluetoothService.bluetoothOff()
                            startActivity(goMain)
                            finish()
                        } else {
                            Log.d("키등록", "실패"+response.raw().toString())
                            Toast.makeText(this@SmartkeyAddKey,
                                "키 등록 정보를 다시 확인하세요 ${response.message()}", Toast.LENGTH_SHORT).show()
                        }
                    }
                    override fun onFailure(call: Call<RegisterKeyInfo>, t: Throwable) {
                        Log.d("LockPost", "t" + t.message)
                    }
                })
            }
            else Toast.makeText(this@SmartkeyAddKey,
                "비밀번호를 확인하세요", Toast.LENGTH_SHORT).show()
        }

        btn_addCancel.setOnClickListener {
            bluetoothService.bluetoothOff()
            finish()
        }

        if(serial_Num == null){ //이거 안되면 6자리만 짤라서 사용하기
            if(bluetoothService.mBluetoothAdapter != null){
                bluetoothService.mBluetoothHandler = object : Handler() {
                    override fun handleMessage(msg: Message) {
                        if (msg.what == SmartkeyBluetoothSetting.BT_MESSAGE_READ) {
                            var readMessage: String? = null
                            try {
                                readMessage = String(msg.obj as ByteArray)
                            } catch (e: UnsupportedEncodingException) {
                                e.printStackTrace()
                            }
                            var serial_num_temp = readMessage.toString().chunked(6)
                            serial_Num = serial_num_temp[0]

                            text_serialNum!!.text = readMessage
                            if(serial_Num != null){
                                SmartkeyBluetoothSetting.IsRunning = false //메시지 읽기 쓰레드 일시 정지
                            }
                        }
                    }
                }
            }
        }

    }
}
```
### 스마트키 제어

## SamrtkeyDetail <br/>
SmartkeyMain에서 넘겨받은 정보로 목적에 맞게 UI를 구성하고 오픈, 클로즈, 로그액티비티로 이동, 공유하기, 삭제하기를 할 수 있는 제어 액티비티이다.<br/>
오픈, 클로즈 시 gps정보를 얻어 서버에 함께 포스트한다.
```Kotlin
class SmartkeyDetailAct : AppCompatActivity() {

    //쿠키세팅
    val cookie = CookieHandler().setCookie()
    val service = Retrofit_service.service

    //gps 변수
    var lat : Double = 0.0
    var long: Double = 0.0

    //같은 스마트키 다이얼로그를 쓰는 메서드에 공유해제인지 키 삭제인지 확인
    private val SHARED_DEL = 1001
    private val KEY_DEL = 1002


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_detail)

        //gps 변수
        val Im = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val isGPSEnabled: Boolean = Im.isProviderEnabled(LocationManager.GPS_PROVIDER)
        val isNetworkEnabled: Boolean = Im.isProviderEnabled(LocationManager.NETWORK_PROVIDER)

        //SmartkeyMain에서 넘겨받은 키 정보
        val keynum = intent.getStringExtra("serialnum") //선택한 key의 serialnum
        val keyname = intent.getStringExtra("keyname") // 선택한 key의 이름
        val unregisterd = intent.getStringExtra("registerd") //등록키인지 공유키인지 확인
        val keyshared = intent.getStringExtra("shared")//공유가 가능한지 불가능한지 판단
        var keymode = intent.getStringExtra("keymode")//키 모드
        var keystate = intent.getStringExtra("keystate")//키 상태

        val goMain = Intent(this, SmartkeyMain::class.java)

        //버튼
        val btn_back = findViewById<Button>(R.id.btn_back)
        val imv_lock = findViewById<ImageView>(R.id.imv_Lock)
        val imv_unlock = findViewById<ImageView>(R.id.imv_Unlock)
        val imv_log = findViewById<ImageView>(R.id.imv_Log)
        val btn_sharing = findViewById<Button>(R.id.btn_Sharing)
        val btn_Delete = findViewById<Button>(R.id.btn_Delete)
        var switch_mode = findViewById<Switch>(R.id.switch_mode)

        findViewById<TextView>(R.id.nameSmartkey).text = keyname //스마트키 이름 표시

        //공유키, 등록키, 공유가능여부, 키모드에 따라 다른 초기 UI
        init_UI_set(unregisterd!!, keyshared!!, keymode!!, keystate!!,
            imv_log, btn_sharing, btn_Delete, imv_lock, imv_unlock, switch_mode)


        //보안모드
        switch_mode.setOnCheckedChangeListener { compoundButton, on ->
            if(on){
                imv_lock.isEnabled = false
                imv_unlock.isEnabled = false
                imv_log.isEnabled = false
                btn_sharing.isEnabled = false
                btn_Delete.isEnabled = false
                //모드 포스트
                postMODE(keynum!!)
            }
            else{
                imv_lock.isEnabled = true
                imv_unlock.isEnabled = true
                imv_log.isEnabled = true
                btn_sharing.isEnabled = true
                btn_Delete.isEnabled = true
                //모드 포스트
                postMODE(keynum!!)
            }
        }


        //------------------------버튼시작 --------------------//
        //잠금
        imv_lock.setOnClickListener {
            getGPSInfo(isGPSEnabled, isNetworkEnabled, Im)

            var Keyinput = HashMap<String, String>()
            Keyinput.put("serialNum", keynum!!)
            Keyinput.put("GPSLong", long.toString())
            Keyinput.put("GPSLat", lat.toString())

            service.postClose(cookieid = cookie, Keyinput).enqueue(object : Callback<P_op_cl> {
                override fun onResponse(call: Call<P_op_cl>, response: Response<P_op_cl>) {
                    if (response.code() == 200) {
                        Log.d("LockPost", "클로즈 성공")
                        Log.d("response", response.raw().toString())
                        imv_lock.visibility = View.GONE
                        imv_unlock.visibility = View.VISIBLE
                    } else {
                        Log.d("LockPost", "오류가 발생했습니다.")
                        Toast.makeText(this@SmartkeyDetailAct,
                            "이미 닫혀있습니다.", Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<P_op_cl>, t: Throwable) {
                    Log.d("LockPost", "t" + t.message)
                }
            })
        }//잠금 끝

        //열림
        imv_unlock.setOnClickListener {
            getGPSInfo(isGPSEnabled, isNetworkEnabled, Im)
            var Keyinput = HashMap<String, String>()
            Keyinput.put("serialNum", keynum!!)
            Keyinput.put("GPSLong", long.toString())
            Keyinput.put("GPSLat", lat.toString())

            service.postOpen(cookieid = cookie, Keyinput).enqueue(object : Callback<P_op_cl> {
                override fun onResponse(call: Call<P_op_cl>, response: Response<P_op_cl>) {
                    if (response.code() == 200) {
                        Log.d("UnlockPost", "오픈 성공")
                        Log.d("response", response.raw().toString())
                        imv_unlock.visibility = View.GONE
                        imv_lock.visibility = View.VISIBLE
                    } else {
                        Toast.makeText(this@SmartkeyDetailAct, "오류가 발생했습니다.", Toast.LENGTH_SHORT)
                            .show()
                        Log.d("UnlockPost", "response badcode")
                    }
                }
                override fun onFailure(call: Call<P_op_cl>, t: Throwable) {
                    Log.d("UnlockPost", "t" + t.message)
                }
            })
        }//열림 끝

        //이력
        imv_log.setOnClickListener {
            val log_intent = Intent(this, SmartkeyLogAct::class.java)
            log_intent.putExtra("serialnum", keynum)
            log_intent.putExtra("keyname", keyname)
            startActivity(log_intent)
        }

        //공유하기
        btn_sharing.setOnClickListener {
            if(keyshared == "1"){ //공유해제
                postsmartkeypw(keynum!!,keyname!! , SHARED_DEL)
            }
            else{
                val sharing_intent = Intent(this, SmartkeySharingAct::class.java)
                sharing_intent.putExtra("serialnum", keynum)
                sharing_intent.putExtra("keyname", keyname)
                startActivity(sharing_intent)
            }
        }

        //키 삭제하기
        btn_Delete.setOnClickListener {
            postsmartkeypw(keynum!!,keyname!!, KEY_DEL)
        }

        //뒤로가기
        btn_back.setOnClickListener {
            startActivity(goMain)
            finish()
        }
    }

    //----------------------------------초기 화면 띄우기-------------------------------------
    fun init_UI_set(unregisterd: String, keyshared: String, keymode: String, keystate: String, imv_log:ImageView,
    btn_sharing: Button, btn_Delete: Button, imv_lock: ImageView, imv_unlock: ImageView, switch_mode: Switch){
        if(keystate == "close"){
            imv_unlock.visibility = View.VISIBLE
        }
        else imv_lock.visibility = View.VISIBLE

        //공유 스마트키로 접근 시 버튼 없애기
        if (unregisterd == "1") {
            imv_log.visibility = View.INVISIBLE
            btn_sharing.visibility = View.INVISIBLE
            btn_Delete.visibility = View.INVISIBLE
            switch_mode.visibility = View.INVISIBLE
        }
        //이미 공유 된 키일 때 공유 삭제로 작동
        if(keyshared=="1"){
            btn_sharing.text = "스마트키 공유해제"
        }
        //초기 스위치 상태 확인
        if(keymode == "0"){//일반모드
            switch_mode.isChecked = false
            imv_lock.isEnabled = true
            imv_unlock.isEnabled = true
            imv_log.isEnabled = true
            btn_sharing.isEnabled = true
            btn_Delete.isEnabled = true
        }
        else if(keymode == "1"){ //보안모드
            switch_mode.isChecked = true
            imv_lock.isEnabled = false
            imv_unlock.isEnabled = false
            imv_log.isEnabled = false
            btn_sharing.isEnabled = false
            btn_Delete.isEnabled = false
        }
    }

    //----------------------------------post 메서드-----------------------------------------

    fun postMODE(keynum: String){
        var inputNum = HashMap<String, String>()
        inputNum.put("serialNum", keynum!!)

        service.postMode(cookieid = cookie, inputNum).enqueue(object : Callback<PostserialNum> {
            override fun onResponse(call: Call<PostserialNum>, response: Response<PostserialNum>) {
                if (response.code() == 200) {
                    Log.d("모드", response.body()!!.message)
                    if(response.body()!!.message =="스마트키가 보안모드로 변경되었습니다."){
                        Toast.makeText(this@SmartkeyDetailAct, "보안모드로 설정되었습니다.",
                            Toast.LENGTH_SHORT).show()
                    }
                    else Toast.makeText(this@SmartkeyDetailAct, "일반모드로 설정되었습니다.",
                        Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@SmartkeyDetailAct,
                        "서버와의 오류가 발생했습니다.", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onFailure(call: Call<PostserialNum>, t: Throwable) {
                Log.d("LockPost", "t" + t.message)
            }
        })
    }

    //스마트키 비밀번호 인증
    fun postsmartkeypw(keynum:String, keyname: String, sharedDelOrKeyDel : Int){
        val dialog = SmartkeyDialog(this)
        dialog.Checkdialog_smpw()

        //다이얼로그 입력후 클릭 시
        dialog.setOnClickListener(object : SmartkeyDialog.OnDialogClickListener {
            override fun onClicked(smartpw: String) {

                var inputkey = HashMap<String, String>()
                inputkey.put("smartPwd", smartpw)
                inputkey.put("serialNum", keynum!!)

                //삭제 전 smartpw 인증
                service.postSmartPw(cookieid = cookie, inputkey).enqueue(object : Callback<PostSmartPw> {
                    override fun onResponse(call: Call<PostSmartPw>, response: Response<PostSmartPw>){
                        if (response.code() == 200) {
                            Log.d("SmartPwd인증", "인증 성공")
                            Log.d("response", response.raw().toString())
                            if(sharedDelOrKeyDel == SHARED_DEL){ //공유해제 시
                                postdeleteshared(keynum, keyname)
                            }
                            else if(sharedDelOrKeyDel == KEY_DEL){ //키삭제 시
                                postdeleteinfo(keynum, keyname)
                            }
                        } else {
                            Log.d("SmartPwd", "인증실패")
                            Toast.makeText(this@SmartkeyDetailAct,
                                "비밀번호를 다시 확인하세요.", Toast.LENGTH_SHORT).show()
                        }
                    }
                    override fun onFailure(call: Call<PostSmartPw>, t: Throwable) {
                        Log.d("SmartPwd실패", "t" + t.message)
                    }
                })//postSmartPw 끝
            }
        })//다이얼로그 클릭이벤트 끝
    }

    //키 삭제
    fun postdeleteinfo(keynum: String, keyname: String){

        val go_main = Intent(this, SmartkeyMain::class.java)
        // 삭제 포스트
        var inputserNum = HashMap<String, String>()
        inputserNum.put("serialNum", keynum!!)

        service.postDelserialNum(cookieid = cookie, inputserNum).enqueue(object : Callback<PostserialNum> {
            override fun onResponse(call: Call<PostserialNum>, response: Response<PostserialNum>) {
                if (response.code() == 200) {
                    Log.d("Delete키", "삭제 성공")
                    Log.d("response", response.raw().toString())
                    Toast.makeText(this@SmartkeyDetailAct,
                        "$keyname 가 삭제되었습니다.", Toast.LENGTH_SHORT).show()
                    startActivity(go_main)
                    finish()
                } else Log.d("Delete키", "삭제 실패")
            }
            override fun onFailure(call: Call<PostserialNum>, t: Throwable) {
                Log.d("Delete 키 실패", "t" + t.message)
            }
        })//postDelKey 끝
    }

    //공유정보 삭제
    fun postdeleteshared(keynum: String, keyname: String){
        // 공유해제 포스트
        val go_main = Intent(this, SmartkeyMain::class.java)
        var inputserNum = HashMap<String, String>()
        inputserNum.put("serialNum", keynum!!)

        service.postDeleteShared(cookieid = cookie, inputserNum).enqueue(object : Callback<PostserialNum> {
            override fun onResponse(call: Call<PostserialNum>, response: Response<PostserialNum>) {
                if (response.code() == 200) {
                    Log.d("공유키", "공유해제 성공")
                    Log.d("response", response.raw().toString())
                    Toast.makeText(this@SmartkeyDetailAct,
                        "$keyname 의 공유가 해제되었습니다.", Toast.LENGTH_SHORT).show()
                    startActivity(go_main)
                    finish()
                } else Log.d("공유키", "공유해제 실패")
            }
            override fun onFailure(call: Call<PostserialNum>, t: Throwable) {
                Log.d("Delete 키 실패", "t" + t.message)
            }
        })//postDelKey 끝
    }

    //----------------------gps정보 받아오는 메서드--------------------------------//

    fun getGPSInfo(isGPSEnabled: Boolean, isNetworkEnabled: Boolean, Im: LocationManager){
        //권한 체크
        if(Build.VERSION.SDK_INT>=23 &&
            ContextCompat.checkSelfPermission(applicationContext, Manifest.permission.ACCESS_FINE_LOCATION)!=
            PackageManager.PERMISSION_GRANTED){
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),0)
        } else{
            when{ //프로바이더 제공자 활성화 여부 체크
                isNetworkEnabled ->{
                    val location = Im.getLastKnownLocation(LocationManager.NETWORK_PROVIDER) //인터넷 기반 위치
                    long = location?.longitude!!
                    lat = location?.latitude!!
                }
                isGPSEnabled ->{
                    val location = Im.getLastKnownLocation(LocationManager.GPS_PROVIDER) //gps기반
                    long = location?.longitude!!
                    lat = location?.latitude!!
                }
            }
        }
    }

}
```
## SmartkeyLogAct
스마트키의 보안모드, 일반모드, 작동 이력, 공유이력을 서버에서 Get하여 최신순으로 테이블레이아웃에 출력하는 액티비티이다.
gps정보를 받아 Geocoder를 사용하여 지역명을 표시했다.
```kolin
class SmartkeyLogAct : AppCompatActivity() {

    val STORAGE_CODE = 99

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_log)

        val btn_finish = findViewById<Button>(R.id.btn_finish)
        val getservice = Retrofit_service.service
        var cookie = CookieHandler().setCookie()

        val keynum = intent.getStringExtra("serialnum")
        val keyname = intent.getStringExtra("keyname")

        lateinit var logtable : List<KeyLog>

        val geocoder = Geocoder(this)
        var addrlist : List<Address>? = null

        findViewById<TextView>(R.id.tabletitle).text = keyname + "의 사용내역"

        getservice.GetKeyLog(cookieid = cookie, sernum = keynum!!).enqueue(object : Callback<GetKeyrecord> {
            override fun onResponse(call: Call<GetKeyrecord>, response: Response<GetKeyrecord>) {
                if(response.code() == 200){

                    //Get 성공 시 테이블 레이아웃 생성
                    Log.d("SmartkeyLog","테이블 갯 성공")
                    logtable = response.body()!!.message

                    var tablesize = logtable.size-1

                    //테이블에 들어갈 내용 기록(최근순)
                    for(i in tablesize downTo 0){
                        var time_text = TextView(this@SmartkeyLogAct)
                        time_text.gravity = Gravity.CENTER
                        var state_text = TextView(this@SmartkeyLogAct)
                        state_text.gravity = Gravity.RIGHT
                        var method_text = TextView(this@SmartkeyLogAct)
                        method_text.gravity = Gravity.CENTER
                        var gps_text = TextView(this@SmartkeyLogAct)
                        gps_text.gravity = Gravity.CENTER

                        //타임스탬프를 두줄에 나누어서 표현
                        var temp_time_0 = logtable[i].Time.chunked(11)
                        var temp_time_1 = temp_time_0[0].chunked(10) //.지우기
                        var timeT = temp_time_1[0]+"\n"+temp_time_0[1]

                        time_text.text = timeT
                        state_text.text = logtable[i].KeyState

                        if(logtable[i].Method.length > 10){
                            var temp_method = logtable[i].Method.chunked(10)
                            var methodM = temp_method[0]+"\n"+temp_method[1]+"\n"+temp_method[2]
                            method_text.text = methodM
                        }
                        else method_text.text = logtable[i].Method

                        if(logtable[i].GPSLat != null && logtable[i].GPSLong != null){
                            addrlist = geocoder.getFromLocation(
                                logtable[i].GPSLat, logtable[i].GPSLong, 1)
                            if (addrlist != null) {
                                if (addrlist?.size == 0) {
                                    gps_text.text = " "
                                } else {
                                    var addrString = addrlist!!.get(0).locality
                                    if(addrString != null && addrString.length > 8){
                                        var tempAddr = addrString.chunked(8)
                                        gps_text.text = tempAddr[0]+"\n"+tempAddr[1]
                                    }
                                    else gps_text.text = addrString
                                }
                            }
                            else gps_text.text = " "
                        }
                        else gps_text.text = " "

                        var tableLayout = findViewById<TableLayout>(R.id.table_layout)
                        var tableRow = TableRow(this@SmartkeyLogAct)

                        tableRow.addView(time_text)
                        tableRow.addView(state_text)
                        tableRow.addView(method_text)
                        tableRow.addView(gps_text)

                        tableLayout.addView(tableRow)


                        //보안모드에서 사진 받아오는 메서드
                        if(logtable[i].Method == "보안모드: 사진"){
                            method_text.setTextColor(Color.parseColor("#0000ff"))
                            method_text.setOnClickListener {

                                getservice.GetSecurityImage(cookieid = cookie, sernum = keynum!!,
                                    time = logtable[i].Time).enqueue(object : Callback<GetSecuImg> {

                                    override fun onResponse(call: Call<GetSecuImg>, response: Response<GetSecuImg>) {
                                        if(response.code() == 200){
                                            var responsemsg = response.body()!!.message
                                            Open_Image(StringToBitmap(responsemsg), logtable[i].Time)
                                        }
                                        else {
                                            Toast.makeText(this@SmartkeyLogAct, "오류가 발생했습니다.",
                                                Toast.LENGTH_SHORT).show()
                                            Log.d("이미지", response.body().toString()+response.code())
                                        }
                                    }
                                    override fun onFailure(call: Call<GetSecuImg>, t: Throwable) {
                                        Log.d("SmartkeyLog","t"+t.message)
                                    }
                                })
                            }
                        }//보안모드 사진 끝

                    }
                }
            }
            override fun onFailure(call: Call<GetKeyrecord>, t: Throwable) {
                Log.d("SmartkeyLog","t"+t.message)
            }
        })

        btn_finish.setOnClickListener {
            finish()
        }
    }

    //-----------------------------------method------------------------------------------//

    fun Open_Image(img: Bitmap?, filename_time: String){
        val Image_dialog = SmartkeyDialog(this)
        Image_dialog.Security_Img_Open(img!!)

        //다이얼로그 입력후 클릭 시
        Image_dialog.setOnClickListener_Secu(object : SmartkeyDialog.OnDialogClickListener_Secu {
            override fun onClicked_Secu(button: Button) {
                saveImageToGallery(button, img, filename_time)
            }
        })
    }

    //받아온 비트맵 디코딩
    fun StringToBitmap(encodedString: String?): Bitmap? {
        return try {
            val encodeByte: ByteArray = Base64.decode(encodedString, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(encodeByte, 0, encodeByte.size)
        } catch (e: Exception) {
            e.message
            null
        }
    }

    //받아온 비트맵을 갤러리에 저장하기
    private fun saveImageToGallery(button: Button, bitmap: Bitmap, filename_time: String) {
        button.setOnClickListener {
            //권한 체크
            if (!checkPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) ||
                !checkPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
            ) {
                return@setOnClickListener
            }
            //그림 저장
            if (!imageExternalSave(this, bitmap, this.getString(R.string.app_name), filename_time)) {
                Toast.makeText(this, "그림 저장을 실패하였습니다", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            Toast.makeText(this, "그림이 갤러리에 저장되었습니다", Toast.LENGTH_SHORT).show()
        }
    }

    fun imageExternalSave(context: Context, bitmap: Bitmap, path: String, filename_time: String): Boolean {
        val state = Environment.getExternalStorageState()
        if (Environment.MEDIA_MOUNTED == state) {

            val rootPath =
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
                    .toString()
            val dirName = "/" + path
            val fileName = filename_time + ".png"
            val savePath = File(rootPath + dirName)
            savePath.mkdirs()

            val file = File(savePath, fileName)
            if (file.exists()) file.delete()

            try {
                val out = FileOutputStream(file)
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
                out.flush()
                out.close()

                //갤러리 갱신
                context.sendBroadcast(
                    Intent(
                        Intent.ACTION_MEDIA_SCANNER_SCAN_FILE,
                        Uri.parse("file://" + Environment.getExternalStorageDirectory())
                    )
                )

                return true
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        return false
    }

    fun checkPermission(activity: Activity, permission: String): Boolean {
        val permissionChecker =
            ContextCompat.checkSelfPermission(activity.applicationContext, permission)

        //권한이 없으면 권한 요청
        if (permissionChecker == PackageManager.PERMISSION_GRANTED) return true
        ActivityCompat.requestPermissions(activity, arrayOf(permission), STORAGE_CODE)
        return false
    }


}
```
## SmartkeySharingAct
스마트키를 공유할 수 있도록 정보를 담아 서버에 포스트하는 액티비티로 인증수단으로 스마트키비밀번호 다이얼로그를 사용한다.

```kotlin
class SmartkeySharingAct : AppCompatActivity() {

    //쿠키, 레트로핏 세팅
    val postservice = Retrofit_service.service
    var cookie = CookieHandler().setCookie()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_sharing)

        val keynum = intent.getStringExtra("serialnum")
        val keyname = intent.getStringExtra("keyname")

        val btn_cancel = findViewById<Button>(R.id.btn_sharingCancel)
        val btn_OK = findViewById<Button>(R.id.btn_sharingOK)

        val go_main = Intent(this, SmartkeyMain::class.java)

        //취소 닫기
        btn_cancel.setOnClickListener { finish() }

        //ok시
        btn_OK.setOnClickListener {

            //다이얼로그 띄우기
            val dialog = SmartkeyDialog(this)
            dialog.Checkdialog_smpw()

            //다이얼로그 입력후 클릭 시
            dialog.setOnClickListener(object : SmartkeyDialog.OnDialogClickListener{
                override fun onClicked(smartpw: String) {

                    var inputkey = HashMap<String, String>()
                    inputkey.put("smartPwd", smartpw)
                    inputkey.put("serialNum", keynum!!)

                    //공유 전 smartpw 인증
                    postservice.postSmartPw(cookieid = cookie, inputkey).enqueue(object : Callback<PostSmartPw> {
                        override fun onResponse(call: Call<PostSmartPw>, response: Response<PostSmartPw>) {

                            if(response.raw().code == 200){
                                Log.d("SmartPwd인증(공유)","인증 성공")
                                Log.d("response", response.raw().toString())

                                var edit_email = findViewById<EditText>(R.id.edit_toshareEmail).text.toString()

                                var input = HashMap<String,String>()
                                input.put("serialNum", keynum!!)
                                input.put("shareEmail", edit_email)

                                //공유정보 포스트
                                postservice.postSharedinfo(cookieid = cookie, input).enqueue(object : Callback<PostSharedInfo> {
                                    override fun onResponse(call: Call<PostSharedInfo>, response: Response<PostSharedInfo>) {

                                        if(response.raw().code == 200){
                                            Log.d("sharePost","공유 성공")
                                            Log.d("response", response.raw().toString())
                                            Toast.makeText(this@SmartkeySharingAct,
                                                "$keyname 이 $edit_email 에게 공유 되었습니다.", Toast.LENGTH_SHORT).show()
                                            startActivity(go_main)
                                            finish()

                                        } else {
                                            Log.d("sharePost","공유 실패")
                                            Log.d("response", response.raw().toString())
                                            Toast.makeText(this@SmartkeySharingAct,
                                                "이메일을 다시 확인하세요", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                    override fun onFailure(call: Call<PostSharedInfo>, t: Throwable) {
                                        Log.d("LockPost","t"+t.message)
                                    }
                                })//공유 포스트 끝

                            }
                            else {Log.d("SmartPwd인증(공유)","인증실패")
                                Toast.makeText(this@SmartkeySharingAct,
                                    "비밀번호를 확인하세요.", Toast.LENGTH_SHORT).show()}
                        }

                        override fun onFailure(call: Call<PostSmartPw>, t: Throwable) {
                            Log.d("SmartPwd실패","t"+t.message)
                        }
                    })//postSmartPw 끝
                }
            })//다이얼로그 클릭이벤트 끝

        }
    }
}
```

### 다이얼로그
## SmartkeySharingAct
스마트키 비밀번호와 블루투스 조작, 비밀번호 초기화, 보안모드 사진을 띄울때 사용하는 다이얼 로그이다.<br/>

```Kotlin
//액티비티 없이 비밀번호 간단 인증을 위한 다이얼로그 클래스
class SmartkeyDialog(context: Context) {

    private val dialog = Dialog(context)
    private lateinit var onClickListener: OnDialogClickListener
    private lateinit var onClickListener_re: OnDialogClickListener_repw
    private lateinit var onClickListener_BT: OnDialogClickListener_BT
    private lateinit var onClickListener_Secu: OnDialogClickListener_Secu

    //스마트키 비밀번호 인증에 사용
    fun setOnClickListener(listener: OnDialogClickListener)
    {
        onClickListener = listener
    }

    //비밀번호 초기화에 사용
    fun setOnClickListener_re(listener: OnDialogClickListener_repw)
    {
        onClickListener_re = listener
    }

    //블루투스 제어로 사용
    fun setOnClickListener_BT(listener: OnDialogClickListener_BT)
    {
        onClickListener_BT = listener
    }

    //보안모드 사진 띄우기에 사용
    fun setOnClickListener_Secu(listener: OnDialogClickListener_Secu)
    {
        onClickListener_Secu = listener
    }

    //스마트키 비밀번호 인증에 사용
    fun Checkdialog_userpw(){
        dialog.setContentView(R.layout.dialog_register_reset_pw)
        dialog.window!!.setLayout(WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT)
        dialog.setCanceledOnTouchOutside(true)
        dialog.setCancelable(true)
        dialog.show()

        val btn_check = dialog.findViewById<Button>(R.id.btn_resetpw_check)
        val btn_cancel = dialog.findViewById<Button>(R.id.btn_resetpw_cancel)

        btn_cancel.setOnClickListener { dialog.dismiss() }

        btn_check.setOnClickListener {
            var reset_pw = dialog.findViewById<EditText>(R.id.edit_resetPw).text.toString()
            var reset_pw_re = dialog.findViewById<EditText>(R.id.edit_resetPw).text.toString() // 재설정.
            onClickListener_re.onClicked_repw(reset_pw, reset_pw_re)
            dialog.dismiss()
        }
    }

    //비밀번호 초기화에 사용
    fun Checkdialog_smpw(){
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

    //블루투스 제어로 사용
    fun Controldialog_BT(DeviceName : String){
        dialog.setContentView(R.layout.dialog_bluetoothcontrol)
        dialog.window!!.setLayout(WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT)
        dialog.setCanceledOnTouchOutside(false)
        dialog.setCancelable(true)
        dialog.show()

        var devicename = dialog.findViewById<TextView>(R.id.txt_diviceName)
        devicename.text = DeviceName
        val btn_bt_open = dialog.findViewById<Button>(R.id.btn_bt_open)
        val btn_bt_close = dialog.findViewById<Button>(R.id.btn_bt_close)
        val btn_bt_finish = dialog.findViewById<Button>(R.id.btn_bt_finish)

        btn_bt_finish.setOnClickListener {
            val CANCEL = 2
            onClickListener_BT.onClicked_BT(CANCEL)
            dialog.dismiss() }

        btn_bt_open.setOnClickListener {
            val OPEN = 1
            onClickListener_BT.onClicked_BT(OPEN)
        }

        btn_bt_close.setOnClickListener {
            val CLOSE = 0
            onClickListener_BT.onClicked_BT(CLOSE)
        }
    }

    //보안모드 사진 띄우기에 사용
    fun Security_Img_Open(down_img : Bitmap) {
        dialog.setContentView(R.layout.dialog_security_img)
        dialog.window!!.setLayout(WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT)
        dialog.setCanceledOnTouchOutside(false)
        dialog.setCancelable(true)
        dialog.show()

        val btn_img_close = dialog.findViewById<Button>(R.id.btn_secu_close)
        val btn_img_save = dialog.findViewById<Button>(R.id.btn_secu_save)
        var iv_secu_img = dialog.findViewById<ImageView>(R.id.iv_secu_img)

        iv_secu_img.setImageBitmap(down_img)

        btn_img_close.setOnClickListener {
            dialog.dismiss()
        }

        btn_img_save.setOnClickListener {
            onClickListener_Secu.onClicked_Secu(btn_img_save)
        }
    }

    //스마트키 비밀번호 인증에 사용
    interface OnDialogClickListener{
         fun onClicked(smartpw: String)
    }

    //비밀번호 초기화에 사용
    interface OnDialogClickListener_repw{
        fun onClicked_repw(reset_pw: String, reset_pw_re: String)
    }

    //블루투스 제어로 사용
    interface OnDialogClickListener_BT{
        fun onClicked_BT(openOrClose: Int)
    }

    //보안모드 사진 띄우기에 사용
    interface OnDialogClickListener_Secu{
        fun onClicked_Secu(button: Button)
    }


}
```
