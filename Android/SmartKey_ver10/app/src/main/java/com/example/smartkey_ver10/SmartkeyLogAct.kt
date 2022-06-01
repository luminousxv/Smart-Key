package com.example.smartkey_ver10

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.location.Address
import android.location.Geocoder
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Environment
import android.util.Base64
import android.util.Log
import android.view.Gravity
import android.webkit.WebSettings
import android.widget.*
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.lang.Exception

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