export function Name() { return "KPRepublic BM80v2"; }
export function VendorId() { return 0x4b50; }
export function ProductId() { return 0x1141; }
export function Publisher() { return "WhirlwindFX"; }
export function Size() { return [18, 7]; }
export function DefaultPosition() { return [10, 100]; }
export function DefaultScale() { return 8.0 }
export function ControllableParameters() {
    return [
        { "property": "shutdownColor", "group": "lighting", "label": "Shutdown Color", "min": "0", "max": "360", "type": "color", "default": "009bde" },
        { "property": "LightingMode", "group": "lighting", "label": "Lighting Mode", "type": "combobox", "values": ["Canvas", "Forced"], "default": "Canvas" },
        { "property": "forcedColor", "group": "lighting", "label": "Forced Color", "min": "0", "max": "360", "type": "color", "default": "009bde" },
    ];
}

const vKeys = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
    33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
    50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62,
    63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75,
    76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86,
];

const vKeyNames = [
    "Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "Print Screen", "Scroll Lock", "Pause Break",
    "`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-_", "=+", "Backspace", "Insert", "Home", "Page Up",
    "Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\", "Del", "End", "Page Down",
    "CapsLock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter",
    "Left Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Right Shift", "Up Arrow",
    "Left Ctrl", "Left Win", "Left Alt", "Space", "Right Alt", "Right Win", "Fn", "Right Ctrl", "Left Arrow", "Down Arrow", "Right Arrow",
];

const vKeyPositions = [
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [15, 1], [16, 1], [17, 1],
    [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2], [15, 2], [16, 2], [17, 2],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3], [15, 3], [16, 3], [17, 3],
    [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4],
    [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [16, 5],
    [1, 6], [2, 6], [3, 6], [6, 6], [11, 6], [12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6],
];

let ledCount = vKeys[vKeys.length -1] + 1

export function LedNames() {
    return vKeyNames;
}

export function LedPositions() {
    return vKeyPositions;
}

export function Initialize() {
    ClearReadBuffer();
    checkFirmwareType();
    versionQMK();
    versionSignalRGBProtocol();
    uniqueIdentifier();
    // device.repollLeds();
    device.setControllableLeds();
    effectEnable();
}

export function Render() {
    sendColors();
}

export function Shutdown() {
    effectDisable();
}

function checkFirmwareType() {
    let packet = [];
    packet[0] = 0x00;
    packet[1] = 0x28;

    device.write(packet, 32);

    let returnpacket = device.read(packet, 32);
    let FirmwareTypeByte = returnpacket[2];

    if (FirmwareTypeByte !== 1 || FirmwareTypeByte !== 2) {
        device.notify("Unsupported Firmware: ", "Click Show Console, and then click on troubleshooting for your keyboard to find out more.", 0)
    }

    device.log("Firmware Type: " + FirmwareTypeByte);
    device.pause(30);
}

//Clear Read buffer to get correct values out of our read functions
function ClearReadBuffer(timeout = 10) {
    let count = 0;
    let readCounts = [];

    while (device.getLastReadSize() > 0) {
        device.read([0x00], 32, timeout);
        count++;
        readCounts.push(device.getLastReadSize());
    }
}

//Check the version of QMK Firmware that the keyboard is running
function versionQMK() {
    let packet = [];
    packet[0] = 0x00;
    packet[1] = 0x21;

    device.write(packet, 32);

    let returnpacket = device.read(packet, 32);
    let QMKVersionByte1 = returnpacket[2];
    let QMKVersionByte2 = returnpacket[3];
    let QMKVersionByte3 = returnpacket[4];
    device.log("QMK Version: " + QMKVersionByte1 + "." + QMKVersionByte2 + "." + QMKVersionByte3);
    device.pause(30);
}

//Grab the version of the SignalRGB Protocol the keyboard is running
function versionSignalRGBProtocol() {
    let packet = [];
    packet[0] = 0x00;
    packet[1] = 0x22;

    device.write(packet, 32);

    let returnpacket = device.read(packet, 32);
    let ProtocolVersionByte1 = returnpacket[2];
    let ProtocolVersionByte2 = returnpacket[3];
    let ProtocolVersionByte3 = returnpacket[4];
    device.log("SignalRGB Protocol Version: " + ProtocolVersionByte1 + "." + ProtocolVersionByte2 + "." + ProtocolVersionByte3);
    device.pause(30);
}

//Grab the unique identifier for this keyboard model
function uniqueIdentifier() {
    let packet = [];
    packet[0] = 0x00;
    packet[1] = 0x23;

    device.write(packet, 32);

    let returnpacket = device.read(packet, 32);
    let UniqueIdentifierByte1 = returnpacket[2];
    let UniqueIdentifierByte2 = returnpacket[3];
    let UniqueIdentifierByte3 = returnpacket[4];
    device.log("Unique Device Identifier: " + UniqueIdentifierByte1 + UniqueIdentifierByte2 + UniqueIdentifierByte3);
    device.pause(30);
}

//Enable the SignalRGB Effect Mode
function effectEnable() {
    let packet = [];
    packet[0] = 0x00;
    packet[1] = 0x25;

    device.write(packet, 32);
    device.pause(30);
}

//Revert to Hardware Mode
function effectDisable() {
    let packet = [];
    packet[0] = 0x00;
    packet[1] = 0x26;

    device.write(packet, 32);
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let colors = [];
    colors[0] = parseInt(result[1], 16);
    colors[1] = parseInt(result[2], 16);
    colors[2] = parseInt(result[3], 16);

    return colors;
}

function grabColors(shutdown = false) {
    let rgbdata = [];

    for (let iIdx = 0; iIdx < vKeys.length; iIdx++) {
        let iPxX = vKeyPositions[iIdx][0];
        let iPxY = vKeyPositions[iIdx][1];
        let color;

        if (shutdown) {
            color = hexToRgb(shutdownColor);
        }
        else if (LightingMode === "Forced") {
            color = hexToRgb(forcedColor);
        }
        else {
            color = device.color(iPxX, iPxY);
        }

        let iLedIdx = vKeys[iIdx] * 3;
        rgbdata[iLedIdx] = color[0];
        rgbdata[iLedIdx + 1] = color[1];
        rgbdata[iLedIdx + 2] = color[2];
    }

    return rgbdata;
}

function sendColors() {
    let LEDCount = 87;
    let rgbdata = grabColors();
    let totalpackets = Math.floor(LEDCount / 9);
    let finalpacketoffset = (totalpackets * 9);
    let finalpacketledstosend = (LEDCount - finalpacketoffset)

    for (var index = 0; index < totalpackets; index++) {
        let packet = [];
        let offset = index * 9;
        packet[0] = 0x00;
        packet[1] = 0x24;

        packet[2] = offset;
        packet[3] = 0x09;
        packet.push(...rgbdata.splice(0, 27));
        device.write(packet, 33);
    }

    let packet = [];
    packet[0] = 0x00;
    packet[1] = 0x24;

    packet[2] = finalpacketoffset;
    packet[3] = finalpacketledstosend - 1;
    packet.push(...rgbdata.splice(0, finalpacketledstosend * 3));
    device.write(packet, 33);
}

export function Validate(endpoint) {
    return endpoint.interface === 1;
}

export function Image() {
    return ""
}