import pino from "pino";

interface LogMetadata {
    [key: string]: any;
}

interface EnhancedLogger {
    info(msg: string | Error, metadata?: LogMetadata | string): void;
    error(msg: string | Error, metadata?: LogMetadata | string): void;
    warn(msg: string | Error, metadata?: LogMetadata | string): void;
    debug(msg: string | Error, metadata?: LogMetadata | string): void;
    level: string;
}

const pinoLogger = pino({
    level: 'debug',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'dd-mm-yyyy HH:MM:ss',
            messageFormat: '{msg} - {#bold metadata:} {metadata}',
        }
    },
    serializers: {
        metadata: (value) => {
            if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value, null, 2);
            }
            return value;
        }
    }
});

const processMessage = (msg: string | Error): string => {
    if (msg instanceof Error) {
        return msg.message + (msg.stack ? `\n${msg.stack}` : '');
    }
    return msg;
};

const processMetadata = (msg: string | Error, metadata?: LogMetadata | string): LogMetadata => {
    let processedMetadata: LogMetadata = {};

    if (typeof metadata === 'string') {
        processedMetadata = { value: metadata };
    } else if (metadata) {
        processedMetadata = metadata;
    }

    if (msg instanceof Error) {
        return {
            ...processedMetadata,
            error: {
                name: msg.name,
                message: msg.message,
                stack: msg.stack
            }
        };
    }

    return processedMetadata;
};

const enhancedLogger: EnhancedLogger = {
    info: (msg: string | Error, metadata?: LogMetadata | string) => {
        pinoLogger.info({
            msg: processMessage(msg),
            metadata: processMetadata(msg, metadata)
        });
    },
    error: (msg: string | Error, metadata?: LogMetadata | string) => {
        pinoLogger.error({
            msg: processMessage(msg),
            metadata: processMetadata(msg, metadata)
        });
    },
    warn: (msg: string | Error, metadata?: LogMetadata | string) => {
        pinoLogger.warn({
            msg: processMessage(msg),
            metadata: processMetadata(msg, metadata)
        });
    },
    debug: (msg: string | Error, metadata?: LogMetadata | string) => {
        pinoLogger.debug({
            msg: processMessage(msg),
            metadata: processMetadata(msg, metadata)
        });
    },
    get level(): string {
        return pinoLogger.level;
    },
    set level(newLevel: string) {
        pinoLogger.level = newLevel;
    }
};

export { enhancedLogger as logger };
