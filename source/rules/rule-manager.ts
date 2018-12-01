import * as exits from '../return-codes';
import * as path from 'path';
import * as log from '../makelog';
import { match } from 'minimatch';
import * as staticRules from "./static-rules";
import * as implicitRules from "./implicit-rules";
import * as targets from "./targets";
import { ITarget } from './target';

export function createManager(): IRuleManager
{
    return new RuleManager();
}

export interface IRuleManager
{
    readonly defaultTarget: ITarget;
    clearDefaultTarget(): void;
    findTarget(fullname: string): ITarget;
    addStaticRule(
        dirName: string,
        targetNames: string[],
        prerequisiteName: string[],
        orderOnlyPrerequisiteName: string[], 
        recipe: string[]
    ): void;
}

class RuleManager implements IRuleManager
{
    private readonly targetManager: targets.ITargetManager;
    private readonly staticRuleManager: staticRules.IStaticRuleManager;
    private readonly implicitRuleManager: implicitRules.IImplicitRuleManager;
    // public readonly makefileNames: string[] = [];
    // public readonly variables: { [name: string]: string } = {};

    public get defaultTarget(): ITarget { return this.targetManager.defaultTarget; }
    public clearDefaultTarget(): void { this.targetManager.defaultTarget = null; }
    public findTarget(fullname: string): ITarget  { return this.targetManager.findTarget(fullname); }

    constructor()
    {
        let self = this;

        this.targetManager = targets.createManager();
        this.staticRuleManager = staticRules.createManager(this.targetManager);
        this.implicitRuleManager = implicitRules.createManager(this.targetManager);
    };

    public addStaticRule(
        dirName: string, 
        targetNames: string[],
        prerequisiteName: string[],
        orderOnlyPrerequisiteName: string[],
        recipe: string[]
    ): void
    {
        this.staticRuleManager.addRule(dirName, targetNames, prerequisiteName, orderOnlyPrerequisiteName, recipe);
    }
    
    public addImplicitRule(
        dirName: string, 
        targetPatterns: string[],
        prerequisitePatterns: string[],
        orderOnlyPrerequisitePatterns: string[],
        recipe: string[]
    ): void
    {
        if (!targetPatterns || targetPatterns.length == 0)
            exits.ruleMissingTarget();

        this.implicitRuleManager.addImplicitRule(targetPatterns, prerequisitePatterns, recipe);
    }

    private includeTarget(srcTarget: ITarget): ITarget
    {
        return this.targetManager.addTarget(srcTarget.name, srcTarget.fullName, srcTarget.isOrderOnly);;
    }

    public toString(): string
    {
        return this.staticRuleManager.toString();
    }
}

