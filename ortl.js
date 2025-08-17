import * as fz from "zigbee-herdsman-converters/converters/fromZigbee";
import * as tz from "zigbee-herdsman-converters/converters/toZigbee";
import * as exposes from "zigbee-herdsman-converters/lib/exposes";
import * as reporting from "zigbee-herdsman-converters/lib/reporting";

const e = exposes.presets;
const ea = exposes.access;

export default {
    zigbeeModel: ["OTR1"],
    model: "OTR1",
    vendor: "Hive",
    description: "Single channel receiver",
    fromZigbee: [fz.thermostat, fz.thermostat_weekly_schedule],
    toZigbee: [
        tz.thermostat_local_temperature,
        tz.thermostat_system_mode,
        tz.thermostat_running_state,
        tz.thermostat_occupied_heating_setpoint,
        tz.thermostat_control_sequence_of_operation,
        tz.thermostat_weekly_schedule,
        tz.thermostat_clear_weekly_schedule,
        tz.thermostat_temperature_setpoint_hold,
        tz.thermostat_temperature_setpoint_hold_duration,
    ],
    exposes: [
        e
            .climate()
            .withSetpoint("occupied_heating_setpoint", 5, 32, 0.5)
            .withLocalTemperature()
            .withSystemMode(["off", "auto", "heat"])
            .withRunningState(["idle", "heat"]),
        e
            .binary("temperature_setpoint_hold", ea.ALL, true, false)
            .withDescription(
                "Prevent changes. `false` = run normally. `true` = prevent from making changes." +
                    " Must be set to `false` when system_mode = off or `true` for heat",
            ),
        e
            .numeric("temperature_setpoint_hold_duration", ea.ALL)
            .withValueMin(0)
            .withValueMax(65535)
            .withDescription(
                "Period in minutes for which the setpoint hold will be active. 65535 = attribute not" + " used. 0 to 360 to match the remote display",
            ),
    ],
    meta: {disableDefaultResponse: true},
    configure: async (device, coordinatorEndpoint) => {
        const endpoint = device.getEndpoint(5);
        const binds = ["genBasic", "genIdentify", "genAlarms", "genTime", "hvacThermostat"];
        await reporting.bind(endpoint, coordinatorEndpoint, binds);
        await reporting.thermostatTemperature(endpoint);
        await reporting.thermostatRunningState(endpoint);
        await reporting.thermostatSystemMode(endpoint);
        await reporting.thermostatOccupiedHeatingSetpoint(endpoint);
        await reporting.thermostatTemperatureSetpointHold(endpoint);
        await reporting.thermostatTemperatureSetpointHoldDuration(endpoint);
    },
};