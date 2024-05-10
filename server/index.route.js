const express = require("express");

const router = express.Router();

/**
Acquiring Enable/Disable State of All Switches
Method	GET
URL	/firewall/module/status
 */

router.get("/firewall/module/status", async (req, res) => {
  try {
    const response = await axios.get(`${RYU_API_URL}/firewall/module/status`);

    res.json(response);
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

router.put("/firewall/module/:op/:sw", async (req, res) => {
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

    res.json(response);
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

router.get("/firewall/rules/:sw/:vlan?", async (req, res) => {
  try {
    const { sw, vlan } = req.params;

    if (vlan) {
      const response = await axios.get(
        `${RYU_API_URL}/firewall/rules/${sw}/${vlan}`
      );

      res.json(response);
    } else {
      const response = await axios.get(`${RYU_API_URL}/firewall/rules/${sw}`);

      res.json(response);
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

router.post("/firewall/rules/:sw/:vlan?", async (req, res) => {
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

      res.json(response);
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

      res.json(response);
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

router.delete("/firewall/rules/:sw/:vlan?", async (req, res) => {
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

      res.json(response);
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

      res.json(response);
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

router.get("/firewall/log/status", async (req, res) => {
  try {
    const response = await axios.get(`${RYU_API_URL}/firewall/log/status`);

    res.json(response);
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

router.put("/firewall/log/:op/:sw", async (req, res) => {
  try {
    const { op, sw } = req.params;

    // find switch in database with switch_id = [ “all” | sw ] and update status
    if (sw === "all") {
      await MainModel.updateMany({}, { status: op });
    } else {
      await MainModel.updateOne({ switch_id: sw }, { status: op });
    }

    const response = await axios.put(`${RYU_API_URL}/firewall/log/${op}/${sw}`);

    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
