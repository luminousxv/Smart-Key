package com.example.smartkey_ver10

import android.app.Dialog
import android.content.Context
import android.graphics.Bitmap
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView

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