# Raspberry Pi README
## 개요
라즈베리파이 4B 보드를 이용해서 스마트키 임베디드 시스템을 만들었다. 

주요 기능으로는 블루투스, WIFI(원격)을 이용하여 서보 모터 제어를 해서 스마트키 잠금/해제를 하고, 

모션 센서를 이용해서 사용자가 가까이 다가가면 LCD 화면이 켜지게 한다. LCD 화면에는 잠금/해제를 시행하면

open/close로 출력이 되고, 에러(서버 연결x)가 나오면 에러 메시지를 출력해준다. 또한 

보안모드를 설계하여 사용자가 보안모드를 on 하면 카메라가 켜지고 도난 방지를 위해 자물쇠 모듈에 자이로 센세를

부착하여 해당 모듈의 움직임이 감지될시 사진을 찍어 앱으로 보내는 기능을 탑제하였다. 

## rpi_module.py 코드 설명
~~~python
from bluetooth import *  # 블루투스 모듈
import RPi.GPIO as GPIO  # 라즈베리파이 GPIO 관련 모듈
import time  # time 제어를 위한 라이브러리
import json  # 서버 통신을 위한 json 라이브러리
import requests  # 서버 요청 라이브러리
import os
import drivers  # lcd 조작을 위한 라이브러리
import serial, close_state, open_state  # 시리얼 번호와 키 잠금 상태 전송하기 위한 .py파일
from time import sleep
from smbus2 import SMBus
from bitstring import Bits
import math  # 자이로 센서 계산을 위한 라이브러리
from picamera import PiCamera  # 카메라 모듈
import datetime

servo_pin = 18  # servo모터 18번 핀 사용
button_pin = 22
GPIO.setmode(GPIO.BCM)  # GPIO 핀들의 번호 지정 규칙
GPIO.setup(servo_pin, GPIO.OUT)  # 서보핀을 출력으로 지정
GPIO.setup(button_pin, GPIO.IN)
servo = GPIO.PWM(servo_pin, 50)  # 50 Hz
servo.start(0)  # 서보모터 초기값 0
open_angle = 3.5  # 열림
close_angle = 7  # 닫힘
state = ''
serialNum = b'001001'   # 앱에 시리얼 넘버 전송하기 위한 숫자
receive_Num = b'100'    # 블루 확인 신호
open_Num = b'200'       # 블투 오픈 신호
close_Num = b'300'      # 블투 닫힘 신호
exit_Num = b'400'       # 블투 제어 off


def doAngle(angle):
    GPIO.setup(servo_pin, GPIO.OUT)  # 서보핀을 출력으로 설정
    servo.ChangeDutyCycle(angle)
    sleep(0.3)  # 0.3 기다림
    GPIO.setup(servo_pin, GPIO.IN)  # 서보핀을 입력으로 설정 (더이상 움직이지 않음)


display = drivers.Lcd()  # Lcd

uuid = "00001101-0000-1000-8000-00805F9B34FB"
server_sock = BluetoothSocket(RFCOMM)  # RFCOMM 포트를 통해 데이터 통신을 하기 위한 준비
server_sock.bind(('', PORT_ANY))
server_sock.listen(1)

port = server_sock.getsockname()[1]  # 연결된 소켓을 찾음
advertise_service(server_sock, "BtChat",
                  service_id=uuid,
                  service_classes=[uuid, SERIAL_PORT_CLASS],
                  profiles=[SERIAL_PORT_PROFILE])  # 블루투스 서비스를 Advertise
print("Waiting for connection : channel %d" % port)  # 클라이언트가 연결될 때까지 대기
client_sock, client_info = server_sock.accept()
print("accepted")

while True:                            # 스마트 키 초기 등록 절차
    data = client_sock.recv(1024)
    print(data)
    if data == receive_Num:
        client_sock.send(serialNum)
        client_sock.close()
        break

while True:
    a = serial.msg  # serial.py에 저장된 시리얼넘버 불러옴
    r = requests.get('http://3.35.57.189:80/Smart-Key/rpi/remote/', json=a)  # 서버 주소
    res = r.json()
    res_code = res["code"]  # 서버에 저장되어 있는 code
    res_state = res["state"]  # 서버에 저장되어 있는 rpi 상태
    res_mode = res["mode"]  # 서버에 저장되어 있는 모드
    display.lcd_backlight(1)
    button_IO = GPIO.input(22)
    if res_code == 200:
        if res_mode == 0:
            if res_state == state:  # 현재 키 상태 비교

                if button_IO == False:
                    display.lcd_clear()
                    display.lcd_display_string("Bluetooth", 1)
                    display.lcd_display_string("mode", 2)
                    uuid = "00001101-0000-1000-8000-00805F9B34FB"
                    server_sock = BluetoothSocket(RFCOMM)  # RFCOMM 포트를 통해 데이터 통신을 하기 위한 준비
                    server_sock.bind(('', PORT_ANY))
                    server_sock.listen(1)

                    port = server_sock.getsockname()[1]  # 연결된 소켓을 찾음
                    advertise_service(server_sock, "BtChat",
                                      service_id=uuid,
                                      service_classes=[uuid, SERIAL_PORT_CLASS],
                                      profiles=[SERIAL_PORT_PROFILE])  # 블루투스 서비스를 Advertise
                    print("Waiting for connection : channel %d" % port)  # 클라이언트가 연결될 때까지 대기
                    client_sock, client_info = server_sock.accept()
                    print("accepted")
                    while True:
                        data1 = client_sock.recv(1024)
                        print(data1)
                        if data1 == open_Num:   #블투 통신으로 오픈 신호를 받았을 경우
                            doAngle(open_angle)
                            display.lcd_clear()
                            display.lcd_display_string("Key_state: open", 1)
                            print("send [%s]" % open_Num)
                            client_sock.send(open_Num)
                            b = open_state.msg
                            r1 = requests.post('http://3.35.57.189:80/Smart-Key/rpi/bluetooth/', json=b)    #제어 후 키 상태 내용을 서버에 보냄
                            continue
                        elif data1 == close_Num:   #블투 통신으로 닫힘 신호를 받았을 경우 
                            doAngle(close_angle)
                            display.lcd_clear()
                            display.lcd_display_string("Key_state: close", 1)
                            print("send [%s]" % close_Num)
                            client_sock.send(close_Num)
                            c = close_state.msg
                            r2 = requests.post('http://3.35.57.189:80/Smart-Key/rpi/bluetooth/', json=c)    #제어 후 키 상태 내용을 서버에 보냄
                            continue
                        elif data1 == receive_Num:
                            client_sock.send(serialNum)
                            continue
                        elif data1 == exit_Num:     # 블투 종료 신호를 받았을 경우
                            client_sock.send(exit_Num)
                            client_sock.close()
                            break                   # while문 탈출 후 원격 제어로 돌아감
                sleep(1.5)
                continue  # 동일하면 if문 탈출

            elif res_state == 'open':  # 현재 키 상태가 open 일때
                state = res_state
                doAngle(open_angle)
                display.lcd_clear()
                display.lcd_display_string("Key_state: open", 1)
                sleep(1.5)
            elif res_state == 'close':  # 현재 키 상태가 close 일때
                state = res_state
                doAngle(close_angle)
                display.lcd_clear()
                display.lcd_display_string("Key_state: close", 1)
                sleep(1.5)
            elif res_state == 'delete':  # 현재 키 상태가 delete 됬을 경우. 블투 대기를 하면서 새로운 연결을 받을 준비함
                display.lcd_backlight(1)
                display.lcd_clear()
                display.lcd_display_string("Delete Key", 1)

                uuid = "00001101-0000-1000-8000-00805F9B34FB"
                server_sock = BluetoothSocket(RFCOMM)  # RFCOMM 포트를 통해 데이터 통신을 하기 위한 준비
                server_sock.bind(('', PORT_ANY))
                server_sock.listen(1)

                port = server_sock.getsockname()[1]  # 연결된 소켓을 찾음
                advertise_service(server_sock, "BtChat",
                                  service_id=uuid,
                                  service_classes=[uuid, SERIAL_PORT_CLASS],
                                  profiles=[SERIAL_PORT_PROFILE])  # 블루투스 서비스를 Advertise
                print("Waiting for connection : channel %d" % port)  # 클라이언트가 연결될 때까지 대기
                client_sock, client_info = server_sock.accept()
                print("accepted")
                while True:
                    data3 = client_sock.recv(1024)
                    print(data3)
                    if data3 == receive_Num:
                        client_sock.send(serialNum)
                        client_sock.close()
                        break
        elif res_mode == 1:  # 보안모드 on

            bus = SMBus(1)
            DEV_ADDR = 0x68
            register_gyro_xout_h = 0x43
            register_gyro_yout_h = 0x45
            register_gyro_zout_h = 0x47
            sensitive_gyro = 131.0

            register_accel_xout_h = 0x3B
            register_accel_yout_h = 0x3D
            register_accel_zout_h = 0x3F
            sensitive_accel = 16384.0


            def read_data(register):
                high = bus.read_byte_data(DEV_ADDR, register)
                low = bus.read_byte_data(DEV_ADDR, register + 1)
                val = (high << 8) + low
                return val

            def twocomplements(val):
                s = Bits(uint=val, length=16)
                return s.int

            def gyro_dps(val):
                return twocomplements(val) / sensitive_gyro

            def accel_g(val):
                return twocomplements(val) / sensitive_accel

            def dist(a, b):
                return math.sqrt((a * a) + (b * b))

            def get_x_rotation(x, y, z):
                radians = math.atan(x / dist(y, z))
                return radians

            def get_y_rotation(x, y, z):
                radians = math.atan(y / dist(x, z))
                return radians

            bus.write_byte_data(DEV_ADDR, 0x6B, 0b00000000)
            camera = PiCamera() #보안 모드에 사용할 카메라 on
            cnt = 0             # count = 0
            while True:
                serial_msg = serial.msg
                req = requests.get('http://3.35.57.189:80/Smart-Key/rpi/remote/', json=serial_msg)      #보안 모드 off를 서버로 받을 경우를 위해 주기적으로 get 한다.
                res1 = req.json()
                res1_code = res1["code"]
                res1_state = res1["state"]
                res1_mode = res1["mode"]

                camera.start_preview()
                x = read_data(register_accel_xout_h)
                y = read_data(register_accel_yout_h)
                z = read_data(register_accel_zout_h)
                aX = get_x_rotation(accel_g(x), accel_g(y), accel_g(z))
                aY = get_y_rotation(accel_g(x), accel_g(y), accel_g(z))

                if res1_mode == 0:     # 보안 모드 off시 카메라 모듈을 닫고, while문 탈출
                    camera.close()
                    break
                if aY > 0.7 or aY < -0.5:   # 자이로 센서를 제품 옆 면에 붙일 경우 y축 위치를 조정
                    cnt += 1
                    sleep(1)
                    if cnt >= 3:            # 움직임이 3회 감지되었을 때 사진 찍음
                        print("snap")
                        now = datetime.datetime.now()
                        filename = now.strftime('%Y -%m-%d %H : %M : %S')
                        camera.capture(filename + '.bmp')
                        camera.stop_preview()
                        cnt = 0

                    else:
                        sleep(1)
                sleep(1.5)
            bus.close()
    elif res_code == 400:  # 존재하지 않는 키일 경우
        print("존재하지 않는 스마트키입니다.")
        display.lcd_display_string("This is a non-", 1)
        display.lcd_display_string("existent key", 2)
        sleep(1.5)
    elif res_code == 500:  # DB 오류가 발생하였을 경우
        print("DB 오류가 발생했습니다.")
        display.lcd_display_string("DB error", 1)
        display.lcd_display_string("occurred", 2)
        sleep(1.5)
    else:  # 서버와 연결이 되지 않을 경우
        print("서버와 연결이 되지 않았습니다.")
        display.lcd_display_string("No connection", 1)
        display.lcd_display_string("to server", 2)
        sleep(1.5)
    if button_IO == False:
        display.lcd_display_string("Bluetooth", 1)
        display.lcd_display_string("mode", 2)
        while True:
            data1 = client_sock.recv(1024)
            print(data1)
            if data2 == open_Num:
                doAngle(open_angle)
                display.lcd_clear()
                display.lcd_display_string("Key_state: open", 1)
                print("send [%s]" % open_Num)
                client_sock.send(open_Num)
                continue
            elif data2 == close_Num:
                doAngle(close_angle)
                display.lcd_clear()
                display.lcd_display_string("Key_state: close", 1)
                print("send [%s]" % close_Num)
                client_sock.send(close_Num)
                continue
            elif data2 == exit_Num:
                break
            sleep(1.5)
GPIO.cleanup()
client_sock.close()
~~~
무한 루프(while)문을 이용해 스마트키를 제어한다. 스마트키(라즈베리파이)는 1.5초마다 서버에서

기록되어 있는 스마트키 상태를 GET해서 현재 상태와 비교한다. 같으면 반복을 하고,

앱에서 잠금/해제 요청이 오면 서버에 저장된 값이 바뀜으로 스마트키가 서버에 요청을 해서 값을 가지고 올때

상태 변화를 인지하고 해당 기능을 수행해준다. LCD는 초음파 센서를 이용해 거리값의 변화를 감지해서

가까워지면 LCD화면이 켜지고, 멀어지면 LCD화면이 꺼지는 방식으로 한다. 

serial.py를 만들어 만약 키를 대량 생산하였을때 번호를 각자 저장하는 식으로 설계하였다.

open_state.py와 close_state.py는 블루투스 통신을 할때 안드로이드 앱으로 키 상태를 전송하고, 앱에서 

서버로 전송을 하여 블루투스 제어도 이력을 갱신할 수 있는 방식으로 사용하였다. 

라즈베리파이가 인터넷에 연결되어있지 않을 경우에는 블루투스를 통해 제어가 가능한다. 이때에는 키에 탑제된

블루투스 버튼을 누르면 LCD 화면에 BLUETOOTH MODE 라는 창이 보이고, 이 이후에 안드로이드 앱을 통해 제어하면 

된다. 블투 제어를 종료하면 안드로이드로 부터 400 값을 받아오고 라즈베리파이는 원격 제어 모드로 돌아간다. 

안드로이드 앱에 보안모드를 켜면 라즈베리파이에 카메라가 켜지고, 부착된 자이로 센서에 움직임이 감지되면 

사진이 찍힌다. 여기서 한번의 움직임은 실수로 일어날 수도 있으니 count를 하여 count=3이 되면 사진을 찍어

보안 모드를 설계하였다. 

## RPI Flowchart
<img src = "../images/rpi_control.png">

## RPI Blueprint
<img src = "../images/RPI_Blueprint.jpg">
왼쪽 아래에는 raspberry Pi 4B 보드이고, 왼쪽 위는 서보 모터, 오른쪽 위는 초음파 센서, 오른쪽 아래는 LCD이다.
