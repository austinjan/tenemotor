# Install
First clone project in to your computer.

### Download dependency package
`$ yarn`

Run:
`$ yarn electron-dev`

# Protocol
### Port 55954 UDP broadcast

Use for scan, settings...

### Message format 

Atop origin message struct:

```c
struct atop_monitor
{
	unsigned char Op;                         //0, specifies whether the message is a request
    unsigned char Htype;                      /* 1, specifies the network hardware type	*/
    unsigned char Hlen;                       /* 2, specifies the length of a hardware address	*/
    unsigned char unuse;                      /* 3	*/
    unsigned char Transaction_Id[4];          /* 4, contains an integer that diskless machines use to match responses whith request */
    unsigned char Second[2];                  //8
    unsigned char Unused[2];                  //10
    unsigned char Client_Address[4];          //12
    unsigned char Your_IP_Address[4];         //16
    unsigned char Server_IP_Address[4];       //20
    unsigned char Gateway_IP_Address[4];      //24
    unsigned char C_H_A[16];                  //28, old mac address client hardware address
    unsigned char Model_Name[16];             //44, 0
    unsigned char reserved[28];               //60,16
    unsigned char download_type;              //88 ,44
    unsigned char country;                    //89 ,45
    unsigned char Host_Name[16];              //90 ,46
    unsigned char dhcp_flag;                  //106 ,62
    unsigned char port_num;                   //107, 63
    unsigned char Boot_File_Name[128];        //108,for version
    unsigned char Vendor_Specific_Area[64];   //236, used to pass Net mask
};
```

#### Sample of meesage send to roller:

| op  | unused |Transaction ID | unsued |
|---|-----------|------------------|-----------|
|0x02 | 0x00 0x00 0x00 | 0x92 0xda 0x00 0x00 | ~ 400 |

#### Sample code of javascript to create message :

```js
const message = new Uint8Array(400) //total length = 400 bytes
message[0] = 0x02; //AM_INVITE
message.set([0x92,0xda,0x00,0x00],4); // transaction id
```

#### Response of roller

| Head (2 bytes)  | Conetnt size (1 byte) | Reserve (1 byte) | Content |
|----------------|-----------------------|------------------|---------|
| 0x4a 0x53 | bytes of content | 0x00 | {"ip":"10.0.33.44","mac":"00:99:0a:fe:00:00","gateway","subnet"} |

### Package

Use atop serial server monitoring protocol, In this mode (Port 55954). Message should not have roller package.




## TCP/IP Port 5566

Use for roller command. Message combine with 2 part.

## Basic Format

'^' + [HEAD] + [Roller Package] + '$'

'^':  Message start byte
'$':  Message end byte
HEAD: 4 bytes |OP|ID|Flag1|Flag2|
Roller Package: Length = LENGTH(second byte) + 3 bytes

### Message Format

```
Example: [ 0xA0 0x01 0x00 0x00 0x00 0x55 0x02 0x01 0x01 0x00 0x00 ]
```

<table>
<thead><tr><td colspan="4">Head</td><td rowspan="2">Roller Package</td></tr><tr><td>Op (byte)</td><td>Message ID</td><td colspan="2">Flag</td></tr></thead><tbody><tr><td>0xA0</td><td>0x01</td><td colspan="2">0x00 0x00</td><td>  0x55 0x02 0x01 0x01 0x00 0x00 </td></tr></tbody>
</table>


### Roller Package Format

<table><thead><tr><td>HEADER</td><td>LENGTH</td><td>CMD</td><td>R/W</td><td>DATA</td><td>CHKSUM8</td><td>EOF</td></tr></thead><tbody><tr><td>0x55</td><td>CMD+R/W+DATA size</td><td>command</td><td>0x00|0x01</td><td> ...</td><td> Sum of datas </td><td>0X00</td></tr></tbody></table>
#### Read Command

|  name | command | data size | comment|
|------|-----|-----|----|
|phaseCurrent|0x01|byte| Phase Current |
|motrotPeriod|0x02|byte| Period |
|cardTemperature|0x03|byte| Motor tempture |
|fuzzy|0x04|?| Phase Current |
|phaseCurrent|0x01|byte| Phase Current |

### Operator

#### ACK OK (0xFF)

Response every thing is OK!

| OP(1byte) | messageID(1byte) | Flag1(1byte) | Flag2(1byte) |
| --------- | ---------------- | ------------ | ------------ |
| 0xFF      | 0x00             | 0x00         | 0x01         |

#### ACK FAIL (0xFF)

Response every thing is OK!

| OP(1byte) | messageID(1byte) | Flag1(1byte) | Flag2(1byte) |
| --------- | ---------------- | ------------ | ------------ |
| 0xFF      | 0x00             | ERROR Number | 0xFF         |


#### Roller-Command(0xA1)

Roller control command, All data  will pass to MCU.
|OP(1byte)| messageID(1byte)| Flag1(1byte) | Flag2(1byte)|  Data ... |
|-----------------|-----------------------|----------|----------|----------|
|0xA1|0x00-0xFF|Any|Any| [Roller Package](#roller-package) |

**Response**:

|OP(1byte)| messageID(1byte)| Flag1(1byte) | Flag2(1byte)|  Data ... |
|-----------------|-----------------------|----------|----------|----------|
|0xA1|0x00|0x00|0x00| return [Roller Package](#roller-package) |

#### E-Eye Trigger(0XA2)

When Roller's e-eye gpio be triggered. Roller will send this message to all  connected socket.

<p style="color:red"> IMPORTANT! If you want to receive E-Eyes event. You must: 
<ul style="color:red">
  <li>set eeyeTCPEvent = 1</li>
  <li>set hostIP = host who want to receive event.</li>
  <li>Host connect to roller by tcp socket, It will receive event when socket connection is alive.</li>
</ul></p>

Triggered E-Eye event flag: 

* M1E1: 0x01
* M1E2: 0x02
* M2E1: 0x04
* M2E2: 0x08

| OP(1byte) | messageID(1byte) | Flag1(1byte) | Flag2(1byte) |
| --------- | ---------------- | ------------ | ------------ |
| 0xA2      | eventID (00-FF)  | Trigger GPIO | CHKSUM       |

**Host Response**

success: ACK OK
fail: ACK FAIL



#### Get settings(B0)

**Send to roller**
|OP(1byte)| unused | unused|  unused|
|-----------------|-----------------------|----------|----------|
|0XB0|0x00|0x00| 0x00 |

**Response**

```c
// package data
typedef struct {
  int forceNeighborIP; //32
  char upperIP[4]; //36
  char downIP[4]; //40
} NeighborIP;

typedef struct {
  int eoz; //0
  int pe; //4
  int halfSpeed; //8
  int speed; //12
  int currentSpeed; //18
  int jamExprTime; //20
  int rumExprTime; //24
  int mode; //28
  NeighborIP nIP; //32
  int eeyeTCPEvent; //44
  char hostIP[4]; //48
  int checkSum; //52
} RollerSettings ; // size = 56 bytes
```



#### Set settings(B1)

**Send to roller**

|OP(1byte)| version | Package size (uint16)|  Data ... |
|-----------------|-----------------------|----------|----------|
|0XB1|0x00|0x00| Package below |

Package:

size = RollerSettings  + checkSum  =  52 + 2  =54 bytes

| data | chkSum |
|-----|-----|-----|
| RollerSettings (check below) | uint16 |

```c
// package data
typedef struct {
  int forceNeighborIP; //32
  char upperIP[4]; //36
  char downIP[4]; //40
} NeighborIP;

typedef struct {
  int eoz; //0
  int pe; //4
  int halfSpeed; //8
  int speed; //12
  int currentSpeed; //18
  int jamExprTime; //20
  int rumExprTime; //24
  int mode; //28
  NeighborIP nIP; //32
  int eeyeTCPEvent; //44
  char hostIP[4]; //48
  int checkSum; //52
} RollerSettings ; // size = 56 bytes
```

**Response**
success: ACK OK
fail: ACK FAIL
