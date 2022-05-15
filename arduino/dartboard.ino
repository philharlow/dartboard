int masterLines = 11; //Change to the number of lines of your Master Layer
int slaveLines = 8; //Change to the number of lines of your Slave Layer
int matrixMasterPins[] = {30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10}; //Put the pins you connected the lines of your Master Layer 
int matrixSlavePins[] = {31, 29, 27, 25, 23, 21, 19, 17}; //Put the pins you connected the lines of your Slave Layer

int missSensorPin = 2; // Output pin from the tilt sensor
// countdown will be negative when ignoring sensor input, positive after it received sensor input but is waiting to announce to make sure no other button/pad input comes in first
int missCountdown = 0;

int nextButtonPin = 4;
int nextButtonGroundPin = 5;
int missButtonPin = 6;
int missButtonGroundPin = 7;
int undoButtonPin = 8;
int undoButtonGroundPin = 9;

void setup() {
    Serial.begin(115200);
    Serial.println("OpenDarts");

    for(int i = 0; i < slaveLines; i++){
        pinMode(matrixSlavePins[i], INPUT_PULLUP);
    }
   for(int i = 0; i < masterLines; i++){
       pinMode(matrixMasterPins[i], OUTPUT);
       digitalWrite(matrixMasterPins[i], HIGH);
   }

    pinMode(missSensorPin, INPUT);
    attachInterrupt(digitalPinToInterrupt(missSensorPin), onMissSensor, RISING);

    pinMode(undoButtonPin, INPUT_PULLUP);
    //attachInterrupt(digitalPinToInterrupt(undoButtonPin), onUndoButton, FALLING);
    pinMode(undoButtonGroundPin, OUTPUT);
    digitalWrite(undoButtonGroundPin, LOW);
    
    pinMode(missButtonPin, INPUT_PULLUP);
    //attachInterrupt(digitalPinToInterrupt(missButtonPin), onMissButton, FALLING);
    pinMode(missButtonGroundPin, OUTPUT);
    digitalWrite(missButtonGroundPin, LOW);

    pinMode(nextButtonPin, INPUT_PULLUP);
    //attachInterrupt(digitalPinToInterrupt(nextButtonPin), onNextButton, FALLING);
    pinMode(nextButtonGroundPin, OUTPUT);
    digitalWrite(nextButtonGroundPin, LOW);
}

void sendMessage(String message) {
    Serial.println(message);
    delay(500);
    missCountdown = -1000; // Extra delay to prevent additional misses
}

void onMissSensor() {
    if (missCountdown == 0) missCountdown = 100;
}

void loop() {
    if (missCountdown < 0) missCountdown++; // Count down delay
    if (missCountdown > 0) {
        if (--missCountdown == 0) {
            sendMessage("miss");
        }
    }

    for(int i = 0; i < masterLines; i++){
        digitalWrite(matrixMasterPins[i], LOW);
        for(int j = 0; j < slaveLines; j++){
            if(digitalRead(matrixSlavePins[j]) == LOW){
                String hit = String(j) + "," + String(i);
                sendMessage(hit);
                break;
            }
        }
        digitalWrite(matrixMasterPins[i], HIGH);
    }

    if (digitalRead(undoButtonPin) == LOW) {
        sendMessage("undo");
    }

    if (digitalRead(missButtonPin) == LOW) {
        sendMessage("missb");
    }

    if (digitalRead(nextButtonPin) == LOW) {
        sendMessage("next");
    }
}