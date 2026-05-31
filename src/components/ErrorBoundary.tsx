import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary capturó un error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-wider">
            Algo salió mal
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            Ocurrió un error inesperado. Probá recargar la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md border border-foreground px-4 py-2 font-body text-sm transition-colors hover:bg-foreground hover:text-background"
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
