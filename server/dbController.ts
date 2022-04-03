import { LocalStorage } from "node-localstorage";
import { CalibrationMap, LedCalibrationMap } from "../src/types/LedTypes";
import { CalibrationObj } from "../src/types/SocketTypes";

global.localStorage = new LocalStorage('./scratch');

export const createCache = (cache: string) => {
    if (!caches[cache]) {
        caches[cache] = new LocalStorage(cache);
    }
    return caches[cache];
}

export const getStringValue = (property: string) => {
    return localStorage.getItem(property);
}

export const setStringValue = (property: string, value: string) => {
    return localStorage.setItem(property, value);
}

export const getJsonValue = (property: string) => {
    const str = getStringValue(property);
    if (!str) return null;
    return JSON.parse(str);
}

export const setJsonValue = (property: string, value: any) => {
    const str = JSON.stringify(value);
    setStringValue(property, str);
}

const DART_CALIBRATION = "DART_CALIBRATION";
export const getDartCalibration = () => {
    return (getJsonValue(DART_CALIBRATION) || {}) as CalibrationMap;
}
export const setDartCalibration = (calibration: CalibrationMap) => {
    return setJsonValue(DART_CALIBRATION, calibration);
}

const LED_CALIBRATION = "LED_CALIBRATION";
export const getLedCalibration = () => {
    return (getJsonValue(LED_CALIBRATION) || {}) as LedCalibrationMap;
}
export const setLedCalibration = (calibration: LedCalibrationMap) => {
    return setJsonValue(LED_CALIBRATION, calibration);
}