
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

int8_t leds[ROWS] = { 0 };

// all on bytes(doesnt work): bÿÿÿÿÿÿÿÿÿÿÿ 
// all on: a255,255,255,255,255,255,255,255,255,255,255
// 1s: a1,1,1,1,1,1,1,1,1,1,1
// all off: a0,0,0,0,0,0,0,0,0,0,0


boolean newData = false;
const int MODE_ON = 1, MODE_OFF = 2, MODE_ALL = 3, MODE_ALL_BYTES = 4; 
int mode = 0;
int8_t inputBuffer[ROWS];
int inputPos = 0;


char tempInput[32];
unsigned int tempInputPos = 0;

void processIncomingByte (const byte inByte) {
  
  if (inByte == '\n' && tempInputPos == 0) {
      if (mode == MODE_ON && inputPos == 2) {
        int x = inputBuffer[0];
        int y = inputBuffer[1];
        leds[y] = leds[y] | (1 << x);
      }
      if (mode == MODE_OFF && inputPos == 2) {
        int x = inputBuffer[0];
        int y = inputBuffer[1];
        leds[y] = leds[y] & ~(1 << x);
      }
      if (mode == MODE_ALL || (mode == MODE_ALL_BYTES)) {
        for (int i=0; i<inputPos; i++) {
          leds[i] = inputBuffer[i];
        }
      }
      inputPos = 0;
      mode = 0;
  } else {
    if (mode == 0) {
      if (inByte == '+') mode = MODE_ON;
      if (inByte == '-') mode = MODE_OFF;
      if (inByte == 'a') mode = MODE_ALL;
      if (inByte == 'b') mode = MODE_ALL_BYTES;
    } else if (mode == MODE_ALL_BYTES) {
      if (inputPos < ROWS)
        inputBuffer [inputPos++] = inByte;
    } else {
      if (inByte == ',' || inByte == '\n') {
        tempInput[tempInputPos++] = '\0';
        tempInputPos = 0;
        inputBuffer [inputPos++] = atoi(tempInput);
        if (inByte == '\n')
          processIncomingByte(inByte);
      } else {
        tempInput[tempInputPos++] = inByte;
      }
    }
  }
}



int pos = -1;
int loopCount = 0;
String str;
void loop() {
  
  while (Serial.available () > 0) {
    processIncomingByte(Serial.read());
  }

  draw();
  
}

void draw() {
  for (int row = 0; row < ROWS; row++) {
    int16_t grounds = 0xFFFF;
    grounds -= 1 << row;

    int positives = leds[row];// 0;
    //for (int col = 0; col < COLS; col++)
    //  if (arr[row][col]) positives += 1 << col;

    digitalWrite(latchPin, LOW);
    shiftOut(dataPin, clockPin, MSBFIRST, grounds >> 8);
    shiftOut(dataPin, clockPin, MSBFIRST, grounds & 255);
    shiftOut(dataPin, clockPin, MSBFIRST, positives);
    digitalWrite(latchPin, HIGH);

    //delay(500);
  }
}