"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useEffect, useState } from "react";

/**
 * Lấy dữ liệu cứ 1 s sẽ get dữ liệu 1 lần
 * Sửa lại api để post rule lên server
 *
 */

export default function Statistics() {
  const [portsStats, setPortsStats] = useState([]);

  const fetchData = () => {
    axios.get("http://localhost:5000/stats/port/1").then((res) => {
      console.log(res);
      setPortsStats(res.data[1]);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  setTimeout(() => {
    fetchData();
  }, 5000);

  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Port Number</TableHead>
          <TableHead>Received Packets</TableHead>
          <TableHead>Transmitted Packets</TableHead>
          <TableHead>Received Bytes</TableHead>
          <TableHead>Transmitted Bytes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {portsStats.map((port: any) => (
          <TableRow key={port.port_no}>
            <TableCell>{port.port_no}</TableCell>
            <TableCell>{port.rx_packets}</TableCell>
            <TableCell>{port.tx_packets}</TableCell>
            <TableCell>{port.rx_bytes}</TableCell>
            <TableCell>{port.tx_bytes}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
