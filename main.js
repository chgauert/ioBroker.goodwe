/* eslint-disable no-undef */
"use strict";

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const goodWe = require("./GoodWe/GoodWe");

let tmr_timeout = null;

class Goodwe extends utils.Adapter {
	inverter = new goodWe.GoodWeUdp();
	interval;
	cycleCnt = 0;

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "goodwe",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		this.CreateObjectsDeviceInfo();
		this.CreateObjectsRunningData();
		this.CreateObjectsExtComData();
		this.CreateObjectsBmsInfo();

		// Reset the connection indicator during startup
		this.setState("info.connection", false, true);

		// @ts-ignore
		this.inverter.Connect(this.config.ipAddr, 8899);

		this.myTimer();
		
		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw iobroker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			this.clearTimeout(tmr_timeout);

			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	CreateObjectsDeviceInfo() {
		this.setObjectNotExistsAsync("DeviceInfo", {
			type: "channel",
			common: { name: "DeviceInfo" },
			native: {},
		});
	
		this.CreateObjectStateNumber("DeviceInfo", "ModbusProtocolVersion");
		this.CreateObjectStateNumber("DeviceInfo", "RatedPower");
		this.CreateObjectStateNumber("DeviceInfo", "AcOutputType");
		this.CreateObjectStateString("DeviceInfo", "SerialNumber");
		this.CreateObjectStateString("DeviceInfo", "DeviceType");
		this.CreateObjectStateNumber("DeviceInfo", "DSP1_SW_Version");
		this.CreateObjectStateNumber("DeviceInfo", "DSP2_SW_Version");
		this.CreateObjectStateNumber("DeviceInfo", "DSP_SVN_Version");
		this.CreateObjectStateNumber("DeviceInfo", "ARM_SW_Version");
		this.CreateObjectStateNumber("DeviceInfo", "ARM_SVN_Version");
		this.CreateObjectStateString("DeviceInfo", "DSP_Int_FW_Version");
		this.CreateObjectStateString("DeviceInfo", "ARM_Int_FW_Version");
	}

	CreateObjectsRunningData() {
		this.setObjectNotExistsAsync("RunningData", {
			type: "channel",
			common: { name: "RunningData" },
			native: {},
		});
	
		this.CreateObjectsDcParameters("RunningData", "PV1");
		this.CreateObjectsDcParameters("RunningData", "PV2");
		this.CreateObjectsDcParameters("RunningData", "PV3");
		this.CreateObjectsDcParameters("RunningData", "PV4");
		this.CreateObjectsAcPhase("RunningData", "GridL1");
		this.CreateObjectsAcPhase("RunningData", "GridL2");
		this.CreateObjectsAcPhase("RunningData", "GridL3");
		this.CreateObjectStateNumber("RunningData", "GridMode");
		this.CreateObjectStateString("RunningData", "GridModeLabel");
		this.CreateObjectPowerParameters("RunningData", "PowerInverterOperation");
		this.CreateObjectPowerParameters("RunningData", "PowerActiveAC");
		this.CreateObjectStateNumber("RunningData", "PowerReactiveAC");
		this.CreateObjectStateNumber("RunningData", "PowerApparentAC");
		this.CreateObjectStateString("RunningData", "GridInOutModeLabel");
		this.CreateObjectsPhaseBackUp("RunningData", "BackUpL1");
		this.CreateObjectsPhaseBackUp("RunningData", "BackUpL2");
		this.CreateObjectsPhaseBackUp("RunningData", "BackUpL3");
		this.CreateObjectPowerParameters("RunningData", "PowerL1");
		this.CreateObjectPowerParameters("RunningData", "PowerL2");
		this.CreateObjectPowerParameters("RunningData", "PowerL3");
		this.CreateObjectPowerParameters("RunningData", "PowerBackUpLine");
		this.CreateObjectPowerParameters("RunningData", "PowerGridLine");
		this.CreateObjectStateNumber("RunningData", "UpsLoadPercent");
		this.CreateObjectStateNumber("RunningData", "AirTemperature");
		this.CreateObjectStateNumber("RunningData", "ModulTemperature");
		this.CreateObjectStateNumber("RunningData", "RadiatorTemperature");
		this.CreateObjectStateNumber("RunningData", "FunctionBitValue");
		this.CreateObjectStateNumber("RunningData", "BusVoltage");
		this.CreateObjectStateNumber("RunningData", "NbusVoltage");
		this.CreateObjectsDcParameters("RunningData", "Battery1");
		this.CreateObjectStateNumber("RunningData", "WarningCode");
		this.CreateObjectStateNumber("RunningData", "SaftyCountry");
		this.CreateObjectStateString("RunningData", "SaftyCountryLabel");
		this.CreateObjectStateNumber("RunningData", "WorkMode");
		this.CreateObjectStateString("RunningData", "WorkModeLabel");
		this.CreateObjectStateNumber("RunningData", "OperationMode");
		this.CreateObjectStateNumber("RunningData", "ErrorMessage");
		this.CreateObjectStateString("RunningData", "ErrorMessageLabel");
		this.CreateObjectPowerParameters("RunningData", "EnergyPvTotal");
		this.CreateObjectPowerParameters("RunningData", "EnergyPvToday");
		this.CreateObjectPowerParameters("RunningData", "EnergyInverterOutTotal");
		this.CreateObjectStateNumber("RunningData", "HoursTotal");

		this.CreateObjectPowerParameters("RunningData", "EnergyInverterOutToday");
		this.CreateObjectPowerParameters("RunningData", "EnergyInverterInTotal");
		this.CreateObjectPowerParameters("RunningData", "EnergyInverterInToday");
		this.CreateObjectPowerParameters("RunningData", "EnergyLoadTotal");
		this.CreateObjectPowerParameters("RunningData", "EnergyLoadToday");
		this.CreateObjectPowerParameters("RunningData", "EnergyBatteryChargeTotal");
		this.CreateObjectPowerParameters("RunningData", "EnergyBatteryChargeToday");
		this.CreateObjectPowerParameters("RunningData", "EnergyBatteryDischargeTotal");
		this.CreateObjectPowerParameters("RunningData", "EnergyBatteryDischargeToday");

		this.CreateObjectStateNumber("RunningData", "BatteryStrings");
		this.CreateObjectStateNumber("RunningData", "CpldWarningCode");
		this.CreateObjectStateNumber("RunningData", "WChargeCtrFlag");
		this.CreateObjectStateNumber("RunningData", "DerateFrozenPower");
		this.CreateObjectStateNumber("RunningData", "DiagStatusHigh");
		this.CreateObjectStateNumber("RunningData", "DiagStatusLow");
		this.CreateObjectStateString("RunningData", "DiagStatusLowAsString");

		this.CreateObjectPowerParameters("RunningData", "PowerAllPv");
		this.CreateObjectPowerParameters("RunningData", "PowerHouseConsumptionPv");
		this.CreateObjectPowerParameters("RunningData", "PowerHouseConsumptionAC");
	}
	
	CreateObjectsExtComData() {
		this.setObjectNotExistsAsync("ExtComData", {
			type: "channel",
			common: { name: "ExtComData" },
			native: {},
		});
	
		this.CreateObjectStateNumber("ExtComData", "Commode");
		this.CreateObjectStateNumber("ExtComData", "Rssi");
		this.CreateObjectStateNumber("ExtComData", "ManufacturerCode");
		this.CreateObjectStateNumber("ExtComData", "MeterConnectStatus");
		this.CreateObjectStateNumber("ExtComData", "MeterCommunicateStatus");
		this.CreateObjectMeterPhase("ExtComData", "L1");
		this.CreateObjectMeterPhase("ExtComData", "L2");
		this.CreateObjectMeterPhase("ExtComData", "L3");
		this.CreateObjectStateNumber("ExtComData", "TotalActivePower");
		this.CreateObjectStateNumber("ExtComData", "TotalReactivePower");
		this.CreateObjectStateNumber("ExtComData", "PowerFactor");
		this.CreateObjectStateNumber("ExtComData", "Frequency");
		this.CreateObjectPowerParameters("ExtComData", "EnergyTotalSell");
		this.CreateObjectPowerParameters("ExtComData", "EnergyTotalBuy");
	}
	
	CreateObjectsBmsInfo() {
		this.setObjectNotExistsAsync("BMSInfo", {
			type: "channel",
			common: { name: "ExtComData" },
			native: {},
		});
	
		this.CreateObjectStateNumber("BMSInfo", "Status");
		this.CreateObjectStateNumber("BMSInfo", "PackTemperature");
		this.CreateObjectStateNumber("BMSInfo", "MaxChargeCurrent");
		this.CreateObjectStateNumber("BMSInfo", "MaxDischargeCurrent");
		this.CreateObjectStateNumber("BMSInfo", "ErrorCodeLow");
		this.CreateObjectStateNumber("BMSInfo", "SOC");
		this.CreateObjectStateNumber("BMSInfo", "SOH");
		this.CreateObjectStateNumber("BMSInfo", "BatteryStrings");
		this.CreateObjectStateNumber("BMSInfo", "WarningCodeLow");
		this.CreateObjectStateNumber("BMSInfo", "Protocol");
		this.CreateObjectStateNumber("BMSInfo", "ErrorCodeHigh");
		this.CreateObjectStateNumber("BMSInfo", "WarningCodeHigh");
		this.CreateObjectStateNumber("BMSInfo", "VersionSW");
		this.CreateObjectStateNumber("BMSInfo", "VersionHW");
		this.CreateObjectStateNumber("BMSInfo", "MaxCellTempID");
		this.CreateObjectStateNumber("BMSInfo", "MinCellTempID");
		this.CreateObjectStateNumber("BMSInfo", "MaxCellVoltageID");
		this.CreateObjectStateNumber("BMSInfo", "MinCellVoltageID");
		this.CreateObjectStateNumber("BMSInfo", "MaxCellTemperature");
		this.CreateObjectStateNumber("BMSInfo", "MinCellTemperature");
		this.CreateObjectStateNumber("BMSInfo", "MaxCellVoltage");
		this.CreateObjectStateNumber("BMSInfo", "MinCellVoltage");
	}

	CreateObjectStateNumber(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "state",
			common: {
				name: Name,
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	}
	
	CreateObjectStateString(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "state",
			common: {
				name: "Name",
				type: "string",
				role: "text",
				read: true,
				write: false,
			},
			native: {},
		});
	}

	CreateObjectPowerParameters(Path,Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "channel",
			common: { name: "Name" },
			native: {},
		});

		this.setObjectNotExistsAsync(Path + "." + Name + ".Value", {
			type: "state",
			common: {
				name: "Value",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});

		this.setObjectNotExistsAsync(Path + "." + Name + ".Unit", {
			type: "state",
			common: {
				name: "Unit",
				type: "string",
				role: "text",
				read: true,
				write: false,
			},
			native: {},
		});

		this.setObjectNotExistsAsync(Path + "." + Name + ".ValueAsString", {
			type: "state",
			common: {
				name: "ValueAsString",
				type: "string",
				role: "text",
				read: true,
				write: false,
			},
			native: {},
		});
	}

	CreateObjectsDcParameters(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "channel",
			common: { name: "Name" },
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Voltage", {
			type: "state",
			common: {
				name: "Voltage",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Current", {
			type: "state",
			common: {
				name: "Current",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.CreateObjectPowerParameters(Path + "." + Name, "Power");
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Mode", {
			type: "state",
			common: {
				name: "Mode",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});

		this.setObjectNotExistsAsync(Path + "." + Name + ".ModeLabel", {
			type: "state",
			common: {
				name: "ModeLabel",
				type: "string",
				role: "text",
				read: true,
				write: false,
			},
			native: {},
		});
	}
	
	CreateObjectsAcPhase(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "channel",
			common: { name: "Name" },
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Voltage", {
			type: "state",
			common: {
				name: "Voltage",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Current", {
			type: "state",
			common: {
				name: "Current",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Frequency", {
			type: "state",
			common: {
				name: "Frequency",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.CreateObjectPowerParameters(Path + "." + Name, "Power");
	}
	
	CreateObjectsPhaseBackUp(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "channel",
			common: { name: "Name" },
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Voltage", {
			type: "state",
			common: {
				name: "Voltage",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Current", {
			type: "state",
			common: {
				name: "Current",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Frequency", {
			type: "state",
			common: {
				name: "Frequency",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.CreateObjectPowerParameters(Path + "." + Name, "Power");
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Mode", {
			type: "state",
			common: {
				name: "Mode",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	}
	
	CreateObjectMeterPhase(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "channel",
			common: { name: Name },
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".ActivePower", {
			type: "state",
			common: {
				name: "ActivePower",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".PowerFactor", {
			type: "state",
			common: {
				name: "PowerFactor",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	}

	UpdateDeviceInfo() {
		this.inverter.ReadDeviceInfo();
	
		this.setStateAsync("DeviceInfo.ModbusProtocolVersion", this.inverter.DeviceInfo.ModbusProtocolVersion, true);
		this.setStateAsync("DeviceInfo.RatedPower", this.inverter.DeviceInfo.RatedPower, true);
		this.setStateAsync("DeviceInfo.AcOutputType", this.inverter.DeviceInfo.AcOutputType, true);
		this.setStateAsync("DeviceInfo.SerialNumber", this.inverter.DeviceInfo.SerialNumber, true);
		this.setStateAsync("DeviceInfo.DeviceType", this.inverter.DeviceInfo.DeviceType, true);
		this.setStateAsync("DeviceInfo.DSP1_SW_Version", this.inverter.DeviceInfo.DSP1_SoftwareVersion, true);
		this.setStateAsync("DeviceInfo.DSP2_SW_Version", this.inverter.DeviceInfo.DSP2_SoftwareVersion, true);
		this.setStateAsync("DeviceInfo.DSP_SVN_Version", this.inverter.DeviceInfo.DSP_SVN_Version, true);
		this.setStateAsync("DeviceInfo.ARM_SW_Version", this.inverter.DeviceInfo.ARM_SoftwareVersion, true);
		this.setStateAsync("DeviceInfo.ARM_SVN_Version", this.inverter.DeviceInfo.ARM_SVN_Version, true);
		this.setStateAsync("DeviceInfo.DSP_Int_FW_Version", this.inverter.DeviceInfo.DSP_IntFirmwareVersion, true);
		this.setStateAsync("DeviceInfo.ARM_Int_FW_Version", this.inverter.DeviceInfo.ARM_IntFirmwareVersion, true);
	
		this.setStateAsync("info.connection", this.inverter.Status, true);
	}

	UpdateRunningData() {
		this.inverter.ReadRunningData();
	
		this.setStateAsync("RunningData.PV1.Voltage", this.inverter.RunningData.Pv1.Voltage, true);
		this.setStateAsync("RunningData.PV1.Current", this.inverter.RunningData.Pv1.Current, true);
		this.setStateAsync("RunningData.PV1.Power.Value", this.inverter.RunningData.Pv1.Power.Value, true);
		this.setStateAsync("RunningData.PV1.Power.Unit", this.inverter.RunningData.Pv1.Power.Unit, true);
		this.setStateAsync("RunningData.PV1.Power.ValueAsString", this.inverter.RunningData.Pv1.Power.ValueAsString, true);
		this.setStateAsync("RunningData.PV1.Mode", this.inverter.RunningData.Pv1.Mode, true);
		this.setStateAsync("RunningData.PV1.ModeLabel", this.inverter.RunningData.Pv1.ModeLabel, true);

		this.setStateAsync("RunningData.PV2.Voltage", this.inverter.RunningData.Pv2.Voltage, true);
		this.setStateAsync("RunningData.PV2.Current", this.inverter.RunningData.Pv2.Current, true);
		this.setStateAsync("RunningData.PV2.Power.Value", this.inverter.RunningData.Pv2.Power.Value, true);
		this.setStateAsync("RunningData.PV2.Power.Unit", this.inverter.RunningData.Pv2.Power.Unit, true);
		this.setStateAsync("RunningData.PV2.Power.ValueAsString", this.inverter.RunningData.Pv2.Power.ValueAsString, true);
		this.setStateAsync("RunningData.PV2.Mode", this.inverter.RunningData.Pv2.Mode, true);
		this.setStateAsync("RunningData.PV2.ModeLabel", this.inverter.RunningData.Pv2.ModeLabel, true);

		this.setStateAsync("RunningData.PV3.Voltage", this.inverter.RunningData.Pv3.Voltage, true);
		this.setStateAsync("RunningData.PV3.Current", this.inverter.RunningData.Pv3.Current, true);
		this.setStateAsync("RunningData.PV3.Power.Value", this.inverter.RunningData.Pv3.Power.Value, true);
		this.setStateAsync("RunningData.PV3.Power.Unit", this.inverter.RunningData.Pv3.Power.Unit, true);
		this.setStateAsync("RunningData.PV3.Power.ValueAsString", this.inverter.RunningData.Pv3.Power.ValueAsString, true);
		this.setStateAsync("RunningData.PV3.Mode", this.inverter.RunningData.Pv3.Mode, true);
		this.setStateAsync("RunningData.PV3.ModeLabel", this.inverter.RunningData.Pv3.ModeLabel, true);

		this.setStateAsync("RunningData.PV4.Voltage", this.inverter.RunningData.Pv4.Voltage, true);
		this.setStateAsync("RunningData.PV4.Current", this.inverter.RunningData.Pv4.Current, true);
		this.setStateAsync("RunningData.PV4.Power.Value", this.inverter.RunningData.Pv4.Power.Value, true);
		this.setStateAsync("RunningData.PV4.Power.Unit", this.inverter.RunningData.Pv4.Power.Unit, true);
		this.setStateAsync("RunningData.PV4.Power.ValueAsString", this.inverter.RunningData.Pv4.Power.ValueAsString, true);
		this.setStateAsync("RunningData.PV4.Mode", this.inverter.RunningData.Pv4.Mode, true);
		this.setStateAsync("RunningData.PV4.ModeLabel", this.inverter.RunningData.Pv4.ModeLabel, true);

		this.setStateAsync("RunningData.GridL1.Voltage", this.inverter.RunningData.GridL1.Voltage, true);
		this.setStateAsync("RunningData.GridL1.Current", this.inverter.RunningData.GridL1.Current, true);
		this.setStateAsync("RunningData.GridL1.Frequency", this.inverter.RunningData.GridL1.Frequency, true);
		this.setStateAsync("RunningData.GridL1.Power.Value", this.inverter.RunningData.GridL1.Power.Value, true);
		this.setStateAsync("RunningData.GridL1.Power.Unit", this.inverter.RunningData.GridL1.Power.Unit, true);
		this.setStateAsync("RunningData.GridL1.Power.ValueAsString", this.inverter.RunningData.GridL1.Power.ValueAsString, true);

		this.setStateAsync("RunningData.GridL2.Voltage", this.inverter.RunningData.GridL2.Voltage, true);
		this.setStateAsync("RunningData.GridL2.Current", this.inverter.RunningData.GridL2.Current, true);
		this.setStateAsync("RunningData.GridL2.Frequency", this.inverter.RunningData.GridL2.Frequency, true);
		this.setStateAsync("RunningData.GridL2.Power.Value", this.inverter.RunningData.GridL2.Power.Value, true);
		this.setStateAsync("RunningData.GridL2.Power.Unit", this.inverter.RunningData.GridL2.Power.Unit, true);
		this.setStateAsync("RunningData.GridL2.Power.ValueAsString", this.inverter.RunningData.GridL2.Power.ValueAsString, true);

		this.setStateAsync("RunningData.GridL3.Voltage", this.inverter.RunningData.GridL3.Voltage, true);
		this.setStateAsync("RunningData.GridL3.Current", this.inverter.RunningData.GridL3.Current, true);
		this.setStateAsync("RunningData.GridL3.Frequency", this.inverter.RunningData.GridL3.Frequency, true);
		this.setStateAsync("RunningData.GridL3.Power.Value", this.inverter.RunningData.GridL3.Power.Value, true);
		this.setStateAsync("RunningData.GridL3.Power.Unit", this.inverter.RunningData.GridL3.Power.Unit, true);
		this.setStateAsync("RunningData.GridL3.Power.ValueAsString", this.inverter.RunningData.GridL3.Power.ValueAsString, true);

		this.setStateAsync("RunningData.GridMode", this.inverter.RunningData.GridMode, true);
		this.setStateAsync("RunningData.GridModeLabel", this.inverter.RunningData.GridModeLabel, true);

		this.setStateAsync("RunningData.PowerInverterOperation.Value", this.inverter.RunningData.PowerInverterOperation.Value, true);
		this.setStateAsync("RunningData.PowerInverterOperation.Unit", this.inverter.RunningData.PowerInverterOperation.Unit, true);
		this.setStateAsync("RunningData.PowerInverterOperation.ValueAsString", this.inverter.RunningData.PowerInverterOperation.ValueAsString, true);

		this.setStateAsync("RunningData.PowerActiveAC.Value", this.inverter.RunningData.PowerActiveAC.Value, true);
		this.setStateAsync("RunningData.PowerActiveAC.Unit", this.inverter.RunningData.PowerActiveAC.Unit, true);
		this.setStateAsync("RunningData.PowerActiveAC.ValueAsString", this.inverter.RunningData.PowerActiveAC.ValueAsString, true);

		this.setStateAsync("RunningData.PowerReactiveAC", this.inverter.RunningData.PowerReactiveAC, true);
		this.setStateAsync("RunningData.PowerApparentAC", this.inverter.RunningData.PowerApparentAC, true);

		this.setStateAsync("RunningData.GridInOutModeLabel", this.inverter.RunningData.GridInOutModeLabel, true);

		this.setStateAsync("RunningData.BackUpL1.Voltage", this.inverter.RunningData.BackUpL1.Voltage, true);
		this.setStateAsync("RunningData.BackUpL1.Current", this.inverter.RunningData.BackUpL1.Current, true);
		this.setStateAsync("RunningData.BackUpL1.Frequency", this.inverter.RunningData.BackUpL1.Frequency, true);
		this.setStateAsync("RunningData.BackUpL1.Power.Value", this.inverter.RunningData.BackUpL1.Power.Value, true);
		this.setStateAsync("RunningData.BackUpL1.Power.Unit", this.inverter.RunningData.BackUpL1.Power.Unit, true);
		this.setStateAsync("RunningData.BackUpL1.Power.ValueAsString", this.inverter.RunningData.BackUpL1.Power.ValueAsString, true);
		this.setStateAsync("RunningData.BackUpL1.Mode", this.inverter.RunningData.BackUpL1.Mode, true);

		this.setStateAsync("RunningData.BackUpL2.Voltage", this.inverter.RunningData.BackUpL2.Voltage, true);
		this.setStateAsync("RunningData.BackUpL2.Current", this.inverter.RunningData.BackUpL2.Current, true);
		this.setStateAsync("RunningData.BackUpL2.Frequency", this.inverter.RunningData.BackUpL2.Frequency, true);
		this.setStateAsync("RunningData.BackUpL2.Power.Value", this.inverter.RunningData.BackUpL2.Power.Value, true);
		this.setStateAsync("RunningData.BackUpL2.Power.Unit", this.inverter.RunningData.BackUpL2.Power.Unit, true);
		this.setStateAsync("RunningData.BackUpL2.Power.ValueAsString", this.inverter.RunningData.BackUpL2.Power.ValueAsString, true);
		this.setStateAsync("RunningData.BackUpL2.Mode", this.inverter.RunningData.BackUpL2.Mode, true);

		this.setStateAsync("RunningData.BackUpL3.Voltage", this.inverter.RunningData.BackUpL3.Voltage, true);
		this.setStateAsync("RunningData.BackUpL3.Current", this.inverter.RunningData.BackUpL3.Current, true);
		this.setStateAsync("RunningData.BackUpL3.Frequency", this.inverter.RunningData.BackUpL3.Frequency, true);
		this.setStateAsync("RunningData.BackUpL3.Power.Value", this.inverter.RunningData.BackUpL3.Power.Value, true);
		this.setStateAsync("RunningData.BackUpL3.Power.Unit", this.inverter.RunningData.BackUpL3.Power.Unit, true);
		this.setStateAsync("RunningData.BackUpL3.Power.ValueAsString", this.inverter.RunningData.BackUpL3.Power.ValueAsString, true);
		this.setStateAsync("RunningData.BackUpL3.Mode", this.inverter.RunningData.BackUpL3.Mode, true);

		this.setStateAsync("RunningData.PowerL1.Value", this.inverter.RunningData.PowerL1.Value, true);
		this.setStateAsync("RunningData.PowerL1.Unit", this.inverter.RunningData.PowerL1.Unit, true);
		this.setStateAsync("RunningData.PowerL1.ValueAsString", this.inverter.RunningData.PowerL1.ValueAsString, true);
		this.setStateAsync("RunningData.PowerL2.Value", this.inverter.RunningData.PowerL2.Value, true);
		this.setStateAsync("RunningData.PowerL2.Unit", this.inverter.RunningData.PowerL2.Unit, true);
		this.setStateAsync("RunningData.PowerL2.ValueAsString", this.inverter.RunningData.PowerL2.ValueAsString, true);
		this.setStateAsync("RunningData.PowerL3.Value", this.inverter.RunningData.PowerL3.Value, true);
		this.setStateAsync("RunningData.PowerL3.Unit", this.inverter.RunningData.PowerL3.Unit, true);
		this.setStateAsync("RunningData.PowerL3.ValueAsString", this.inverter.RunningData.PowerL3.ValueAsString, true);

		this.setStateAsync("RunningData.PowerBackUpLine.Value", this.inverter.RunningData.PowerBackUpLine.Value, true);
		this.setStateAsync("RunningData.PowerBackUpLine.Unit", this.inverter.RunningData.PowerBackUpLine.Unit, true);
		this.setStateAsync("RunningData.PowerBackUpLine.ValueAsString", this.inverter.RunningData.PowerBackUpLine.ValueAsString, true);
		this.setStateAsync("RunningData.PowerGridLine.Value", this.inverter.RunningData.PowerGridLine.Value, true);
		this.setStateAsync("RunningData.PowerGridLine.Unit", this.inverter.RunningData.PowerGridLine.Unit, true);
		this.setStateAsync("RunningData.PowerGridLine.ValueAsString", this.inverter.RunningData.PowerGridLine.ValueAsString, true);

		this.setStateAsync("RunningData.UpsLoadPercent", this.inverter.RunningData.UpsLoadPercent, true);
		this.setStateAsync("RunningData.AirTemperature", this.inverter.RunningData.AirTemperature, true);
		this.setStateAsync("RunningData.ModulTemperature", this.inverter.RunningData.ModulTemperature, true);
		this.setStateAsync("RunningData.RadiatorTemperature", this.inverter.RunningData.RadiatorTemperature, true);
		this.setStateAsync("RunningData.FunctionBitValue", this.inverter.RunningData.FunctionBitValue, true);
		this.setStateAsync("RunningData.BusVoltage", this.inverter.RunningData.BusVoltage, true);
		this.setStateAsync("RunningData.NbusVoltage", this.inverter.RunningData.NbusVoltage, true);

		this.setStateAsync("RunningData.Battery1.Voltage", this.inverter.RunningData.Battery1.Voltage, true);
		this.setStateAsync("RunningData.Battery1.Current", this.inverter.RunningData.Battery1.Current, true);
		this.setStateAsync("RunningData.Battery1.Power.Value", this.inverter.RunningData.Battery1.Power.Value, true);
		this.setStateAsync("RunningData.Battery1.Power.Unit", this.inverter.RunningData.Battery1.Power.Unit, true);
		this.setStateAsync("RunningData.Battery1.Power.ValueAsString", this.inverter.RunningData.Battery1.Power.ValueAsString, true);
		this.setStateAsync("RunningData.Battery1.Mode", this.inverter.RunningData.Battery1.Mode, true);
		this.setStateAsync("RunningData.Battery1.ModeLabel", this.inverter.RunningData.Battery1.ModeLabel, true);

		this.setStateAsync("RunningData.WarningCode", this.inverter.RunningData.WarningCode, true);
		this.setStateAsync("RunningData.SaftyCountry", this.inverter.RunningData.SaftyCountry, true);
		this.setStateAsync("RunningData.SaftyCountryLabel", this.inverter.RunningData.SaftyCountryLabel, true);
		this.setStateAsync("RunningData.WorkMode", this.inverter.RunningData.WorkMode, true);
		this.setStateAsync("RunningData.WorkModeLabel", this.inverter.RunningData.WorkModeLabel, true);
		this.setStateAsync("RunningData.OperationMode", this.inverter.RunningData.OperationMode, true);
		this.setStateAsync("RunningData.ErrorMessage", this.inverter.RunningData.ErrorMessage, true);
		this.setStateAsync("RunningData.ErrorMessageLabel", this.inverter.RunningData.ErrorMessageLabel, true);

		this.setStateAsync("RunningData.EnergyPvTotal.Value", this.inverter.RunningData.EnergyPvTotal.Value, true);
		this.setStateAsync("RunningData.EnergyPvTotal.Unit", this.inverter.RunningData.EnergyPvTotal.Unit, true);
		this.setStateAsync("RunningData.EnergyPvTotal.ValueAsString", this.inverter.RunningData.EnergyPvTotal.ValueAsString, true);
		this.setStateAsync("RunningData.EnergyPvToday.Value", this.inverter.RunningData.EnergyPvToday.Value, true);
		this.setStateAsync("RunningData.EnergyPvToday.Unit", this.inverter.RunningData.EnergyPvToday.Unit, true);
		this.setStateAsync("RunningData.EnergyPvToday.ValueAsString", this.inverter.RunningData.EnergyPvToday.ValueAsString, true);
		this.setStateAsync("RunningData.EnergyInverterOutTotal.Value", this.inverter.RunningData.EnergyInverterOutTotal.Value, true);
		this.setStateAsync("RunningData.EnergyInverterOutTotal.Unit", this.inverter.RunningData.EnergyInverterOutTotal.Unit, true);
		this.setStateAsync("RunningData.EnergyInverterOutTotal.ValueAsString", this.inverter.RunningData.EnergyInverterOutTotal.ValueAsString, true);

		this.setStateAsync("RunningData.HoursTotal", this.inverter.RunningData.HoursTotal, true);

		this.setStateAsync("RunningData.EnergyInverterOutToday.Value", this.inverter.RunningData.EnergyInverterOutToday.Value, true);
		this.setStateAsync("RunningData.EnergyInverterOutToday.Unit", this.inverter.RunningData.EnergyInverterOutToday.Unit, true);
		this.setStateAsync("RunningData.EnergyInverterOutToday.ValueAsString", this.inverter.RunningData.EnergyInverterOutToday.ValueAsString, true);

		this.setStateAsync("RunningData.EnergyInverterInTotal.Value", this.inverter.RunningData.EnergyInverterInTotal.Value, true);
		this.setStateAsync("RunningData.EnergyInverterInTotal.Unit", this.inverter.RunningData.EnergyInverterInTotal.Unit, true);
		this.setStateAsync("RunningData.EnergyInverterInTotal.ValueAsString", this.inverter.RunningData.EnergyInverterInTotal.ValueAsString, true);

		this.setStateAsync("RunningData.EnergyInverterInToday.Value", this.inverter.RunningData.EnergyInverterInToday.Value, true);
		this.setStateAsync("RunningData.EnergyInverterInToday.Unit", this.inverter.RunningData.EnergyInverterInToday.Unit, true);
		this.setStateAsync("RunningData.EnergyInverterInToday.ValueAsString", this.inverter.RunningData.EnergyInverterInToday.ValueAsString, true);

		this.setStateAsync("RunningData.EnergyLoadTotal.Value", this.inverter.RunningData.EnergyLoadTotal.Value, true);
		this.setStateAsync("RunningData.EnergyLoadTotal.Unit", this.inverter.RunningData.EnergyLoadTotal.Unit, true);
		this.setStateAsync("RunningData.EnergyLoadTotal.ValueAsString", this.inverter.RunningData.EnergyLoadTotal.ValueAsString, true);

		this.setStateAsync("RunningData.EnergyLoadToday.Value", this.inverter.RunningData.EnergyLoadToday.Value, true);
		this.setStateAsync("RunningData.EnergyLoadToday.Unit", this.inverter.RunningData.EnergyLoadToday.Unit, true);
		this.setStateAsync("RunningData.EnergyLoadToday.ValueAsString", this.inverter.RunningData.EnergyLoadToday.ValueAsString, true);

		this.setStateAsync("RunningData.EnergyBatteryChargeTotal.Value", this.inverter.RunningData.EnergyBatteryChargeTotal.Value, true);
		this.setStateAsync("RunningData.EnergyBatteryChargeTotal.Unit", this.inverter.RunningData.EnergyBatteryChargeTotal.Unit, true);
		this.setStateAsync("RunningData.EnergyBatteryChargeTotal.ValueAsString", this.inverter.RunningData.EnergyBatteryChargeTotal.ValueAsString, true);

		this.setStateAsync("RunningData.EnergyBatteryChargeToday.Value", this.inverter.RunningData.EnergyBatteryChargeToday.Value, true);
		this.setStateAsync("RunningData.EnergyBatteryChargeToday.Unit", this.inverter.RunningData.EnergyBatteryChargeToday.Unit, true);
		this.setStateAsync("RunningData.EnergyBatteryChargeToday.ValueAsString", this.inverter.RunningData.EnergyBatteryChargeToday.ValueAsString, true);

		this.setStateAsync("RunningData.EnergyBatteryDischargeTotal.Value", this.inverter.RunningData.EnergyBatteryDischargeTotal.Value, true);
		this.setStateAsync("RunningData.EnergyBatteryDischargeTotal.Unit", this.inverter.RunningData.EnergyBatteryDischargeTotal.Unit, true);
		this.setStateAsync("RunningData.EnergyBatteryDischargeTotal.ValueAsString", this.inverter.RunningData.EnergyBatteryDischargeTotal.ValueAsString, true);

		this.setStateAsync("RunningData.EnergyBatteryDischargeToday.Value", this.inverter.RunningData.EnergyBatteryDischargeToday.Value, true);
		this.setStateAsync("RunningData.EnergyBatteryDischargeToday.Unit", this.inverter.RunningData.EnergyBatteryDischargeToday.Unit, true);
		this.setStateAsync("RunningData.EnergyBatteryDischargeToday.ValueAsString", this.inverter.RunningData.EnergyBatteryDischargeToday.ValueAsString, true);

		this.setStateAsync("RunningData.BatteryStrings", this.inverter.RunningData.BatteryStrings, true);
		this.setStateAsync("RunningData.CpldWarningCode", this.inverter.RunningData.CpldWarningCode, true);
		this.setStateAsync("RunningData.WChargeCtrFlag", this.inverter.RunningData.WChargeCtrFlag, true);
		this.setStateAsync("RunningData.DerateFrozenPower", this.inverter.RunningData.DerateFrozenPower, true);
		this.setStateAsync("RunningData.DiagStatusHigh", this.inverter.RunningData.DiagStatusHigh, true);
		this.setStateAsync("RunningData.DiagStatusLow", this.inverter.RunningData.DiagStatusLow, true);
		this.setStateAsync("RunningData.DiagStatusLowAsString", this.inverter.RunningData.DiagStatusLowAsString, true);

		this.setStateAsync("RunningData.PowerAllPv.Value", this.inverter.RunningData.PowerAllPv.Value, true);
		this.setStateAsync("RunningData.PowerAllPv.Unit", this.inverter.RunningData.PowerAllPv.Unit, true);
		this.setStateAsync("RunningData.PowerAllPv.ValueAsString", this.inverter.RunningData.PowerAllPv.ValueAsString, true);

		this.setStateAsync("RunningData.PowerHouseConsumptionPv.Value", this.inverter.RunningData.PowerHouseConsumptionPv.Value, true);
		this.setStateAsync("RunningData.PowerHouseConsumptionPv.Unit", this.inverter.RunningData.PowerHouseConsumptionPv.Unit, true);
		this.setStateAsync("RunningData.PowerHouseConsumptionPv.ValueAsString", this.inverter.RunningData.PowerHouseConsumptionPv.ValueAsString, true);

		this.setStateAsync("RunningData.PowerHouseConsumptionAC.Value", this.inverter.RunningData.PowerHouseConsumptionAC.Value, true);
		this.setStateAsync("RunningData.PowerHouseConsumptionAC.Unit", this.inverter.RunningData.PowerHouseConsumptionAC.Unit, true);
		this.setStateAsync("RunningData.PowerHouseConsumptionAC.ValueAsString", this.inverter.RunningData.PowerHouseConsumptionAC.ValueAsString, true);

	}
	
	UpdateExtComData() {
		this.inverter.ReadExtComData();
	
		this.setStateAsync("ExtComData.Commode", this.inverter.ExtComData.Commode, true);
		this.setStateAsync("ExtComData.Rssi", this.inverter.ExtComData.Rssi, true);
		this.setStateAsync("ExtComData.ManufacturerCode", this.inverter.ExtComData.ManufacturerCode, true);
		this.setStateAsync("ExtComData.MeterConnectStatus", this.inverter.ExtComData.MeterConnectStatus, true);
		this.setStateAsync("ExtComData.MeterCommunicateStatus", this.inverter.ExtComData.MeterCommunicateStatus, true);
		this.setStateAsync("ExtComData.L1.ActivePower", this.inverter.ExtComData.L1.ActivePower, true);
		this.setStateAsync("ExtComData.L1.PowerFactor", this.inverter.ExtComData.L1.PowerFactor, true);
		this.setStateAsync("ExtComData.L2.ActivePower", this.inverter.ExtComData.L2.ActivePower, true);
		this.setStateAsync("ExtComData.L2.PowerFactor", this.inverter.ExtComData.L2.PowerFactor, true);
		this.setStateAsync("ExtComData.L3.ActivePower", this.inverter.ExtComData.L3.ActivePower, true);
		this.setStateAsync("ExtComData.L3.PowerFactor", this.inverter.ExtComData.L3.PowerFactor, true);
		this.setStateAsync("ExtComData.TotalActivePower", this.inverter.ExtComData.TotalActivePower, true);
		this.setStateAsync("ExtComData.TotalReactivePower", this.inverter.ExtComData.TotalReactivePower, true);
		this.setStateAsync("ExtComData.PowerFactor", this.inverter.ExtComData.PowerFactor, true);
		this.setStateAsync("ExtComData.Frequency", this.inverter.ExtComData.Frequency, true);
		this.setStateAsync("ExtComData.EnergyTotalSell.Value", this.inverter.ExtComData.EnergyTotalSell.Value, true);
		this.setStateAsync("ExtComData.EnergyTotalSell.Unit", this.inverter.ExtComData.EnergyTotalSell.Unit, true);
		this.setStateAsync("ExtComData.EnergyTotalSell.ValueAsString", this.inverter.ExtComData.EnergyTotalSell.ValueAsString, true);
		this.setStateAsync("ExtComData.EnergyTotalBuy.Value", this.inverter.ExtComData.EnergyTotalBuy.Value, true);
		this.setStateAsync("ExtComData.EnergyTotalBuy.Unit", this.inverter.ExtComData.EnergyTotalBuy.Unit, true);
		this.setStateAsync("ExtComData.EnergyTotalBuy.ValueAsString", this.inverter.ExtComData.EnergyTotalBuy.ValueAsString, true);
	}
	
	UpdateBmsInfo() {
		this.inverter.ReadBmsInfo();
	
		this.setStateAsync("BMSInfo.Status", this.inverter.BmsInfo.Status, true);
		this.setStateAsync("BMSInfo.PackTemperature", this.inverter.BmsInfo.PackTemperature, true);
		this.setStateAsync("BMSInfo.MaxChargeCurrent", this.inverter.BmsInfo.MaxChargeCurrent, true);
		this.setStateAsync("BMSInfo.MaxDischargeCurrent", this.inverter.BmsInfo.MaxDischargeCurrent, true);
		this.setStateAsync("BMSInfo.ErrorCodeLow", this.inverter.BmsInfo.ErrorCodeLow, true);
		this.setStateAsync("BMSInfo.SOC", this.inverter.BmsInfo.SOC, true);
		this.setStateAsync("BMSInfo.SOH", this.inverter.BmsInfo.SOH, true);
		this.setStateAsync("BMSInfo.BatteryStrings", this.inverter.BmsInfo.BatteryStrings, true);
		this.setStateAsync("BMSInfo.WarningCodeLow", this.inverter.BmsInfo.WarningCodeLow, true);
		this.setStateAsync("BMSInfo.Protocol", this.inverter.BmsInfo.Protocol, true);
		this.setStateAsync("BMSInfo.ErrorCodeHigh", this.inverter.BmsInfo.ErrorCodeHigh, true);
		this.setStateAsync("BMSInfo.WarningCodeHigh", this.inverter.BmsInfo.WarningCodeHigh, true);
		this.setStateAsync("BMSInfo.VersionSW", this.inverter.BmsInfo.VersionSW, true);
		this.setStateAsync("BMSInfo.VersionHW", this.inverter.BmsInfo.VersionHW, true);
		this.setStateAsync("BMSInfo.MaxCellTempID", this.inverter.BmsInfo.MaxCellTempID, true);
		this.setStateAsync("BMSInfo.MinCellTempID", this.inverter.BmsInfo.MinCellTempID, true);
		this.setStateAsync("BMSInfo.MaxCellVoltageID", this.inverter.BmsInfo.MaxCellVoltageID, true);
		this.setStateAsync("BMSInfo.MinCellVoltageID", this.inverter.BmsInfo.MinCellVoltageID, true);
		this.setStateAsync("BMSInfo.MaxCellTemperature", this.inverter.BmsInfo.MaxCellTemperature, true);
		this.setStateAsync("BMSInfo.MinCellTemperature", this.inverter.BmsInfo.MinCellTemperature, true);
		this.setStateAsync("BMSInfo.MaxCellVoltage", this.inverter.BmsInfo.MaxCellVoltage, true);
		this.setStateAsync("BMSInfo.MinCellVoltage", this.inverter.BmsInfo.MinCellVoltage, true);
	}

	myTimer() {	
		if (this.inverter.Status == false) {
			this.cycleCnt = 0;
			this.inverter.ReadIdInfo();
		} else {
		
			switch (this.cycleCnt) {
				case 1:
					this.UpdateDeviceInfo();
					//this.log.info("Goodwe update");
					break;

				case 3:
					this.UpdateRunningData();
					break;

				case 5:
					this.UpdateExtComData();
					break;

				case 7:
					this.UpdateBmsInfo();
					break;
			}

			// @ts-ignore
			if(this.cycleCnt >= this.config.pollCycle) {
				this.cycleCnt = 0;
			}
		
			this.cycleCnt++;
		}

		tmr_timeout = this.setTimeout(() => this.myTimer(), 1000);
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Goodwe(options);
} else {
	// otherwise start the instance directly
	new Goodwe();
}
