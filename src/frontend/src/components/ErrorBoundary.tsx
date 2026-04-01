import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: "32px 16px", textAlign: "center" }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#111",
                marginBottom: "4px",
              }}
            >
              Something went wrong
            </p>
            <p style={{ fontSize: "12px", color: "#6b7280" }}>
              Unable to load this section. Please refresh and try again.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
