export interface ApplicationInfoDto {
    name: string;
    activeProfiles: string[];
    serverTime: string;
}

export interface OperatingSystemInfoDto {
    name: string;
    version: string;
    architecture: string;
    hostName: string;
}

export interface CpuInfoDto {
    architecture: string;
    availableProcessors: number;
    systemLoadAverage: number;
    systemCpuLoadPercentage: number | null;
    processCpuLoadPercentage: number | null;
}

export interface MemoryInfoDto {
    jvmUsedBytes: number;
    jvmMaxBytes: number;
    jvmFreeBytes: number;
    systemTotalBytes: number;
    systemFreeBytes: number;
    systemUsedBytes: number;
}

export interface StorageInfoDto {
    path: string;
    totalBytes: number;
    usableBytes: number;
    usedBytes: number;
}

export interface ServiceVersionsDto {
    rabbitMq: string;
    postgreSql: string;
    grafana: string;
}

export interface JavaRuntimeInfoDto {
    vendor: string;
    version: string;
    vmName: string;
    vmVersion: string;
    javaHome: string;
    pid: number;
    startTime: string;
    uptimeMillis: number;
}

export interface DeveloperInfoDto {
    application: ApplicationInfoDto;
    operatingSystem: OperatingSystemInfoDto;
    cpu: CpuInfoDto;
    memory: MemoryInfoDto;
    storage: StorageInfoDto;
    services: ServiceVersionsDto;
    javaRuntime: JavaRuntimeInfoDto;
}
