// @ts-nocheck
/* eslint-disable no-undef */
const dgram = require("dgram");

class GoodWePacket {
	static Format = { Packet: 7, Checksum: 2 };
	static Header = { High: 0xaa, Low: 0x55 };
	static Addr = { AP: 0xc0, Inverter: 0x7f };
	static CtrCode = { Register: 0x00, Read: 0x01, Execute: 0x03 };
	static FcCodeRegister = {
		Offline: 0x00,
		RegisterRequest: 0x80,
		AllocateRegisterAddr: 0x01,
		AddressConfirm: 0x81,
		RemoveRegister: 0x02,
		RemoveConfirm: 0x82,
	};
	static FcCodeRead = {
		QueryRunningInfo: 0x01,
		ResponseRunningInfo: 0x81,
		QueryIdInfo: 0x02,
		ResponseIdInfo: 0x82,
		QuerySettingInfo: 0x03,
		ResponseSettingInfo: 0x83,
	};
}

class GoodWeRegister {
	static Format = { Frame: 5, CRC16: 2 };
	static RecvHeader = { High: 0xaa, Low: 0x55 };
	static Addr = { Inverter: 0xf7 };
	static FcDode = { Read: 0x03, ReadSingleRegister: 0x06, WriteMultipleRegister: 0x09 };
}

class GoodWeIdInfo {
	FirmwareVersion = "";
	ModelName = "";
	Na = new Uint8Array(16);
	SerialNumber = "";
	NomVpv = 0.0;
	InternalVersion = "";
	SafetyCountryCode = 0x00;
}

class GoodWeDeviceInfo {
	ModbusProtocolVersion = 0;
	RatedPower = 0;
	AcOutputType = 0;
	SerialNumber = "";
	DeviceType = "";
	DSP1_SoftwareVersion = 0;
	DSP2_SoftwareVersion = 0;
	DSP_SVN_Version = 0;
	ARM_SoftwareVersion = 0;
	ARM_SVN_Version = 0;
	DSP_IntFirmwareVersion = "";
	ARM_IntFirmwareVersion = "";
}

class PowerParameters {
	Value = 0.0;
	Unit = "";

	get ValueAsString() {
		return this.Value + " " + this.Unit;
	}
}

class DcParameters {
	Voltage = 0.0;
	Current = 0.0;
	Power = new PowerParameters();
	Mode = 0;
	ModeLabel = "";
}

class AcPhase {
	Voltage = 0.0;
	Current = 0.0;
	Frequency = 0.0;
	Power = new PowerParameters();
}

class ACPhaseBackup {
	Voltage = 0.0;
	Current = 0.0;
	Frequency = 0.0;
	Power = new PowerParameters();
	Mode = 0;
}

class GoodWeRunningData {
	Rtc = new Date();
	Pv1 = new DcParameters();
	Pv2 = new DcParameters();
	Pv3 = new DcParameters();
	Pv4 = new DcParameters();

	GridL1 = new AcPhase();
	GridL2 = new AcPhase();
	GridL3 = new AcPhase();
	GridMode = 0;
	GridModeLabel = "";
	GridInOutModeLabel = "";

	BackUpL1 = new ACPhaseBackup();
	BackUpL2 = new ACPhaseBackup();
	BackUpL3 = new ACPhaseBackup();

	PowerInverterOperation = new PowerParameters();

	PowerActiveAC = new PowerParameters();
	PowerReactiveAC = 0;
	PowerApparentAC = 0;

	PowerL1 = new PowerParameters();
	PowerL2 = new PowerParameters();
	PowerL3 = new PowerParameters();

	PowerBackUpLine = new PowerParameters();
	PowerGridLine = new PowerParameters();

	Battery1 = new DcParameters();

	UpsLoadPercent = 0;
	AirTemperature = 0.0;
	ModulTemperature = 0.0;
	RadiatorTemperature = 0.0;
	FunctionBitValue = 0;
	BusVoltage = 0.0;
	NbusVoltage = 0.0;
	WarningCode = 0;
	SaftyCountry = 0;
	SaftyCountryLabel = "";
	WorkMode = 0;
	WorkModeLabel = "";
	OperationMode = 0;
	ErrorMessage = 0;
	ErrorMessageLabel = "";
	HoursTotal = 0.0;

	EnergyPvTotal = new PowerParameters();
	EnergyPvToday = new PowerParameters();
	EnergyInverterOutTotal = new PowerParameters();
	EnergyInverterOutToday = new PowerParameters();
	EnergyInverterInTotal = new PowerParameters();
	EnergyInverterInToday = new PowerParameters();
	EnergyLoadTotal = new PowerParameters();
	EnergyLoadToday = new PowerParameters();
	EnergyBatteryChargeTotal = new PowerParameters();
	EnergyBatteryChargeToday = new PowerParameters();
	EnergyBatteryDischargeTotal = new PowerParameters();
	EnergyBatteryDischargeToday = new PowerParameters();

	BatteryStrings = 0;
	CpldWarningCode = 0;
	WChargeCtrFlag = 0;
	DerateFlag = 0;
	DerateFrozenPower = 0;
	DiagStatusHigh = 0;
	DiagStatusLow = 0;
	DiagStatusLowAsString = "";

	PowerAllPv = new PowerParameters();
	PowerHouseConsumptionPv = new PowerParameters();
	PowerHouseConsumptionAC = new PowerParameters();
}

class GoodWeMeterPhase {
	ActivePower = 0;
	PowerFactor = 0.0;
}

class GoodWeExternalComData {
	Commode = 0;
	Rssi = 0;
	ManufacturerCode = 0;
	MeterConnectStatus = 0;
	MeterCommunicateStatus = 0;
	L1 = new GoodWeMeterPhase();
	L2 = new GoodWeMeterPhase();
	L3 = new GoodWeMeterPhase();
	TotalActivePower = 0;
	TotalReactivePower = 0;
	PowerFactor = 0.0;
	Frequency = 0.0;
	EnergyTotalSell = new PowerParameters();
	EnergyTotalBuy = new PowerParameters();
}

class GoodweBmSInfo {
	Status = 0;
	PackTemperature = 0.0;
	MaxChargeCurrent = 0;
	MaxDischargeCurrent = 0;
	SOC = 0;
	SOH = 0;
	BatteryStrings = 0;
	Protocol = 0;
	ErrorCodeLow = 0;
	ErrorCodeHigh = 0;
	WarningCodeLow = 0;
	WarningCodeHigh = 0;
	VersionSW = 0;
	VersionHW = 0;
	MaxCellTempID = 0;
	MinCellTempID = 0;
	MaxCellVoltageID = 0;
	MinCellVoltageID = 0;
	MaxCellTemperature = 0.0;
	MinCellTemperature = 0.0;
	MaxCellVoltage = 0.0;
	MinCellVoltage = 0.0;
	EnergyBatteryChargedTotal = new PowerParameters();
	EnergyBatteryDischargedTotal = new PowerParameters();
	SerialNumber = "";
}

class GoodWeUdp {
	static ConStatus = { Offline: false, Online: true };

	#status = GoodWeUdp.ConStatus.Offline;
	#ipAddr = "";
	#port = 0;
	#client = dgram.createSocket("udp4");
	#idInfo = new GoodWeIdInfo();
	#deviceInfo = new GoodWeDeviceInfo();
	#runningData = new GoodWeRunningData();
	#extComData = new GoodWeExternalComData();
	#bmsInfo = new GoodweBmSInfo();

	constructor() {
		this.#client.setMaxListeners(0);
	}

	destructor() {
		this.#client.close();
	}

	Connect(IpAddr, Port) {
		this.#ipAddr = IpAddr;
		this.#port = Port;

		this.ReadIdInfo();
	}

	ReadIdInfo() {
		let sendbuf = new Uint8Array(9);
		let i;
		let crc = 0;

		sendbuf[0] = GoodWePacket.Header.High;
		sendbuf[1] = GoodWePacket.Header.Low;
		sendbuf[2] = GoodWePacket.Addr.AP;
		sendbuf[3] = GoodWePacket.Addr.Inverter;
		sendbuf[4] = GoodWePacket.CtrCode.Read;
		sendbuf[5] = GoodWePacket.FcCodeRead.QueryIdInfo;
		sendbuf[6] = 0;

		for (i = 0; i <= 6; i++) {
			crc = crc + sendbuf[i];
		}

		sendbuf[7] = crc >> 8;
		sendbuf[8] = crc & 0x00ff;

		/*
		this.#client.on("listening", function () {
			console.log("GoodWePacket listening");
		});
		*/

		try {
			this.#client.on("message", (rcvbuf) => {
				if (this.#CheckRecPacket(rcvbuf, sendbuf[4], sendbuf[5])) {
					this.#idInfo.FirmwareVersion = this.#GetStringFromByteArray(rcvbuf, 7, 5);
					this.#idInfo.ModelName = this.#GetStringFromByteArray(rcvbuf, 12, 10);
					this.#idInfo.Na = rcvbuf.slice(22, 37);
					this.#idInfo.SerialNumber = this.#GetStringFromByteArray(rcvbuf, 38, 16);
					this.#idInfo.NomVpv = this.#GetUintFromByteArray(rcvbuf, 54, 4) / 10;
					this.#idInfo.InternalVersion = this.#GetStringFromByteArray(rcvbuf, 58, 12);
					this.#idInfo.SafetyCountryCode = rcvbuf[70];

					this.#status = GoodWeUdp.ConStatus.Online;
				} else {
					this.#status = GoodWeUdp.ConStatus.Offline;
				}
			});

			this.#client.send(sendbuf, 0, sendbuf.length, this.#port, this.#ipAddr, function (err) {
				if (err) throw err;
				//console.log("GoodWePacket send");
			});
		}

		catch (error){
			this.log.info("ReadIdInfo");
			console.error(error);
		}
	}

	ReadDeviceInfo() {
		let sendbuf = new Uint8Array(8);
		let crc;

		sendbuf[0] = GoodWeRegister.Addr.Inverter;
		sendbuf[1] = GoodWeRegister.FcDode.Read;
		sendbuf[2] = 0x88;
		sendbuf[3] = 0xb8;
		sendbuf[4] = 0x00;
		sendbuf[5] = 0x21;

		crc = this.#CalculatetCrc16(sendbuf, 0, 6);

		sendbuf[6] = crc >> 8;
		sendbuf[7] = crc & 0x00ff;

		/*
		this.#client.on("listening", function () {
			console.log("GoodWeDeviceInfo listening");
		});
		*/
		try {
			this.#client.on("message", (rcvbuf) => {
				if (this.#CheckRecRegisterData(rcvbuf, sendbuf[1], sendbuf[5])) {
					this.#deviceInfo.ModbusProtocolVersion = this.#GetUintFromByteArray(rcvbuf, 5, 2);
					this.#deviceInfo.RatedPower = this.#GetUintFromByteArray(rcvbuf, 7, 2);
					this.#deviceInfo.AcOutputType = this.#GetUintFromByteArray(rcvbuf, 9, 2);
					this.#deviceInfo.SerialNumber = this.#GetStringFromByteArray(rcvbuf, 11, 16);
					this.#deviceInfo.DeviceType = this.#GetStringFromByteArray(rcvbuf, 27, 10);
					this.#deviceInfo.DSP1_SoftwareVersion = this.#GetUintFromByteArray(rcvbuf, 37, 2);
					this.#deviceInfo.DSP2_SoftwareVersion = this.#GetUintFromByteArray(rcvbuf, 39, 2);
					this.#deviceInfo.DSP_SVN_Version = this.#GetUintFromByteArray(rcvbuf, 41, 2);
					this.#deviceInfo.ARM_SoftwareVersion = this.#GetUintFromByteArray(rcvbuf, 43, 2);
					this.#deviceInfo.ARM_SVN_Version = this.#GetUintFromByteArray(rcvbuf, 45, 2);
					this.#deviceInfo.DSP_IntFirmwareVersion = this.#GetStringFromByteArray(rcvbuf, 47, 12);
					this.#deviceInfo.ARM_IntFirmwareVersion = this.#GetStringFromByteArray(rcvbuf, 59, 12);

					this.#status = GoodWeUdp.ConStatus.Online;
				} else {
					this.#status = GoodWeUdp.ConStatus.Offline;
				}
			});

			this.#client.send(sendbuf, 0, sendbuf.length, this.#port, this.#ipAddr, function (err) {
				if (err) throw err;
				//console.log("GoodWeDeviceInfo send");
			});
		}
		catch (error){
			this.log.info("ReadDeviceInfo");
			console.error(error);
		}
	}

	ReadRunningData() {
		let sendbuf = new Uint8Array(8);
		let crc;

		sendbuf[0] = GoodWeRegister.Addr.Inverter;
		sendbuf[1] = GoodWeRegister.FcDode.Read;
		sendbuf[2] = 0x89;
		sendbuf[3] = 0x1c;
		sendbuf[4] = 0x00;
		sendbuf[5] = 0x7d;

		crc = this.#CalculatetCrc16(sendbuf, 0, 6);

		sendbuf[6] = crc >> 8;
		sendbuf[7] = crc & 0x00ff;

		/*
		this.#client.on("listening", function () {
			console.log("GoodWeDeviceInfo listening");
		});
		*/
		
		try{
			this.#client.on("message", (rcvbuf) => {
				if (this.#CheckRecRegisterData(rcvbuf, sendbuf[1], sendbuf[5])) {
					this.#runningData.Pv1.Voltage = this.#GetUintFromByteArray(rcvbuf, 11, 2) / 10;
					this.#runningData.Pv1.Current = this.#GetUintFromByteArray(rcvbuf, 13, 2) / 10;
					this.#runningData.Pv1.Power.Value = this.#GetUintFromByteArray(rcvbuf, 15, 4);
					this.#runningData.Pv1.Power.Unit = "W";

					this.#runningData.Pv2.Voltage = this.#GetUintFromByteArray(rcvbuf, 19, 2) / 10;
					this.#runningData.Pv2.Current = this.#GetUintFromByteArray(rcvbuf, 21, 2) / 10;
					this.#runningData.Pv2.Power.Value = this.#GetUintFromByteArray(rcvbuf, 23, 4);
					this.#runningData.Pv2.Power.Unit = "W";

					this.#runningData.Pv3.Voltage = this.#GetUintFromByteArray(rcvbuf, 27, 2) / 10;
					this.#runningData.Pv3.Current = this.#GetUintFromByteArray(rcvbuf, 29, 2) / 10;
					this.#runningData.Pv3.Power.Value = this.#GetUintFromByteArray(rcvbuf, 31, 4);
					this.#runningData.Pv3.Power.Unit = "W";

					this.#runningData.Pv4.Voltage = this.#GetUintFromByteArray(rcvbuf, 35, 2) / 10;
					this.#runningData.Pv4.Current = this.#GetUintFromByteArray(rcvbuf, 37, 2) / 10;
					this.#runningData.Pv4.Power.Value = this.#GetUintFromByteArray(rcvbuf, 39, 4);
					this.#runningData.Pv4.Power.Unit = "W";

					this.#runningData.Pv4.Mode = rcvbuf[43];
					this.#runningData.Pv4.ModeLabel = this.#LabelDictionaries.PvModeAsString[this.#runningData.Pv4.Mode];
					this.#runningData.Pv3.Mode = rcvbuf[44];
					this.#runningData.Pv3.ModeLabel = this.#LabelDictionaries.PvModeAsString[this.#runningData.Pv3.Mode];
					this.#runningData.Pv2.Mode = rcvbuf[45];
					this.#runningData.Pv2.ModeLabel = this.#LabelDictionaries.PvModeAsString[this.#runningData.Pv2.Mode];
					this.#runningData.Pv1.Mode = rcvbuf[46];
					this.#runningData.Pv1.ModeLabel = this.#LabelDictionaries.PvModeAsString[this.#runningData.Pv1.Mode];

					this.#runningData.GridL1.Voltage = this.#GetUintFromByteArray(rcvbuf, 47, 2) / 10;
					this.#runningData.GridL1.Current = this.#GetUintFromByteArray(rcvbuf, 49, 2) / 10;
					this.#runningData.GridL1.Frequency = this.#GetUintFromByteArray(rcvbuf, 51, 2) / 100;
					this.#runningData.GridL1.Power.Value = this.#GetIntFromByteArray(rcvbuf, 55, 2);
					this.#runningData.GridL1.Power.Unit = "W";

					this.#runningData.GridL2.Voltage = this.#GetUintFromByteArray(rcvbuf, 57, 2) / 10;
					this.#runningData.GridL2.Current = this.#GetUintFromByteArray(rcvbuf, 59, 2) / 10;
					this.#runningData.GridL2.Frequency = this.#GetUintFromByteArray(rcvbuf, 61, 2) / 100;
					this.#runningData.GridL2.Power.Value = this.#GetIntFromByteArray(rcvbuf, 65, 2);
					this.#runningData.GridL2.Power.Unit = "W";

					this.#runningData.GridL3.Voltage = this.#GetUintFromByteArray(rcvbuf, 67, 2) / 10;
					this.#runningData.GridL3.Current = this.#GetUintFromByteArray(rcvbuf, 69, 2) / 10;
					this.#runningData.GridL3.Frequency = this.#GetUintFromByteArray(rcvbuf, 71, 2) / 100;
					this.#runningData.GridL3.Power.Value = this.#GetIntFromByteArray(rcvbuf, 75, 2);
					this.#runningData.GridL3.Power.Unit = "W";

					this.#runningData.GridMode = this.#GetUintFromByteArray(rcvbuf, 77, 2);
					this.#runningData.GridModeLabel = this.#LabelDictionaries.GridModeAsString[this.#runningData.GridMode];

					this.#runningData.PowerInverterOperation.Value = this.#GetIntFromByteArray(rcvbuf, 81, 2);
					this.#runningData.PowerInverterOperation.Unit = "W";

					this.#runningData.PowerActiveAC.Value = this.#GetIntFromByteArray(rcvbuf, 85, 2);
					this.#runningData.PowerActiveAC.Unit = "W";

					this.#runningData.PowerReactiveAC = this.#GetIntFromByteArray(rcvbuf, 89, 2);
					this.#runningData.PowerApparentAC = this.#GetIntFromByteArray(rcvbuf, 93, 2);

					this.#runningData.GridInOutModeLabel = this.#GetGridInOutModeLabel(this.#runningData.PowerActiveAC.Value);

					this.#runningData.BackUpL1.Voltage = this.#GetUintFromByteArray(rcvbuf, 95, 2) / 10;
					this.#runningData.BackUpL1.Current = this.#GetUintFromByteArray(rcvbuf, 97, 2) / 10;
					this.#runningData.BackUpL1.Frequency = this.#GetUintFromByteArray(rcvbuf, 99, 2) / 100;
					this.#runningData.BackUpL1.Mode = this.#GetUintFromByteArray(rcvbuf, 101, 2);
					this.#runningData.BackUpL1.Power.Value = this.#GetIntFromByteArray(rcvbuf, 105, 2);
					this.#runningData.BackUpL1.Power.Unit = "W";

					this.#runningData.BackUpL2.Voltage = this.#GetUintFromByteArray(rcvbuf, 107, 2) / 10;
					this.#runningData.BackUpL2.Current = this.#GetUintFromByteArray(rcvbuf, 109, 2) / 10;
					this.#runningData.BackUpL2.Frequency = this.#GetUintFromByteArray(rcvbuf, 111, 2) / 100;
					this.#runningData.BackUpL2.Mode = this.#GetUintFromByteArray(rcvbuf, 113, 2);
					this.#runningData.BackUpL2.Power.Value = this.#GetIntFromByteArray(rcvbuf, 117, 2);
					this.#runningData.BackUpL2.Power.Unit = "W";

					this.#runningData.BackUpL3.Voltage = this.#GetUintFromByteArray(rcvbuf, 119, 2) / 10;
					this.#runningData.BackUpL3.Current = this.#GetUintFromByteArray(rcvbuf, 121, 2) / 10;
					this.#runningData.BackUpL3.Frequency = this.#GetUintFromByteArray(rcvbuf, 123, 2) / 100;
					this.#runningData.BackUpL3.Mode = this.#GetUintFromByteArray(rcvbuf, 125, 2);
					this.#runningData.BackUpL3.Power.Value = this.#GetIntFromByteArray(rcvbuf, 129, 2);
					this.#runningData.BackUpL3.Power.Unit = "W";

					this.#runningData.PowerL1.Value = this.#GetIntFromByteArray(rcvbuf, 133, 2);
					this.#runningData.PowerL1.Unit = "W";
					this.#runningData.PowerL2.Value = this.#GetIntFromByteArray(rcvbuf, 137, 2);
					this.#runningData.PowerL2.Unit = "W";
					this.#runningData.PowerL3.Value = this.#GetIntFromByteArray(rcvbuf, 141, 2);
					this.#runningData.PowerL3.Unit = "W";

					this.#runningData.PowerBackUpLine.Value = this.#GetIntFromByteArray(rcvbuf, 145, 2);
					this.#runningData.PowerBackUpLine.Unit = "W";
					this.#runningData.PowerGridLine.Value = this.#GetIntFromByteArray(rcvbuf, 149, 2);
					this.#runningData.PowerGridLine.Unit = "W";

					this.#runningData.UpsLoadPercent = this.#GetUintFromByteArray(rcvbuf, 151, 2);
					this.#runningData.AirTemperature = this.#GetIntFromByteArray(rcvbuf, 153, 2) / 10;
					this.#runningData.ModulTemperature = this.#GetIntFromByteArray(rcvbuf, 155, 2) / 10;
					this.#runningData.RadiatorTemperature = this.#GetIntFromByteArray(rcvbuf, 157, 2) / 10;
					this.#runningData.FunctionBitValue = this.#GetUintFromByteArray(rcvbuf, 159, 2);
					this.#runningData.BusVoltage = this.#GetUintFromByteArray(rcvbuf, 161, 2) / 10;
					this.#runningData.NbusVoltage = this.#GetUintFromByteArray(rcvbuf, 163, 2) / 10;

					this.#runningData.Battery1.Voltage = this.#GetUintFromByteArray(rcvbuf, 165, 2) / 10;
					this.#runningData.Battery1.Current = this.#GetIntFromByteArray(rcvbuf, 167, 2) / 10;
					this.#runningData.Battery1.Power.Value = this.#GetIntFromByteArray(rcvbuf, 171, 2);
					this.#runningData.Battery1.Power.Unit = "W";
					this.#runningData.Battery1.Mode = this.#GetUintFromByteArray(rcvbuf, 173, 2);
					this.#runningData.Battery1.ModeLabel = this.#LabelDictionaries.BatteryModeAsString[this.#runningData.Battery1.Mode];

					this.#runningData.WarningCode = this.#GetUintFromByteArray(rcvbuf, 175, 2);
					this.#runningData.SaftyCountry = this.#GetUintFromByteArray(rcvbuf, 177, 2);
					this.#runningData.SaftyCountryLabel = this.#LabelDictionaries.SafetyCountryCodeAsString[this.#runningData.SaftyCountry];

					this.#runningData.WorkMode = this.#GetUintFromByteArray(rcvbuf, 179, 2);
					this.#runningData.WorkModeLabel = this.#LabelDictionaries.InverteWorkModeTypeETAsString[this.#runningData.WorkMode];

					this.#runningData.OperationMode = this.#GetUintFromByteArray(rcvbuf, 181, 2);

					this.#runningData.ErrorMessage = this.#GetUintFromByteArray(rcvbuf, 183, 4);
					this.#runningData.ErrorMessageLabel = this.#decodeBitmap(this.#runningData.ErrorMessage, this.#LabelDictionaries.ErrorCodeAsString);

					this.#runningData.EnergyPvTotal.Value = this.#GetUintFromByteArray(rcvbuf, 187, 4) / 10;
					this.#runningData.EnergyPvTotal.Unit = "kWh";
					this.#runningData.EnergyPvToday.Value = this.#GetUintFromByteArray(rcvbuf, 191, 4) / 10;
					this.#runningData.EnergyPvToday.Unit = "kWh";

					this.#runningData.EnergyInverterOutTotal.Value = this.#GetUintFromByteArray(rcvbuf, 195, 4) / 10;
					this.#runningData.EnergyInverterOutTotal.Unit = "kWh";

					this.#runningData.HoursTotal = this.#GetUintFromByteArray(rcvbuf, 199, 4);

					this.#runningData.EnergyInverterOutToday.Value  = this.#GetUintFromByteArray(rcvbuf, 203, 2) / 10;
					this.#runningData.EnergyInverterOutToday.Unit = "kWh";
					this.#runningData.EnergyInverterInTotal.Value  = this.#GetUintFromByteArray(rcvbuf, 205, 4) / 10;
					this.#runningData.EnergyInverterInTotal.Unit = "kWh";
					this.#runningData.EnergyInverterInToday.Value  = this.#GetUintFromByteArray(rcvbuf, 209, 2) / 10;
					this.#runningData.EnergyInverterInToday.Unit = "kWh";

					this.#runningData.EnergyLoadTotal.Value = this.#GetUintFromByteArray(rcvbuf, 211, 4) / 10;
					this.#runningData.EnergyLoadTotal.Unit = "kWh";
					this.#runningData.EnergyLoadToday.Value = this.#GetUintFromByteArray(rcvbuf, 215, 2) / 10;
					this.#runningData.EnergyLoadToday.Unit = "kWh";

					this.#runningData.EnergyBatteryChargeTotal.Value = this.#GetUintFromByteArray(rcvbuf, 217, 4) / 10;
					this.#runningData.EnergyBatteryChargeTotal.Unit = "kWh";
					this.#runningData.EnergyBatteryChargeToday.Value = this.#GetUintFromByteArray(rcvbuf, 221, 2) / 10;
					this.#runningData.EnergyBatteryChargeToday.Unit = "kWh";
					this.#runningData.EnergyBatteryDischargeTotal.Value = this.#GetUintFromByteArray(rcvbuf, 223, 4) / 10;
					this.#runningData.EnergyBatteryDischargeTotal.Unit = "kWh";
					this.#runningData.EnergyBatteryDischargeToday.Value = this.#GetUintFromByteArray(rcvbuf, 227, 2) / 10;
					this.#runningData.EnergyBatteryDischargeToday.Unit = "kWh";

					this.#runningData.BatteryStrings = this.#GetUintFromByteArray(rcvbuf, 229, 2);
					this.#runningData.CpldWarningCode = this.#GetUintFromByteArray(rcvbuf, 231, 2);
					this.#runningData.WChargeCtrFlag = this.#GetUintFromByteArray(rcvbuf, 233, 2);
					this.#runningData.DerateFlag = this.#GetUintFromByteArray(rcvbuf, 235, 2);
					this.#runningData.DerateFrozenPower = this.#GetUintFromByteArray(rcvbuf, 237, 4);
					this.#runningData.DiagStatusHigh = this.#GetUintFromByteArray(rcvbuf, 241, 4);
					this.#runningData.DiagStatusLow = this.#GetUintFromByteArray(rcvbuf, 245, 4);
					this.#runningData.DiagStatusLowAsString = this.#decodeBitmap(this.#runningData.DiagStatusLow, this.#LabelDictionaries.DiagStatusCodesAsString);

					this.#runningData.PowerAllPv.Value = this.#runningData.Pv1.Power.Value + this.#runningData.Pv2.Power.Value + this.#runningData.Pv3.Power.Value + this.#runningData.Pv4.Power.Value;
					this.#runningData.PowerAllPv.Unit = "W";

					this.#runningData.PowerHouseConsumptionPv.Value = this.#runningData.PowerAllPv.Value + this.#runningData.Battery1.Power.Value;
					this.#runningData.PowerHouseConsumptionPv.Unit = "W";

					this.#runningData.PowerHouseConsumptionAC.Value = this.#runningData.PowerBackUpLine.Value + this.#runningData.PowerGridLine.Value;
					this.#runningData.PowerHouseConsumptionAC.Unit = "W";

					this.#status = GoodWeUdp.ConStatus.Online;
				} else {
					this.#status = GoodWeUdp.ConStatus.Offline;
				}
			});

			this.#client.send(sendbuf, 0, sendbuf.length, this.#port, this.#ipAddr, function (err) {
				if (err) throw err;
				//console.log("GoodWeRunningData send");
			});
		}

		catch (error){
			this.log.info("ReadRunningData");
			console.error(error);
		}
	}

	ReadExtComData() {
		let sendbuf = new Uint8Array(8);
		let crc;

		sendbuf[0] = GoodWeRegister.Addr.Inverter;
		sendbuf[1] = GoodWeRegister.FcDode.Read;
		sendbuf[2] = 0x8c;
		sendbuf[3] = 0xa0;
		sendbuf[4] = 0x00;
		sendbuf[5] = 0x1b;

		crc = this.#CalculatetCrc16(sendbuf, 0, 6);

		sendbuf[6] = crc >> 8;
		sendbuf[7] = crc & 0x00ff;

		/*
		this.#client.on("listening", function () {
			console.log("GoodWeExtComData listening");
		});
		*/

		try {
			this.#client.on("message", (rcvbuf) => {
				if (this.#CheckRecRegisterData(rcvbuf, sendbuf[1], sendbuf[5])) {
					this.#extComData.Commode = this.#GetUintFromByteArray(rcvbuf, 5, 2);
					this.#extComData.Rssi = this.#GetUintFromByteArray(rcvbuf, 7, 2);
					this.#extComData.ManufacturerCode = this.#GetUintFromByteArray(rcvbuf, 9, 2);
					this.#extComData.MeterConnectStatus = this.#GetUintFromByteArray(rcvbuf, 11, 2);
					this.#extComData.MeterCommunicateStatus = this.#GetUintFromByteArray(rcvbuf, 13, 2);
					this.#extComData.L1.ActivePower = this.#GetIntFromByteArray(rcvbuf, 15, 2);
					this.#extComData.L2.ActivePower = this.#GetIntFromByteArray(rcvbuf, 17, 2);
					this.#extComData.L3.ActivePower = this.#GetIntFromByteArray(rcvbuf, 19, 2);
					this.#extComData.TotalActivePower = this.#GetIntFromByteArray(rcvbuf, 21, 2);
					this.#extComData.TotalReactivePower = this.#GetUintFromByteArray(rcvbuf, 23, 2);
					this.#extComData.L1.PowerFactor = this.#GetUintFromByteArray(rcvbuf, 25, 2) / 100;
					this.#extComData.L2.PowerFactor = this.#GetUintFromByteArray(rcvbuf, 27, 2) / 100;
					this.#extComData.L3.PowerFactor = this.#GetUintFromByteArray(rcvbuf, 29, 2) / 100;
					this.#extComData.PowerFactor = this.#GetUintFromByteArray(rcvbuf, 31, 2) / 100;
					this.#extComData.Frequency = this.#GetUintFromByteArray(rcvbuf, 33, 2) / 100;
					this.#extComData.EnergyTotalSell.Value = this.#GetFloatFromByteArray(rcvbuf, 35, 4) / 1000;
					this.#extComData.EnergyTotalSell.Unit = "kWh";
					this.#extComData.EnergyTotalBuy.Value = this.#GetFloatFromByteArray(rcvbuf, 39, 4) / 1000;
					this.#extComData.EnergyTotalBuy.Unit = "kWh";

					this.#status = GoodWeUdp.ConStatus.Online;
				} else {
					this.#status = GoodWeUdp.ConStatus.Offline;
				}
			});

			this.#client.send(sendbuf, 0, sendbuf.length, this.#port, this.#ipAddr, function (err) {
				if (err) throw err;
				//console.log("GoodWeExtComData send");
			});
		}

		catch (error){
			this.log.info("ReadExtComData");
			console.error(error);
		}
	}

	ReadBmsInfo() {
		let sendbuf = new Uint8Array(8);
		let crc;

		sendbuf[0] = GoodWeRegister.Addr.Inverter;
		sendbuf[1] = GoodWeRegister.FcDode.Read;
		sendbuf[2] = 0x90;
		sendbuf[3] = 0x8a;
		sendbuf[4] = 0x00;
		sendbuf[5] = 0x43;

		crc = this.#CalculatetCrc16(sendbuf, 0, 6);

		sendbuf[6] = crc >> 8;
		sendbuf[7] = crc & 0x00ff;

		/*
		this.#client.on("listening", function () {
			console.log("GoodWeExtComData listening");
		});
		*/

		try {
			this.#client.on("message", (rcvbuf) => {
				if (this.#CheckRecRegisterData(rcvbuf, sendbuf[1], sendbuf[5])) {
					this.#bmsInfo.Status = this.#GetUintFromByteArray(rcvbuf, 5, 2);
					this.#bmsInfo.PackTemperature = this.#GetUintFromByteArray(rcvbuf, 7, 2) / 10;
					this.#bmsInfo.MaxChargeCurrent = this.#GetUintFromByteArray(rcvbuf, 9, 2);
					this.#bmsInfo.MaxDischargeCurrent = this.#GetUintFromByteArray(rcvbuf, 11, 2);
					this.#bmsInfo.ErrorCodeLow = this.#GetUintFromByteArray(rcvbuf, 13, 2);
					this.#bmsInfo.SOC = this.#GetUintFromByteArray(rcvbuf, 15, 2);
					this.#bmsInfo.SOH = this.#GetUintFromByteArray(rcvbuf, 17, 2);
					this.#bmsInfo.BatteryStrings = this.#GetUintFromByteArray(rcvbuf, 19, 2);
					this.#bmsInfo.WarningCodeLow = this.#GetUintFromByteArray(rcvbuf, 21, 2);
					this.#bmsInfo.Protocol = this.#GetUintFromByteArray(rcvbuf, 23, 2);
					this.#bmsInfo.ErrorCodeHigh = this.#GetUintFromByteArray(rcvbuf, 25, 2);
					this.#bmsInfo.WarningCodeHigh = this.#GetUintFromByteArray(rcvbuf, 27, 2);
					this.#bmsInfo.VersionSW = this.#GetUintFromByteArray(rcvbuf, 29, 2);
					this.#bmsInfo.VersionHW = this.#GetUintFromByteArray(rcvbuf, 31, 2);
					this.#bmsInfo.MaxCellTempID = this.#GetUintFromByteArray(rcvbuf, 33, 2);
					this.#bmsInfo.MinCellTempID = this.#GetUintFromByteArray(rcvbuf, 35, 2);
					this.#bmsInfo.MaxCellVoltageID = this.#GetUintFromByteArray(rcvbuf, 37, 2);
					this.#bmsInfo.MinCellVoltageID = this.#GetUintFromByteArray(rcvbuf, 39, 2);
					this.#bmsInfo.MaxCellTemperature = this.#GetUintFromByteArray(rcvbuf, 41, 2) / 10;
					this.#bmsInfo.MinCellTemperature = this.#GetUintFromByteArray(rcvbuf, 43, 2) / 10;
					this.#bmsInfo.MaxCellVoltage = this.#GetUintFromByteArray(rcvbuf, 45, 2) / 1000;
					this.#bmsInfo.MinCellVoltage = this.#GetUintFromByteArray(rcvbuf, 47, 2) / 1000;
					this.#bmsInfo.EnergyBatteryChargedTotal.Value = this.#GetUintFromByteArray(rcvbuf, 113, 4) / 10;
					this.#bmsInfo.EnergyBatteryChargedTotal.Unit = "kWh";
					this.#bmsInfo.EnergyBatteryDischargedTotal.Value = this.#GetUintFromByteArray(rcvbuf, 117, 4) / 10;
					this.#bmsInfo.EnergyBatteryDischargedTotal.Unit = "kWh";
					this.#bmsInfo.SerialNumber = this.#GetStringFromByteArray(rcvbuf, 121, 18);

					this.#status = GoodWeUdp.ConStatus.Online;
				} else {
					this.#status = GoodWeUdp.ConStatus.Offline;
				}
			});

			this.#client.send(sendbuf, 0, sendbuf.length, this.#port, this.#ipAddr, function (err) {
				if (err) throw err;
				//console.log("GoodWeBmsInfo send");
			});
		}

		catch (error){
			this.log.info("ReadBmsInfo");
			console.error(error);
		}
	}

	#CheckRecPacket(Data, CtrCode, FctCode) {
		let packetFormat = new Uint8Array(GoodWePacket.Format.Packet);
		let packetCrc = new Uint8Array(GoodWePacket.Format.Checksum);
		let i;
		let crc = 0;
		let low, high;

		packetFormat = Data.slice(0, GoodWePacket.Format.Packet);
		packetCrc = Data.slice(Data.length - GoodWePacket.Format.Checksum, Data.length);

		for (i = 0; i < Data.length - GoodWePacket.Format.Checksum; i++) {
			crc = crc + Data[i];
		}

		high = crc >> 8;
		low = crc & 0x00ff;

		if (packetCrc[0] == high && packetCrc[1] == low) {
			if (packetFormat[0] == GoodWePacket.Header.High && packetFormat[1] == GoodWePacket.Header.Low) {
				if (packetFormat[2] == GoodWePacket.Addr.Inverter && packetFormat[3] == GoodWePacket.Addr.AP) {
					if (packetFormat[4] == CtrCode) {
						if (packetFormat[5] == (FctCode | 0x80)) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	#CheckRecRegisterData(Data, FctCode, Length) {
		let registerFrame = new Uint8Array(GoodWeRegister.Format.Frame);
		let registerCrc = new Uint8Array(GoodWeRegister.Format.CRC16);
		let crc = 0;

		registerFrame = Data.slice(0, GoodWeRegister.Format.Frame);
		registerCrc = Data.slice(Data.length - GoodWeRegister.Format.CRC16, Data.length);

		crc = this.#CalculatetCrc16(Data, 2, Data.length - GoodWeRegister.Format.CRC16 - 2);

		if (registerCrc[0] == crc >> 8 && registerCrc[1] == (crc & 0x00ff)) {
			if (
				registerFrame[0] == GoodWeRegister.RecvHeader.High &&
				registerFrame[1] == GoodWeRegister.RecvHeader.Low
			) {
				if (registerFrame[2] == GoodWeRegister.Addr.Inverter) {
					if (registerFrame[3] == FctCode) {
						if (registerFrame[4] == Length * 2) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	#GetStringFromByteArray(Data, Start, Length) {
		let buf = new Uint8Array(Length);
		let value;

		buf = Data.slice(Start, Start + Length);
		value = buf.toString();

		return value;
	}

	#GetUintFromByteArray(Data, Start, Length) {
		let buf = new Uint8Array(Length);
		let i;
		let value = 0;

		buf = Data.slice(Start, Start + Length);
		//buf.reverse();

		for (i = 0; i < Length; i++) {
			value = value << 8;
			value = value + buf[i];
		}

		return value;
	}

	#GetIntFromByteArray(Data, Start, Length) {
		let buf = new Uint8Array(Length);
		let i;
		let value = 0;

		buf = Data.slice(Start, Start + Length);
		//buf.reverse();

		for (i = 0; i < Length; i++) {
			value = value << 8;
			value = value + buf[i];
		}

		if ((value & 0x8000) == 0x8000) {
			value = value ^ 0xffff;
			value = value + 1;
			value = value * -1;
		}

		return value;
	}

	#GetFloatFromByteArray(Data, Start, Length) {
		let buf = new Uint8Array(Length);

		buf = Data.slice(Start, Start + Length);

		var bits = (buf[0] << 24) | (buf[1] << 16) | (buf[2] << 8) | buf[3];
		//var bits = 0b10111101111110111110011101101101; // = -0,123;
		var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
		var e = (bits >>> 23) & 0xff;
		var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
		var f = sign * m * Math.pow(2, e - 150);

		return f;
	}

	#CalculatetCrc16(Data, Start, Length) {
		let pos;
		let i;
		let crc = 0xffff;
		let ret;

		for (pos = Start; pos < Start + Length; pos++) {
			crc ^= Data[pos];

			for (i = 8; i != 0; i--) {
				if ((crc & 0x0001) != 0) {
					crc >>= 1;
					crc ^= 0xa001;
				} else {
					crc >>= 1;
				}
			}
		}

		ret = ((crc & 0x00ff) << 8) + ((crc & 0xff00) >> 8);

		return ret;
	}

	get Status() {
		return this.#status;
	}

	get IdInfo() {
		return this.#idInfo;
	}

	get DeviceInfo() {
		return this.#deviceInfo;
	}

	get RunningData() {
		return this.#runningData;
	}

	get ExtComData() {
		return this.#extComData;
	}

	get BmsInfo() {
		return this.#bmsInfo;
	}

	#decodeBitmap(BitMask, StringDict) {
		let bits = BitMask;
		let result = [];

		for (let i = 0; i < 32; i++) {
			if ((bits & 0x1) === 1) {
				result.push(StringDict[i] || `err${i}`);
			}
			bits = bits >> 1;
		}
		return result.join(", ");
	}

	#GetGridInOutModeLabel(AcPowerValue) {
		if(AcPowerValue == 0)
			return this.#LabelDictionaries.GridInOutModeAsString[0];
		if(AcPowerValue > 0)
			return this.#LabelDictionaries.GridInOutModeAsString[1];
		if(AcPowerValue < 0)
			return this.#LabelDictionaries.GridInOutModeAsString[2];

		return "";
	}

	#LabelDictionaries = {
		GridInOutModeAsString:[
			"Idle",
			"Exporting",
			"Importing"
		],

		GridModeAsString:[
			"Not connected to grid",
			"Connected to grid",
			"Fault"
		],

		BatteryModeAsString:[
			"No battery",
			"Standby",
			"Discharge",
			"Charge",
			"To be charged",
			"To be discharged"
		],

		InverteWorkModeTypeETAsString:[
			"Wait Mode",
			"Normal (On-Grid)",
			"Normal (Off-Grid)",
			"Fault Mode",
			"Flash Mode",
			"Check Mode"
		],

		PvModeAsString:[
			"PV panels not connected",
			"PV panels connected, no power",
			"PV panels connected, producing power"
		],

		ErrorCodeAsString:[
			"GFCI Device Check Failure",
			"AC HCT Check Failure",
			"",
			"DCI Consistency Failure",
			"GFCI Consistency Failure",
			"",
			"GFCI Device Failure",
			"Relay Device Failure",
			"AC HCT Failure",
			"Utility Loss",
			"Ground I Failure",
			"DC Bus High",
			"InternalFan Failure",
			"Over Temperature",
			"Utility Phase Failure",
			"PV Over Voltage",
			"External Fan Failure",
			"Vac Failure",
			"Isolation Failure",
			"DC Injection High",
			"Back-Up Over Load",
			"",
			"Fac Consistency Failure",
			"Vac Consistency Failure",
			"",
			"Relay Check Failure",
			"",
			"PhaseAngleFailure",
			"DSP communication failure",
			"Fac Failure",
			"EEPROM R/W Failure",
			"Internal Communication Failure"
		],

		DiagStatusCodesAsString:[
			"Battery voltage low",
			"Battery SOC low",
			"Battery SOC in back",
			"BMS: Discharge disabled",
			"Discharge time on",
			"Charge time on",
    		"Discharge Driver On",
    		"BMS: Discharge current too low",
    		"APP: Discharge current too low",
    		"Meter communication failure",
    		"Meter connection reversed",
    		"Self-use load light",
    		"EMS: discharge current is zero",
    		"Discharge BUS high PV voltage",
    		"Battery Disconnected",
    		"Battery Overcharged",
    		"BMS: Temperature too high",
    		"BMS: Charge too high",
    		"BMS: Charge disabled",
    		"Self-use off",
    		"SOC delta too volatile",
    		"Battery self discharge too high",
    		"Battery SOC low (off-grid)",
    		"Grid wave unstable",
    		"Export power limit set",
    		"PF value set",
    		"Real power limit set",
    		"DC output on",
    		"SOC protect off"
		],

		BMSAlarmCodesAsString:[
			"Charging over-voltage 2",
			"Discharging under-voltage 2",
			"Cell temperature high 2",
			"Cell temperature low 2",
			"Charging over-current 2",
			"Discharging over-current 2",
			"Precharge fault",
			"DC bus fault",
			"Battery break",
			"Battery lock",
			"Discharging circuit failure",
			"Charging circuit failure",
			"Communication failure 2",
			"Cell temperature high 3",
			"Discharging under-voltage 3",
			"Charging over-voltage 3"
		],

		BMSWarningCodesAsString:[
			"Charging over-voltage 1",
			"Discharging under-voltage 1",
			"Cell temperature high 1",
			"Cell temperature low 1",
			"Charging over-current 1",
			"Discharging over-current 1",
			"Communication failure 1",
			"System reboot",
			"Cell imbalance",
			"System temperature low 1",
			"System temperature low 2",
			"System temperature high"
		],

		SafetyCountryCodeAsString:[
			"IT CEI 0-21",
			"CZ-A1",
			"DE LV with PV",
			"ES-A",
			"GR",
			"DK2",
			"BE",
			"RO-A",
			"GB G98",
			"Australia A",
			"FR mainland",
			"China",
			"60Hz 230Vac Default",
			"PL LV",
			"South Africa",
			"",
			"Brazil 220Vac",
			"Thailand MEA",
			"Thailand PEA",
			"Mauritius",
			"NL-A",
			"G98/NI",
			"China Higher",
			"FR island 50Hz",
			"FR island 60Hz",
			"Australia Ergon",
			"Australia Energex",
			"NL 16/20A",
			"Korea",
			"China Utility",
			"AT-A",
			"India",
			"50Hz 230Vac Default",
			"Warehouse",
			"Philippines",
			"IE-16/25A",
			"Taiwan",
			"BG",
			"Barbados",
			"China Highest",
			"GB G99-A",
			"SE LV",
			"Chile BT",
			"Brazil 127Vac",
			"Newzealand",
			"IEEE1547 208Vac",
			"IEEE1547 220Vac",
			"IEEE1547 240Vac",
			"60Hz 127Vac Default",
			"50Hz 127Vac Default",
			"Australia WAPN",
			"Australia MicroGrid",
			"JP 50Hz",
			"JP 60Hz",
			"India Higher",
			"DEWA LV",
			"DEWA MV",
			"SK",
			"NZ GreenGrid",
			"HU",
			"Sri Lanka",
			"ES island",
			"Ergon30K",
			"Energex30K",
			"IEEE1547 230/400Vac",
			"IEC61727 60Hz",
			"CH",
			"IT CEI 0-16",
			"Australia Horizon",
			"CY",
			"Australia SAPN",
			"Australia Ausgrid",
			"Australia Essential",
			"Australia Victoria",
			"Hong Kong",
			"PL MV",
			"NL-B",
			"SE MV",
			"DE MV",
			"DE LV without PV",
			"ES-D",
			"Australia Endeavour",
			"Argentina",
			"Israel LV",
			"IEC61727 50Hz",
			"Australia B",
			"Australia C",
			"Chile MT-A",
			"Chile MT-B",
			"Vietnam",
			"reserve14",
			"Israel-HV",
			"",
			"NewZealand:2015",
			"RO-D",
			"",
			"US 208Vac Default",
			"US 240Vac Default",
			"US CA 208Vac",
			"US CA 240Vac",
			"cUSA_208VacCA_SDGE",
			"cUSA_240VacCA_SDGE",
			"cUSA_208VacCA_PGE",
			"cUSA_240VacCA_PGE",
			"US HI 208Vac",
			"US HI 240Vac",
			"USA_208VacHECO_14HM",
			"USA_240VacHECO_14HM",
			"US 480Vac",
			"US CA 480Vac",
			"US HI 480Vac",
			"US Kauai 208Vac",
			"US Kauai 240Vac",
			"US Kauai 480Vac",
			"US ISO-NE 208Vac",
			"US ISO-NE 240Vac",
			"US ISO-NE 480Vac",
			"",
			"PR 208Vac",
			"PR 240Vac",
			"PR 480Vac",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"Poland_B",
			"EE",
		],
	}

}


module.exports = {
	GoodWePacket,
	GoodWeRegister,
	GoodWeIdInfo,
	GoodWeDeviceInfo,
	GoodWeMeterPhase,
	GoodWeExternalComData,
	GoodweBmSInfo,
	GoodWeUdp,
};
