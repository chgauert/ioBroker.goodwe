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
		this.CreateObjectsControlParams();

		// Reset the connection indicator during startup
		this.setState("info.connection", false, true);

		// @ts-ignore
		this.inverter.Connect(this.config.ipAddr, 8899, this);

		this.myTimer();
		
		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw iobroker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);

        // Alle eigenen States abonnieren		
		const ctrlParamNamespace = this.namespace + ".ControlParameter.*";

        await this.subscribeStatesAsync(ctrlParamNamespace);		
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
			if (state.ack == true) {
				// The state was changed by the adapter cyclic polling
				return;
			} else {
				// The state was changed by user
				this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
				this.WriteControlValue(id, state);
			}
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
		this.CreateObjectStateNumber("RunningData", "SafetyCountry");
		this.CreateObjectStateString("RunningData", "SafetyCountryLabel");
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
			common: { name: "BMSInfo" },
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
		this.CreateObjectPowerParameters("BMSInfo", "EnergyBatteryChargedTotal");
		this.CreateObjectPowerParameters("BMSInfo", "EnergyBatteryDischargedTotal");
		this.CreateObjectStateString("BMSInfo", "SerialNumber");
	}

	CreateObjectsControlParams() {
		this.setObjectNotExistsAsync("ControlParameter", {
			type: "channel",
			common: { name: "ControlParameter" },
			native: {},
		});
	
		this.CreateObjectControlParam("ControlParameter", "ShadowScanEnabled");
		this.CreateObjectControlParam("ControlParameter", "ShadowScanCycle");

		this.CreateObjectControlParam("ControlParameter", "BattMinSOCOnGrid");
		this.CreateObjectControlParam("ControlParameter", "BattMinSOCOffGrid");
		this.CreateObjectControlParam("ControlParameter", "BackupSOCHoldingEnabled");		
		this.CreateObjectControlParam("ControlParameter", "SOCProtectionDisabled");		
		
		this.CreateObjectControlParam("ControlParameter", "FastChargeEnabled");
		this.CreateObjectControlParam("ControlParameter", "FastChargeSOCStop");
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

	CreateObjectControlParam(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "channel",
			common: { name: "Name" },
			native: {},
		});

		this.setObjectNotExistsAsync(Path + "." + Name + ".Register", {
			type: "state",
			common: {
				name: "Register",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});

		this.setObjectNotExistsAsync(Path + "." + Name + ".Value", {
			type: "state",
			common: {
				name: "Value",
				type: "number",
				role: "value",
				read: true,
				write: true,
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

	UpdateDeviceInfo(AdapterInstance) {
/*
		try {
			await this.inverter.ReadDeviceInfo(this);
			this.log.debug("UpdateDeviceInfo new data received");
		}
		catch(ex) {
			this.log.error("UpdateDeviceInfo returned error -> " + ex);
			return;
		}
*/
		if(AdapterInstance == null) {
			return;
		}

		AdapterInstance.log.debug("UpdateDeviceInfo new data received");

		AdapterInstance.setStateAsync("DeviceInfo.ModbusProtocolVersion", AdapterInstance.inverter.DeviceInfo.ModbusProtocolVersion, true);
		AdapterInstance.setStateAsync("DeviceInfo.RatedPower", AdapterInstance.inverter.DeviceInfo.RatedPower, true);
		AdapterInstance.setStateAsync("DeviceInfo.AcOutputType", AdapterInstance.inverter.DeviceInfo.AcOutputType, true);
		AdapterInstance.setStateAsync("DeviceInfo.SerialNumber", AdapterInstance.inverter.DeviceInfo.SerialNumber, true);
		AdapterInstance.setStateAsync("DeviceInfo.DeviceType", AdapterInstance.inverter.DeviceInfo.DeviceType, true);
		AdapterInstance.setStateAsync("DeviceInfo.DSP1_SW_Version", AdapterInstance.inverter.DeviceInfo.DSP1_SoftwareVersion, true);
		AdapterInstance.setStateAsync("DeviceInfo.DSP2_SW_Version", AdapterInstance.inverter.DeviceInfo.DSP2_SoftwareVersion, true);
		AdapterInstance.setStateAsync("DeviceInfo.DSP_SVN_Version", AdapterInstance.inverter.DeviceInfo.DSP_SVN_Version, true);
		AdapterInstance.setStateAsync("DeviceInfo.ARM_SW_Version", AdapterInstance.inverter.DeviceInfo.ARM_SoftwareVersion, true);
		AdapterInstance.setStateAsync("DeviceInfo.ARM_SVN_Version", AdapterInstance.inverter.DeviceInfo.ARM_SVN_Version, true);
		AdapterInstance.setStateAsync("DeviceInfo.DSP_Int_FW_Version", AdapterInstance.inverter.DeviceInfo.DSP_IntFirmwareVersion, true);
		AdapterInstance.setStateAsync("DeviceInfo.ARM_Int_FW_Version", AdapterInstance.inverter.DeviceInfo.ARM_IntFirmwareVersion, true);
	
		AdapterInstance.setStateAsync("info.connection", AdapterInstance.inverter.Status, true);
	}

	UpdateRunningData(AdapterInstance) {

		if(AdapterInstance == null) {
			return;
		}

		AdapterInstance.log.debug("UpdateRunningData new data received");

		AdapterInstance.setStateAsync("RunningData.PV1.Voltage", AdapterInstance.inverter.RunningData.Pv1.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.PV1.Current", AdapterInstance.inverter.RunningData.Pv1.Current, true);
		AdapterInstance.setStateAsync("RunningData.PV1.Power.Value", AdapterInstance.inverter.RunningData.Pv1.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.PV1.Power.Unit", AdapterInstance.inverter.RunningData.Pv1.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PV1.Power.ValueAsString", AdapterInstance.inverter.RunningData.Pv1.Power.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.PV1.Mode", AdapterInstance.inverter.RunningData.Pv1.Mode, true);
		AdapterInstance.setStateAsync("RunningData.PV1.ModeLabel", AdapterInstance.inverter.RunningData.Pv1.ModeLabel, true);

		AdapterInstance.setStateAsync("RunningData.PV2.Voltage", AdapterInstance.inverter.RunningData.Pv2.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.PV2.Current", AdapterInstance.inverter.RunningData.Pv2.Current, true);
		AdapterInstance.setStateAsync("RunningData.PV2.Power.Value", AdapterInstance.inverter.RunningData.Pv2.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.PV2.Power.Unit", AdapterInstance.inverter.RunningData.Pv2.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PV2.Power.ValueAsString", AdapterInstance.inverter.RunningData.Pv2.Power.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.PV2.Mode", AdapterInstance.inverter.RunningData.Pv2.Mode, true);
		AdapterInstance.setStateAsync("RunningData.PV2.ModeLabel", AdapterInstance.inverter.RunningData.Pv2.ModeLabel, true);

		AdapterInstance.setStateAsync("RunningData.PV3.Voltage", AdapterInstance.inverter.RunningData.Pv3.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.PV3.Current", AdapterInstance.inverter.RunningData.Pv3.Current, true);
		AdapterInstance.setStateAsync("RunningData.PV3.Power.Value", AdapterInstance.inverter.RunningData.Pv3.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.PV3.Power.Unit", AdapterInstance.inverter.RunningData.Pv3.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PV3.Power.ValueAsString", AdapterInstance.inverter.RunningData.Pv3.Power.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.PV3.Mode", AdapterInstance.inverter.RunningData.Pv3.Mode, true);
		AdapterInstance.setStateAsync("RunningData.PV3.ModeLabel", AdapterInstance.inverter.RunningData.Pv3.ModeLabel, true);

		AdapterInstance.setStateAsync("RunningData.PV4.Voltage", AdapterInstance.inverter.RunningData.Pv4.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.PV4.Current", AdapterInstance.inverter.RunningData.Pv4.Current, true);
		AdapterInstance.setStateAsync("RunningData.PV4.Power.Value", AdapterInstance.inverter.RunningData.Pv4.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.PV4.Power.Unit", AdapterInstance.inverter.RunningData.Pv4.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PV4.Power.ValueAsString", AdapterInstance.inverter.RunningData.Pv4.Power.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.PV4.Mode", AdapterInstance.inverter.RunningData.Pv4.Mode, true);
		AdapterInstance.setStateAsync("RunningData.PV4.ModeLabel", AdapterInstance.inverter.RunningData.Pv4.ModeLabel, true);

		AdapterInstance.setStateAsync("RunningData.GridL1.Voltage", AdapterInstance.inverter.RunningData.GridL1.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.GridL1.Current", AdapterInstance.inverter.RunningData.GridL1.Current, true);
		AdapterInstance.setStateAsync("RunningData.GridL1.Frequency", AdapterInstance.inverter.RunningData.GridL1.Frequency, true);
		AdapterInstance.setStateAsync("RunningData.GridL1.Power.Value", AdapterInstance.inverter.RunningData.GridL1.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.GridL1.Power.Unit", AdapterInstance.inverter.RunningData.GridL1.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.GridL1.Power.ValueAsString", AdapterInstance.inverter.RunningData.GridL1.Power.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.GridL2.Voltage", AdapterInstance.inverter.RunningData.GridL2.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.GridL2.Current", AdapterInstance.inverter.RunningData.GridL2.Current, true);
		AdapterInstance.setStateAsync("RunningData.GridL2.Frequency", AdapterInstance.inverter.RunningData.GridL2.Frequency, true);
		AdapterInstance.setStateAsync("RunningData.GridL2.Power.Value", AdapterInstance.inverter.RunningData.GridL2.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.GridL2.Power.Unit", AdapterInstance.inverter.RunningData.GridL2.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.GridL2.Power.ValueAsString", AdapterInstance.inverter.RunningData.GridL2.Power.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.GridL3.Voltage", AdapterInstance.inverter.RunningData.GridL3.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.GridL3.Current", AdapterInstance.inverter.RunningData.GridL3.Current, true);
		AdapterInstance.setStateAsync("RunningData.GridL3.Frequency", AdapterInstance.inverter.RunningData.GridL3.Frequency, true);
		AdapterInstance.setStateAsync("RunningData.GridL3.Power.Value", AdapterInstance.inverter.RunningData.GridL3.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.GridL3.Power.Unit", AdapterInstance.inverter.RunningData.GridL3.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.GridL3.Power.ValueAsString", AdapterInstance.inverter.RunningData.GridL3.Power.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.GridMode", AdapterInstance.inverter.RunningData.GridMode, true);
		AdapterInstance.setStateAsync("RunningData.GridModeLabel", AdapterInstance.inverter.RunningData.GridModeLabel, true);

		AdapterInstance.setStateAsync("RunningData.PowerInverterOperation.Value", AdapterInstance.inverter.RunningData.PowerInverterOperation.Value, true);
		AdapterInstance.setStateAsync("RunningData.PowerInverterOperation.Unit", AdapterInstance.inverter.RunningData.PowerInverterOperation.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PowerInverterOperation.ValueAsString", AdapterInstance.inverter.RunningData.PowerInverterOperation.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.PowerActiveAC.Value", AdapterInstance.inverter.RunningData.PowerActiveAC.Value, true);
		AdapterInstance.setStateAsync("RunningData.PowerActiveAC.Unit", AdapterInstance.inverter.RunningData.PowerActiveAC.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PowerActiveAC.ValueAsString", AdapterInstance.inverter.RunningData.PowerActiveAC.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.PowerReactiveAC", AdapterInstance.inverter.RunningData.PowerReactiveAC, true);
		AdapterInstance.setStateAsync("RunningData.PowerApparentAC", AdapterInstance.inverter.RunningData.PowerApparentAC, true);

		AdapterInstance.setStateAsync("RunningData.GridInOutModeLabel", AdapterInstance.inverter.RunningData.GridInOutModeLabel, true);

		AdapterInstance.setStateAsync("RunningData.BackUpL1.Voltage", AdapterInstance.inverter.RunningData.BackUpL1.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL1.Current", AdapterInstance.inverter.RunningData.BackUpL1.Current, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL1.Frequency", AdapterInstance.inverter.RunningData.BackUpL1.Frequency, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL1.Power.Value", AdapterInstance.inverter.RunningData.BackUpL1.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL1.Power.Unit", AdapterInstance.inverter.RunningData.BackUpL1.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL1.Power.ValueAsString", AdapterInstance.inverter.RunningData.BackUpL1.Power.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL1.Mode", AdapterInstance.inverter.RunningData.BackUpL1.Mode, true);

		AdapterInstance.setStateAsync("RunningData.BackUpL2.Voltage", AdapterInstance.inverter.RunningData.BackUpL2.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL2.Current", AdapterInstance.inverter.RunningData.BackUpL2.Current, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL2.Frequency", AdapterInstance.inverter.RunningData.BackUpL2.Frequency, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL2.Power.Value", AdapterInstance.inverter.RunningData.BackUpL2.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL2.Power.Unit", AdapterInstance.inverter.RunningData.BackUpL2.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL2.Power.ValueAsString", AdapterInstance.inverter.RunningData.BackUpL2.Power.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL2.Mode", AdapterInstance.inverter.RunningData.BackUpL2.Mode, true);

		AdapterInstance.setStateAsync("RunningData.BackUpL3.Voltage", AdapterInstance.inverter.RunningData.BackUpL3.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL3.Current", AdapterInstance.inverter.RunningData.BackUpL3.Current, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL3.Frequency", AdapterInstance.inverter.RunningData.BackUpL3.Frequency, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL3.Power.Value", AdapterInstance.inverter.RunningData.BackUpL3.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL3.Power.Unit", AdapterInstance.inverter.RunningData.BackUpL3.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL3.Power.ValueAsString", AdapterInstance.inverter.RunningData.BackUpL3.Power.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.BackUpL3.Mode", AdapterInstance.inverter.RunningData.BackUpL3.Mode, true);

		AdapterInstance.setStateAsync("RunningData.PowerL1.Value", AdapterInstance.inverter.RunningData.PowerL1.Value, true);
		AdapterInstance.setStateAsync("RunningData.PowerL1.Unit", AdapterInstance.inverter.RunningData.PowerL1.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PowerL1.ValueAsString", AdapterInstance.inverter.RunningData.PowerL1.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.PowerL2.Value", AdapterInstance.inverter.RunningData.PowerL2.Value, true);
		AdapterInstance.setStateAsync("RunningData.PowerL2.Unit", AdapterInstance.inverter.RunningData.PowerL2.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PowerL2.ValueAsString", AdapterInstance.inverter.RunningData.PowerL2.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.PowerL3.Value", AdapterInstance.inverter.RunningData.PowerL3.Value, true);
		AdapterInstance.setStateAsync("RunningData.PowerL3.Unit", AdapterInstance.inverter.RunningData.PowerL3.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PowerL3.ValueAsString", AdapterInstance.inverter.RunningData.PowerL3.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.PowerBackUpLine.Value", AdapterInstance.inverter.RunningData.PowerBackUpLine.Value, true);
		AdapterInstance.setStateAsync("RunningData.PowerBackUpLine.Unit", AdapterInstance.inverter.RunningData.PowerBackUpLine.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PowerBackUpLine.ValueAsString", AdapterInstance.inverter.RunningData.PowerBackUpLine.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.PowerGridLine.Value", AdapterInstance.inverter.RunningData.PowerGridLine.Value, true);
		AdapterInstance.setStateAsync("RunningData.PowerGridLine.Unit", AdapterInstance.inverter.RunningData.PowerGridLine.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PowerGridLine.ValueAsString", AdapterInstance.inverter.RunningData.PowerGridLine.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.UpsLoadPercent", AdapterInstance.inverter.RunningData.UpsLoadPercent, true);
		AdapterInstance.setStateAsync("RunningData.AirTemperature", AdapterInstance.inverter.RunningData.AirTemperature, true);
		AdapterInstance.setStateAsync("RunningData.ModulTemperature", AdapterInstance.inverter.RunningData.ModulTemperature, true);
		AdapterInstance.setStateAsync("RunningData.RadiatorTemperature", AdapterInstance.inverter.RunningData.RadiatorTemperature, true);
		AdapterInstance.setStateAsync("RunningData.FunctionBitValue", AdapterInstance.inverter.RunningData.FunctionBitValue, true);
		AdapterInstance.setStateAsync("RunningData.BusVoltage", AdapterInstance.inverter.RunningData.BusVoltage, true);
		AdapterInstance.setStateAsync("RunningData.NbusVoltage", AdapterInstance.inverter.RunningData.NbusVoltage, true);

		AdapterInstance.setStateAsync("RunningData.Battery1.Voltage", AdapterInstance.inverter.RunningData.Battery1.Voltage, true);
		AdapterInstance.setStateAsync("RunningData.Battery1.Current", AdapterInstance.inverter.RunningData.Battery1.Current, true);
		AdapterInstance.setStateAsync("RunningData.Battery1.Power.Value", AdapterInstance.inverter.RunningData.Battery1.Power.Value, true);
		AdapterInstance.setStateAsync("RunningData.Battery1.Power.Unit", AdapterInstance.inverter.RunningData.Battery1.Power.Unit, true);
		AdapterInstance.setStateAsync("RunningData.Battery1.Power.ValueAsString", AdapterInstance.inverter.RunningData.Battery1.Power.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.Battery1.Mode", AdapterInstance.inverter.RunningData.Battery1.Mode, true);
		AdapterInstance.setStateAsync("RunningData.Battery1.ModeLabel", AdapterInstance.inverter.RunningData.Battery1.ModeLabel, true);

		AdapterInstance.setStateAsync("RunningData.WarningCode", AdapterInstance.inverter.RunningData.WarningCode, true);
		AdapterInstance.setStateAsync("RunningData.SafetyCountry", AdapterInstance.inverter.RunningData.SafetyCountry, true);
		AdapterInstance.setStateAsync("RunningData.SafetyCountryLabel", AdapterInstance.inverter.RunningData.SafetyCountryLabel, true);
		AdapterInstance.setStateAsync("RunningData.WorkMode", AdapterInstance.inverter.RunningData.WorkMode, true);
		AdapterInstance.setStateAsync("RunningData.WorkModeLabel", AdapterInstance.inverter.RunningData.WorkModeLabel, true);
		AdapterInstance.setStateAsync("RunningData.OperationMode", AdapterInstance.inverter.RunningData.OperationMode, true);
		AdapterInstance.setStateAsync("RunningData.ErrorMessage", AdapterInstance.inverter.RunningData.ErrorMessage, true);
		AdapterInstance.setStateAsync("RunningData.ErrorMessageLabel", AdapterInstance.inverter.RunningData.ErrorMessageLabel, true);

		AdapterInstance.setStateAsync("RunningData.EnergyPvTotal.Value", AdapterInstance.inverter.RunningData.EnergyPvTotal.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyPvTotal.Unit", AdapterInstance.inverter.RunningData.EnergyPvTotal.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyPvTotal.ValueAsString", AdapterInstance.inverter.RunningData.EnergyPvTotal.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.EnergyPvToday.Value", AdapterInstance.inverter.RunningData.EnergyPvToday.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyPvToday.Unit", AdapterInstance.inverter.RunningData.EnergyPvToday.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyPvToday.ValueAsString", AdapterInstance.inverter.RunningData.EnergyPvToday.ValueAsString, true);
		AdapterInstance.setStateAsync("RunningData.EnergyInverterOutTotal.Value", AdapterInstance.inverter.RunningData.EnergyInverterOutTotal.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyInverterOutTotal.Unit", AdapterInstance.inverter.RunningData.EnergyInverterOutTotal.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyInverterOutTotal.ValueAsString", AdapterInstance.inverter.RunningData.EnergyInverterOutTotal.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.HoursTotal", AdapterInstance.inverter.RunningData.HoursTotal, true);

		AdapterInstance.setStateAsync("RunningData.EnergyInverterOutToday.Value", AdapterInstance.inverter.RunningData.EnergyInverterOutToday.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyInverterOutToday.Unit", AdapterInstance.inverter.RunningData.EnergyInverterOutToday.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyInverterOutToday.ValueAsString", AdapterInstance.inverter.RunningData.EnergyInverterOutToday.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.EnergyInverterInTotal.Value", AdapterInstance.inverter.RunningData.EnergyInverterInTotal.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyInverterInTotal.Unit", AdapterInstance.inverter.RunningData.EnergyInverterInTotal.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyInverterInTotal.ValueAsString", AdapterInstance.inverter.RunningData.EnergyInverterInTotal.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.EnergyInverterInToday.Value", AdapterInstance.inverter.RunningData.EnergyInverterInToday.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyInverterInToday.Unit", AdapterInstance.inverter.RunningData.EnergyInverterInToday.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyInverterInToday.ValueAsString", AdapterInstance.inverter.RunningData.EnergyInverterInToday.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.EnergyLoadTotal.Value", AdapterInstance.inverter.RunningData.EnergyLoadTotal.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyLoadTotal.Unit", AdapterInstance.inverter.RunningData.EnergyLoadTotal.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyLoadTotal.ValueAsString", AdapterInstance.inverter.RunningData.EnergyLoadTotal.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.EnergyLoadToday.Value", AdapterInstance.inverter.RunningData.EnergyLoadToday.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyLoadToday.Unit", AdapterInstance.inverter.RunningData.EnergyLoadToday.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyLoadToday.ValueAsString", AdapterInstance.inverter.RunningData.EnergyLoadToday.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.EnergyBatteryChargeTotal.Value", AdapterInstance.inverter.RunningData.EnergyBatteryChargeTotal.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyBatteryChargeTotal.Unit", AdapterInstance.inverter.RunningData.EnergyBatteryChargeTotal.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyBatteryChargeTotal.ValueAsString", AdapterInstance.inverter.RunningData.EnergyBatteryChargeTotal.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.EnergyBatteryChargeToday.Value", AdapterInstance.inverter.RunningData.EnergyBatteryChargeToday.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyBatteryChargeToday.Unit", AdapterInstance.inverter.RunningData.EnergyBatteryChargeToday.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyBatteryChargeToday.ValueAsString", AdapterInstance.inverter.RunningData.EnergyBatteryChargeToday.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.EnergyBatteryDischargeTotal.Value", AdapterInstance.inverter.RunningData.EnergyBatteryDischargeTotal.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyBatteryDischargeTotal.Unit", AdapterInstance.inverter.RunningData.EnergyBatteryDischargeTotal.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyBatteryDischargeTotal.ValueAsString", AdapterInstance.inverter.RunningData.EnergyBatteryDischargeTotal.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.EnergyBatteryDischargeToday.Value", AdapterInstance.inverter.RunningData.EnergyBatteryDischargeToday.Value, true);
		AdapterInstance.setStateAsync("RunningData.EnergyBatteryDischargeToday.Unit", AdapterInstance.inverter.RunningData.EnergyBatteryDischargeToday.Unit, true);
		AdapterInstance.setStateAsync("RunningData.EnergyBatteryDischargeToday.ValueAsString", AdapterInstance.inverter.RunningData.EnergyBatteryDischargeToday.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.BatteryStrings", AdapterInstance.inverter.RunningData.BatteryStrings, true);
		AdapterInstance.setStateAsync("RunningData.CpldWarningCode", AdapterInstance.inverter.RunningData.CpldWarningCode, true);
		AdapterInstance.setStateAsync("RunningData.WChargeCtrFlag", AdapterInstance.inverter.RunningData.WChargeCtrFlag, true);
		AdapterInstance.setStateAsync("RunningData.DerateFrozenPower", AdapterInstance.inverter.RunningData.DerateFrozenPower, true);
		AdapterInstance.setStateAsync("RunningData.DiagStatusHigh", AdapterInstance.inverter.RunningData.DiagStatusHigh, true);
		AdapterInstance.setStateAsync("RunningData.DiagStatusLow", AdapterInstance.inverter.RunningData.DiagStatusLow, true);
		AdapterInstance.setStateAsync("RunningData.DiagStatusLowAsString", AdapterInstance.inverter.RunningData.DiagStatusLowAsString, true);

		AdapterInstance.setStateAsync("RunningData.PowerAllPv.Value", AdapterInstance.inverter.RunningData.PowerAllPv.Value, true);
		AdapterInstance.setStateAsync("RunningData.PowerAllPv.Unit", AdapterInstance.inverter.RunningData.PowerAllPv.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PowerAllPv.ValueAsString", AdapterInstance.inverter.RunningData.PowerAllPv.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.PowerHouseConsumptionPv.Value", AdapterInstance.inverter.RunningData.PowerHouseConsumptionPv.Value, true);
		AdapterInstance.setStateAsync("RunningData.PowerHouseConsumptionPv.Unit", AdapterInstance.inverter.RunningData.PowerHouseConsumptionPv.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PowerHouseConsumptionPv.ValueAsString", AdapterInstance.inverter.RunningData.PowerHouseConsumptionPv.ValueAsString, true);

		AdapterInstance.setStateAsync("RunningData.PowerHouseConsumptionAC.Value", AdapterInstance.inverter.RunningData.PowerHouseConsumptionAC.Value, true);
		AdapterInstance.setStateAsync("RunningData.PowerHouseConsumptionAC.Unit", AdapterInstance.inverter.RunningData.PowerHouseConsumptionAC.Unit, true);
		AdapterInstance.setStateAsync("RunningData.PowerHouseConsumptionAC.ValueAsString", AdapterInstance.inverter.RunningData.PowerHouseConsumptionAC.ValueAsString, true);

	}
	
	UpdateExtComData(AdapterInstance) {

		if(AdapterInstance == null) {
			return;
		}

		AdapterInstance.log.debug("UpdateExtComData new data received");

		AdapterInstance.setStateAsync("ExtComData.Commode", AdapterInstance.inverter.ExtComData.Commode, true);
		AdapterInstance.setStateAsync("ExtComData.Rssi", AdapterInstance.inverter.ExtComData.Rssi, true);
		AdapterInstance.setStateAsync("ExtComData.ManufacturerCode", AdapterInstance.inverter.ExtComData.ManufacturerCode, true);
		AdapterInstance.setStateAsync("ExtComData.MeterConnectStatus", AdapterInstance.inverter.ExtComData.MeterConnectStatus, true);
		AdapterInstance.setStateAsync("ExtComData.MeterCommunicateStatus", AdapterInstance.inverter.ExtComData.MeterCommunicateStatus, true);
		AdapterInstance.setStateAsync("ExtComData.L1.ActivePower", AdapterInstance.inverter.ExtComData.L1.ActivePower, true);
		AdapterInstance.setStateAsync("ExtComData.L1.PowerFactor", AdapterInstance.inverter.ExtComData.L1.PowerFactor, true);
		AdapterInstance.setStateAsync("ExtComData.L2.ActivePower", AdapterInstance.inverter.ExtComData.L2.ActivePower, true);
		AdapterInstance.setStateAsync("ExtComData.L2.PowerFactor", AdapterInstance.inverter.ExtComData.L2.PowerFactor, true);
		AdapterInstance.setStateAsync("ExtComData.L3.ActivePower", AdapterInstance.inverter.ExtComData.L3.ActivePower, true);
		AdapterInstance.setStateAsync("ExtComData.L3.PowerFactor", AdapterInstance.inverter.ExtComData.L3.PowerFactor, true);
		AdapterInstance.setStateAsync("ExtComData.TotalActivePower", AdapterInstance.inverter.ExtComData.TotalActivePower, true);
		AdapterInstance.setStateAsync("ExtComData.TotalReactivePower", AdapterInstance.inverter.ExtComData.TotalReactivePower, true);
		AdapterInstance.setStateAsync("ExtComData.PowerFactor", AdapterInstance.inverter.ExtComData.PowerFactor, true);
		AdapterInstance.setStateAsync("ExtComData.Frequency", AdapterInstance.inverter.ExtComData.Frequency, true);
		AdapterInstance.setStateAsync("ExtComData.EnergyTotalSell.Value", AdapterInstance.inverter.ExtComData.EnergyTotalSell.Value, true);
		AdapterInstance.setStateAsync("ExtComData.EnergyTotalSell.Unit", AdapterInstance.inverter.ExtComData.EnergyTotalSell.Unit, true);
		AdapterInstance.setStateAsync("ExtComData.EnergyTotalSell.ValueAsString", AdapterInstance.inverter.ExtComData.EnergyTotalSell.ValueAsString, true);
		AdapterInstance.setStateAsync("ExtComData.EnergyTotalBuy.Value", AdapterInstance.inverter.ExtComData.EnergyTotalBuy.Value, true);
		AdapterInstance.setStateAsync("ExtComData.EnergyTotalBuy.Unit", AdapterInstance.inverter.ExtComData.EnergyTotalBuy.Unit, true);
		AdapterInstance.setStateAsync("ExtComData.EnergyTotalBuy.ValueAsString", AdapterInstance.inverter.ExtComData.EnergyTotalBuy.ValueAsString, true);
	}
	
	UpdateBmsInfo(AdapterInstance) {

		if(AdapterInstance == null) {
			return;
		}

		AdapterInstance.log.debug("UpdateBmsInfo new data received");

		AdapterInstance.setStateAsync("BMSInfo.Status", AdapterInstance.inverter.BmsInfo.Status, true);
		AdapterInstance.setStateAsync("BMSInfo.PackTemperature", AdapterInstance.inverter.BmsInfo.PackTemperature, true);
		AdapterInstance.setStateAsync("BMSInfo.MaxChargeCurrent", AdapterInstance.inverter.BmsInfo.MaxChargeCurrent, true);
		AdapterInstance.setStateAsync("BMSInfo.MaxDischargeCurrent", AdapterInstance.inverter.BmsInfo.MaxDischargeCurrent, true);
		AdapterInstance.setStateAsync("BMSInfo.ErrorCodeLow", AdapterInstance.inverter.BmsInfo.ErrorCodeLow, true);
		AdapterInstance.setStateAsync("BMSInfo.SOC", AdapterInstance.inverter.BmsInfo.SOC, true);
		AdapterInstance.setStateAsync("BMSInfo.SOH", AdapterInstance.inverter.BmsInfo.SOH, true);
		AdapterInstance.setStateAsync("BMSInfo.BatteryStrings", AdapterInstance.inverter.BmsInfo.BatteryStrings, true);
		AdapterInstance.setStateAsync("BMSInfo.WarningCodeLow", AdapterInstance.inverter.BmsInfo.WarningCodeLow, true);
		AdapterInstance.setStateAsync("BMSInfo.Protocol", AdapterInstance.inverter.BmsInfo.Protocol, true);
		AdapterInstance.setStateAsync("BMSInfo.ErrorCodeHigh", AdapterInstance.inverter.BmsInfo.ErrorCodeHigh, true);
		AdapterInstance.setStateAsync("BMSInfo.WarningCodeHigh", AdapterInstance.inverter.BmsInfo.WarningCodeHigh, true);
		AdapterInstance.setStateAsync("BMSInfo.VersionSW", AdapterInstance.inverter.BmsInfo.VersionSW, true);
		AdapterInstance.setStateAsync("BMSInfo.VersionHW", AdapterInstance.inverter.BmsInfo.VersionHW, true);
		AdapterInstance.setStateAsync("BMSInfo.MaxCellTempID", AdapterInstance.inverter.BmsInfo.MaxCellTempID, true);
		AdapterInstance.setStateAsync("BMSInfo.MinCellTempID", AdapterInstance.inverter.BmsInfo.MinCellTempID, true);
		AdapterInstance.setStateAsync("BMSInfo.MaxCellVoltageID", AdapterInstance.inverter.BmsInfo.MaxCellVoltageID, true);
		AdapterInstance.setStateAsync("BMSInfo.MinCellVoltageID", AdapterInstance.inverter.BmsInfo.MinCellVoltageID, true);
		AdapterInstance.setStateAsync("BMSInfo.MaxCellTemperature", AdapterInstance.inverter.BmsInfo.MaxCellTemperature, true);
		AdapterInstance.setStateAsync("BMSInfo.MinCellTemperature", AdapterInstance.inverter.BmsInfo.MinCellTemperature, true);
		AdapterInstance.setStateAsync("BMSInfo.MaxCellVoltage", AdapterInstance.inverter.BmsInfo.MaxCellVoltage, true);
		AdapterInstance.setStateAsync("BMSInfo.MinCellVoltage", AdapterInstance.inverter.BmsInfo.MinCellVoltage, true);

		AdapterInstance.setStateAsync("BMSInfo.EnergyBatteryChargedTotal.Value", AdapterInstance.inverter.BmsInfo.EnergyBatteryChargedTotal.Value, true);
		AdapterInstance.setStateAsync("BMSInfo.EnergyBatteryChargedTotal.Unit", AdapterInstance.inverter.BmsInfo.EnergyBatteryChargedTotal.Unit, true);
		AdapterInstance.setStateAsync("BMSInfo.EnergyBatteryChargedTotal.ValueAsString", AdapterInstance.inverter.BmsInfo.EnergyBatteryChargedTotal.ValueAsString, true);
		AdapterInstance.setStateAsync("BMSInfo.EnergyBatteryDischargedTotal.Value", AdapterInstance.inverter.BmsInfo.EnergyBatteryDischargedTotal.Value, true);
		AdapterInstance.setStateAsync("BMSInfo.EnergyBatteryDischargedTotal.Unit", AdapterInstance.inverter.BmsInfo.EnergyBatteryDischargedTotal.Unit, true);
		AdapterInstance.setStateAsync("BMSInfo.EnergyBatteryDischargedTotal.ValueAsString", AdapterInstance.inverter.BmsInfo.EnergyBatteryDischargedTotal.ValueAsString, true);
		AdapterInstance.setStateAsync("BMSInfo.SerialNumber", AdapterInstance.inverter.BmsInfo.SerialNumber, true);
	}

	UpdateControlParamsBlock1(AdapterInstance) {

		if(AdapterInstance == null) {
			return;
		}

		AdapterInstance.log.debug("UpdateControlParamsBlock1 new data received");

		AdapterInstance.setStateAsync("ControlParameter.ShadowScanEnabled.Register", AdapterInstance.inverter.ControlParameter.ShadowScanEnabled.Register, true);
		AdapterInstance.setStateAsync("ControlParameter.ShadowScanEnabled.Value", AdapterInstance.inverter.ControlParameter.ShadowScanEnabled.Value, true);
		AdapterInstance.setStateAsync("ControlParameter.ShadowScanEnabled.Unit", AdapterInstance.inverter.ControlParameter.ShadowScanEnabled.Unit, true);
		AdapterInstance.setStateAsync("ControlParameter.ShadowScanEnabled.ValueAsString", AdapterInstance.inverter.ControlParameter.ShadowScanEnabled.ValueAsString, true);

		AdapterInstance.setStateAsync("ControlParameter.ShadowScanCycle.Register", AdapterInstance.inverter.ControlParameter.ShadowScanCycle.Register, true);
		AdapterInstance.setStateAsync("ControlParameter.ShadowScanCycle.Value", AdapterInstance.inverter.ControlParameter.ShadowScanCycle.Value, true);
		AdapterInstance.setStateAsync("ControlParameter.ShadowScanCycle.Unit", AdapterInstance.inverter.ControlParameter.ShadowScanCycle.Unit, true);
		AdapterInstance.setStateAsync("ControlParameter.ShadowScanCycle.ValueAsString", AdapterInstance.inverter.ControlParameter.ShadowScanCycle.ValueAsString, true);
	}

	UpdateControlParamsBlock2(AdapterInstance) {

		if(AdapterInstance == null) {
			return;
		}

		AdapterInstance.log.debug("UpdateControlParamsBlock2 new data received");

		AdapterInstance.setStateAsync("ControlParameter.BattMinSOCOnGrid.Register", AdapterInstance.inverter.ControlParameter.BattMinSOCOnGrid.Register, true);
		AdapterInstance.setStateAsync("ControlParameter.BattMinSOCOnGrid.Value", AdapterInstance.inverter.ControlParameter.BattMinSOCOnGrid.Value, true);
		AdapterInstance.setStateAsync("ControlParameter.BattMinSOCOnGrid.Unit", AdapterInstance.inverter.ControlParameter.BattMinSOCOnGrid.Unit, true);
		AdapterInstance.setStateAsync("ControlParameter.BattMinSOCOnGrid.ValueAsString", AdapterInstance.inverter.ControlParameter.BattMinSOCOnGrid.ValueAsString, true);

		AdapterInstance.setStateAsync("ControlParameter.BattMinSOCOffGrid.Register", AdapterInstance.inverter.ControlParameter.BattMinSOCOffGrid.Register, true);
		AdapterInstance.setStateAsync("ControlParameter.BattMinSOCOffGrid.Value", AdapterInstance.inverter.ControlParameter.BattMinSOCOffGrid.Value, true);
		AdapterInstance.setStateAsync("ControlParameter.BattMinSOCOffGrid.Unit", AdapterInstance.inverter.ControlParameter.BattMinSOCOffGrid.Unit, true);
		AdapterInstance.setStateAsync("ControlParameter.BattMinSOCOffGrid.ValueAsString", AdapterInstance.inverter.ControlParameter.BattMinSOCOffGrid.ValueAsString, true);
	}
	
	UpdateControlParamsBlock3(AdapterInstance) {

		if(AdapterInstance == null) {
			return;
		}

		AdapterInstance.log.debug("UpdateControlParamsBlock3 new data received");

		AdapterInstance.setStateAsync("ControlParameter.SOCProtectionDisabled.Register", AdapterInstance.inverter.ControlParameter.SOCProtectionDisabled.Register, true);
		AdapterInstance.setStateAsync("ControlParameter.SOCProtectionDisabled.Value", AdapterInstance.inverter.ControlParameter.SOCProtectionDisabled.Value, true);
		AdapterInstance.setStateAsync("ControlParameter.SOCProtectionDisabled.Unit", AdapterInstance.inverter.ControlParameter.SOCProtectionDisabled.Unit, true);
		AdapterInstance.setStateAsync("ControlParameter.SOCProtectionDisabled.ValueAsString", AdapterInstance.inverter.ControlParameter.SOCProtectionDisabled.ValueAsString, true);

		AdapterInstance.setStateAsync("ControlParameter.BackupSOCHoldingEnabled.Register", AdapterInstance.inverter.ControlParameter.BackupSOCHoldingEnabled.Register, true);
		AdapterInstance.setStateAsync("ControlParameter.BackupSOCHoldingEnabled.Value", AdapterInstance.inverter.ControlParameter.BackupSOCHoldingEnabled.Value, true);
		AdapterInstance.setStateAsync("ControlParameter.BackupSOCHoldingEnabled.Unit", AdapterInstance.inverter.ControlParameter.BackupSOCHoldingEnabled.Unit, true);
		AdapterInstance.setStateAsync("ControlParameter.BackupSOCHoldingEnabled.ValueAsString", AdapterInstance.inverter.ControlParameter.BackupSOCHoldingEnabled.ValueAsString, true);

		AdapterInstance.setStateAsync("ControlParameter.FastChargeEnabled.Register", AdapterInstance.inverter.ControlParameter.FastChargeEnabled.Register, true);
		AdapterInstance.setStateAsync("ControlParameter.FastChargeEnabled.Value", AdapterInstance.inverter.ControlParameter.FastChargeEnabled.Value, true);
		AdapterInstance.setStateAsync("ControlParameter.FastChargeEnabled.Unit", AdapterInstance.inverter.ControlParameter.FastChargeEnabled.Unit, true);
		AdapterInstance.setStateAsync("ControlParameter.FastChargeEnabled.ValueAsString", AdapterInstance.inverter.ControlParameter.FastChargeEnabled.ValueAsString, true);

		AdapterInstance.setStateAsync("ControlParameter.FastChargeSOCStop.Register", AdapterInstance.inverter.ControlParameter.FastChargeSOCStop.Register, true);
		AdapterInstance.setStateAsync("ControlParameter.FastChargeSOCStop.Value", AdapterInstance.inverter.ControlParameter.FastChargeSOCStop.Value, true);
		AdapterInstance.setStateAsync("ControlParameter.FastChargeSOCStop.Unit", AdapterInstance.inverter.ControlParameter.FastChargeSOCStop.Unit, true);
		AdapterInstance.setStateAsync("ControlParameter.FastChargeSOCStop.ValueAsString", AdapterInstance.inverter.ControlParameter.FastChargeSOCStop.ValueAsString, true);
	}

	async myTimer() {	
		if (this.inverter.Status == false) {
			this.cycleCnt = 0;
			this.inverter.ReadIdInfo(this);
		} else {
		
			switch (this.cycleCnt) {
				case 1:
					this.inverter.ReadDeviceInfo(this, this.UpdateDeviceInfo);
					break;
				case 5:
					this.inverter.ReadRunningData(this, this.UpdateRunningData);
					break;
				case 10:
					this.inverter.ReadExtComData(this, this.UpdateExtComData);
					break;
				case 15:
					this.inverter.ReadBmsInfo(this, this.UpdateBmsInfo);
					break;
				case 20:
					this.inverter.ReadControlDataBlock1(this, this.UpdateControlParamsBlock1);
					break;				
				case 25:
					this.inverter.ReadControlDataBlock2(this, this.UpdateControlParamsBlock2);
					break;				
				case 30:
					this.inverter.ReadControlDataBlock3(this, this.UpdateControlParamsBlock3);
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

	async WriteControlValue(id, state) {

		if(id.endsWith(".Value") == false) {
			return;
		}
		const idRegister = id.replace(".Value", ".Register");

		let valRegister = await this.getStateAsync(idRegister);

		let Param = this.inverter.ControlParameter.GetParameterForRegister(valRegister?.val);
		if( Param == null) {
			return;
		}

		Param.Value = state.val;

		this.inverter.WriteControlParameter(Param);

		this.inverter.ReadControlParameter(Param.Name, Param, null, null);
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
//# sourceMappingURL=main.js.map