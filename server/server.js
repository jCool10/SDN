const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const { RuleModel, MainModel } = require("./model");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

const RYU_API_URL = "http://192.168.88.107:8080"; // Giả sử ryu-manager chạy trên cổng 8080
// const RYU_API_URL = "http://192.168.228.139:8080"; // Giả sử ryu-manager chạy trên cổng 8080
// const RYU_API_URL = "http://localhost:8080"; // Giả sử ryu-manager chạy trên cổng 8080
const URL_DB =
  "mongodb+srv://valentinohoang1908:valentinohoang1908@cluster0.sayhxfh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(URL_DB)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

const toPaddedHexString = (number) => {
  const hex = number.toString(16);
  return hex.padStart(16, "0");
};

app.get("/firewall/rules/init", async (req, res) => {
  try {
    const findRules = await RuleModel.find();

    res.json(findRules);
  } catch (error) {
    console.log(error);
  }
});

/**
 Get ports stats
  Method GET
  URL /stats/port/<dpid>[/<port>]
 */

app.get("/stats/port/:dpid/:port?", async (req, res) => {
  try {
    const { dpid, port } = req.params;

    if (port) {
      const response = await axios.get(
        `${RYU_API_URL}/stats/port/${dpid}/${port}`
      );

      res.json(response.data);
    } else {
      const response = await axios.get(`${RYU_API_URL}/stats/port/${dpid}`);

      res.json(response.data);
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 Get all switches
 Method GET
 URL 	/stats/switches
 */
app.get("/stats/switches", async (req, res) => {
  try {
    const response = await axios.get(`${RYU_API_URL}/stats/switches`);

    const switches = response.data;

    switches.map(async (sw) => {
      const switchHex = toPaddedHexString(sw);
      const findSwitch = await MainModel.findOne({ switch_id: switchHex });

      if (!findSwitch) {
        await MainModel.create({ switch_id: switchHex });
      }
    });

    const findSwitches = await MainModel.find();

    res.json(findSwitches);
  } catch (error) {
    console.log(error);
  }
});

/**
Acquiring Enable/Disable State of All Switches
Method	GET
URL	/firewall/module/status
 */
app.get("/firewall/module/status", async (req, res) => {
  try {
    const response = await axios.get(`${RYU_API_URL}/firewall/module/status`);

    res.json(response.data);
  } catch (error) {
    console.log(error);
  }
});

/*
Changing Enable/Disable State of All Switches
Method	PUT
URL	
/firewall/module/{op}/{switch}

–op: [ “enable” | “disable” ]

–switch: [ “all” | Switch ID ]

Remarks	Initial state of each switch is “disable”
*/

app.put("/firewall/module/:op/:sw", async (req, res) => {
  try {
    const { op, sw } = req.params;

    // find switch in database with switch_id = [ “all” | sw ] and update status
    if (sw === "all") {
      await MainModel.updateMany({}, { status: op });
    } else {
      await MainModel.updateOne({ switch_id: sw }, { status: op });
    }

    const response = await axios.put(
      `${RYU_API_URL}/firewall/module/${op}/${sw}`
    );

    res.json(response.data);
  } catch (error) {
    console.log(error);
  }
});

/*
Acquiring All Rules
Method	GET
URL	
/firewall/rules/{switch}[/{vlan}]

–switch: [ “all” | Switch ID ]

–vlan: [ “all” | VLAN ID ]

Remarks	Specification of VLAN ID is optional.
*/

app.get("/firewall/rules/:sw/:vlan?", async (req, res) => {
  try {
    const { sw, vlan } = req.params;

    if (vlan) {
      const response = await axios.get(
        `${RYU_API_URL}/firewall/rules/${sw}/${vlan}`
      );

      res.json(response.data);
    } else {
      const response = await axios.get(`${RYU_API_URL}/firewall/rules/${sw}`);

      res.json(response.data);
    }
  } catch (error) {
    console.log(error);
  }
});

/*
Adding Rules
Method	POST
URL	
/firewall/rules/{switch}[/{vlan}]

–switch: [ “all” | Switch ID ]

–vlan: [ “all” | VLAN ID ]

Data	
priority:[ 0 - 65535 ]

in_port:[ 0 - 65535 ]

dl_src:”<xx:xx:xx:xx:xx:xx>”

dl_dst:”<xx:xx:xx:xx:xx:xx>”

dl_type:[ “ARP” | “IPv4” | “IPv6” ]

nw_src:”<xxx.xxx.xxx.xxx/xx>”

nw_dst:”<xxx.xxx.xxx.xxx/xx>”

ipv6_src:”<xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx/xx>”

ipv6_dst:”<xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx/xx>”

nw_proto”:[ “TCP” | “UDP” | “ICMP” | “ICMPv6” ]

tp_src:[ 0 - 65535 ]

tp_dst:[ 0 - 65535 ]

actions: [ “ALLOW” | “DENY” ]

Remarks	
When it is successfully registered, Rule ID is generated and is noted in the response.

Specification of VLAN ID is optional.
*/

app.post("/firewall/rules/:sw/:vlan?", async (req, res) => {
  try {
    const { sw, vlan } = req.params;
    const data = req.body;

    const rules = { ...data };
    delete rules.dl_type;

    if (vlan) {
      const response = await axios.post(
        `${RYU_API_URL}/firewall/rules/${sw}/${vlan}`,
        rules
      );

      const ruleId =
        response.data[0].command_result[0].details.match(/rule_id=(\d+)/);

      if (sw === "all") {
        await MainModel.findOneAndUpdate(
          {},
          {
            $push: {
              "access_control_list.0.rules": { ...rules, rule_id: ruleId },
            },
          },
          { new: true }
        );
      } else {
        await MainModel.findOneAndUpdate(
          { switch_id: sw },
          {
            $push: {
              "access_control_list.0.rules": { ...rules, rule_id: ruleId },
            },
          },
          { new: true }
        );
      }

      res.json(response.data);
    } else {
      const response = await axios.post(
        `${RYU_API_URL}/firewall/rules/${sw}`,
        rules
      );

      const ruleId =
        response.data[0].command_result[0].details.match(/rule_id=(\d+)/)[1];

      if (sw === "all") {
        await MainModel.findOneAndUpdate(
          {},
          {
            $push: {
              "access_control_list.0.rules": { ...rules, rule_id: ruleId },
            },
          },
          { new: true }
        );
      } else {
        await MainModel.findOneAndUpdate(
          { switch_id: sw },
          {
            $push: {
              "access_control_list.0.rules": { ...rules, rule_id: ruleId },
            },
          },
          { new: true }
        );
      }

      res.json(response.data);
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 Deleting Rules
Method	DELETE
URL	
/firewall/rules/{switch}[/{vlan}]

–switch: [ “all” | Switch ID ]

–vlan: [ “all” | VLAN ID ]

Data	rule_id:[ “all” | 1 - ... ]
Remarks	Specification of VLAN ID is optional.
 */

app.delete("/firewall/rules/:sw/:vlan?", async (req, res) => {
  try {
    const { sw, vlan } = req.params;
    const rule_id = req.body.rule_id;

    if (vlan) {
      const response = await axios.delete(
        `${RYU_API_URL}/firewall/rules/${sw}/${vlan}`,
        {
          data: { rule_id },
        }
      );

      if (sw === "all") {
        await MainModel.updateMany(
          {},
          { $pull: { "access_control_list.0.rules": { rule_id } } }
        );
      } else {
        await MainModel.updateOne(
          { switch_id: sw },
          { $pull: { "access_control_list.0.rules": { rule_id } } }
        );
      }

      res.json(response.data);
    } else {
      const response = await axios.delete(
        `${RYU_API_URL}/firewall/rules/${sw}`,
        {
          data: { rule_id },
        }
      );

      if (sw === "all") {
        await MainModel.updateMany(
          {},
          { $pull: { "access_control_list.0.rules": { rule_id } } }
        );
      } else {
        await MainModel.updateOne(
          { switch_id: sw },
          { $pull: { "access_control_list.0.rules": { rule_id } } }
        );
      }

      res.json(response.data);
    }
  } catch (error) {
    console.log(error);
  }
});

/*
Acquiring Log Output State of All Switches
Method	GET
URL	/firewall/log/status
 */

app.get("/firewall/log/status", async (req, res) => {
  try {
    const response = await axios.get(`${RYU_API_URL}/firewall/log/status`);

    res.json(response.data);
  } catch (error) {
    console.log(error);
  }
});

/*
Changing Log Output State of All Switches
Method	PUT
URL	
/firewall/log/{op}/{switch}

–op: [ “enable” | “disable” ]

–switch: [ “all” | Switch ID ]

Remarks	Initial state of each switch is “enable”
*/

app.put("/firewall/log/:op/:sw", async (req, res) => {
  try {
    const { op, sw } = req.params;

    // find switch in database with switch_id = [ “all” | sw ] and update status
    if (sw === "all") {
      await MainModel.updateMany({}, { status: op });
    } else {
      await MainModel.updateOne({ switch_id: sw }, { status: op });
    }

    const response = await axios.put(`${RYU_API_URL}/firewall/log/${op}/${sw}`);

    res.json(response.data);
  } catch (error) {
    console.log(error);
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
