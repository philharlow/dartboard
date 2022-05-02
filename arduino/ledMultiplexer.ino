
// Define Connections to 74HC595
 
// ST_CP pin 12
const int latchPin = 10;
// SH_CP pin 11
const int clockPin = 11;
// DS pin 14
const int dataPin = 12;
 
void setup ()
{
  Serial.begin(115200);
  Serial.println("LedMatrix");
  // Setup pins as Outputs
  pinMode(latchPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
  pinMode(dataPin, OUTPUT);
}
const int ROWS = 11;
const int COLS = 8;

uint8_t leds[ROWS] = { 0 };

// all on bytes(doesnt work): bÿÿÿÿÿÿÿÿÿÿÿ 
// all on: a255,255,255,255,255,255,255,255,255,255,255
// 1s: a1,1,1,1,1,1,1,1,1,1,1
// all off: a0,0,0,0,0,0,0,0,0,0,0
// single on: +1,1
// single off: -1,1


boolean newData = false;
const int INPUT_MODE_ON = 1, INPUT_MODE_OFF = 2, INPUT_MODE_ALL = 3, INPUT_MODE_ALL_BYTES = 4; 
int inputMode = 0;
uint8_t inputBuffer[ROWS];
int inputPos = 0;


char tempInput[32];
unsigned int tempInputPos = 0;

void processIncomingByte (const byte inByte) {
  
  if (inByte == '\n' && tempInputPos == 0) {
      if (inputMode == INPUT_MODE_ON && inputPos == 2) {
        int x = inputBuffer[0];
        int y = inputBuffer[1];
        leds[y] = leds[y] | (1 << x);
      }
      if (inputMode == INPUT_MODE_OFF && inputPos == 2) {
        int x = inputBuffer[0];
        int y = inputBuffer[1];
        leds[y] = leds[y] & ~(1 << x);
      }
      if (inputMode == INPUT_MODE_ALL || (inputMode == INPUT_MODE_ALL_BYTES)) {
        for (int i=0; i<inputPos; i++) {
          leds[i] = inputBuffer[i];
        }
      }
      inputPos = 0;
      inputMode = 0;
      
      //Serial.println("rows:");
      //for (int row = 0; row < ROWS; row++) {
      //  Serial.println(leds[row]);
      //}
  } else {
    // First character defines mode
    if (inputMode == 0) {
      if (inByte == '+') inputMode = INPUT_MODE_ON;
      if (inByte == '-') inputMode = INPUT_MODE_OFF;
      if (inByte == 'a') inputMode = INPUT_MODE_ALL;
      if (inByte == 'b') inputMode = INPUT_MODE_ALL_BYTES;
    } else if (inputMode == INPUT_MODE_ALL_BYTES) {
      if (inputPos < ROWS)
        inputBuffer [inputPos++] = inByte;
    } else {
      if (inByte == ',' || inByte == '\n') {
        tempInput[tempInputPos++] = '\0';
        tempInputPos = 0;
        //Serial.println("tempInput");
        //Serial.println(tempInput);
        //Serial.println(inputPos);
        int val = atoi(tempInput);
        //Serial.println(val);
        inputBuffer[inputPos++] = val;
        if (inByte == '\n')
          processIncomingByte(inByte);
      } else {
        tempInput[tempInputPos++] = inByte;
      }
    }
  }
}

void loop() {
  
  while (Serial.available () > 0) {
    processIncomingByte(Serial.read());
  }

  draw();
  
}

void draw() {
  for (int row = 0; row < ROWS; row++) {
    uint16_t grounds = 0xFFFF;
    grounds -= 1 << row;

    uint16_t positives = leds[row];
    //Serial.println("positives");
    //Serial.println(positives);
    //Serial.println("grounds");
    //Serial.println(grounds >> 8);
    //Serial.println(grounds & 255);

    digitalWrite(latchPin, LOW);
    shiftOut(dataPin, clockPin, MSBFIRST, positives);
    shiftOut(dataPin, clockPin, MSBFIRST, grounds >> 8);
    shiftOut(dataPin, clockPin, MSBFIRST, grounds & 255);
    digitalWrite(latchPin, HIGH);

    //delay(1500);
  }
}