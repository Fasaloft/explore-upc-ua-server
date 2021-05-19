import { CreateSubscriptionRequest, MessageSecurityMode, SecurityPolicy } from "node-opcua-client";

export const MAX_AGE = 0;

export const CONNECTION_STRATEGY = {
    initialDelay: 500,
    maxRetry: 1
}

export const MONITOR_PARAMETERS = {
    samplingInterval: 500,
    discardOldest: true,
    queueSize: 10
}

export const SUBSCRIPTION_OPTIONS = {
    requestedPublishingInterval: 2000,
    requestedMaxKeepAliveCount: 10,
    requestedLifetimeCount: 6000,
    maxNotificationsPerPublish: 2000,
    publishingEnabled: true,
    priority: 10
}

export const OPTIONS = {
    applicationName: "TestingOPCServer",
    connectionStrategy: CONNECTION_STRATEGY,
    securityMode: MessageSecurityMode.None,
    securityPolicy: SecurityPolicy.None,
    endpoint_must_exist: false,
};