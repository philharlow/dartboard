int masterLines = 11; //Change here to the number of lines of your Master Layer
int slaveLines = 9; //Change here to the number of lines of your Slave Layer
int matrixMaster[] = {22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46 }; //Put here the pins you connected the lines of your Master Layer 
int matrixSlave[] = {23, 25, 27, 29, 31, 33, 35, 37, 39}; //Put here the pins you connected the lines of your Slave Layer
void setup() {     
    Serial.begin(115200);     
    Serial.println("OpenDarts"); //This line is not necessary, is just here for debug purposes
    for(int i = 0; i < slaveLines; i++){         
        pinMode(matrixSlave[i], INPUT_PULLUP);     
    }
   for(int i = 0; i < masterLines; i++){         
       pinMode(matrixMaster[i], OUTPUT);         
       digitalWrite(matrixMaster[i], HIGH);     
   } 
}
void loop() {
    for(int i = 0; i < masterLines; i++){         
        digitalWrite(matrixMaster[i], LOW);         
        for(int j = 0; j < slaveLines; j++){             
            if(digitalRead(matrixSlave[j]) == LOW){                 
                Serial.print(j);                 
                Serial.print(",");                 
                Serial.println(i);                 
                delay(500);                 
                break;             
            }         
        }         
        digitalWrite(matrixMaster[i], HIGH);     
    } 
}

