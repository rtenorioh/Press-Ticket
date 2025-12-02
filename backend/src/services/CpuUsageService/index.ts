import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export interface CpuProcessInfo {
  pid: number;
  command: string;
  cpuPercentage: number;
  user?: string;
  cpuTime?: string;
}

export interface CpuUsageInfo {
  cpuModel: string;
  cores: number;
  threads: number;
  cpuUsage: number;
  frequency: string;
  maxFrequency?: string;
  uptime: string;
  loadAverage: number[];
  topProcesses: CpuProcessInfo[];
}

function parseLoadAverage(loadavg: string): number[] {
  return loadavg.split(' ').slice(0, 3).map(Number);
}

function extractFrequencyFromModel(cpuModel: string): string | null {
  
  const ghzMatch = cpuModel.match(/@\s*(\d+\.?\d*)\s*GHz/i);
  if (ghzMatch) {
    const ghz = parseFloat(ghzMatch[1]);
    return `${(ghz * 1000).toFixed(0)} MHz`;
  }
  
  const mhzMatch = cpuModel.match(/@\s*(\d+)\s*MHz/i);
  if (mhzMatch) {
    return `${mhzMatch[1]} MHz`;
  }
  
  return null;
}

export async function getCpuUsageInfo(): Promise<CpuUsageInfo> {
  const cpuModelCmd = `lscpu | grep 'Model name' | awk -F: '{print $2}' | xargs`;
  const coresCmd = `lscpu | grep '^CPU(s):' | awk '{print $2}'`;
  const threadsCmd = `lscpu | grep 'Thread(s) per core' | awk '{print $4}'`;
  const freqCmd = `lscpu | grep 'CPU max MHz' | awk -F: '{print $2}' | xargs`;
  const freqCurrentCmd = `lscpu | grep 'CPU MHz' | awk -F: '{print $2}' | xargs | head -n 1`;
  const uptimeCmd = `uptime -p`;
  const loadAvgCmd = `cat /proc/loadavg | awk '{print $1, $2, $3}'`;
  const cpuUsageCmd = `top -bn2 | grep 'Cpu(s)' | tail -n1 | awk '{print 100-$8}'`;
  const topProcCmd = `ps -eo pid,comm,pcpu,user,time --sort=-pcpu | head -n 11`;

  try {
    const [cpuModel, cores, threads, freqMax, uptimeRaw, loadAvg, cpuUsage, topProcessesRaw, freqCurrent] = await Promise.all([
      execAsync(cpuModelCmd).then(r => r.stdout.trim()),
      execAsync(coresCmd).then(r => r.stdout.trim()),
      execAsync(threadsCmd).then(r => r.stdout.trim()),
      execAsync(freqCmd).then(r => r.stdout.trim()),
      execAsync(uptimeCmd).then(r => r.stdout.trim()),
      execAsync(loadAvgCmd).then(r => r.stdout.trim()),
      execAsync(cpuUsageCmd).then(r => r.stdout.trim()),
      execAsync(topProcCmd).then(r => r.stdout.trim()),
      execAsync(freqCurrentCmd).then(r => r.stdout.trim()),
    ]);

    function traduzirUptime(uptime: string): string {
      return uptime
        .replace(/weeks?/g, 'semanas')
        .replace(/days?/g, 'dias')
        .replace(/hours?/g, 'horas')
        .replace(/minutes?/g, 'minutos')
        .replace(/up /g, '');
    }
    const uptime = traduzirUptime(uptimeRaw);

    const topProcesses: CpuProcessInfo[] = topProcessesRaw
      .split('\n')
      .slice(1)
      .map((line) => {
        const [pid, command, cpuPercentage, user, cpuTime] = line.trim().split(/\s+/, 5);
        return {
          pid: Number(pid),
          command,
          cpuPercentage: Number(cpuPercentage.replace(',', '.')),
          user,
          cpuTime,
        };
      });

    let frequency = 'N/A';
    if (freqCurrent && !isNaN(Number(freqCurrent))) {
      frequency = `${Number(freqCurrent).toFixed(0)} MHz`;
    } else if (freqMax && !isNaN(Number(freqMax))) {
      frequency = `${Number(freqMax).toFixed(0)} MHz`;
    } else {
      const extractedFreq = extractFrequencyFromModel(cpuModel);
      if (extractedFreq) {
        frequency = extractedFreq;
      }
    }

    return {
      cpuModel,
      cores: Number(cores),
      threads: Number(threads),
      cpuUsage: Number(Number(cpuUsage).toFixed(2)),
      frequency,
      maxFrequency: freqMax ? `${Number(freqMax).toFixed(0)} MHz` : '',
      uptime,
      loadAverage: parseLoadAverage(loadAvg),
      topProcesses,
    };
  } catch (err) {
    return {
      cpuModel: 'N/A',
      cores: 0,
      threads: 0,
      cpuUsage: 0,
      frequency: '',
      maxFrequency: '',
      uptime: '',
      loadAverage: [0,0,0],
      topProcesses: [],
    };
  }
}
