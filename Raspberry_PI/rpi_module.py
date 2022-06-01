from bluetooth import *  # 블루투스 모듈
import RPi.GPIO as GPIO  # 라즈베리파이 GPIO 관련 모듈
import time                     # time 제어를 위한 라이브러리
import json                     # 서버 통신을 위한 json 라이브러리
import requests                 # 서버 요청 라이브러리
import os
import drivers                  # lcd 조작을 위한 라이브러리
import serial, close_state, open_state   #시리얼 번호와 키 잠금 상태 전송하기 위한 .py파일
from time import sleep
from smbus2 import SMBus
from bitstring import Bits
import math                      # 자이로 센서 계산을 위한 라이브러리
from picamera import PiCamera    # 카메라 모듈
import base64                    # 사진 전송 모듈


servo_pin = 18                        # servo모터 18번 핀 사용
button_pin = 22
motion_pin = 7
GPIO.setmode(GPIO.BCM)          # GPIO 핀들의 번호 지정 규칙
GPIO.setup(servo_pin, GPIO.OUT)       # 서보핀을 출력으로 지정
GPIO.setup(button_pin, GPIO.IN)
GPIO.setup(motion_pin, GPIO.IN)
servo = GPIO.PWM(servo_pin, 50)       # 50 Hz
servo.start(0)                  # 서보모터 초기값 0
open_angle = 3.5                  # 열림
close_angle = 7                # 닫힘
state = ''
serialNum = b'001001'                 # 앱에 시리얼 넘버 전송하기 위한 숫자
receive_Num = b'100'                  # 앱에 정상적으로 값을 넘길때 사용하는 숫자
open_Num = b'200'                     # 키가 오픈되었을 경우
close_Num = b'300'                    # 키가 닫혔을 경우
exit_Num = b'400'                     # 블루투스 종료

def doAngle(angle):
    GPIO.setup(servo_pin, GPIO.OUT)      # 서보핀을 출력으로 설정
    servo.ChangeDutyCycle(angle)
    sleep(0.3)                          # 0.3 기다림
    GPIO.setup(servo_pin, GPIO.IN)      # 서보핀을 입력으로 설정 (더이상 움직이지 않음)

display = drivers.Lcd()     # Lcd
display.lcd_clear()
display.lcd_display_string("TUK Smart Key", 1)
sleep(2)

while True:
    json_1 = serial.msg  # serial.py에 저장된 시리얼넘버 불러옴
    req_get = requests.get('http://3.35.57.189:80/Smart-Key/rpi/remote/', json=json_1)  # 서버 주소
    res2 = req_get.json()
    res_code2 = res2["code"]  # 서버에 저장되어 있는 code

    if res_code2 == 400:                # 키가 등록되어 있지 않아 등록 절차부터 시작
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
        display.lcd_clear()
        display.lcd_display_string("Please register", 1)
        display.lcd_display_string("your Key", 2)
        while True:
            data = client_sock.recv(1024)           # 블루투스로 데이터 받음
            print(data)
            if data == receive_Num:                 # 받은 데이터가 100인 경우
                client_sock.send(serialNum)         # 시리얼 번호를 보냄
                continue
            elif data == b'150':                    # 받은 데이터가 150인 경우
                client_sock.close()                 # 블루투스 종료
                display.lcd_clear()
                display.lcd_display_string("Registration is ", 1)
                display.lcd_display_string("complete", 2)
                sleep(1)
                break
    elif res_code2 == 200:              # 키가 등록되어 있으므로 제어 시작
        a = serial.msg  # serial.py에 저장된 시리얼넘버 불러옴
        r = requests.get('http://3.35.57.189:80/Smart-Key/rpi/remote/', json=a)  # 서버 주소
        res = r.json()
        res_code = res["code"]  # 서버에 저장되어 있는 code
        res_state = res["state"]  # 서버에 저장되어 있는 rpi 상태
        res_mode = res["mode"]  # 서버에 저장되어 있는 모드
        display.lcd_backlight(1)
        button_IO = GPIO.input(22)
        if res_mode == 0:
            if res_state == state:  # 현재 키 상태 비교

                if button_IO == False:      # 블루투스 버튼을 눌렀을 경우
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
                        data1 = client_sock.recv(1024)  # 앱으로부터 값을 받음
                        print(data1)
                        if data1 == open_Num:       # 받은 값이 open인 경우
                            doAngle(open_angle)     # 오픈
                            display.lcd_clear()
                            display.lcd_display_string("Key_state: open", 1)
                            print("send [%s]" % open_Num)
                            client_sock.send(open_Num)
                            b = open_state.msg
                            r1 = requests.post('http://3.35.57.189:80/Smart-Key/rpi/bluetooth/', json=b)    # 서버 db에 저장
                            continue
                        elif data1 == close_Num:    # 받은 값이 close인 경우
                            doAngle(close_angle)    # 닫음
                            display.lcd_clear()
                            display.lcd_display_string("Key_state: close", 1)
                            print("send [%s]" % close_Num)
                            client_sock.send(close_Num)
                            c = close_state.msg
                            r2 = requests.post('http://3.35.57.189:80/Smart-Key/rpi/bluetooth/', json=c)
                            continue
                        elif data1 == receive_Num:
                            client_sock.send(serialNum)
                            continue
                        elif data1 == exit_Num:     # 받은 값이 exit_Num인 경우
                            client_sock.send(exit_Num)
                            client_sock.close()     # 종료 한다.
                            break
                sleep(1.5)
                continue  # 동일하면 if문 탈출

                if GPIO.input(motion_pin) == 1:
                    display.lcd_backlight(1)
                else:
                    display.lcd_backlight(0)
                sleep(1)

            # 원격 제어
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

        elif res_mode == 1:  # 보안모드

            bus = SMBus(1)      # SMBus i2c를 이용
            # 자이로 초기값 세팅
            DEV_ADDR = 0x68
            register_gyro_xout_h = 0x43
            register_gyro_yout_h = 0x45
            register_gyro_zout_h = 0x47
            sensitive_gyro = 131.0
            # 가속도 초기값 세팅
            register_accel_xout_h = 0x3B
            register_accel_yout_h = 0x3D
            register_accel_zout_h = 0x3F
            sensitive_accel = 16384.0


            def read_data(register):
                high = bus.read_byte_data(DEV_ADDR, register)
                low = bus.read_byte_data(DEV_ADDR, register + 1)
                val = (high << 8) + low
                return val


            def value_data(val):
                s = Bits(uint=val, length=16)
                return s.int


            def gyro_dps(val):
                return value_data(val) / sensitive_gyro


            def accel_g(val):
                return value_data(val) / sensitive_accel


            def dist(a, b):
                return math.sqrt((a * a) + (b * b))


            def get_x_rotation(x, y, z):
                radians = math.atan(x / dist(y, z))
                return radians


            def get_y_rotation(x, y, z):
                radians = math.atan(y / dist(x, z))
                return radians

            bus.write_byte_data(DEV_ADDR, 0x6B, 0b00000000)
            camera = PiCamera()     # 카메라 킴
            cnt = 0                 # cnt 초기 값 0
            while True:
                serial_msg = serial.msg
                req = requests.get('http://3.35.57.189:80/Smart-Key/rpi/remote/', json=serial_msg)
                res1 = req.json()
                res1_code = res1["code"]
                res1_state = res1["state"]
                res1_mode = res1["mode"]

                camera.start_preview()
                x = read_data(register_accel_xout_h)        # x축 값을 읽음
                y = read_data(register_accel_yout_h)        # y축 값을 읽음
                z = read_data(register_accel_zout_h)        # z축 값을 읽음
                aX = get_x_rotation(accel_g(x), accel_g(y), accel_g(z))     # x축 움직임을 읽음
                aY = get_y_rotation(accel_g(x), accel_g(y), accel_g(z))     # y축 움직임을 읽음

                if res1_mode == 0:             # 보안모드가 꺼질 경우 종료
                    camera.close()
                    break
                if aX > 0.7 or aX < -0.5:      # x축 이동 값이 -0.7 ~ 0.5 사이인 경우
                    cnt += 1                   # 카운트 하나 함
                    sleep(1)
                    if cnt >= 3:                # 만약 cnt = 3 인 경우
                        print("snap")
                        file = camera.capture('image.jpg')      # 사진을 찍음
                        with open('image.jpg', 'rb') as image_file:
                            b64data = base64.b64encode(image_file.read())       # 찍은 사진을 base64 인코딩을 진행
                        e = {"serialNum": "001001", "image": b64data}
                        r4 = requests.post('http://3.35.57.189:80/Smart-Key/rpi/image/', json=e)    # 인코딩된 사진을 서버 db로 보냄
                        camera.stop_preview()
                        cnt = 0

                    else:
                        sleep(1)
            bus.close()
    elif res_code2 == 300:
        display.lcd_backlight(1)
        display.lcd_clear()
        display.lcd_display_string("Delete Key", 1)
        sleep(1.5)
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
        display.lcd_clear()
        display.lcd_display_string("Please register", 1)
        display.lcd_display_string("your Key", 2)
        while True:
            data = client_sock.recv(1024)  # 블루투스로 데이터 받음
            print(data)
            if data == receive_Num:  # 받은 데이터가 100인 경우
                client_sock.send(serialNum)  # 시리얼 번호를 보냄
                continue
            elif data == b'150':  # 받은 데이터가 150인 경우
                client_sock.close()  # 블루투스 종료
                display.lcd_clear()
                display.lcd_display_string("Registration is ", 1)
                display.lcd_display_string("complete", 2)
                sleep(1)
                break

    else:  # 서버와 연결이 되지 않을 경우
        print("서버와 연결이 되지 않았습니다.")
        display.lcd_display_string("No connection", 1)
        display.lcd_display_string("to server", 2)
        sleep(1.5)
GPIO.cleanup()
client_sock.close()
