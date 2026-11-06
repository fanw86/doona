# Experimental ShadowQUIC

Full and lite support native `shadowquic://` links on the honk integration branch. The backend must be built with its optional `shadowquic` feature; older builds reject these nodes. The UI cannot infer that build feature from the native API capabilities.

Enter a username, password and JLS server name (SNI). Credentials are percent-encoded; IPv6 server addresses are bracketed. SNI and ALPN belong to JLS, so certificate-verification, REALITY and stream-transport controls do not apply.

Advanced settings include ALPN (default `h3`), congestion (`bbr` by default), `zero-rtt` (default true), `over-stream` (default false), MTU (1200–65527) and half-close inactivity in milliseconds (default 60000; zero disables). Unfilled settings use backend defaults. The current handler always authenticates before application data and does not replay early application data.

Stream and UDP probes are offered; server TCP-connect probes do not apply to this QUIC carrier. Structured third-party subscription dialects remain unsupported. Packaging and deployment of a feature-enabled backend are separate steps.
