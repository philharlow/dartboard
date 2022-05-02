int masterLines = 11; //Change here to the number of lines of your Master Layer
int slaveLines = 8; //Change here to the number of lines of your Slave Layer
int matrixMaster[] = {31, 29, 27, 25, 23, 21, 19, 17, 15, 13, 11}; //Put here the pins you connected the lines of your Master Layer 
int matrixSlave[] = {30, 28, 26, 24, 22, 20, 18, 16}; //Put here the pins you connected the lines of your Slave Layer

int missSensor = 2; // Output pin from the tilt sensor
int missCountdown = 0;

void setup() {
    Serial.begin(115200);
    Serial.println("OpenDarts");

    for(int i = 0; i < slaveLines; i++){
        pinMode(matrixSlave[i], INPUT_PULLUP);
    }
   for(int i = 0; i < masterLines; i++){
       pinMode(matrixMaster[i], OUTPUT);
       digitalWrite(matrixMaster[i], HIGH);
   }

    pinMode(missSensor, INPUT);
    attachInterrupt(digitalPinToInterrupt(missSensor), onMissSensor, RISING);
}

void loop() {
    if (missCountdown > 0) {
        if (--missCountdown == 0) {
            missCountdown = -1; // Ignore any miss events during our delay
            Serial.println("miss");
            delay(500);
            missCountdown = 0;
        }
    }

    for(int i = 0; i < masterLines; i++){
        digitalWrite(matrixMaster[i], LOW);
        for(int j = 0; j < slaveLines; j++){
            if(digitalRead(matrixSlave[j]) == LOW){
                missCountdown = -1; // Ignore any miss events during our delay
                Serial.print(j);
                Serial.print(",");
                Serial.println(i);
                delay(500);
                missCountdown = 0;
                break;
            }
        }
        digitalWrite(matrixMaster[i], HIGH);
    }
}

void onMissSensor() {
    if (missCountdown != 0) return;
    missCountdown = 100;
}