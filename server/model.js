const mongoose = require("mongoose");

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
  rule_id: Number,
  priority: Number,
  dl_type: String,
  nw_src: String,
  nw_dst: String,
  nw_proto: String,
  actions: String,
});

const mainSchema = new mongoose.Schema({
  switch_id: String,
  status: { type: String, default: "disable", enum: ["enable", "disable"] },
  access_control_list: [
    {
      rules: { type: [ruleSchema], default: [] },
    },
  ],
});

const MainModel = mongoose.model("Main", mainSchema);
const RuleModel = mongoose.model("Rule", ruleSchema);

module.exports = { MainModel, RuleModel };
