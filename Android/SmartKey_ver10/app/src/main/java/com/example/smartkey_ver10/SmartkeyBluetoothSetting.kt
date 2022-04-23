package com.example.smartkey_ver10

import android.app.AlertDialog
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.content.DialogInterface
import android.os.Handler
import android.os.SystemClock
import android.widget.Toast
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.util.*

class SmartkeyBluetoothSetting(context: Context) {

    val thisCon: Context = context

    var mBluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    var mPairedDevices: Set<BluetoothDevice>? = null
    var mListPairedDevices: MutableList<String>? = null
    var mBluetoothHandler: Handler? = null
    var mThreadConnectedBluetooth : ConnectedBluetoothThread? = null
    var mBluetoothDevice: BluetoothDevice? = null
    var mBluetoothSocket: BluetoothSocket? = null


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

    //여기 고쳐야됨
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
                            SystemClock.sleep(1000)
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