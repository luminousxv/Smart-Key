from smbus2 import SMBus            # smbus import
from bitstring import Bits
import math
import time
import datetime
import json
import requests

bus = SMBus(1)
DEV_ADDR = 0x68

register_gyro_xout_h = 0x43         # MPU6050 레지스터의 주소
register_gyro_yout_h = 0x45
register_gyro_zout_h = 0x47
sensitive_gyro = 131.0

register_accel_xout_h = 0x3B
register_accel_yout_h = 0x3D
register_accel_zout_h = 0x3F
sensitive_accel = 16384.0

def read_data(register):
    high = bus.read_byte_data(DEV_ADDR, register)   # Accelero 및 Gyro의 값은 16비트
    low = bus.read_byte_data(DEV_ADDR, register+1)
    val = (high << 8) + low                         # 높은 값과 낮은 값을 결합
    return val

def twocomplements(val):
    s = Bits(uint=val, length=16)
    return s.int

def gyro_dps(val):
    return twocomplements(val)/sensitive_gyro

def accel_g(val):
    return twocomplements(val)/sensitive_accel

def dist(a,b):
    return math.sqrt((a*a)+(b*b))

def get_x_rotation(x,y,z):
    radians = math.atan(x/dist(y,z))
    return radians

def get_y_rotation(x,y,z):
    radians = math.atan(y/dist(x,z))
    return radians

bus.write_byte_data(DEV_ADDR, 0x6B, 0b00000000)


cnt = 0                 # count = 0
try:
    while True:
        x = read_data(register_accel_xout_h)
        y = read_data(register_accel_yout_h)
        z = read_data(register_accel_zout_h)
        aX = get_x_rotation(accel_g(x), accel_g(y), accel_g(z))
        aY = get_y_rotation(accel_g(x), accel_g(y), accel_g(z))

        if aY > 0.7 or aY < -0.5:           # y축 위치가 0.7보다 크거나 -0.5보다 작으면
            cnt += 1                        # count +1
            time.sleep(1.5)
            print(cnt)
            if cnt >= 3:                    # count = 3이면
                print("snap")               # 찰칵!
                cnt = 0
            else:
                time.sleep(1.5)
except KeyboardInterrupt:
    exit()

