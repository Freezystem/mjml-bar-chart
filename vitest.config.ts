import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        reporters: process.env.GITHUB_ACTIONS
            ? ["dot", "github-actions"]
            : ["tree"],
        watch: false,
        fileParallelism: true,
        maxWorkers: "50%",
        include: ["src/**/*.spec.ts"],
        globals: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "cobertura"],
            reportsDirectory: "./coverage",
            reportOnFailure: true,
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.test.ts", "src/**/*.d.ts"],
            thresholds: {
                functions: 100,
                lines: 100,
                statements: 100,
                branches: 100,
            },
        },
    },
});
