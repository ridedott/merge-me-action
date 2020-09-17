export declare enum AllowedMergeMethods {
    MERGE = "MERGE",
    SQUASH = "SQUASH",
    REBASE = "REBASE"
}
export declare enum AllowedMergePresets {
    DEPENDABOT_MINOR = "DEPENDABOT_MINOR",
    DEPENDABOT_PATCH = "DEPENDABOT_PATCH"
}
export declare const parseInputMergeMethod: () => AllowedMergeMethods;
export declare const parseInputMergePreset: () => AllowedMergePresets | undefined;
//# sourceMappingURL=inputParsers.d.ts.map