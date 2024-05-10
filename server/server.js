const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const { RuleModel, MainModel } = require("./model");

const app = express();
app.use(cors());

const RYU_API_URL = "http://localhost:8080"; // Giả sử ryu-manager chạy trên cổng 8080
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

/**
export interface Main {
    switch_id:           string;
    access_control_list: AccessControlList[];
}

export interface AccessControlList {
    rules: Rule[];
}

export interface Rule {
    rule_id:   number;
    priority:  number;
    dl_type:   string;
    nw_src:    string;
    nw_dst:    string;
    nw_proto?: string;
    actions:   string;
}

 */

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

    if (vlan) {
      if (sw === "all") {
        await MainModel.updateMany(
          {},
          { $push: { "access_control_list.0.rules": data } }
        );
      } else {
        await MainModel.updateOne(
          { switch_id: sw },
          { $push: { "access_control_list.0.rules": data } }
        );
      }

      const response = await axios.post(
        `${RYU_API_URL}/firewall/rules/${sw}/${vlan}`,
        data
      );

      res.json(response.data);
    } else {
      if (sw === "all") {
        await MainModel.updateMany(
          {},
          { $push: { "access_control_list.0.rules": data } }
        );
      } else {
        await MainModel.updateOne(
          { switch_id: sw },
          { $push: { "access_control_list.0.rules": data } }
        );
      }

      const response = await axios.post(
        `${RYU_API_URL}/firewall/rules/${sw}`,
        data
      );

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
    const data = req.body;

    if (vlan) {
      if (sw === "all") {
        await MainModel.updateMany(
          {},
          { $pull: { "access_control_list.0.rules": data } }
        );
      } else {
        await MainModel.updateOne(
          { switch_id: sw },
          { $pull: { "access_control_list.0.rules": data } }
        );
      }

      const response = await axios.delete(
        `${RYU_API_URL}/firewall/rules/${sw}/${vlan}`,
        { data }
      );

      res.json(response.data);
    } else {
      if (sw === "all") {
        await MainModel.updateMany(
          {},
          { $pull: { "access_control_list.0.rules": data } }
        );
      } else {
        await MainModel.updateOne(
          { switch_id: sw },
          { $pull: { "access_control_list.0.rules": data } }
        );
      }

      const response = await axios.delete(
        `${RYU_API_URL}/firewall/rules/${sw}`,
        { data }
      );

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
