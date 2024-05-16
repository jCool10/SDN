"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useEffect, useState } from "react";

const formSchema = z.object({
  priority: z.string().min(0).max(65535),
  dl_type: z.enum(["IPv4", "IPv6"]),
  src: z.string(),
  dst: z.string(),
  nw_proto: z.enum(["TCP", "UDP", "ICMP", "ICMPv6", "any"]),
  actions: z.enum(["ALLOW", "DENY"]),
});

export default function ProfileForm() {
  const [rules, setRules] = useState([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: "1",
      dl_type: "IPv4",
      src: "any",
      dst: "any",
      nw_proto: "any",
      actions: "ALLOW",
    },
  });

  const fetchData = () => {
    axios.get("http://localhost:5000/firewall/rules/all").then((res) => {
      console.log(res);

      const rulesData = res.data
        .map((rule: any) => {
          const { access_control_list, switch_id } = rule;

          return access_control_list
            .map((acl: any) => {
              const { rules } = acl;

              return rules.map((rule: any) => {
                return { ...rule, switch_id };
              });
            })
            .flat();
        })
        .flat();

      setRules(rulesData);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    const { actions, dst, src, nw_proto } = values;

    let rules: any = values;

    if (nw_proto === "ICMPv6") {
      rules.dl_type = "IPv6";
    } else if (
      nw_proto === "ICMP" ||
      nw_proto === "TCP" ||
      nw_proto === "UDP"
    ) {
      rules.dl_type = "IPv4";
    }

    if (rules.dl_type === "IPv4") {
      if (src === "any") {
        delete rules.src;
      } else {
        rules.nw_src = src;
        delete rules.src;
      }

      if (dst === "any") {
        delete rules.dst;
      } else {
        rules.nw_dst = dst;
        delete rules.dst;
      }
    } else if (rules.dl_type === "IPv6") {
      if (src === "any") {
        delete rules.src;
      } else {
        rules.ipv6_src = src;
        delete rules.src;
      }

      if (dst === "any") {
        delete rules.dst;
      } else {
        rules.ipv6_dst = dst;
        delete rules.dst;
      }
    }

    if (nw_proto === "any") {
      rules.nw_proto = "ICMP";
    }

    if (actions === "ALLOW") {
      delete rules.actions;
    }

    console.log(rules);

    axios
      .post("http://localhost:5000/firewall/rules/0000000000000001", rules)
      .then(() => {
        fetchData();
      });
  }

  const deleteRule = (switch_id: string, rule_id: string) => {
    axios
      .delete(`http://localhost:5000/firewall/rules/${switch_id}`, {
        data: { rule_id },
      })
      .then(() => {
        fetchData();
      });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className=" grid grid-cols-2 gap-4"
        >
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Input placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dl_type"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>DL Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="DL TYpe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="IPv4">IPv4</SelectItem>
                    <SelectItem value="IPv6">IPv6</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nw_proto"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>NW Protocol</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="NW Protocol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TCP">TCP</SelectItem>
                    <SelectItem value="UDP">UDP</SelectItem>
                    <SelectItem value="ICMP">ICMP</SelectItem>
                    <SelectItem value="ICMPv6">ICMPv6</SelectItem>
                    <SelectItem value="any">any</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="src"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>NW Source</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dst"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>NW Destination</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="actions"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Actions</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Actions" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALLOW">ALLOW</SelectItem>
                    <SelectItem value="DENY">DENY</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="col-span-2" type="submit">
            Submit
          </Button>
        </form>
      </Form>
      <Separator className="my-6" />
      <Button onClick={() => deleteRule("all", "all")}>Delete All</Button>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Switch ID</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>DL Type</TableHead>
            <TableHead>NW Source</TableHead>
            <TableHead>NW Destination</TableHead>
            <TableHead>NW Protocol</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Rule ID</TableHead>
            <TableHead>Operations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule: any) => (
            <TableRow key={rule.rule_id}>
              <TableCell>{rule.switch_id}</TableCell>
              <TableCell>{rule.priority}</TableCell>
              <TableCell>{rule.dl_type}</TableCell>
              <TableCell>
                {rule.dl_type === "IPv4"
                  ? rule.nw_src
                    ? rule.nw_src
                    : "any"
                  : rule.ipv6_src
                  ? rule.ipv6_src
                  : "any"}
              </TableCell>
              <TableCell>
                {rule.dl_type === "IPv4"
                  ? rule.nw_dst
                    ? rule.nw_dst
                    : "any"
                  : rule.ipv6_dst
                  ? rule.ipv6_dst
                  : "any"}
              </TableCell>
              <TableCell>{rule.nw_proto ? rule.nw_proto : "any"}</TableCell>
              <TableCell>{rule.actions}</TableCell>
              <TableCell>{rule.rule_id}</TableCell>
              <TableCell>
                <Button
                  onClick={() => deleteRule(rule.switch_id, rule.rule_id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
