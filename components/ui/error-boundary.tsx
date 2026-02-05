'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-900 my-4">
                    <h2 className="text-lg font-bold mb-2">Something went wrong.</h2>
                    <p className="text-sm opacity-80 mb-4">
                        {this.props.name ? `Error in ${this.props.name}: ` : ''}
                        {this.state.error?.message || 'Unknown error'}
                    </p>
                    <button
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-md text-sm font-medium transition-colors"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
