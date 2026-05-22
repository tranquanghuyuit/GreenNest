import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { config } from "../config.js";

const tracingEnabled = process.env.OTEL_TRACING_ENABLED === "true";

function getTraceEndpoint() {
  const explicitEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  if (explicitEndpoint) {
    return explicitEndpoint;
  }

  const baseEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";
  return `${baseEndpoint.replace(/\/$/, "")}/v1/traces`;
}

if (tracingEnabled) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: config.serviceName
    }),
    traceExporter: new OTLPTraceExporter({
      url: getTraceEndpoint()
    }),
    instrumentations: [getNodeAutoInstrumentations()]
  });

  sdk.start();

  const shutdown = () => {
    sdk
      .shutdown()
      .catch((error: unknown) => {
        console.error("OpenTelemetry shutdown failed", error);
      })
      .finally(() => {
        process.exit(0);
      });
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}
