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