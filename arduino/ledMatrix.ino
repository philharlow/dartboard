
// Led Matrix multiplexer
// Project page:

// Example serial commands:
// command type, followed by 12 comma-separated 8-bit numbers, representing the 11 rows, and the extra buttons
// all on bytes(doesnt work): bÿÿÿÿÿÿÿÿÿÿÿÿ
// all on: a255,255,255,255,255,255,255,255,255,255,255,255
// 1s: a1,1,1,1,1,1,1,1,1,1,1,1
// all off: a0,0,0,0,0,0,0,0,0,0,0,0
// single on: +1,1
// single off: -1,1

// Extra button leds: undo, miss, next player
// undo off, miss off, next on: e1 (0x001)
// undo off, miss on, next off: e2 (0x010)
// undo on, miss off, next off: e4 (0x100)
 
// ST_CP pin 12
const int latchPin = 10;
// SH_CP pin 11
const int clockPin = 11;
// DS pin 14
const int dataPin = 12;

// Button led pins. These are in a funky order (+,-) because of which nano pins can pwm
const int undoButtonLedPin = 3;
const int undoButtonGroundPin = 2;
const int missButtonLedPin = 5;
const int missButtonGroundPin = 4;
const int nextButtonLedPin = 6;
const int nextButtonGroundPin = 7;
int undoPwmOn = 50; // use pwm to skip resistors/allow fading
int missPwmOn = 70;
int nextPwmOn = 70;


// LED matrix size
const int ROWS = 11;
const int COLS = 8;

uint8_t leds[ROWS] = { 0 };
uint8_t extraLeds = 0;

// Variables to handle incoming serial data
boolean newData = false;
const int INPUT_MODE_ON = 1, INPUT_MODE_OFF = 2, INPUT_MODE_ALL = 3, INPUT_MODE_ALL_BYTES = 4, INPUT_MODE_EXTRA_BUTTONS = 5; 
int inputMode = 0;
uint8_t inputBuffer[ROWS + 1];
int inputPos = 0;
char tempInput[32];
unsigned int tempInputPos = 0;
 
void setup ()
{
  Serial.begin(115200);
  Serial.println("LedMatrix");

  // Setup pins as Outputs
  pinMode(latchPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
  pinMode(dataPin, OUTPUT);
  
  // Setup extra led pins
  pinMode(undoButtonLedPin, OUTPUT);
  pinMode(undoButtonGroundPin, OUTPUT);
  digitalWrite(undoButtonGroundPin, LOW);
  pinMode(missButtonLedPin, OUTPUT);
  pinMode(missButtonGroundPin, OUTPUT);
  digitalWrite(missButtonGroundPin, LOW);
  pinMode(nextButtonLedPin, OUTPUT);
  pinMode(nextButtonGroundPin, OUTPUT);
  digitalWrite(nextButtonGroundPin, LOW);
}

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
        int length = min(ROWS, inputPos);
        for (int i=0; i<length; i++) {
          leds[i] = inputBuffer[i];
        }
        if (inputPos == ROWS + 1) {
          extraLeds = inputBuffer[ROWS];
        }
      }
      if (inputMode == INPUT_MODE_EXTRA_BUTTONS && inputPos == 1) {
        extraLeds = inputBuffer[0];
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
      if (inByte == 'e') inputMode = INPUT_MODE_EXTRA_BUTTONS;
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

long period = 1000;
void draw() {
  for (int row = 0; row < ROWS; row++) {
    uint16_t cathodes = 0xFFFF;
    cathodes -= 1 << row;

    uint16_t anodes = leds[row];

    digitalWrite(latchPin, LOW);
    shiftOut(dataPin, clockPin, MSBFIRST, anodes);
    shiftOut(dataPin, clockPin, MSBFIRST, cathodes >> 8);
    shiftOut(dataPin, clockPin, MSBFIRST, cathodes & 255);
    digitalWrite(latchPin, HIGH);

    // Make the buttons breathe in and out
    unsigned long now = millis();
    long pos = now % period;
    float val = (cos(pos / (float)period * PI * 2) + 1) * 0.5;
    float pwm = 0.2 + val * 0.8;
    // Extra buttons
    analogWrite(undoButtonLedPin, (extraLeds >> 2) & 1 == 1 ? pwm * undoPwmOn : 0);
    analogWrite(missButtonLedPin, (extraLeds >> 1) & 1 == 1 ? pwm * missPwmOn : 0);
    analogWrite(nextButtonLedPin, (extraLeds >> 0) & 1 == 1 ? pwm * nextPwmOn : 0);
  }
}