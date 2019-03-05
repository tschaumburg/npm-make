import { ExplicitRule } from "./explicit-rule";
import { ImplicitRule } from "./implicit-rule";
import { StaticPatternRule } from "./static-pattern-rule";
import { BaseRule } from "./base-rule";
import { ITargetName, ITarget, ITargetPattern, IBaseRule } from "../../../parse-result";

export interface IRuleSet
{
    readonly defaultTarget: ITargetName;
    clearDefaultTarget(): void;
    readonly explicitRules: ExplicitRule[];
    readonly implicitRules: ImplicitRule[];
    readonly staticPatternRules: StaticPatternRule[];
    addRule(
        targets: ITarget[],
        prerequisites: ITarget[],
        targetPattern: ITargetPattern,
        prereqPattern: ITarget[],
        orderOnlies: ITarget[],
        inlineRecipe: string,
        isTerminal: boolean
    ): IBaseRule;
}
