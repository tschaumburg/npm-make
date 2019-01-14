import * as exits from '../return-codes';
import * as fs from 'fs';
import * as path from 'path';
import * as log from '../makelog';
import { IPlan, IFileRef, IAction, IFilePlan } from '../planner/plan';
import { FileRef } from '../planner/plan/plan-impl';
import { runPlan } from './run-recipe';
import { TargetName } from '../parser/result';

const UNKNOWN_TARGET = 'target:unknown';


export class Engine
{
    constructor(private readonly plan: IPlan) 
    {}

    public updateGoals(goals: IFilePlan[]): boolean
    {
        let res = false;
        for (let goal of goals)
        {
            res = this._updateTarget(goal, "*") || res;
        }

        return res;
    }

    /**
     * Returns true if target changed
     * @param target
     */
    private _updateTarget(fileplan: IFilePlan, prefix: string): boolean
    {
        let self = this;
        let fileref = fileplan.file;
        let action = fileplan.producedBy;

        //console.error(prefix + "TESTING(" + fileplan.file.fullname + "): start");

        if (!action)
        {
            if (!fs.existsSync(fileref.fullname))
            {
                exits.ruleUnknownTarget(fileref.fullname, fileref.fullname);
            }
        }

        // Naked leaf nodes:
        // =================
        //
        //    specification.zip: ALWAYS
        //           wget ftp://foo.com/specification.zip
        //    ALWAYS:
        //
        // 4.7: ...If a target has no prerequisites or recipe
        // [henceforth a "naked leaf nodes"], and the target
        // of the rule is a nonexistent file, then make imagines 
        // this target to have been updated whenever its rule
        // is run.This implies that all targets depending on 
        // this one will always have their recipe run.

        if (this.isNakedLeaf(fileplan))
        {
            if (!fs.existsSync(fileref.fullname))
            {
                //log.info(
                //    prefix + "SCHEDULING(" + target.name + "): " +
                //    target.fullName + " is a naked leaf node"
                //);
                return true; //this.plan.addStep(rule.recipe);
            }
        }

        // Phony targets:
        // ==============
        //
        //    clean:
        //         rm *.o
        //
        // 4.6: A phony target is one that is not really the name 
        // of a file; rather it is just a name for a recipe to be 
        // executed when you make an explicit request.

        if (this.isPhony(fileplan))
        {
            log.info(
                prefix + "SCHEDULING(" + fileref.fullname + "): " +
                fileref.fullname + " is .PHONY"
            );
            this._execute(fileplan);
            return true;
            //return this.lan.addStep(rule.recipe, target, []);
        }

        // Depth-first recursion:
        // ======================
        if (!!action)
        {
            // First update any prerequisites if necessary.
            let changedPrerequisiteFiles =
                action.prerequisites
                    .filter(
                        prereq =>
                            self._updateTarget(prereq, prefix + "   ")
                    );

            // If any prerequisites needed updating, the
            // target needs updating too:
            if (changedPrerequisiteFiles.length > 0)
            {
                let names = changedPrerequisiteFiles.map(prereq => prereq.file.fullname).join(" ");
                log.info(
                    prefix + "SCHEDULING(" + fileref.fullname + ") " +
                    "because prerequisites (" + names + ") were scheduled for update"
                );

                self._execute(fileplan);
                return true;
            }
        }

        // Missing targets need building:
        // ==============================
        if (!fs.existsSync(fileref.fullname))
        {
            log.info(
                prefix + "SCHEDULING(" + fileref.fullname + ") " +
                "because file " + fileref.fullname + " doesn't exist"
            );

            self._execute(fileplan);
            return true;
        }

        // Outdated targets need building:
        // ==============================
        // If the target is newer than all prequisites, we're done;
        if (!!action)
        {
            let targetTime = this.timestamp(fileref.fullname);
            let newerPrerequisites =
                action.prerequisites
                    .filter(
                        p => self.timestamp(p.file.fullname) >= targetTime
                    );
            //        let prerequisiteTimes = rule.prerequities.map(p => self.timestamp(p.fullName));
            //if (prerequisiteTimes.some(p => p >= targetTime))

            if (newerPrerequisites.length > 0)
            {
                log.info(
                    prefix + "SCHEDULING(" + fileref.fullname + ") " +
                    "because file " + fileref.fullname + " is outdated" +
                    "compared to (" + newerPrerequisites.map(p => p.file.fullname).join(" ") + ")"
                );

                self._execute(fileplan);
                return true;
            }
        }

        //// Leaf nodes:
        //// ===========
        //if (!rule)
        //{
        //    if (fs.existsSync(target.fullName))
        //    {
        //        return false
        //    }
        //    else
        //    {
        //        return true;
        //    }
        //}
        //
        //// If there's no rule for this target (i.e. it's a leaf node),
        //// there's no way to update it:
        //if (!rule)
        //{
        //    log.info("Planning", prefix + "TESTING(" + target.name + "): returns false");
        //    return false;
        //}

        //// First check for updates to any prerequisites:


        //// If this is a .phony rule
        ////    target:
        ////       recipe
        //// always run recipe
        //if (!rule.prerequities || rule.prerequities.length == 0)
        //{
        //    if (!!rule.recipe && rule.recipe.steps.length > 0)
        //    {
        //        let result = this.plan.addStep(rule.recipe);

        //        if (result)
        //            log.info("Planning", prefix + "UPDATING " + target.name + " because it doesn't exist");

        //        log.info("Planning", prefix + "TESTING(" + target.name + "): returns " + result);
        //        return result;
        //    }
        //}

        //// Check if the target was already out-of-date BEFORE any
        //// update action is planned, we might as well put it in 
        //// the plan already:
        //let newerPrerequisiteTimes =
        //    rule.prerequities
        //        .filter((p) => this.timestamp(p.fullName) >= targetTime);

        //if (newerPrerequisiteTimes.length > 0)
        //{
        //    let result = this.plan.addStep(rule.recipe);

        //    if (result)
        //    {
        //        log.info("Planning", 
        //            prefix + "TESTING(" + target.name + "): returns " + result +
        //            " because prerequisites (" +
        //            newerPrerequisiteTimes.map(p => p.fullName).join(", ") +
        //            ") were newer"
        //        );
        //    }
        //    else
        //    {
        //        log.info("Planning", 
        //            prefix + "TESTING(" + target.name + "): returns " + result
        //        );
        //    }

        //    return result;
        //}

        return false;
    }

    private _execute(target: IFilePlan): void
    {
        runPlan(target);
    }

    private isNakedLeaf(target: IFilePlan): boolean
    {
        let rule = target.producedBy;

        if (!rule)
            return false;

        if (rule.prerequisites && rule.prerequisites.length > 0)
            return false;

        if (rule.recipe && rule.recipe && rule.recipe.length > 0)
            return false;

        return true;
    }

    private readonly phonies: FileRef[] = [];
    private isPhony(target: IFilePlan): any 
    {
        if (this.phonies.indexOf(target.file) >= 0)
            return true;

        let rule = target.producedBy;

        if (!rule)
            return false;

        if (rule.prerequisites && rule.prerequisites.length > 0)
            return false;

        return true;
    }

    private timestamp(fullName: string): number
    {
        let res = -1;

        if (!fullName)
        {
            res = 0;
        }
        else if (!fs.existsSync(fullName))
        {
            //if (fullName.endsWith(".h"))
            //    throw new Error(fullName + " missing");

            res = 0;
        }
        else 
        {
            res = fs.statSync(fullName).mtimeMs;;
        }

        log.info("timestamp " + fullName + " = " + res);
        return res;
    }

}