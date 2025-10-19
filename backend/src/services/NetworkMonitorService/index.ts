import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "../../utils/logger";
import os from "os";

const execPromise = promisify(exec);

interface NetworkInterfaceInfo {
  name: string;
  ipAddress: string;
  macAddress: string;
  status: string;
  speed: string;
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  errors: number;
  dropped: number;
}

interface PingResult {
  host: string;
  alive: boolean;
  time?: number;
  min?: number;
  avg?: number;
  max?: number;
  stddev?: number;
}

interface NetworkStatus {
  interfaces: NetworkInterfaceInfo[];
  connectionStatus: {
    internet: boolean;
    latency: PingResult[];
  };
  activeConnections: {
    total: number;
    established: number;
    listening: number;
    timeWait: number;
    closeWait: number;
  };
  dnsStatus: {
    working: boolean;
    resolveTime?: number;
  };
}

const getNetworkInterfaces = async (): Promise<NetworkInterfaceInfo[]> => {
  try {
    const interfaces: NetworkInterfaceInfo[] = [];
    const netInterfaces = os.networkInterfaces();
    
    const { stdout: netStats } = await execPromise("ip -s link");
    
    for (const [name, ifaceInfos] of Object.entries(netInterfaces)) {
      if (!ifaceInfos || name.includes("lo")) continue;
      
      const ipv4Info = ifaceInfos.find(info => info.family === "IPv4");
      if (!ipv4Info) continue;
      
      const rxBytes = extractNetworkStat(netStats, name, "RX: bytes");
      const txBytes = extractNetworkStat(netStats, name, "TX: bytes");
      const rxPackets = extractNetworkStat(netStats, name, "RX: packets");
      const txPackets = extractNetworkStat(netStats, name, "TX: packets");
      const errors = extractNetworkStat(netStats, name, "errors");
      const dropped = extractNetworkStat(netStats, name, "dropped");
      
      let speed = "Unknown";
      try {
        const { stdout: speedOutput } = await execPromise(`cat /sys/class/net/${name}/speed 2>/dev/null || echo "Unknown"`);
        if (speedOutput.trim() !== "Unknown") {
          speed = `${speedOutput.trim()} Mbps`;
        }
      } catch (error) {
        speed = "Unknown";
      }
      
      let status = "Unknown";
      try {
        const { stdout: statusOutput } = await execPromise(`cat /sys/class/net/${name}/operstate 2>/dev/null || echo "unknown"`);
        status = statusOutput.trim();
      } catch (error) {
        status = "unknown";
      }
      
      interfaces.push({
        name,
        ipAddress: ipv4Info.address,
        macAddress: ipv4Info.mac,
        status,
        speed,
        bytesReceived: parseInt(rxBytes) || 0,
        bytesSent: parseInt(txBytes) || 0,
        packetsReceived: parseInt(rxPackets) || 0,
        packetsSent: parseInt(txPackets) || 0,
        errors: parseInt(errors) || 0,
        dropped: parseInt(dropped) || 0
      });
    }
    
    return interfaces;
  } catch (error) {
    logger.error("Erro ao obter informações das interfaces de rede:", error);
    return [];
  }
};

const extractNetworkStat = (output: string, interfaceName: string, statName: string): string => {
  try {
    const interfaceSection = output.split(`${interfaceName}:`)[1]?.split("\n\n")[0];
    if (!interfaceSection) return "0";
    
    if (statName === "RX: bytes") {
      const match = interfaceSection.match(/RX:[^\n]*bytes\s+(\d+)/i);
      return match ? match[1] : "0";
    } else if (statName === "TX: bytes") {
      const match = interfaceSection.match(/TX:[^\n]*bytes\s+(\d+)/i);
      return match ? match[1] : "0";
    } else if (statName === "RX: packets") {
      const match = interfaceSection.match(/RX:[^\n]*packets\s+(\d+)/i);
      return match ? match[1] : "0";
    } else if (statName === "TX: packets") {
      const match = interfaceSection.match(/TX:[^\n]*packets\s+(\d+)/i);
      return match ? match[1] : "0";
    } else if (statName === "errors") {
      const match = interfaceSection.match(/errors\s+(\d+)/i);
      return match ? match[1] : "0";
    } else if (statName === "dropped") {
      const match = interfaceSection.match(/dropped\s+(\d+)/i);
      return match ? match[1] : "0";
    }
    
    return "0";
  } catch (error) {
    return "0";
  }
};

const checkInternetConnectivity = async (): Promise<boolean> => {
  try {
    await execPromise("ping -c 1 -W 2 8.8.8.8");
    return true;
  } catch (error) {
    return false;
  }
};

const checkLatency = async (): Promise<PingResult[]> => {
  const hosts = ["8.8.8.8", "1.1.1.1", "208.67.222.222"]; // Google, Cloudflare, OpenDNS
  const results: PingResult[] = [];
  
  for (const host of hosts) {
    try {
      const { stdout } = await execPromise(`ping -c 3 -W 2 ${host}`);
      
      const alive = true;
      let time = 0;
      let min = 0;
      let avg = 0;
      let max = 0;
      let stddev = 0;
      
      const timeMatch = stdout.match(/time=(\d+(\.\d+)?)/);
      if (timeMatch) {
        time = parseFloat(timeMatch[1]);
      }
      
      const statsMatch = stdout.match(/min\/avg\/max\/mdev = (\d+(\.\d+)?)\/(\d+(\.\d+)?)\/(\d+(\.\d+)?)\/(\d+(\.\d+)?)/);
      if (statsMatch) {
        min = parseFloat(statsMatch[1]);
        avg = parseFloat(statsMatch[3]);
        max = parseFloat(statsMatch[5]);
        stddev = parseFloat(statsMatch[7]);
      }
      
      results.push({ host, alive, time, min, avg, max, stddev });
    } catch (error) {
      results.push({ host, alive: false });
    }
  }
  
  return results;
};

const getActiveConnections = async (): Promise<{
  total: number;
  established: number;
  listening: number;
  timeWait: number;
  closeWait: number;
}> => {
  try {
    const { stdout } = await execPromise("ss -tan | awk '{print $1}' | grep -v State | sort | uniq -c");
    
    let total = 0;
    let established = 0;
    let listening = 0;
    let timeWait = 0;
    let closeWait = 0;
    
    const lines = stdout.trim().split("\n");
    for (const line of lines) {
      const [count, state] = line.trim().split(/\s+/);
      const numCount = parseInt(count);
      total += numCount;
      
      if (state === "ESTAB") established = numCount;
      else if (state === "LISTEN") listening = numCount;
      else if (state === "TIME-WAIT") timeWait = numCount;
      else if (state === "CLOSE-WAIT") closeWait = numCount;
    }
    
    return { total, established, listening, timeWait, closeWait };
  } catch (error) {
    logger.error("Erro ao obter conexões ativas:", error);
    return { total: 0, established: 0, listening: 0, timeWait: 0, closeWait: 0 };
  }
};

const checkDnsStatus = async (): Promise<{ working: boolean; resolveTime?: number }> => {
  try {
    const startTime = Date.now();
    await execPromise("nslookup google.com");
    const endTime = Date.now();
    
    return { working: true, resolveTime: endTime - startTime };
  } catch (error) {
    return { working: false };
  }
};

export const getNetworkStatus = async (): Promise<NetworkStatus> => {
  try {
    const [interfaces, internetConnected, latencyResults, activeConnections, dnsStatus] = await Promise.all([
      getNetworkInterfaces(),
      checkInternetConnectivity(),
      checkLatency(),
      getActiveConnections(),
      checkDnsStatus()
    ]);
    
    return {
      interfaces,
      connectionStatus: {
        internet: internetConnected,
        latency: latencyResults
      },
      activeConnections,
      dnsStatus
    };
  } catch (error) {
    logger.error("Erro ao obter status da rede:", error);
    
    return {
      interfaces: [],
      connectionStatus: {
        internet: false,
        latency: []
      },
      activeConnections: {
        total: 0,
        established: 0,
        listening: 0,
        timeWait: 0,
        closeWait: 0
      },
      dnsStatus: {
        working: false
      }
    };
  }
};
