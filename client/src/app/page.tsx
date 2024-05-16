"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [switches, setSwitches] = useState([]);

  const fetchData = () => {
    axios.get("http://localhost:5000/stats/switches").then((res) => {
      setSwitches(res.data);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const changeStatus = (status: string, switch_id: string) => {
    axios
      .put(`http://localhost:5000/firewall/module/${status}/${switch_id}`)
      .then(() => {
        fetchData();
      });
  };

  return (
    <>
      <div className="flex gap-3 mb-2">
        <Button onClick={() => changeStatus("disable", "all")}>
          Disable All
        </Button>
        <Button onClick={() => changeStatus("enable", "all")}>
          Enable All
        </Button>
      </div>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Datapath ID</TableHead>
            <TableHead>Switch ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Operations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {switches.map((sw: any) => (
            <TableRow key={sw.switch_id}>
              <TableCell>{parseInt(sw.switch_id, 16)}</TableCell>
              <TableCell>{sw.switch_id}</TableCell>
              <TableCell className="capitalize">{sw.status}</TableCell>
              <TableCell>
                {sw.status === "enable" ? (
                  <Button onClick={() => changeStatus("disable", sw.switch_id)}>
                    Disable
                  </Button>
                ) : (
                  <Button onClick={() => changeStatus("enable", sw.switch_id)}>
                    Enable
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
