package com.example.smartkey_ver10

import android.app.Dialog
import android.content.Context
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText

//액티비티 없이 비밀번호 간단 인증을 위한 다이얼로그 클래스
class SmartkeyPwDialog(context: Context) {

    private val dialog = Dialog(context)
    private lateinit var onClickListener: OnDialogClickListener
    private lateinit var onClickListener_re: OnDialogClickListener_repw

    fun setOnClickListener(listener: OnDialogClickListener)
    {
        onClickListener = listener
    }

    fun setOnClickListener_re(listener: OnDialogClickListener_repw)
    {
        onClickListener_re = listener
    }

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
    interface OnDialogClickListener{
         fun onClicked(smartpw: String)
    }

    interface OnDialogClickListener_repw{
        fun onClicked_repw(reset_pw: String, reset_pw_re: String)
    }


}