package com.example.smartkey_ver10

import android.app.AlertDialog
import android.content.DialogInterface
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.os.Message
import android.util.Log
import android.widget.Button
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.UnsupportedEncodingException

class SmartkeyMain : AppCompatActivity() {

    //쿠키세팅
    val GetService = Retrofit_service.service
    val cookie = CookieHandler().setCookie()
    val UserEmail = CookieHandler().setUserEmail()

    //블루투스 셋팅
    val bluetoothService = SmartkeyBluetoothSetting(this@SmartkeyMain)
    //블루투스로 이용시에는 그냥 다이얼로그로 설정하자

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
                            registered_list.add(ViewItem("","$keynum" , "$keyname"))
                        } else{                             //공유받은 스마트키
                            var keynum = keyList[i].SerialNum
                            var keyname = keyList[i].KeyName
                            keyshared.put(keyList[i].KeyName, keyList[i].Shared)
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
            {data->adapterOnClick(data, keyshared.get(data.name) ,"0")})
        findViewById<RecyclerView>(R.id.registered_recycleView).adapter = reg_adapter

        //공유 키 클릭 이벤트
        val shared_adapter = RecyclerUserAdapter(shared_list,
            {data->adapterOnClick(data, keyshared.get(data.name),"1")})
        findViewById<RecyclerView>(R.id.shared_recycleView).adapter = shared_adapter
    }






    private fun bluetoothControl(serialNum: String){
        val Smartkeydialog = SmartkeyDialog(this)
        Smartkeydialog.Controldialog_BT()
        Smartkeydialog.setOnClickListener_BT(object : SmartkeyDialog.OnDialogClickListener_BT{
            override fun onClicked_BT(openclose:Int) {
                if(openclose == 1){ //오픈
                    bluetoothService.open()
                    //+서버에 상태 업테이트 고고
                }
                else if(openclose == 0){ // 클로즈
                    bluetoothService.close()
                }
                else if(openclose == 2){ // 닫기
                    bluetoothService.bluetoothOff()
                }
            }
        })

    }



    //클릭 이벤트 함수
    private fun adapterOnClick(data: ViewItem, keyshared:String? ,registerd: String){
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
                    if(item == 0){smartPwPost(data, keyshared, registerd, items[item].toString())}

                    //---------------블루투스 접속일 때-----------------------
                    if(item == 1){
                        bluetoothService.bluetoothOn() //블루투스 연결


                        //블루투스 연결 되면 기기 확인(시리얼번호 대조)
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
                                            serial_Num = readMessage.toString()
                                        }
                                    }
                                }
                            }
                        }//시리얼 번호 확인 끝


                        //스마트키 비밀번호 실행
                        if(serial_Num == data.id){
                            smartPwPost(data, keyshared, registerd, items[item].toString())
                        }
                        else Toast.makeText(this, "선택한 스마트키와 블루투스 스마트키와 다릅니다",
                            Toast.LENGTH_SHORT).show()
                    }
                })
            //블루투스 접속 누르면 블루투스 연결해야함.

            val alert: AlertDialog = BluOrHttpSelect.create()
            alert.show()
        }
        //공유키 클릭 시
        else if(registerd=="1"){
            smartPwPost(data, keyshared, registerd, "원격 접속")
        }


    }//클릭이벤트 함수 끝



    //스마트키 비밀번호 포스트함수
    fun smartPwPost(data:ViewItem, keyshared: String? ,registerd: String, selection:String){

        val Smartkeydialog = SmartkeyDialog(this)

        //스마트키 비밀번호 다이얼로그 띄우기
        val nexintent = Intent(this, SmartkeyDetailAct::class.java)
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
                                nexintent.putExtra("shared", keyshared)
                                nexintent.putExtra("registerd", registerd)
                                nexintent.putExtra("serialnum", data.id)
                                nexintent.putExtra("keyname", data.name)
                                startActivity(nexintent)
                                finish()
                            }
                            else if(selection == "블루투스 접속"){
                                bluetoothControl(data.id)} // 블루투스 제어 다이얼로그
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