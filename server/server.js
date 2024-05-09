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

const ruleSchema = new mongoose.Schema({
  switch_id: String,
  access_control_list: [
    {
      rules: [
        {
          rule_id: Number,
          priority: Number,
          dl_type: String,
          nw_src: String,
          nw_dst: String,
          nw_proto: String,
          actions: String,
        },
      ],
    },
  ],
});

const RuleModel = mongoose.model("Rule", ruleSchema);

// Get all firewall rules from MongoDB
app.get("/firewall/rules/db", async (req, res) => {
  try {
    const rules = await RuleModel.find();

    res.json(rules);
  } catch (error) {
    console.log(error);
  }
});

// Get all firewall rules
app.get("/firewall/rules", async (req, res) => {
  try {
    const response = await axios.get(`${RYU_API_URL}/firewall/rules/all`);

    const rules = response.data;

    // Save rules to MongoDB
    await RuleModel.insertMany(rules);

    res.json(rules);
  } catch (error) {
    console.log(error);
  }
});

// Add a new firewall rule
app.post("/firewall/rules", async (req, res) => {
  const data = req.body;
  const response = await axios.post(`${RYU_API_URL}/firewall/rules/all`, data);

  res.json(response.data);
});

// Delete a firewall rule
app.delete("/firewall/rules", (req, res) => {
  const data = req.body;

  const response = axios.delete(`${RYU_API_URL}/firewall/rules/all`, {
    data,
  });

  // update MongoDB

  res.json(response.data);
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
