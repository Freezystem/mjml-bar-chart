import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        reporters: process.env.GITHUB_ACTIONS
            ? ["dot", "github-actions"]
            : ["tree"],
        watch: false,
        fileParallelism: true,
        maxWorkers: "50%",
        include: ["tests/**/*.spec.ts"],
        coverage: {
            provider: "v8",
            reporter: process.env.GITHUB_ACTIONS
                ? ["text", "lcov"]
                : ["text", "html"],
            reportsDirectory: "./coverage",
            reportOnFailure: true,
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.d.ts"],
            thresholds: {
                functions: 100,
                lines: 100,
                statements: 100,
                branches: 100,
            },
        },
    },
});
