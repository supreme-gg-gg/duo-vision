import socket

serverMACAddress = '08:D1:F9:97:A9:16'

port = 1  # Needs to match value used on the device you are connecting to

SIZE = 1024

s = socket.socket(socket.AF_BLUETOOTH, socket.SOCK_STREAM, socket.BTPROTO_RFCOMM)

s.connect((serverMACAddress, port))

while True:
    data = s.recv(SIZE)
    if data:
        print(data)

s.close()