
/*
   Intensity LED  : 0 = 0mA | 255 = 124mA (max). Be careful, data from PD can saturate at 524287 if Intensity LED is too high
   PGG Sample Rate : 0x00 = 24.995 samples per second | 0x13 = 4096 samples per second (max)
   Sample Average : 2, 4, 8, 16, 32, 64, 128 samples (max)
   Led Sequence Control : LED1 (1), LED2 (2), LED3 (3), LED1 and LED2 pulsed simultaneously (4),
   LED1 and LED3 pulsed simultaneously (5), LED2 and LED3 pulsed simultaneously (6), LED1, LED2 and LED3 pulsed simultaneously (7),
   Pilot on LED1 (8), DIRECT AMBIENT (9), LED4 [external mux control] (10), LED5 [external mux control] (11), LED6 [external mux control] (12)
   DIRECT AMBIENT : DA (i.e. normal photodiode measurements)
   Sequence Control is up to the configuration you wish (page 14-15 datasheet)
   PD: PhotoDiode
   1 LED is RGB or just 1 color
*/

#include <MAX86141.h>
#include <SPI.h>

/* PPG Sensor Configurations */

// Sensor composed with 2 PDs and 1 LED //
#define PDsLED

#ifdef PDsLED
//////////// Pointers used to send timestamp, 2 samples PD1, 2 samples PD2 and SNR by Bluetooth /////////////
uint8_t pt_ledSeq1A_PD1_2[12];
uint8_t pt_ledSeq1A_PD2_2[12];
uint8_t SNR1_2[4], SNR2_2[4];
#endif

/* Inculde LED configuration */
int ledMode[10];
int last_correction = millis();

#define CORRECTION_MIN_INTERVAL 50
#include "LEDsConfiguration_Sensor.h"

/* Sample Rate taken */
//#define Sample_Rate

/* Pin Definitions  */
// #define MISO_PIN              19
// #define MOSI_PIN              18
// #define SCK_PIN               5
//#define SS_PIN                19 //(Adafruit)
#define SS_PIN                10 //(Movuino)


/* Global Variables */
static int spiClk = 1000000; // 8 MHz Maximum
int cpt1 = 0, cpt2 = 0;
int interruptPin = 36;
bool dataReady = false;
long startTime;
long samplesTaken = 0;
int sequences_size = 0;
float snr_pd1, snr_pd2;
MAX86141 pulseOx1;

extern BLECharacteristic intensityLedsCharacteristic;
extern bool is_calibrating;

// Check if the saturation of the signal is too high. If an overdrive is found, the led intensity will
// be set to a new appropriate level and the correctionCallback() function will be called with the new value
int correctOverdrive(void (*correctionCallback)(int))
{
  Serial.printf("%f %d %f %d\n", snr_pd1, isinf(snr_pd1), snr_pd2, isinf(snr_pd2));
  if ((snr_pd1 > 80.0 || snr_pd2 > 80.0) && millis() - last_correction <= CORRECTION_MIN_INTERVAL) {
    return 1;
  }
  if ((snr_pd1 > 80.0 || snr_pd2 > 80.0) && millis() - last_correction > CORRECTION_MIN_INTERVAL) {
    Serial.println("############################ SATURATION #########################");
    /// Regulate led instensity to 20 ///
    const int newIntensity = pulseOx1.getIntensityLed() * 0.9;
    pulseOx1.setIntensityLed(newIntensity, ledMode);
    correctionCallback(newIntensity);
    last_correction = millis();
    Serial.println("ret 1");
    return 1;
  }
  if (pulseOx1.getIntensityLed() == 255) {
     last_correction = millis();
     Serial.println("TEST");
     return 1;
  }
  Serial.println("ret 0");
  return 0;
}

void configurePPG86(void) {
  Serial.println("####  PPG MAX86141 CONFIG ####");
  // Configure IO.
  pinMode(SS_PIN, OUTPUT);
  digitalWrite(SS_PIN, HIGH);

  //initialise SPI
  pulseOx1.spi = new SPIClass(SPI);
  pulseOx1.SS = SS_PIN;
  Serial.println("Init Device");
  pulseOx1.spi->begin();

  delay(100);
  pulseOx1.setDebug(true);

#ifdef PDsLED
  sequences_size = config(rgbLED_G /*Green LED selected (Sequence 1A, 0-3)*/ | DA /*Direct Ambient (Sequence 2B, 4-9)*/);
  pulseOx1.initialisation(2/*nb_pds*/, ledMode/*LedMode*/, sequences_size/*Number of sequences*/, 10/*intensity_LEDs*/, 0x00/*sample_average*/, 0xE/*sample_rate*/, 0x3/*pulse width*/, 0x2/*ADC Range= 16uA*/, spiClk);
#endif
  Serial.println(sequences_size);
//  Serial.println(ledMode);
  Serial.println("--Read Register-- System Control");
  Serial.println(pulseOx1.read_reg(0x0D));

  Serial.println("--Read Register-- PART_ID");
  int part_ID = pulseOx1.read_reg(0xFF);
  Serial.println(part_ID);

  Serial.println("--Read Temp-- 0x40");
  pulseOx1.write_reg(0x40, 0xFF);

  Serial.println(pulseOx1.read_reg(0x41));

  if (part_ID == 36) {
    Serial.println("MAX86140 connection succeeded !");
    errorPPG86 = false;
  }
  else if (part_ID == 37) {
    Serial.println("MAX86141 connection succeeded !");
    errorPPG86 = false;
  }
  else {
    Serial.println("Connection failed !");
  }

  delay(1000);

  pulseOx1.setDebug(false);

  startTime = millis();

  //  Serial.println();

}


void updatePPG86(void (*correctionCallback)(int)) {
  Serial.println(is_calibrating);
  uint8_t intStatus;
  //Read Status
  intStatus = pulseOx1.read_reg(REG_INT_STAT_1);
  bool flagA_full = (intStatus & 0x80) >> 7;

  /////// if there is 8 data in the FIFO ///////
  if (flagA_full) {
    samplesTaken = samplesTaken + 2;
    int fifo_size = pulseOx1.device_data_read1();

    //---------------------------- Serial Communication -------------------------------------//
#ifdef SerialTest
#ifdef PDsLED
    Serial.println("----- PPG data ----- :");
    Serial.println("Reading all data from PD1: ");
    for (int i = 0; i < fifo_size / 4; i++) {
      Serial.println(pulseOx1.tab_ledSeq1A_PD1[i]);
    }

    Serial.println("Reading all data from PD2: ");
    for (int i = 0; i < fifo_size / 4; i++) {
      Serial.println(pulseOx1.tab_ledSeq1A_PD2[i]);
    }

    free(pulseOx1.tab_ledSeq1A_PD1);
    free(pulseOx1.tab_ledSeq1A_PD2);
#endif
#endif

    //---------------------------- Bluetooth Communication ----------------------------------//
#ifdef BleTest

#ifdef PDsLED
    //    Serial.println("----- PPG data ----- :");
    //    for (int i = 0; i < fifo_size / 4; i++) {
    //      Serial.println(pulseOx1.tab_ledSeq1A_PD1[i]);
    //    }
    //
    //    for (int i = 0; i < fifo_size / 4; i++) {
    //      Serial.println(pulseOx1.tab_ledSeq1A_PD2[i]);
    //    }

#ifdef Sample_Rate
    Serial.print("Sample Rate : Hz[");
    Serial.print((float)(samplesTaken) / ((millis() - startTime) / 1000.0), 2);
    Serial.print("]");
    Serial.println();
    Serial.println();
#endif

    ///////// See if direct ambient is affecting the output of ADC (OverFlow) /////////
    uint8_t InterruptStatus_without_AFull_DataReady = pulseOx1.read_reg(REG_INT_STAT_1) << 2;
    bool InterruptStatus_with_ALC = pulseOx1.read_reg(REG_INT_STAT_1) >> 8;
    //Serial.println("############## Reading ALC bit ############ " + String(InterruptStatus_with_ALC));

    if (InterruptStatus_with_ALC == 0) {
      ///////////// Pointer to send only 2 samples by Bluetooth (PD1) ////////////
      if ((pulseOx1.tab_ledSeq1A_PD1[0] != 0) && (pulseOx1.tab_ledSeq1A_PD1[1] != 0)) {

        ///////////// Addition data of PD1 in buffer to measure SNR (Signal Noise Ratio) //////////
        pulseOx1.signalData_ledSeq1A_PD1[cpt1] = pulseOx1.tab_ledSeq1A_PD1[0];
        pulseOx1.signalData_ledSeq1A_PD1[cpt1 + 1] = pulseOx1.tab_ledSeq1A_PD1[1];

        ///////////// Pointer to send only 2 samples by Bluetooth (PD1) ////////////
        uint32_t timestamp1 = millis();
        pt_ledSeq1A_PD1_2[3] = (uint8_t)timestamp1;
        pt_ledSeq1A_PD1_2[2] = (uint8_t)(timestamp1 >>= 8);
        pt_ledSeq1A_PD1_2[1] = (uint8_t)(timestamp1 >>= 8);
        pt_ledSeq1A_PD1_2[0] = (uint8_t)(timestamp1 >>= 8);


        pt_ledSeq1A_PD1_2[7] = (uint8_t)pulseOx1.tab_ledSeq1A_PD1[0];
        pt_ledSeq1A_PD1_2[6] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD1[0] >>= 8);
        pt_ledSeq1A_PD1_2[5] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD1[0] >>= 8);
        pt_ledSeq1A_PD1_2[4] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD1[0] >>= 8);

        pt_ledSeq1A_PD1_2[11] = (uint8_t)pulseOx1.tab_ledSeq1A_PD1[1];
        pt_ledSeq1A_PD1_2[10] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD1[1] >>= 8);
        pt_ledSeq1A_PD1_2[9] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD1[1] >>= 8);
        pt_ledSeq1A_PD1_2[8] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD1[1] >>= 8);

        cpt1 += 2;
        if (cpt1 == SIZE) {
          //          Serial.println("SNR (dB): " + String(pulseOx1.signaltonoise(pulseOx1.signalData_ledSeq1A_PD1, SIZE)));
          snr_pd1 = pulseOx1.signaltonoise(pulseOx1.signalData_ledSeq1A_PD1, SIZE);
          if (snr_pd1 > 1000.0)
            snr_pd1 = 999.9;
          int var = 0;
          var = 100 * snr_pd1;
          if (var < 0) {
            int a = -100 * var;
            SNR1_2[3] = (uint8_t)a;
            SNR1_2[2] = (uint8_t)(a >>= 8);
            SNR1_2[1] = (uint8_t)(a >>= 8);
            SNR1_2[0] = (uint8_t)(a >>= 8);
          }
          else {
            SNR1_2[3] = (uint8_t)var;
            SNR1_2[2] = (uint8_t)(var >>= 8);
            SNR1_2[1] = (uint8_t)(var >>= 8);
            SNR1_2[0] = (uint8_t)(var >>= 8);
          }
          cpt1 = 0;
        }

      }


      if ((pulseOx1.tab_ledSeq1A_PD2[0] != 0) && (pulseOx1.tab_ledSeq1A_PD2[1] != 0)) {

        ///////////// Addition data of PD2 in buffer to measure SNR (Signal Noise Ratio) //////////
        pulseOx1.signalData_ledSeq1A_PD2[cpt2] = pulseOx1.tab_ledSeq1A_PD2[0];
        pulseOx1.signalData_ledSeq1A_PD2[cpt2 + 1] = pulseOx1.tab_ledSeq1A_PD2[1];

        ///////////// Pointer to send only 2 samples by Bluetooth (PD2) ////////////
        uint32_t timestamp2 = millis();
        pt_ledSeq1A_PD2_2[3] = (uint8_t)timestamp2;
        pt_ledSeq1A_PD2_2[2] = (uint8_t)(timestamp2 >>= 8);
        pt_ledSeq1A_PD2_2[1] = (uint8_t)(timestamp2 >>= 8);
        pt_ledSeq1A_PD2_2[0] = (uint8_t)(timestamp2 >>= 8);

        pt_ledSeq1A_PD2_2[7] = (uint8_t)pulseOx1.tab_ledSeq1A_PD2[0];
        pt_ledSeq1A_PD2_2[6] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD2[0] >>= 8);
        pt_ledSeq1A_PD2_2[5] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD2[0] >>= 8);
        pt_ledSeq1A_PD2_2[4] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD2[0] >>= 8);

        pt_ledSeq1A_PD2_2[11] = (uint8_t)pulseOx1.tab_ledSeq1A_PD2[1];
        pt_ledSeq1A_PD2_2[10] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD2[1] >>= 8);
        pt_ledSeq1A_PD2_2[9] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD2[1] >>= 8);
        pt_ledSeq1A_PD2_2[8] = (uint8_t)(pulseOx1.tab_ledSeq1A_PD2[1] >>= 8);

        cpt2 += 2;
        if (cpt2 == SIZE) {
          //          Serial.println("SNR (dB): " + String(pulseOx1.signaltonoise(pulseOx1.signalData_ledSeq1A_PD2, SIZE)));
          snr_pd2 = pulseOx1.signaltonoise(pulseOx1.signalData_ledSeq1A_PD2, SIZE);
          if (snr_pd2 > 1000.0)
            snr_pd2 = 999.9;
          int var = 0;
          var = 100 * snr_pd2;
          if (var < 0) {
            int a = -100 * var;
            SNR2_2[3] = (uint8_t)a;
            SNR2_2[2] = (uint8_t)(a >>= 8);
            SNR2_2[1] = (uint8_t)(a >>= 8);
            SNR2_2[0] = (uint8_t)(a >>= 8);
          }
          else {
            SNR2_2[3] = (uint8_t)var;
            SNR2_2[2] = (uint8_t)(var >>= 8);
            SNR2_2[1] = (uint8_t)(var >>= 8);
            SNR2_2[0] = (uint8_t)(var >>= 8);
          }
          cpt2 = 0;
        }
      }

    }
    Serial.println(is_calibrating);
      if (is_calibrating)
    {
      Serial.println("calib true");
      if (!correctOverdrive(correctionCallback))
      {
        Serial.println("reset");
        is_calibrating = false;
      }
    }
    free(pulseOx1.tab_ledSeq1A_PD1);
    free(pulseOx1.tab_ledSeq1A_PD2);
    
#endif

#endif
  }
  //  Serial.println();
}
