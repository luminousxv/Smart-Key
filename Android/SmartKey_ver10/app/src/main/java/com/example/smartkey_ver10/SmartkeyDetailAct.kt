package com.example.smartkey_ver10

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.*
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.common.internal.Objects
import com.google.android.gms.location.*
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.util.*
import kotlin.collections.HashMap

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
