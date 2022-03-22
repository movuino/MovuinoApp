
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <MPU9250.h>

#define ACCEL_SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define GYRO_SERVICE_UUID         "4fafc202-1fb5-459e-8fcc-c5c9c331914b"
#define MAGNETO_SERVICE_UUID      "4fafc203-1fb5-459e-8fcc-c5c9c331914b"

#define ACCEL_CHARACTERISTIC_UUID "ffffffff-36e4-4688-b7f5-ea07361b26a8"
#define GYRO_CHARACTERISTIC_UUID "ffffffff-36d3-4688-b7f5-ea07361b26a8"
#define MAGNETO_CHARACTERISTIC_UUID "ffffffff-36d2-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* accelCharacteristic = NULL;
BLECharacteristic* gyroCharacteristic = NULL;
BLECharacteristic* magnetoCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
uint32_t value = 0;
MPU9250 mpu;
float aX, aY, aZ;
float gX, gY, gZ;
float mX, mY, mZ;

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/



class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
};



void setup() {
  Serial.begin(115200);
  Wire.begin();
  delay(1000);
  mpu.setup(0x69);

  // Create the BLE Device
  BLEDevice::init("Movuino ESP32");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *accelService = pServer->createService(ACCEL_SERVICE_UUID);
  BLEService *gyroService = pServer->createService(GYRO_SERVICE_UUID);
  BLEService *magnetoService = pServer->createService(MAGNETO_SERVICE_UUID);

  accelCharacteristic = accelService->createCharacteristic(
                  ACCEL_CHARACTERISTIC_UUID,
                  BLECharacteristic::PROPERTY_READ   |
                  BLECharacteristic::PROPERTY_WRITE  |
                  BLECharacteristic::PROPERTY_NOTIFY |
                  BLECharacteristic::PROPERTY_INDICATE
                );
    
  gyroCharacteristic = gyroService->createCharacteristic(
                GYRO_CHARACTERISTIC_UUID,
                BLECharacteristic::PROPERTY_READ   |
                BLECharacteristic::PROPERTY_WRITE  |
                BLECharacteristic::PROPERTY_NOTIFY |
                BLECharacteristic::PROPERTY_INDICATE
              );
  magnetoCharacteristic = magnetoService->createCharacteristic(
              MAGNETO_CHARACTERISTIC_UUID,
              BLECharacteristic::PROPERTY_READ   |
              BLECharacteristic::PROPERTY_WRITE  |
              BLECharacteristic::PROPERTY_NOTIFY |
              BLECharacteristic::PROPERTY_INDICATE
            );
                  
  accelCharacteristic->addDescriptor(new BLE2902());
  gyroCharacteristic->addDescriptor(new BLE2902());
  magnetoCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  accelService->start();
  gyroService->start();
  magnetoService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(ACCEL_SERVICE_UUID);
  pAdvertising->addServiceUUID(GYRO_SERVICE_UUID);
  pAdvertising->addServiceUUID(MAGNETO_SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  // pAdvertising->setMinPreferred(0x0);  // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection to notify...");
}

uint8_t accel_tab[12];
uint8_t gyro_tab[12];
uint8_t magneto_tab[12];

void loop() {
    // notify changed value
    mpu.update();

    // getAcc and getGyro are aparently reversed
    gX = mpu.getAccX();
    gY = mpu.getAccY();
    gZ = mpu.getAccZ();

    aX = mpu.getGyroX();
    aY = mpu.getGyroY();
    aZ = mpu.getGyroZ();

    mX = mpu.getMagX();
    mY = mpu.getMagY();
    mZ = mpu.getMagZ();
    
    Serial.printf("%f %f %f\n", gX, gY, gZ);
    accel_tab[0] = ((uint8_t*)&aX)[0];
    accel_tab[1] = ((uint8_t*)&aX)[1];
    accel_tab[2] = ((uint8_t*)&aX)[2];
    accel_tab[3] = ((uint8_t*)&aX)[3];
    accel_tab[4] = ((uint8_t*)&aY)[0];
    accel_tab[5] = ((uint8_t*)&aY)[1];
    accel_tab[6] = ((uint8_t*)&aY)[2];
    accel_tab[7] = ((uint8_t*)&aY)[3];
    accel_tab[8] = ((uint8_t*)&aZ)[0];
    accel_tab[9] = ((uint8_t*)&aZ)[1];
    accel_tab[10] = ((uint8_t*)&aZ)[2];
    accel_tab[11] = ((uint8_t*)&aZ)[3];

    gyro_tab[0] = ((uint8_t*)&gX)[0];
    gyro_tab[1] = ((uint8_t*)&gX)[1];
    gyro_tab[2] = ((uint8_t*)&gX)[2];
    gyro_tab[3] = ((uint8_t*)&gX)[3];
    gyro_tab[4] = ((uint8_t*)&gY)[0];
    gyro_tab[5] = ((uint8_t*)&gY)[1];
    gyro_tab[6] = ((uint8_t*)&gY)[2];
    gyro_tab[7] = ((uint8_t*)&gY)[3];
    gyro_tab[8] = ((uint8_t*)&gZ)[0];
    gyro_tab[9] = ((uint8_t*)&gZ)[1];
    gyro_tab[10] = ((uint8_t*)&gZ)[2];
    gyro_tab[11] = ((uint8_t*)&gZ)[3];

    magneto_tab[0] = ((uint8_t*)&mX)[0];
    magneto_tab[1] = ((uint8_t*)&mX)[1];
    magneto_tab[2] = ((uint8_t*)&mX)[2];
    magneto_tab[3] = ((uint8_t*)&mX)[3];
    magneto_tab[4] = ((uint8_t*)&mY)[0];
    magneto_tab[5] = ((uint8_t*)&mY)[1];
    magneto_tab[6] = ((uint8_t*)&mY)[2];
    magneto_tab[7] = ((uint8_t*)&mY)[3];
    magneto_tab[8] = ((uint8_t*)&mZ)[0];
    magneto_tab[9] = ((uint8_t*)&mZ)[1];
    magneto_tab[10] = ((uint8_t*)&mZ)[2];
    magneto_tab[11] = ((uint8_t*)&mZ)[3];
    
    if (deviceConnected) {
      Serial.println("connected");
        accelCharacteristic->setValue(accel_tab, sizeof(accel_tab));
        accelCharacteristic->notify();
        gyroCharacteristic->setValue(gyro_tab, sizeof(gyro_tab));
        gyroCharacteristic->notify();
        magnetoCharacteristic->setValue(magneto_tab, sizeof(magneto_tab));
        magnetoCharacteristic->notify();
    }
    // disconnecting
    if (!deviceConnected && oldDeviceConnected) {
        delay(500); // give the bluetooth stack the chance to get things ready
        pServer->startAdvertising(); // restart advertising
        Serial.println("start advertising");
        oldDeviceConnected = deviceConnected;
        deviceConnected = false;
    }
    // connecting
    if (deviceConnected && !oldDeviceConnected) {
        // do stuff here on connecting
        oldDeviceConnected = deviceConnected;
    }
    delay(25);
}