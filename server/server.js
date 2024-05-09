const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");

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
 * # curl http://localhost:8080/firewall/rules/0000000000000001/all
  [
    {
      "access_control_list": [
        {
          "rules": [
            {
              "priority": 1,
              "dl_type": "IPv4",
              "nw_proto": "ICMP",
              "dl_vlan": 2,
              "nw_src": "10.0.0.0/8",
              "rule_id": 1,
              "actions": "ALLOW"
            },
            {
              "priority": 1,
              "dl_type": "IPv4",
              "nw_proto": "ICMP",
              "nw_dst": "10.0.0.0/8",
              "dl_vlan": 2,
              "rule_id": 2,
              "actions": "ALLOW"
            }
          ],
          "vlan_id": 2
        }
      ],
      "switch_id": "0000000000000001"
    }
  ]
 */

const RuleSchema = new mongoose.Schema({
  switch_id: String,
  access_control_list: [
    {
      vlan_id: Number,
      rules: [
        {
          priority: Number,
          dl_type: String,
          nw_proto: String,
          dl_vlan: Number,
          nw_src: String,
          nw_dst: String,
          rule_id: Number,
          actions: String,
        },
      ],
    },
  ],
});

// Get all firewall rules
app.get("/firewall/rules", async (req, res) => {
  try {
    const response = await axios.get(`${RYU_API_URL}/firewall/rules/all`);
  } catch (error) {
    console.log(error);
  }
});

// Add a new firewall rule
app.post("/firewall/rules", (req, res) => {
  const data = req.body;
  axios
    .post(`${RYU_API_URL}/firewall/rules/all`, data)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.json(error);
    });
});

// Delete a firewall rule
app.delete("/firewall/rules", (req, res) => {
  const data = req.body;
  axios
    .delete(`${RYU_API_URL}/firewall/rules/all`, { data })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.json(error);
    });
});

// Enable/Disable all switches
app.put("/firewall/module/:op/:sw", (req, res) => {
  const { op, sw } = req.params;
  axios
    .put(`${RYU_API_URL}/firewall/module/${op}/${sw}`)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.json(error);
    });
});

// Get all switches status
app.get("/firewall/module/status", (req, res) => {
  axios
    .get(`${RYU_API_URL}/firewall/module/status`)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.json(error);
    });
});

// Enable/Disable log output
app.put("/firewall/log/:op/:sw", (req, res) => {
  const { op, sw } = req.params;
  axios
    .put(`${RYU_API_URL}/firewall/log/${op}/${sw}`)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.json(error);
    });
});

// Get all switches log status
app.get("/firewall/log/status", (req, res) => {
  axios
    .get(`${RYU_API_URL}/firewall/log/status`)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.json(error);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
