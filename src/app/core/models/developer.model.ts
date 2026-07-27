/** Identity of the running backend application instance. */
export interface ApplicationInfoDto {
    /** The Spring application name. */
    name: string;
    /** The currently active Spring profiles. */
    activeProfiles: string[];
    /** ISO instant the response was assembled at. */
    serverTime: string;
}

/** Operating system and host the backend's JVM is currently running on. */
export interface OperatingSystemInfoDto {
    /** Operating system name, e.g. `Linux`. */
    name: string;
    /** Operating system version/kernel release string. */
    version: string;
    /** CPU architecture reported by the OS, e.g. `amd64` or `aarch64`. */
    architecture: string;
    /** Container/host name, or `"unknown"` if it could not be resolved. */
    hostName: string;
}

/** CPU characteristics and current load of the container the backend's JVM runs in. */
export interface CpuInfoDto {
    architecture: string;
    /** Processors visible to the JVM; respects container CPU quotas/cgroup limits. */
    availableProcessors: number;
    /** System load average over the last minute, or `-1` if unavailable on this platform. */
    systemLoadAverage: number;
    /** Overall system CPU load as a 0-100 percentage, or `null` if the platform MX bean is unavailable. */
    systemCpuLoadPercentage: number | null;
    /** This JVM process's own CPU load as a 0-100 percentage, or `null` if unavailable. */
    processCpuLoadPercentage: number | null;
}

/** Memory usage of both the JVM heap and the underlying container/host. */
export interface MemoryInfoDto {
    /** Bytes currently used on the JVM heap (`totalMemory - freeMemory`). */
    jvmUsedBytes: number;
    /** Maximum number of bytes the JVM heap can grow to. */
    jvmMaxBytes: number;
    /** Bytes currently unused within the JVM's already-allocated heap. */
    jvmFreeBytes: number;
    /** Total physical memory visible to the OS/container, or `-1` if unavailable. */
    systemTotalBytes: number;
    /** Free physical memory available to the OS/container, or `-1` if unavailable. */
    systemFreeBytes: number;
    /** Used physical memory (`systemTotalBytes - systemFreeBytes`), or `-1` if unavailable. */
    systemUsedBytes: number;
}

/** Disk usage of the filesystem backing the backend container's writable layer. */
export interface StorageInfoDto {
    /** Filesystem path this information was measured against. */
    path: string;
    /** Total capacity of the filesystem, or `-1` if it could not be read. */
    totalBytes: number;
    /** Bytes available to the backend process, or `-1` if it could not be read. */
    usableBytes: number;
    /** Bytes already used (`totalBytes - usableBytes`), or `-1` if it could not be computed. */
    usedBytes: number;
}

/**
 * Live versions of the services the backend depends on. Any field may hold a string starting with
 * `"unavailable"` instead of a version if that dependency could not be reached — see
 * {@link DeveloperPage.isUnavailable}.
 */
export interface ServiceVersionsDto {
    rabbitMq: string;
    postgreSql: string;
    grafana: string;
}

/** Identifies the Java runtime executing the backend and where it is installed. */
export interface JavaRuntimeInfoDto {
    /** JVM vendor, e.g. `Eclipse Adoptium`. */
    vendor: string;
    /** The running JVM's `java.version`. */
    version: string;
    /** JVM implementation name, e.g. `OpenJDK 64-Bit Server VM`. */
    vmName: string;
    /** JVM implementation version. */
    vmVersion: string;
    /** Filesystem path the JVM was launched from (`java.home`). */
    javaHome: string;
    /** Operating-system process id of the backend JVM. */
    pid: number;
    /** ISO instant the JVM started. */
    startTime: string;
    /** How long the JVM has been running, in milliseconds. */
    uptimeMillis: number;
}

/**
 * Full runtime-environment diagnostics snapshot returned by `GET /developer`, restricted to
 * callers holding the `DEBUG` permission (exclusively the `DEVELOPER` role).
 */
export interface DeveloperInfoDto {
    application: ApplicationInfoDto;
    operatingSystem: OperatingSystemInfoDto;
    cpu: CpuInfoDto;
    memory: MemoryInfoDto;
    storage: StorageInfoDto;
    services: ServiceVersionsDto;
    javaRuntime: JavaRuntimeInfoDto;
}
